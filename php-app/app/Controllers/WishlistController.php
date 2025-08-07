<?php
namespace App\Controllers;

use Core\Controller;
use Core\Csrf;
use App\Models\Wishlist as WL;

class WishlistController extends Controller
{
    public function index(): string
    {
        $this->ensureAuth();
        $items = WL::list((int)$_SESSION['uid']);
        return $this->view('wishlist/index', ['title' => 'My Wishlist', 'items' => $items]);
    }

    public function add(): string
    {
        $this->ensureAuth();
        if (!Csrf::check($_POST['_csrf'] ?? '')) { http_response_code(400); return 'Invalid CSRF'; }
        $pid = (int)($_POST['product_id'] ?? 0);
        if ($pid > 0) { WL::add((int)$_SESSION['uid'], $pid); }
        return $this->redirect('/wishlist');
    }

    public function remove(): string
    {
        $this->ensureAuth();
        if (!Csrf::check($_POST['_csrf'] ?? '')) { http_response_code(400); return 'Invalid CSRF'; }
        $pid = (int)($_POST['product_id'] ?? 0);
        if ($pid > 0) { WL::remove((int)$_SESSION['uid'], $pid); }
        return $this->redirect('/wishlist');
    }
}
