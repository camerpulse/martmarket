<?php
namespace App\Controllers;

use Core\Controller;
use Core\Config;
use App\Models\Category;
use App\Models\Product;

class CatalogController extends Controller
{
    private const PER_PAGE = 24;

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
                // Redirect legacy numeric category param to slug URL for SEO
                $cat = Category::find($categoryId);
                if ($cat) {
                    $qs = [];
                    if ($q) { $qs['q'] = $q; }
                    if ($page > 1) { $qs['page'] = $page; }
                    $qsStr = $qs ? ('?' . http_build_query($qs)) : '';
                    header('Location: /category/' . rawurlencode($cat['slug']) . $qsStr, true, 301);
                    exit;
                }
            } else {
                $activeCategory = Category::findBySlug(trim((string)$categoryParam));
                if ($activeCategory) { $categoryId = (int)$activeCategory['id']; }
            }
        }
        $q = isset($_GET['q']) ? trim((string)$_GET['q']) : null;
        $page = max(1, (int)($_GET['page'] ?? 1));
        $perPage = self::PER_PAGE;
        $total = Product::countSearch($categoryId, $q);
        $offset = ($page - 1) * $perPage;
        $products = Product::search($categoryId, $q, $perPage, $offset);
        $pages = (int)max(1, ceil($total / $perPage));
        $title = $activeCategory ? ('Browse ' . $activeCategory['name']) : 'Browse Products';
        if ($q) { $title .= ' – Search: ' . $q; }
        $metaDescription = $activeCategory
            ? ('Browse ' . $activeCategory['name'] . ' on MartMarket. Secure Bitcoin escrow, anonymous shopping.')
            : 'Browse products on MartMarket with secure Bitcoin escrow. Search, filter categories, and shop anonymously.';
        // Canonical URL prefers friendly category slug path when available
        $baseUrl = rtrim(Config::get('app.base_url', ''), '/');
        if ($baseUrl === '') {
            $scheme = ((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https')) ? 'https' : 'http';
            $baseUrl = $scheme . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost');
        }
        $canonical = $baseUrl . ($activeCategory ? ('/category/' . $activeCategory['slug']) : '/catalog');
        return $this->view('catalog/index', [
            'title' => $title,
            'metaDescription' => $metaDescription,
            'canonical' => $canonical,
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
        // Legacy ID-based URL: redirect to canonical slug URL when possible
        if ($id > 0 && !$slug) {
            $p = \App\Models\Product::find($id);
            if ($p && !empty($p['slug'])) {
                header('Location: /product/' . rawurlencode($p['slug']), true, 301);
                exit;
            }
        }
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
