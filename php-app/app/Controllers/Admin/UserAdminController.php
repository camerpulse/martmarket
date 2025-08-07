<?php
namespace App\Controllers\Admin;

use Core\Controller;
use Core\Csrf;
use App\Models\User;

class UserAdminController extends Controller
{
    public function index(): string
    {
        $this->ensureRole('admin');
        $page = max(1, (int)($_GET['page'] ?? 1));
        $perPage = 50;
        $total = User::count();
        $offset = ($page - 1) * $perPage;
        $rows = User::all($perPage, $offset);
        $pages = (int)max(1, ceil($total / $perPage));
        return $this->view('admin/users/index', [
            'title' => 'Users',
            'rows' => $rows,
            'page' => $page,
            'pages' => $pages,
            'total' => $total,
        ]);
    }

    public function update(): string
    {
        $this->ensureRole('admin');
        if (!Csrf::check($_POST['_csrf'] ?? '')) { http_response_code(400); return 'Invalid CSRF'; }
        $id = (int)($_POST['id'] ?? 0);
        $role = (string)($_POST['role'] ?? 'buyer');
        $active = isset($_POST['is_active']);
        if ($id > 0) {
            User::setRole($id, $role);
            User::setActive($id, $active);
        }
        return $this->redirect('/admin/users');
    }
}
