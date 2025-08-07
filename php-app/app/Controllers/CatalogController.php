<?php
namespace App\Controllers;

use Core\Controller;
use App\Models\Category;
use App\Models\Product;

class CatalogController extends Controller
{
public function index(): string
    {
        $categories = Category::all();
        $categoryId = isset($_GET['category']) ? (int)$_GET['category'] : null;
        $q = isset($_GET['q']) ? trim((string)$_GET['q']) : null;
        $page = max(1, (int)($_GET['page'] ?? 1));
        $perPage = 24;
        $total = Product::countSearch($categoryId, $q);
        $offset = ($page - 1) * $perPage;
        $products = Product::search($categoryId, $q, $perPage, $offset);
        $pages = (int)max(1, ceil($total / $perPage));
        return $this->view('catalog/index', [
            'title' => 'Browse Products',
            'metaDescription' => 'Browse products on MartMarket with secure Bitcoin escrow. Search, filter categories, and shop anonymously.',
            'categories' => $categories,
            'products' => $products,
            'q' => $q,
            'categoryId' => $categoryId,
            'page' => $page,
            'pages' => $pages,
            'total' => $total
        ]);
    }

    public function product(): string
    {
        $slug = isset($_GET['slug']) ? trim((string)$_GET['slug']) : null;
        $id = (int)($_GET['id'] ?? 0);
        $product = null;
        if ($slug) {
            $product = Product::findBySlug($slug);
        } elseif ($id > 0) {
            $product = Product::find($id);
        }
        if (!$product || (int)$product['is_active'] !== 1) { http_response_code(404); return 'Product not found'; }
        $images = \App\Models\ProductImage::listByProduct((int)$product['id']);
        $vendor = \App\Models\Vendor::find((int)$product['vendor_id']);
        return $this->view('catalog/product', [ 
            'title' => $product['title'] . ' – Product',
            'metaDescription' => substr(strip_tags((string)($product['description'] ?? '')), 0, 150),
            'product' => $product,
            'images' => $images,
            'vendor' => $vendor,
        ]);
    }
}
