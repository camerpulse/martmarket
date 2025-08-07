<?php
namespace App\Controllers\Admin;

use Core\Controller;
use Core\Csrf;
use App\Models\Category;

class CategoryAdminController extends Controller
{
    public function index(): string
    {
        $this->ensureRole('admin');
        $cats = Category::all();
        return $this->view('admin/categories/index', ['title' => 'Categories', 'categories' => $cats]);
    }

    public function create(): string
    {
        $this->ensureRole('admin');
        if (!Csrf::check($_POST['_csrf'] ?? '')) { http_response_code(400); return 'Invalid CSRF'; }
        $name = trim((string)($_POST['name'] ?? ''));
        $slug = strtolower(preg_replace('/[^a-z0-9-]+/i', '-', $name));
        if ($name && $slug) { Category::create($name, $slug); }
        return $this->redirect('/admin/categories');
    }
}
