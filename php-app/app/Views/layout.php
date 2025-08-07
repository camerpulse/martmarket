<?php
namespace App\Views; // Not a real namespace, but this file is included to layout content
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= htmlspecialchars($title ?? 'MartMarket') ?></title>
  <?php $metaDescription = $metaDescription ?? 'MartMarket anonymous marketplace – browse products, vendors, and secure escrow with Bitcoin payments.'; ?>
  <meta name="description" content="<?= htmlspecialchars($metaDescription) ?>">
  <?php $canonical = (($_SERVER['HTTPS'] ?? 'off') === 'on' ? 'https://' : 'http://') . ($_SERVER['HTTP_HOST'] ?? 'localhost') . ($_SERVER['REQUEST_URI'] ?? '/'); ?>
  <link rel="canonical" href="<?= htmlspecialchars($canonical) ?>">
  <meta property="og:title" content="<?= htmlspecialchars($title ?? 'MartMarket') ?>">
  <meta property="og:description" content="<?= htmlspecialchars($metaDescription) ?>">
  <meta property="og:url" content="<?= htmlspecialchars($canonical) ?>">
  <meta property="og:type" content="website">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#0b0c10;color:#e6edf3;margin:0}
    header,main,footer{max-width:960px;margin:0 auto;padding:16px}
    a{color:#5ab1f6;text-decoration:none}
    .card{background:#111217;border:1px solid #1f2430;border-radius:12px;padding:16px;margin:16px 0}
    .btn{background:#5ab1f6;border:none;color:#0b0c10;padding:10px 14px;border-radius:8px;cursor:pointer;font-weight:600}
    .btn.secondary{background:#2b2f3a;color:#e6edf3}
    input,textarea,select{width:100%;padding:10px;border-radius:8px;border:1px solid #2b2f3a;background:#0f1116;color:#e6edf3}
    label{display:block;margin:8px 0 4px}
    .row{display:flex;gap:16px}
    .col{flex:1}
    .error{color:#ff6b6b;font-weight:600}
    nav a{margin-right:12px}
  </style>
</head>
<body>
<header>
  <nav>
    <a href="/">Home</a>
    <a href="/catalog">Shop</a>
    <?php if(!empty($_SESSION['uid'])): ?>
      <a href="/account/profile">Profile</a>
      <a href="/messages">Messages</a>
      <a href="/wishlist">Wishlist</a>
      <a href="/affiliate">Affiliate</a>
      <?php if(($_SESSION['role'] ?? 'buyer') === 'vendor'): ?>
        <a href="/vendor/dashboard">Vendor</a>
        <a href="/vendor/products">My Products</a>
      <?php endif; ?>
      <?php if(($_SESSION['role'] ?? 'buyer') === 'admin'): ?>
        <a href="/admin">Admin</a>
        <a href="/admin/users">Users</a>
        <a href="/admin/vendors">Vendor Verifications</a>
        <a href="/admin/orders">Orders</a>
        <a href="/admin/disputes">Disputes</a>
        <a href="/admin/categories">Categories</a>
        <a href="/admin/translations">Translations</a>
        <a href="/admin/payments">Payments</a>
        <a href="/admin/affiliate/payouts">Affiliate Payouts</a>
      <?php endif; ?>
      <a href="/logout">Logout</a>
    <?php else: ?>
      <a href="/login">Login</a>
      <a href="/register">Register</a>
    <?php endif; ?>
  </nav>
</header>
<main>
  <div class="card">
    <?php include $viewFile; ?>
  </div>
</main>
<footer>
  <small>&copy; <?= date('Y') ?> MartMarket</small>
</footer>
</body>
</html>
