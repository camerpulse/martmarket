<?php
// Front controller
declare(strict_types=1);

// Use Composer autoload if available
$vendorAutoload = __DIR__ . '/../vendor/autoload.php';
if (file_exists($vendorAutoload)) {
    require $vendorAutoload;
}

require_once __DIR__ . '/../core/Config.php';
require_once __DIR__ . '/../core/Session.php';
require_once __DIR__ . '/../core/Router.php';
require_once __DIR__ . '/../core/DB.php';
require_once __DIR__ . '/../core/Csrf.php';
require_once __DIR__ . '/../core/Controller.php';
require_once __DIR__ . '/../core/View.php';

use Core\Config;
use Core\Session;
use Core\Router;

Session::start();

// Redirect to installer if config not present
if (!file_exists(__DIR__ . '/../config/app.php') || !file_exists(__DIR__ . '/../config/database.php') || !file_exists(__DIR__ . '/../config/security.php')) {
    header('Location: /installer/');
    exit;
}

// Load configs
Config::load(__DIR__ . '/../config/app.php');
Config::load(__DIR__ . '/../config/database.php');
Config::load(__DIR__ . '/../config/security.php');

// Basic security headers
header('X-Frame-Options: SAMEORIGIN');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');

$router = new Router();

// Routes
$router->get('/', function() {
    echo \Core\View::render('auth/login', ['title' => 'Login']);
});

// Auth routes
require_once __DIR__ . '/../app/Controllers/AuthController.php';
require_once __DIR__ . '/../app/Controllers/ProfileController.php';
require_once __DIR__ . '/../app/Controllers/VendorController.php';
require_once __DIR__ . '/../app/Controllers/VendorProductController.php';
require_once __DIR__ . '/../app/Controllers/CatalogController.php';
require_once __DIR__ . '/../app/Controllers/Admin/VendorAdminController.php';
require_once __DIR__ . '/../app/Controllers/Admin/CategoryAdminController.php';

$auth = new App\Controllers\AuthController();
$profile = new App\Controllers\ProfileController();
$vendorCtrl = new App\Controllers\VendorController();
$vendorProd = new App\Controllers\VendorProductController();
$catalog = new App\Controllers\CatalogController();
$adminVendor = new App\Controllers\Admin\VendorAdminController();
$adminCategory = new App\Controllers\Admin\CategoryAdminController();

$router->get('/login', [$auth, 'loginForm']);
$router->post('/login', [$auth, 'login']);
$router->get('/register', [$auth, 'registerForm']);
$router->post('/register', [$auth, 'register']);
$router->get('/logout', [$auth, 'logout']);
$router->get('/2fa/setup', [$auth, 'twofaSetupForm']);
$router->post('/2fa/setup', [$auth, 'twofaSetup']);
$router->post('/2fa/verify', [$auth, 'twofaVerify']);

// Profile
$router->get('/account/profile', [$profile, 'profileForm']);
$router->post('/account/profile', [$profile, 'updateProfile']);
$router->post('/account/pgp/add', [$profile, 'addPGP']);
$router->post('/account/pgp/default', [$profile, 'setDefaultPGP']);

// Catalog
$router->get('/catalog', [$catalog, 'index']);
$router->get('/product/view', [$catalog, 'product']);

// Vendor
$router->get('/vendor/dashboard', [$vendorCtrl, 'dashboard']);
$router->get('/vendor/products', [$vendorProd, 'index']);
$router->get('/vendor/product/new', [$vendorProd, 'createForm']);
$router->post('/vendor/product/store', [$vendorProd, 'store']);
$router->post('/vendor/request-verification', [$vendorCtrl, 'requestVerification']);

// Admin Vendors
$router->get('/admin/vendors', [$adminVendor, 'index']);
$router->post('/admin/vendors/approve', [$adminVendor, 'approve']);
$router->post('/admin/vendors/reject', [$adminVendor, 'reject']);

// Admin Categories
$router->get('/admin/categories', [$adminCategory, 'index']);
$router->post('/admin/categories/create', [$adminCategory, 'create']);

$router->dispatch();
