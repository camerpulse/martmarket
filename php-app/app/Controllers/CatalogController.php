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
        $categoryParam = $_GET['category'] ?? null;
        $categorySlug = isset($_GET['category_slug']) ? trim((string)$_GET['category_slug']) : null;
        $activeCategory = null;
        $categoryId = null;
        if ($categorySlug) {
            $activeCategory = Category::findBySlug($categorySlug);
            if ($activeCategory) { $categoryId = (int)$activeCategory['id']; }
        } elseif ($categoryParam !== null && $categoryParam !== '') {
            if (ctype_digit((string)$categoryParam)) {
                $categoryId = (int)$categoryParam;
            } else {
                $activeCategory = Category::findBySlug(trim((string)$categoryParam));
                if ($activeCategory) { $categoryId = (int)$activeCategory['id']; }
            }
        }
        $q = isset($_GET['q']) ? trim((string)$_GET['q']) : null;
        $page = max(1, (int)($_GET['page'] ?? 1));
        $perPage = 24;
        $total = Product::countSearch($categoryId, $q);
        $offset = ($page - 1) * $perPage;
        $products = Product::search($categoryId, $q, $perPage, $offset);
        $pages = (int)max(1, ceil($total / $perPage));
        $title = $activeCategory ? ('Browse ' . $activeCategory['name']) : 'Browse Products';
        if ($q) { $title .= ' – Search: ' . $q; }
        $metaDescription = $activeCategory
            ? ('Browse ' . $activeCategory['name'] . ' on MartMarket. Secure Bitcoin escrow, anonymous shopping.')
            : 'Browse products on MartMarket with secure Bitcoin escrow. Search, filter categories, and shop anonymously.';
        return $this->view('catalog/index', [
            'title' => $title,
            'metaDescription' => $metaDescription,
            'categories' => $categories,
            'products' => $products,
            'q' => $q,
            'categoryId' => $categoryId,
            'activeCategory' => $activeCategory,
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
        $reviewSummary = \App\Models\Review::summaryForProduct((int)$product['id']);
        $reviews = \App\Models\Review::forProduct((int)$product['id']);
        return $this->view('catalog/product', [ 
            'title' => $product['title'] . ' – Product',
            'metaDescription' => substr(strip_tags((string)($product['description'] ?? '')), 0, 150),
            'product' => $product,
            'images' => $images,
            'vendor' => $vendor,
            'reviewSummary' => $reviewSummary,
            'reviews' => $reviews,
        ]);
    }
}
