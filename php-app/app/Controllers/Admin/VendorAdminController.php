<?php
namespace App\Controllers\Admin;

use Core\Controller;
use Core\Csrf;
use App\Models\VendorVerification;

class VendorAdminController extends Controller
{
    public function index(): string
    {
        $this->ensureRole('admin');
        $rows = VendorVerification::pending();
        return $this->view('admin/vendors/index', ['title' => 'Vendor Verifications', 'rows' => $rows]);
    }

    public function approve(): string
    {
        $this->ensureRole('admin');
        if (!Csrf::check($_POST['_csrf'] ?? '')) { http_response_code(400); return 'Invalid CSRF'; }
        $id = (int)($_POST['id'] ?? 0);
        if ($id) { VendorVerification::approve($id); }
        return $this->redirect('/admin/vendors');
    }

    public function reject(): string
    {
        $this->ensureRole('admin');
        if (!Csrf::check($_POST['_csrf'] ?? '')) { http_response_code(400); return 'Invalid CSRF'; }
        $id = (int)($_POST['id'] ?? 0);
        $notes = trim((string)($_POST['notes'] ?? '')) ?: null;
        if ($id) { VendorVerification::reject($id, $notes); }
        return $this->redirect('/admin/vendors');
    }
}
