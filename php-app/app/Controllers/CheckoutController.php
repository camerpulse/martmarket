<?php
namespace App\Controllers;

use Core\Controller;
use Core\Csrf;
use App\Models\Product;
use App\Models\Vendor;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Escrow;
use App\Models\Settings;
use App\Services\PaymentService;

class CheckoutController extends Controller
{
    public function start(): string
    {
        $this->ensureAuth();
        $productId = (int)($_GET['product_id'] ?? 0);
        $qty = max(1, (int)($_GET['qty'] ?? 1));
        $product = Product::find($productId);
        if (!$product || (int)$product['is_active'] !== 1) { http_response_code(404); return 'Product not found'; }
        $vendorId = (int)$product['vendor_id'];
        $amountBtc = bcmul((string)$product['price_btc'], (string)$qty, 8);

        // derive next address from xpub
        $xpub = Settings::get('btc_xpub', '');
        $index = (int)Settings::get('btc_index', '0');
        if (!$xpub) { return $this->view('checkout/error', ['message' => 'Bitcoin not configured by admin yet.']); }
        $address = PaymentService::deriveAddress($xpub, $index);
        Settings::set('btc_index', (string)($index + 1));

        $orderNumber = strtoupper(bin2hex(random_bytes(6)));
        $orderId = Order::create((int)$_SESSION['uid'], $vendorId, $orderNumber, $address, $amountBtc);
        Order::addItem($orderId, $productId, $product['title'], (string)$product['price_btc'], $qty);
        Payment::create($orderId, $address, $amountBtc);
        Escrow::create($orderId);

        // Notify buyer & vendor
        $buyer = \App\Models\User::find((int)$_SESSION['uid']);
        $vendorUserId = (int)($vendorId ? (\App\Models\Vendor::find($vendorId)['user_id'] ?? 0) : 0);
        $vendorUser = $vendorUserId ? \App\Models\User::find($vendorUserId) : null;
        $buyerEmail = $buyer['email'] ?? null; $vendorEmail = $vendorUser['email'] ?? null;
        $subjBuyer = 'Your order #' . $orderNumber . ' – Payment Instructions';
        $bodyBuyer = '<p>Thank you for your order.</p><p>Send exactly <strong>' . htmlspecialchars($amountBtc) . ' BTC</strong> to <code>' . htmlspecialchars($address) . '</code>.</p>';
        if ($buyerEmail) { \App\Services\MailService::send($buyerEmail, $buyerEmail, $subjBuyer, $bodyBuyer); }
        if ($vendorEmail) {
            $subjVendor = 'New order #' . $orderNumber . ' placed';
            $bodyVendor = '<p>A new order was placed. Awaiting payment.</p>';
            \App\Services\MailService::send($vendorEmail, $vendorEmail, $subjVendor, $bodyVendor);
        }

        return $this->redirect('/checkout/view?id=' . $orderId);
    }

    public function view(): string
    {
        $this->ensureAuth();
        $id = (int)($_GET['id'] ?? 0);
        $order = Order::find($id);
        if (!$order || (int)$order['buyer_id'] !== (int)$_SESSION['uid']) { http_response_code(404); return 'Order not found'; }
        $confirmationsRequired = (int)Settings::get('btc_confirmations', '3');
        return $this->view('checkout/view', ['title' => 'Checkout', 'order' => $order, 'confirmationsRequired' => $confirmationsRequired]);
    }

    public function status(): string
    {
        $this->ensureAuth();
        header('Content-Type: application/json');
        $id = (int)($_GET['id'] ?? 0);
        $order = Order::find($id);
        if (!$order || (int)$order['buyer_id'] !== (int)$_SESSION['uid']) { http_response_code(404); return json_encode(['error' => 'Not found']); }
        $required = (int)Settings::get('btc_confirmations', '3');
        $status = PaymentService::checkAddressStatus($order['btc_address']);
        $received = (string)($status['received_btc'] ?? '0');
        $conf = (int)($status['confirmations'] ?? 0);
        $txid = $status['txid'] ?? null;
        $newPaymentStatus = bccomp($received, $order['btc_expected_amount'], 8) >= 0 ? ($conf >= $required ? 'confirmed' : 'awaiting') : 'awaiting';
        $prev = Payment::findByOrder($id);
        Payment::updateByOrder($id, $txid, $received, $newPaymentStatus, date('Y-m-d H:i:s'));
        if ($newPaymentStatus === 'confirmed' && ($prev['status'] ?? '') !== 'confirmed') {
            Order::updatePayment($id, $received, $conf, 'in_escrow');
            // Notify parties once
            $buyer = \App\Models\User::find((int)$order['buyer_id']);
            $vendorUserId = (int)(\App\Models\Vendor::find((int)$order['vendor_id'])['user_id'] ?? 0);
            $vendorUser = $vendorUserId ? \App\Models\User::find($vendorUserId) : null;
            $buyerEmail = $buyer['email'] ?? null; $vendorEmail = $vendorUser['email'] ?? null;
            $subj = 'Payment confirmed for order #' . $order['order_number'] . ' – In Escrow';
            $body = '<p>Your Bitcoin payment was confirmed.</p><p>Funds are now held in escrow.</p>';
            if ($buyerEmail) { \App\Services\MailService::send($buyerEmail, $buyerEmail, $subj, $body); }
            if ($vendorEmail) { \App\Services\MailService::send($vendorEmail, $vendorEmail, $subj, $body); }
            $order['status'] = 'in_escrow';
        } else {
            Order::updatePayment($id, $received, $conf, $order['status']);
        }
        $resp = [
            'status' => $order['status'],
            'received_btc' => $received,
            'confirmations' => $conf,
            'expected_btc' => $order['btc_expected_amount'],
        ];
        return json_encode($resp);
    }
}
