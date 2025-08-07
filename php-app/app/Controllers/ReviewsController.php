<?php
namespace App\Controllers;

use Core\Controller;
use Core\Csrf;
use App\Models\Review;

class ReviewsController extends Controller
{
    public function new(): string
    {
        $this->ensureAuth();
        $orderId = (int)($_GET['order_id'] ?? 0) ?: null;
        $productId = (int)($_GET['product_id'] ?? 0) ?: null;
        $vendorId = (int)($_GET['vendor_id'] ?? 0) ?: null;
        // If linked to an order, ensure ownership and completion
        if ($orderId) {
            $order = \App\Models\Order::find($orderId);
            if (!$order || (int)$order['buyer_id'] !== (int)$_SESSION['uid']) { http_response_code(403); return 'Forbidden'; }
            if ($order['status'] !== 'completed') { http_response_code(400); return 'Reviews are available after completion.'; }
            // Prefill vendor
            $vendorId = $vendorId ?: (int)$order['vendor_id'];
            // If only one item, prefill product
            $items = \App\Models\Order::items($orderId);
            if (!$productId && count($items) === 1) { $productId = (int)$items[0]['product_id']; }
        }
        return $this->view('reviews/new', ['title' => 'Write Review', 'orderId' => $orderId, 'productId' => $productId, 'vendorId' => $vendorId]);
    }

    public function create(): string
    {
        $this->ensureAuth();
        if (!Csrf::check($_POST['_csrf'] ?? '')) { http_response_code(400); return 'Invalid CSRF'; }
        $orderId = (int)($_POST['order_id'] ?? 0) ?: null;
        $productId = (int)($_POST['product_id'] ?? 0) ?: null;
        $vendorId = (int)($_POST['vendor_id'] ?? 0) ?: null;
        $rating = max(1, min(5, (int)($_POST['rating'] ?? 5)));
        $comment = trim((string)($_POST['comment'] ?? '')) ?: null;
        if ($orderId) {
            $order = \App\Models\Order::find($orderId);
            if (!$order || (int)$order['buyer_id'] !== (int)$_SESSION['uid'] || $order['status'] !== 'completed') { http_response_code(403); return 'Not allowed'; }
            // Default vendor from order if missing
            if (!$vendorId) { $vendorId = (int)$order['vendor_id']; }
        }
        Review::create($orderId, $productId, $vendorId, (int)$_SESSION['uid'], $rating, $comment);
        return $this->redirect($orderId ? ('/orders/view?id=' . $orderId) : '/catalog');
    }
}
