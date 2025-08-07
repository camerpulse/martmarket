<?php
namespace App\Controllers\Admin;

use Core\Controller;
use Core\Csrf;
use App\Models\Settings;
use App\Models\Payment;
use App\Models\Order;
use App\Services\PaymentService;

class PaymentSettingsController extends Controller
{
    public function settings(): string
    {
        $this->ensureRole('admin');
        $data = [
            'provider' => Settings::get('btc_provider', 'blockstream'),
            'network' => Settings::get('btc_network', 'testnet'),
            'confirmations' => Settings::get('btc_confirmations', '3'),
            'xpub' => Settings::get('btc_xpub', ''),
        ];
        return $this->view('admin/payments/settings', ['title' => 'Payments Settings', 'cfg' => $data]);
    }

    public function save(): string
    {
        $this->ensureRole('admin');
        if (!Csrf::check($_POST['_csrf'] ?? '')) { http_response_code(400); return 'Invalid CSRF'; }
        Settings::set('btc_provider', in_array($_POST['provider'] ?? 'blockstream', ['blockstream','blockcypher']) ? $_POST['provider'] : 'blockstream');
        Settings::set('btc_network', in_array($_POST['network'] ?? 'testnet', ['mainnet','testnet']) ? $_POST['network'] : 'testnet');
        $conf = (int)($_POST['confirmations'] ?? 3); $conf = max(1, min(6, $conf));
        Settings::set('btc_confirmations', (string)$conf);
        $xpub = trim((string)($_POST['xpub'] ?? ''));
        if ($xpub) { Settings::set('btc_xpub', $xpub); }
        return $this->redirect('/admin/payments');
    }

    public function check(): string
    {
        $this->ensureRole('admin');
        $awaiting = Payment::awaiting();
        $required = (int)Settings::get('btc_confirmations', '3');
        foreach ($awaiting as $p) {
            $status = PaymentService::checkAddressStatus($p['address']);
            $received = $status['received_btc'] ?? '0';
            $conf = (int)($status['confirmations'] ?? 0);
            $txid = $status['txid'] ?? null;
            $newStatus = bccomp($received, $p['expected_amount'], 8) >= 0 ? ($conf >= $required ? 'confirmed' : 'awaiting') : 'awaiting';
            Payment::updateByOrder((int)$p['order_id'], $txid, $received, $newStatus, date('Y-m-d H:i:s'));
            if ($newStatus === 'confirmed') {
                Order::updatePayment((int)$p['order_id'], $received, $conf, 'in_escrow');
            }
        }
        return $this->redirect('/admin/payments');
    }
}
