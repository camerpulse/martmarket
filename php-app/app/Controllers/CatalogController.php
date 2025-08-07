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
        $products = Product::search($categoryId, $q, 30, 0);
        return $this->view('catalog/index', [
            'title' => 'Browse Products',
            'categories' => $categories,
            'products' => $products,
            'q' => $q,
            'categoryId' => $categoryId
        ]);
    }

    public function product(): string
    {
        $id = (int)($_GET['id'] ?? 0);
        if ($id <= 0) { http_response_code(404); return 'Product not found'; }
        $product = Product::find($id);
        if (!$product || (int)$product['is_active'] !== 1) { http_response_code(404); return 'Product not found'; }
        return $this->view('catalog/product', [ 'title' => $product['title'] . ' – Product', 'product' => $product ]);
    }
}
