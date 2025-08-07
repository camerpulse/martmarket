<?php
namespace App\Controllers\Admin;

use Core\Controller;
use Core\DB;
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

        return $this->view('admin/dashboard/index', [
            'title' => 'Admin Dashboard',
            'stats' => $stats,
            'locales' => Translation::locales(),
        ]);
    }
}
