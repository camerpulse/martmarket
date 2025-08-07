<?php
namespace App\Controllers\Admin;

use Core\Controller;
use Core\DB;
use Core\Config;
use App\Models\Translation;

class AdminDashboardController extends Controller
{
    public function index(): string
    {
        $this->ensureRole('admin');

        $pdo = DB::pdo();

        $stats = [
            'users' => (int)$pdo->query('SELECT COUNT(*) FROM users')->fetchColumn(),
            'vendors' => (int)$pdo->query('SELECT COUNT(*) FROM vendors')->fetchColumn(),
            'vendor_pending' => (int)$pdo->query("SELECT COUNT(*) FROM vendor_verifications WHERE status = 'pending'")->fetchColumn(),
            'orders_total' => (int)$pdo->query('SELECT COUNT(*) FROM orders')->fetchColumn(),
            'orders_escrow' => (int)$pdo->query("SELECT COUNT(*) FROM escrows WHERE status = 'holding'")->fetchColumn(),
            'orders_disputed' => (int)$pdo->query("SELECT COUNT(*) FROM orders WHERE status = 'disputed'")->fetchColumn(),
            'disputes_open' => (int)$pdo->query("SELECT COUNT(*) FROM disputes WHERE status IN ('open','in_review')")->fetchColumn(),
        ];

        $alerts = [];
        if (!\App\Models\Settings::get('btc_xpub', '')) { $alerts[] = ['type'=>'critical','text'=>'Bitcoin XPUB not configured. Payments cannot be generated.']; }
        if ((string)\App\Models\Settings::get('btc_network', 'testnet') === 'testnet') { $alerts[] = ['type'=>'warning','text'=>'Bitcoin network is set to TESTNET.']; }
        if (!\App\Models\Settings::get('cron_token', '')) { $alerts[] = ['type'=>'warning','text'=>'Cron token not set. Configure payment poller and cPanel cron.']; }
        $adminCount = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role = 'admin'")->fetchColumn();
        if ($adminCount > 1) { $alerts[] = ['type'=>'info','text'=>'Multiple admin accounts detected. Review user roles.']; }
        if ((int)$stats['vendor_pending'] > 0) { $alerts[] = ['type'=>'info','text'=> $stats['vendor_pending'] . ' vendor verification request(s) pending.']; }
        if (!(string)Config::get('mail.host')) { $alerts[] = ['type'=>'info','text'=>'SMTP not configured. Emails may not be delivered.']; }

        return $this->view('admin/dashboard/index', [
            'title' => 'Admin Dashboard',
            'stats' => $stats,
            'locales' => Translation::locales(),
            'alerts' => $alerts,
        ]);
    }
}
