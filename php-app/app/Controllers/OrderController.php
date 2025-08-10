<?php
namespace App\Controllers;

use Core\Controller;
use Core\Csrf;
use App\Models\Order;

class OrderController extends Controller
{
    public function index(): string
    {
        $this->ensureAuth();
        $orders = Order::byUser((int)$_SESSION['uid']);
        return $this->view('orders/index', [
            'title' => 'My Orders',
            'orders' => $orders,
        ]);
    }

    public function orderView(): string
    {
        $this->ensureAuth();
        $id = (int)($_GET['id'] ?? 0);
        $order = Order::find($id);
        if (!$order || (int)$order['buyer_id'] !== (int)$_SESSION['uid']) { http_response_code(404); return 'Order not found'; }
        $items = Order::items($id);
        return $this->view('orders/view', [
            'title' => 'Order #' . $order['order_number'],
            'order' => $order,
            'items' => $items,
        ]);
    }

    public function markReceived(): string
    {
        $this->ensureAuth();
        if (!Csrf::check($_POST['_csrf'] ?? '')) { http_response_code(400); return 'Invalid CSRF'; }
        $id = (int)($_POST['id'] ?? 0);
        $order = Order::find($id);
        if (!$order || (int)$order['buyer_id'] !== (int)$_SESSION['uid']) { http_response_code(404); return 'Order not found'; }
        // Only allow if currently in escrow or shipped
        if (in_array($order['status'], ['in_escrow','shipped','paid'], true)) {
            Order::setStatus($id, 'completed');
        }
        return $this->redirect('/orders/view?id=' . $id);
    }
}
