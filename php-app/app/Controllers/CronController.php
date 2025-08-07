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
        $token = (string)($_GET['token'] ?? '');
        $expected = (string)Settings::get('cron_token', '');
        if (!$expected || !hash_equals($expected, $token)) {
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
                }
            }
        }
        return 'OK';
    }
}
