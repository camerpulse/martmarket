<?php
namespace App\Controllers;

use Core\Controller;
use Core\Csrf;
use App\Models\Dispute;
use App\Models\Vendor;

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
        $did = Dispute::open($orderId, (int)$_SESSION['uid'], $reason);
        // Notify vendor
        $order = \App\Models\Order::find($orderId);
        if ($order) {
            $vendor = \App\Models\Vendor::find((int)$order['vendor_id']);
            $vendorUser = $vendor ? \App\Models\User::find((int)$vendor['user_id']) : null;
            if (!empty($vendorUser['email'])) {
                $subj = 'New dispute opened for order #' . ($order['order_number'] ?? $orderId);
                $body = '<p>A buyer opened a dispute for order #' . htmlspecialchars($order['order_number'] ?? (string)$orderId) . '.</p>';
                \App\Services\MailService::send($vendorUser['email'], $vendorUser['email'], $subj, $body);
            }
        }
        return $this->redirect('/disputes');
    }

    // Buyer dispute detail view
    public function view(): string
    {
        $this->ensureAuth();
        $id = (int)($_GET['id'] ?? 0);
        if ($id <= 0) { http_response_code(404); return 'Dispute not found'; }
        $row = Dispute::findWithOrderAndVendor($id);
        if (!$row || (int)$row["opened_by"] !== (int)$_SESSION['uid']) { http_response_code(403); return 'Forbidden'; }
        return $this->view('disputes/view', [
            'title' => 'Dispute #' . (int)$row['id'],
            'd' => $row,
        ]);
    }

    // Vendor-facing disputes list
    public function vendorIndex(): string
    {
        $this->ensureRole('vendor');
        $vendor = Vendor::byUser((int)$_SESSION['uid']);
        if (!$vendor) { http_response_code(403); return 'Forbidden'; }
        $rows = Dispute::forVendor((int)$vendor['id']);
        return $this->view('vendor/disputes/index', ['title' => 'Disputes', 'rows' => $rows]);
    }

    // Vendor updates dispute status/resolution
    public function vendorUpdate(): string
    {
        $this->ensureRole('vendor');
        if (!Csrf::check($_POST['_csrf'] ?? '')) { http_response_code(400); return 'Invalid CSRF'; }
        $id = (int)($_POST['id'] ?? 0);
        $status = (string)($_POST['status'] ?? 'in_review');
        $resolution = trim((string)($_POST['resolution'] ?? '')) ?: null;
        $allowed = ['open','in_review','resolved_buyer','resolved_vendor','cancelled'];
        if ($id <= 0 || !in_array($status, $allowed, true)) { return $this->redirect('/vendor/disputes'); }
        $vendor = Vendor::byUser((int)$_SESSION['uid']);
        if (!$vendor) { http_response_code(403); return 'Forbidden'; }
        $row = Dispute::findWithOrderAndVendor($id);
        if (!$row || (int)$row['vendor_id'] !== (int)$vendor['id']) { http_response_code(403); return 'Forbidden'; }
        Dispute::updateStatus($id, $status, $resolution);
        // Notify buyer
        $buyer = \App\Models\User::find((int)$row['opened_by']);
        if (!empty($buyer['email'])) {
            $subj = 'Dispute #' . (int)$row['id'] . ' updated by vendor';
            $body = '<p>Status: ' . htmlspecialchars($status) . '</p>' . ($resolution ? '<p>Vendor note: ' . nl2br(htmlspecialchars($resolution)) . '</p>' : '');
            \App\Services\MailService::send($buyer['email'], $buyer['email'], $subj, $body);
        }
        return $this->redirect('/vendor/disputes');
    }
}
