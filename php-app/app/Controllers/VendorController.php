<?php
namespace App\Controllers;

use Core\Controller;
use Core\Csrf;
use App\Models\Vendor;
use App\Models\VendorVerification;
use App\Models\Order;

class VendorController extends Controller
{
    public function dashboard(): string
    {
        $this->ensureRole('vendor');
        $vendor = Vendor::byUser((int)($_SESSION['uid'] ?? 0));
        return $this->view('vendor/dashboard', ['title' => 'Vendor Dashboard', 'vendor' => $vendor]);
    }

    public function requestVerification(): string
    {
        $this->ensureRole('vendor');
        if (!Csrf::check($_POST['_csrf'] ?? '')) { http_response_code(400); return 'Invalid CSRF'; }
        $vendor = Vendor::byUser((int)$_SESSION['uid']);
        if (!$vendor) {
            $vendorId = Vendor::createForUser((int)$_SESSION['uid']);
            $vendor = ['id' => $vendorId];
        }
        VendorVerification::request((int)$vendor['id'], trim((string)($_POST['notes'] ?? '')) ?: null);
        return $this->redirect('/vendor/dashboard');
    }

    public function view(): string
    {
        $vendorId = (int)($_GET['id'] ?? 0);
        if ($vendorId <= 0) { http_response_code(404); return 'Vendor not found'; }
        $vendor = Vendor::find($vendorId);
        if (!$vendor) { http_response_code(404); return 'Vendor not found'; }
        $products = \App\Models\Product::byVendor((int)$vendor['id']);
        $rating = \App\Models\Review::summaryForVendor((int)$vendor['id']);
        return $this->view('vendor/storefront', [
            'title' => ($vendor['store_name'] ?? 'Vendor') . ' – Storefront',
            'vendor' => $vendor,
            'products' => $products,
            'rating' => $rating,
        ]);
    }

    // Vendor Orders
    public function orders(): string
    {
        $this->ensureRole('vendor');
        $vendor = Vendor::byUser((int)$_SESSION['uid']);
        if (!$vendor) { http_response_code(403); return 'Vendor profile required'; }
        $page = max(1, (int)($_GET['page'] ?? 1));
        $perPage = 50; $offset = ($page - 1) * $perPage;
        $rows = Order::byVendor((int)$vendor['id'], $perPage, $offset);
        return $this->view('vendor/orders/index', [
            'title' => 'Vendor Orders',
            'rows' => $rows,
            'page' => $page,
        ]);
    }

    public function orderView(): string
    {
        $this->ensureRole('vendor');
        $vendor = Vendor::byUser((int)$_SESSION['uid']);
        if (!$vendor) { http_response_code(403); return 'Vendor profile required'; }
        $id = (int)($_GET['id'] ?? 0);
        $order = Order::find($id);
        if (!$order || (int)$order['vendor_id'] !== (int)$vendor['id']) { http_response_code(404); return 'Order not found'; }
        $items = Order::items($id);
        return $this->view('vendor/orders/view', [
            'title' => 'Order #' . $order['order_number'],
            'order' => $order,
            'items' => $items,
        ]);
    }

    public function markShipped(): string
    {
        $this->ensureRole('vendor');
        if (!Csrf::check($_POST['_csrf'] ?? '')) { http_response_code(400); return 'Invalid CSRF'; }
        $vendor = Vendor::byUser((int)$_SESSION['uid']);
        if (!$vendor) { http_response_code(403); return 'Vendor profile required'; }
        $id = (int)($_POST['id'] ?? 0);
        $tracking = trim((string)($_POST['tracking_number'] ?? ''));
        $note = trim((string)($_POST['shipping_note'] ?? '')) ?: null;
        $order = Order::find($id);
        if (!$order || (int)$order['vendor_id'] !== (int)$vendor['id']) { http_response_code(404); return 'Order not found'; }
        if (in_array($order['status'], ['in_escrow','paid'], true)) {
            Order::setShipment($id, $tracking, $note);
            // Notify buyer by email (best-effort)
            $buyer = \App\Models\User::find((int)$order['buyer_id']);
            if ($buyer) {
                \App\Services\MailService::send($buyer['email'], $buyer['email'], 'Your order has shipped', '<p>Your order #' . htmlspecialchars($order['order_number']) . ' has been marked as shipped.</p>' . ($tracking ? '<p>Tracking: ' . htmlspecialchars($tracking) . '</p>' : '') . ($note ? '<p>Note: ' . nl2br(htmlspecialchars($note)) . '</p>' : ''));
            }
        }
        return $this->redirect('/vendor/orders/view?id=' . $id);
    }
}

