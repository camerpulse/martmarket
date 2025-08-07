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
}
