<?php
namespace App\Controllers;

use Core\Controller;
use Core\Csrf;
use App\Models\Dispute;

class DisputeController extends Controller
{
    public function index(): string
    {
        $this->ensureAuth();
        $rows = Dispute::forUser((int)$_SESSION['uid']);
        return $this->view('disputes/index', ['title' => 'My Disputes', 'rows' => $rows]);
    }

    public function new(): string
    {
        $this->ensureAuth();
        $orderId = (int)($_GET['order_id'] ?? 0) ?: null;
        return $this->view('disputes/new', ['title' => 'Open Dispute', 'orderId' => $orderId]);
    }

    public function create(): string
    {
        $this->ensureAuth();
        if (!Csrf::check($_POST['_csrf'] ?? '')) { http_response_code(400); return 'Invalid CSRF'; }
        $orderId = (int)($_POST['order_id'] ?? 0);
        $reason = trim((string)($_POST['reason'] ?? ''));
        if ($orderId <= 0 || $reason === '') return $this->redirect('/disputes');
        Dispute::open($orderId, (int)$_SESSION['uid'], $reason);
        return $this->redirect('/disputes');
    }
}
