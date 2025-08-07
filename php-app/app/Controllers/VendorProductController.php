<?php
namespace App\Controllers;

use Core\Controller;
use Core\Csrf;
use App\Models\Vendor;
use App\Models\Category;
use App\Models\Product;

class VendorProductController extends Controller
{
    public function index(): string
    {
        $this->ensureRole('vendor');
        $vendor = Vendor::byUser((int)$_SESSION['uid']);
        $items = $vendor ? Product::byVendor((int)$vendor['id']) : [];
        return $this->view('vendor/products/index', ['title' => 'My Products', 'products' => $items]);
    }

    public function createForm(): string
    {
        $this->ensureRole('vendor');
        $categories = Category::all();
        return $this->view('vendor/products/form', ['title' => 'Add Product', 'categories' => $categories]);
    }

    public function store(): string
    {
        $this->ensureRole('vendor');
        if (!Csrf::check($_POST['_csrf'] ?? '')) { http_response_code(400); return 'Invalid CSRF'; }
        $vendor = Vendor::byUser((int)$_SESSION['uid']);
        if (!$vendor) { return $this->redirect('/vendor/dashboard'); }

        $title = trim((string)($_POST['title'] ?? ''));
        $slug = strtolower(preg_replace('/[^a-z0-9-]+/i', '-', $title)) . '-' . substr(bin2hex(random_bytes(3)),0,6);
        $desc = trim((string)($_POST['description'] ?? '')) ?: null;
        $categoryId = (int)($_POST['category_id'] ?? 0) ?: null;
        $priceBtc = (string)($_POST['price_btc'] ?? '0');
        $priceUsd = (string)($_POST['price_usd'] ?? '');
        $stock = (int)($_POST['stock_quantity'] ?? 0) ?: null;
        $active = isset($_POST['is_active']);

        if ($title === '' || bccomp($priceBtc, '0', 8) !== 1) {
            return $this->redirect('/vendor/product/new');
        }

        $pid = Product::create([
            'vendor_id' => (int)$vendor['id'],
            'category_id' => $categoryId,
            'title' => $title,
            'slug' => $slug,
            'description' => $desc,
            'price_btc' => $priceBtc,
            'price_usd' => $priceUsd ?: null,
            'stock_quantity' => $stock,
            'is_active' => $active
        ]);

        $this->handleUpload($pid);
        return $this->redirect('/vendor/products');
    }

    private function handleUpload(int $productId): void
    {
        if (empty($_FILES['image']['name'])) return;
        $f = $_FILES['image'];
        if ($f['error'] !== UPLOAD_ERR_OK) return;
        if ($f['size'] > 2*1024*1024) return; // 2MB
        $fi = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($fi, $f['tmp_name']);
        finfo_close($fi);
if (!in_array($mime, ['image/jpeg','image/png'])) return;
        $ext = $mime === 'image/png' ? 'png' : 'jpg';
        $dir = dirname(__DIR__,2) . '/public/uploads/products/';
        if (!is_dir($dir)) { @mkdir($dir, 0755, true); }
        $name = bin2hex(random_bytes(12)) . '.' . $ext;
        $path = $dir . $name;
        if (move_uploaded_file($f['tmp_name'], $path)) {
            \Core\DB::pdo()->prepare('INSERT INTO product_images (product_id, image_path) VALUES (?, ?)')
                ->execute([$productId, '/uploads/products/' . $name]);
        }
    }
}
