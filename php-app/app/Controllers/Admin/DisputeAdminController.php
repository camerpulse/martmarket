<?php
namespace App\Controllers\Admin;

use Core\Controller;
use Core\Csrf;
use App\Models\Dispute;

class DisputeAdminController extends Controller
{
    public function index(): string
    {
        $this->ensureRole('admin');
        $rows = Dispute::allOpen();
        return $this->view('admin/disputes/index', ['title' => 'Disputes', 'rows' => $rows]);
    }

    public function update(): string
    {
        $this->ensureRole('admin');
        if (!Csrf::check($_POST['_csrf'] ?? '')) { http_response_code(400); return 'Invalid CSRF'; }
        $id = (int)($_POST['id'] ?? 0);
        $status = in_array($_POST['status'] ?? 'in_review', ['open','in_review','resolved_buyer','resolved_vendor','cancelled']) ? $_POST['status'] : 'in_review';
        $res = trim((string)($_POST['resolution'] ?? '')) ?: null;
        if ($id) { Dispute::updateStatus($id, $status, $res); }
        return $this->redirect('/admin/disputes');
    }
}
