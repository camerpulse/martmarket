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
        $productId = (int)($_GET['product_id'] ?? 0) ?: null;
        $vendorId = (int)($_GET['vendor_id'] ?? 0) ?: null;
        return $this->view('reviews/new', ['title' => 'Write Review', 'productId' => $productId, 'vendorId' => $vendorId]);
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
        Review::create($orderId, $productId, $vendorId, (int)$_SESSION['uid'], $rating, $comment);
        return $this->redirect('/catalog');
    }
}
