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
        $slug = \Core\Slug::unique('products', 'slug', $title);
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

    public function editForm(): string
    {
        $this->ensureRole('vendor');
        $vendor = Vendor::byUser((int)$_SESSION['uid']);
        if (!$vendor) { return $this->redirect('/vendor/dashboard'); }
        $id = (int)($_GET['id'] ?? 0);
        $product = $id > 0 ? Product::find($id) : null;
        if (!$product || (int)$product['vendor_id'] !== (int)$vendor['id']) { http_response_code(404); return 'Product not found'; }
        $categories = Category::all();
        $images = \App\Models\ProductImage::listByProduct($id);
        return $this->view('vendor/products/form', [
            'title' => 'Edit Product',
            'categories' => $categories,
            'product' => $product,
            'images' => $images,
        ]);
    }

    public function update(): string
    {
        $this->ensureRole('vendor');
        if (!Csrf::check($_POST['_csrf'] ?? '')) { http_response_code(400); return 'Invalid CSRF'; }
        $vendor = Vendor::byUser((int)$_SESSION['uid']);
        if (!$vendor) { return $this->redirect('/vendor/dashboard'); }
        $id = (int)($_POST['id'] ?? 0);
        $existing = $id > 0 ? Product::find($id) : null;
        if (!$existing || (int)$existing['vendor_id'] !== (int)$vendor['id']) { http_response_code(404); return 'Product not found'; }

        $title = trim((string)($_POST['title'] ?? $existing['title']));
        $slugInput = trim((string)($_POST['slug'] ?? ''));
        $slug = $slugInput !== '' ? \Core\Slug::generate($slugInput) : $existing['slug'];
        $desc = trim((string)($_POST['description'] ?? '')) ?: null;
        $categoryId = (int)($_POST['category_id'] ?? 0) ?: null;
        $priceBtc = (string)($_POST['price_btc'] ?? (string)$existing['price_btc']);
        $priceUsd = (string)($_POST['price_usd'] ?? '');
        $stock = (int)($_POST['stock_quantity'] ?? 0) ?: null;
        $active = isset($_POST['is_active']);
        if ($title === '' || bccomp($priceBtc, '0', 8) !== 1) {
            return $this->redirect('/vendor/product/edit?id=' . $id);
        }
        Product::update($id, (int)$vendor['id'], [
            'category_id' => $categoryId,
            'title' => $title,
            'slug' => $slug,
            'description' => $desc,
            'price_btc' => $priceBtc,
            'price_usd' => $priceUsd ?: null,
            'stock_quantity' => $stock,
            'is_active' => $active
        ]);
        $this->handleUpload($id);
        return $this->redirect('/vendor/products');
    }

    private function handleUpload(int $productId): void
    {
        if (empty($_FILES['image']['name'])) return;
        $f = $_FILES['image'];
        if ($f['error'] !== UPLOAD_ERR_OK) return;
        if (!is_uploaded_file($f['tmp_name'])) return;
        if ($f['size'] > 2*1024*1024) return; // 2MB

        $imageType = function_exists('exif_imagetype') ? @exif_imagetype($f['tmp_name']) : false;
        if ($imageType === IMAGETYPE_JPEG) {
            $ext = 'jpg';
        } elseif ($imageType === IMAGETYPE_PNG) {
            $ext = 'png';
        } else {
            // Fallback MIME check
            $fi = finfo_open(FILEINFO_MIME_TYPE);
            $mime = $fi ? @finfo_file($fi, $f['tmp_name']) : '';
            if ($fi) finfo_close($fi);
            if ($mime === 'image/jpeg') { $ext = 'jpg'; $imageType = IMAGETYPE_JPEG; }
            elseif ($mime === 'image/png') { $ext = 'png'; $imageType = IMAGETYPE_PNG; }
            else { return; }
        }

        // Validate dimensions
        $dim = @getimagesize($f['tmp_name']);
        if (!$dim) return;
        [$w, $h] = $dim;
        if ($w < 1 || $h < 1 || $w > 6000 || $h > 6000) return;

        $dir = dirname(__DIR__,2) . '/public/uploads/products/';
        if (!is_dir($dir)) { @mkdir($dir, 0755, true); }
        $name = bin2hex(random_bytes(12)) . '.' . $ext;
        $path = $dir . $name;

        // Re-encode to strip metadata and ensure valid image structure (if GD available)
        $reencoded = false;
        if (extension_loaded('gd')) {
            if ($imageType === IMAGETYPE_JPEG && function_exists('imagecreatefromjpeg')) {
                $src = @imagecreatefromjpeg($f['tmp_name']);
                if ($src) {
                    @imagejpeg($src, $path, 85);
                    imagedestroy($src);
                    $reencoded = true;
                }
            } elseif ($imageType === IMAGETYPE_PNG && function_exists('imagecreatefrompng')) {
                $src = @imagecreatefrompng($f['tmp_name']);
                if ($src) {
                    imagesavealpha($src, true);
                    @imagepng($src, $path, 6);
                    imagedestroy($src);
                    $reencoded = true;
                }
            }
        }

        if (!$reencoded) {
            if (!move_uploaded_file($f['tmp_name'], $path)) { return; }
        }

        @chmod($path, 0644);
        \Core\DB::pdo()->prepare('INSERT INTO product_images (product_id, image_path) VALUES (?, ?)')
            ->execute([$productId, '/uploads/products/' . $name]);
    }
}
