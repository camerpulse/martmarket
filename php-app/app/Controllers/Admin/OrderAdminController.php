<?php
namespace App\Controllers\Admin;

use Core\Controller;
use Core\Csrf;
use App\Models\Order;
use App\Services\AffiliateService;

class OrderAdminController extends Controller
{
    public function index(): string
    {
        $this->ensureRole('admin');
        $page = max(1, (int)($_GET['page'] ?? 1));
        $perPage = 50;
        $total = Order::count();
        $offset = ($page - 1) * $perPage;
        $rows = Order::list($perPage, $offset);
        $pages = (int)max(1, ceil($total / $perPage));
        return $this->view('admin/orders/index', [
            'title' => 'Orders',
            'rows' => $rows,
            'page' => $page,
            'pages' => $pages,
            'total' => $total,
        ]);
    }

    public function view(): string
    {
        $this->ensureRole('admin');
        $id = (int)($_GET['id'] ?? 0);
        $order = Order::find($id);
        if (!$order) { http_response_code(404); return 'Order not found'; }
        $items = Order::items($id);
        return $this->view('admin/orders/view', [
            'title' => 'Order #' . $order['order_number'],
            'order' => $order,
            'items' => $items,
        ]);
    }

    public function update(): string
    {
        $this->ensureRole('admin');
        if (!Csrf::check($_POST['_csrf'] ?? '')) { http_response_code(400); return 'Invalid CSRF'; }
        $id = (int)($_POST['id'] ?? 0);
        $status = (string)($_POST['status'] ?? 'pending');
        if ($id > 0) {
            Order::setStatus($id, $status);
            if ($status === 'completed') {
                AffiliateService::handleOrderCompleted($id);
            }
        }
        return $this->redirect('/admin/orders/view?id=' . $id);
    }
}

