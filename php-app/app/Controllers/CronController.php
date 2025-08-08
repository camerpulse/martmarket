<?php
namespace App\Controllers;

use Core\Controller;
use App\Models\Settings;
use App\Models\Payment;
use App\Models\Order;
use App\Models\Vendor;
use App\Models\User;
use App\Services\PaymentService;

class CronController extends Controller
{
public function payments(): string
    {
        $headerToken = (string)($_SERVER['HTTP_X_CRON_TOKEN'] ?? '');
        $queryToken = (string)($_GET['token'] ?? '');
        $token = $headerToken !== '' ? $headerToken : $queryToken;
        $expected = (string)Settings::get('cron_token', '');
        if (!$expected || !hash_equals($expected, $token)) {
            \Core\Logger::log('cron', 'warning', 'Unauthorized cron access attempt', ['ip' => $_SERVER['REMOTE_ADDR'] ?? null]);
            http_response_code(403);
            return 'Forbidden';
        }
        $awaiting = Payment::awaiting();
        $required = (int)Settings::get('btc_confirmations', '3');
        foreach ($awaiting as $p) {
            $status = PaymentService::checkAddressStatus($p['address']);
            $received = (string)($status['received_btc'] ?? '0');
            $conf = (int)($status['confirmations'] ?? 0);
            $txid = $status['txid'] ?? null;
            $newStatus = bccomp($received, $p['expected_amount'], 8) >= 0 ? ($conf >= $required ? 'confirmed' : 'awaiting') : 'awaiting';
            $prev = Payment::findByOrder((int)$p['order_id']);
            Payment::updateByOrder((int)$p['order_id'], $txid, $received, $newStatus, date('Y-m-d H:i:s'));
            \Core\Logger::log('payments', 'info', 'Payment status polled', [
                'order_id' => (int)$p['order_id'], 'address' => $p['address'], 'received' => $received, 'confirmations' => $conf, 'new_status' => $newStatus
            ]);
            if ($newStatus === 'confirmed' && ($prev['status'] ?? '') !== 'confirmed') {
                Order::updatePayment((int)$p['order_id'], $received, $conf, 'in_escrow');
                $order = Order::find((int)$p['order_id']);
                if ($order) {
                    $buyer = User::find((int)$order['buyer_id']);
                    $vendorUserId = (int)(Vendor::find((int)$order['vendor_id'])['user_id'] ?? 0);
                    $vendorUser = $vendorUserId ? User::find($vendorUserId) : null;
                    $subj = 'Payment confirmed for order #' . $order['order_number'] . ' – In Escrow';
                    $body = '<p>Your Bitcoin payment was confirmed.</p><p>Funds are now held in escrow.</p>';
                    if (!empty($buyer['email'])) { \App\Services\MailService::send($buyer['email'], $buyer['email'], $subj, $body); }
                    if (!empty($vendorUser['email'])) { \App\Services\MailService::send($vendorUser['email'], $vendorUser['email'], $subj, $body); }
                    \Core\Logger::log('payments', 'info', 'Order moved to escrow after confirmation', ['order_id' => (int)$p['order_id'], 'txid' => $txid]);
                }
            }
        }
        \Core\Logger::log('cron', 'info', 'Cron payment poll completed', ['count' => count($awaiting)]);
        return 'OK';
    }
}
