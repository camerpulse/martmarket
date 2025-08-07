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
// Optional configs
Config::load(__DIR__ . '/../config/mail.php');
Config::load(__DIR__ . '/../config/payments.php');

// Basic security headers
header('X-Frame-Options: SAMEORIGIN');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');

$router = new Router();

// Routes
$router->get('/', function() {
    echo \Core\View::render('catalog/index', ['title' => 'Browse Products']);
});

// Auth routes
require_once __DIR__ . '/../app/Controllers/AuthController.php';
require_once __DIR__ . '/../app/Controllers/ProfileController.php';
require_once __DIR__ . '/../app/Controllers/VendorController.php';
require_once __DIR__ . '/../app/Controllers/VendorProductController.php';
require_once __DIR__ . '/../app/Controllers/CatalogController.php';
require_once __DIR__ . '/../app/Controllers/OrderController.php';
require_once __DIR__ . '/../app/Controllers/MessageController.php';
require_once __DIR__ . '/../app/Controllers/ReviewsController.php';
require_once __DIR__ . '/../app/Controllers/DisputeController.php';
require_once __DIR__ . '/../app/Controllers/WishlistController.php';
require_once __DIR__ . '/../app/Controllers/Admin/VendorAdminController.php';
require_once __DIR__ . '/../app/Controllers/Admin/CategoryAdminController.php';
require_once __DIR__ . '/../app/Controllers/Admin/UserAdminController.php';
require_once __DIR__ . '/../app/Controllers/Admin/OrderAdminController.php';
require_once __DIR__ . '/../app/Controllers/CheckoutController.php';
require_once __DIR__ . '/../app/Controllers/Admin/PaymentSettingsController.php';
require_once __DIR__ . '/../app/Controllers/Admin/DisputeAdminController.php';
require_once __DIR__ . '/../app/Controllers/Admin/AdminDashboardController.php';
require_once __DIR__ . '/../app/Controllers/Admin/TranslationAdminController.php';
require_once __DIR__ . '/../app/Controllers/Admin/AffiliateAdminController.php';
require_once __DIR__ . '/../app/Controllers/CronController.php';

$auth = new App\Controllers\AuthController();
$profile = new App\Controllers\ProfileController();
$vendorCtrl = new App\Controllers\VendorController();
$vendorProd = new App\Controllers\VendorProductController();
$catalog = new App\Controllers\CatalogController();
$messages = new App\Controllers\MessageController();
$reviews = new App\Controllers\ReviewsController();
$disputes = new App\Controllers\DisputeController();
$wishlist = new App\Controllers\WishlistController();
$affiliate = new App\Controllers\ReferralController();
$checkout = new App\Controllers\CheckoutController();
$adminVendor = new App\Controllers\Admin\VendorAdminController();
$adminCategory = new App\Controllers\Admin\CategoryAdminController();
$adminUsers = new App\Controllers\Admin\UserAdminController();
$adminOrders = new App\Controllers\Admin\OrderAdminController();
$adminPayments = new App\Controllers\Admin\PaymentSettingsController();
$adminDisputes = new App\Controllers\Admin\DisputeAdminController();
$adminDashboard = new App\Controllers\Admin\AdminDashboardController();
$adminTranslations = new App\Controllers\Admin\TranslationAdminController();
$adminAffiliate = new App\Controllers\Admin\AffiliateAdminController();

// Home -> Catalog
$router->get('/', [$catalog, 'index']);

$router->get('/login', [$auth, 'loginForm']);
$router->post('/login', [$auth, 'login']);
$router->get('/register', [$auth, 'registerForm']);
$router->post('/register', [$auth, 'register']);
$router->get('/logout', [$auth, 'logout']);
$router->get('/2fa/setup', [$auth, 'twofaSetupForm']);
$router->post('/2fa/setup', [$auth, 'twofaSetup']);
$router->post('/2fa/verify', [$auth, 'twofaVerify']);
$router->get('/password/forgot', [$auth, 'forgotForm']);
$router->post('/password/forgot', [$auth, 'forgot']);
$router->get('/password/reset', [$auth, 'resetForm']);
$router->post('/password/reset', [$auth, 'reset']);

// Profile
$router->get('/account/profile', [$profile, 'profileForm']);
$router->post('/account/profile', [$profile, 'updateProfile']);
$router->post('/account/pgp/add', [$profile, 'addPGP']);
$router->post('/account/pgp/default', [$profile, 'setDefaultPGP']);

// Catalog
$router->get('/catalog', [$catalog, 'index']);
$router->get('/product/view', [$catalog, 'product']); // legacy
$router->get('/product/([A-Za-z0-9\-]+)', [$catalog, 'product']); // handled via .htaccess rewrite


// Vendor
$router->get('/vendor/dashboard', [$vendorCtrl, 'dashboard']);
$router->get('/vendor/products', [$vendorProd, 'index']);
$router->get('/vendor/product/new', [$vendorProd, 'createForm']);
$router->get('/vendor/product/edit', [$vendorProd, 'editForm']);
$router->post('/vendor/product/store', [$vendorProd, 'store']);
$router->post('/vendor/product/update', [$vendorProd, 'update']);
$router->post('/vendor/request-verification', [$vendorCtrl, 'requestVerification']);
$router->get('/vendor/view', [$vendorCtrl, 'view']);
$router->get('/vendor/orders', [$vendorCtrl, 'orders']);
$router->get('/vendor/orders/view', [$vendorCtrl, 'orderView']);
$router->post('/vendor/orders/ship', [$vendorCtrl, 'markShipped']);
$router->get('/vendor/orders/export', [$vendorCtrl, 'exportOrders']);
$router->get('/vendor/disputes', [$disputes, 'vendorIndex']);
$router->post('/vendor/disputes/update', [$disputes, 'vendorUpdate']);

// Messages
$router->get('/messages', [$messages, 'index']);
$router->get('/messages/view', [$messages, 'view']);
$router->post('/messages/start', [$messages, 'start']);
$router->post('/messages/send', [$messages, 'send']);

// Orders (buyer)
$router->get('/orders', [new App\Controllers\OrderController(), 'index']);
$router->get('/orders/view', [new App\Controllers\OrderController(), 'view']);
$router->post('/orders/received', [new App\Controllers\OrderController(), 'markReceived']);

// Reviews
$router->get('/reviews/new', [$reviews, 'new']);
$router->post('/reviews/create', [$reviews, 'create']);

// User Disputes
$router->get('/disputes', [$disputes, 'index']);
$router->get('/disputes/new', [$disputes, 'new']);
$router->get('/disputes/view', [$disputes, 'view']);
$router->post('/disputes/create', [$disputes, 'create']);

// Admin Categories
$router->get('/admin/categories', [$adminCategory, 'index']);
$router->post('/admin/categories/create', [$adminCategory, 'create']);

// Admin Payments
$router->get('/admin/payments', [$adminPayments, 'settings']);
$router->post('/admin/payments/save', [$adminPayments, 'save']);
$router->post('/admin/payments/check', [$adminPayments, 'check']);

// Admin Dashboard
$router->get('/admin', [$adminDashboard, 'index']);

// Admin Users
$router->get('/admin/users', [$adminUsers, 'index']);
$router->post('/admin/users/update', [$adminUsers, 'update']);

// Admin Orders
$router->get('/admin/orders', [$adminOrders, 'index']);
$router->get('/admin/orders/view', [$adminOrders, 'view']);
$router->post('/admin/orders/update', [$adminOrders, 'update']);
$router->post('/admin/orders/release', [$adminOrders, 'release']);

// Admin Disputes
$router->get('/admin/disputes', [$adminDisputes, 'index']);
$router->post('/admin/disputes/update', [$adminDisputes, 'update']);

// Admin Translations
$router->get('/admin/translations', [$adminTranslations, 'index']);
$router->post('/admin/translations/save', [$adminTranslations, 'save']);

// Wishlist
$router->get('/wishlist', [$wishlist, 'index']);
$router->post('/wishlist/add', [$wishlist, 'add']);
$router->post('/wishlist/remove', [$wishlist, 'remove']);

// Affiliate
$router->get('/affiliate', [$affiliate, 'index']);
$router->get('/affiliate/payouts', [$affiliate, 'payouts']);
$router->post('/affiliate/payout/request', [$affiliate, 'requestPayout']);
// Admin Affiliate
$router->get('/admin/affiliate/payouts', [$adminAffiliate, 'payouts']);
$router->post('/admin/affiliate/payouts/update', [$adminAffiliate, 'updatePayout']);

// Checkout
$router->get('/checkout/start', [$checkout, 'start']);
$router->get('/checkout/view', [$checkout, 'view']);
$router->get('/checkout/status', [$checkout, 'status']);

// Cron endpoints (token protected)
$router->get('/cron/payments', [new App\Controllers\CronController(), 'payments']);

$router->dispatch();
