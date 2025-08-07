<?php
namespace App\Views; // placeholder
?>
<h1>Vendor Storefront</h1>
<?php $vendor = $vendor ?? null; $products = $products ?? []; ?>
<?php if(!$vendor): ?>
  <p>Vendor not found.</p>
<?php else: ?>
  <div class="card">
    <h2><?= htmlspecialchars($vendor['store_name'] ?? ('Vendor #' . (int)$vendor['id'])) ?>
      <?php if(!empty($vendor['is_verified'])): ?>
        <span style="font-size:12px;background:#2b2f3a;border-radius:6px;padding:2px 6px;margin-left:6px">Verified</span>
      <?php endif; ?>
    </h2>
    <p>Total sales: <?= (int)($vendor['total_sales'] ?? 0) ?> • Trust score: <?= (int)($vendor['trust_score'] ?? 0) ?></p>
  </div>
  <?php if(!$products): ?>
    <p>No products yet.</p>
  <?php else: ?>
    <div class="row" style="flex-wrap:wrap">
      <?php foreach($products as $p): ?>
        <div class="card" style="width:280px">
          <h3><?= htmlspecialchars($p['title']) ?></h3>
          <p><strong>BTC:</strong> <?= htmlspecialchars($p['price_btc']) ?></p>
          <a class="btn" href="/product/view?id=<?= (int)$p['id'] ?>">View</a>
        </div>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>
<?php endif; ?>
