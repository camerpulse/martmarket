<?php
namespace App\Controllers;

use Core\Controller;
use Core\Csrf;
use App\Models\Vendor;
use App\Models\VendorVerification;

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
        return $this->view('vendor/storefront', [
            'title' => ($vendor['store_name'] ?? 'Vendor') . ' – Storefront',
            'vendor' => $vendor,
            'products' => $products
        ]);
    }
}
