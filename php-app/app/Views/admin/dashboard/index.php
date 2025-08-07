<?php
$title = 'Admin Dashboard';
$stats = $stats ?? [];
?>
<h1>Admin Dashboard</h1>
<div class="row">
  <div class="col">
    <div class="card">
      <h3>Users</h3>
      <p><strong>Total:</strong> <?= (int)($stats['users'] ?? 0) ?></p>
    </div>
  </div>
  <div class="col">
    <div class="card">
      <h3>Vendors</h3>
      <p><strong>Total:</strong> <?= (int)($stats['vendors'] ?? 0) ?></p>
      <p><strong>Pending Verifications:</strong> <?= (int)($stats['vendor_pending'] ?? 0) ?></p>
      <p><a class="btn secondary" href="/admin/vendors">Manage Verifications</a></p>
    </div>
  </div>
</div>
<div class="row">
  <div class="col">
    <div class="card">
      <h3>Orders</h3>
      <p><strong>Total:</strong> <?= (int)($stats['orders_total'] ?? 0) ?></p>
      <p><strong>In Escrow:</strong> <?= (int)($stats['orders_escrow'] ?? 0) ?></p>
      <p><strong>Disputed:</strong> <?= (int)($stats['orders_disputed'] ?? 0) ?></p>
      <p><a class="btn secondary" href="/admin/disputes">View Disputes</a></p>
    </div>
  </div>
  <div class="col">
    <div class="card">
      <h3>Translations</h3>
      <p><strong>Locales:</strong> <?= htmlspecialchars(implode(', ', $locales ?? [])) ?></p>
      <p><a class="btn" href="/admin/translations">Open Translations</a></p>
    </div>
  </div>
</div>
<div class="card">
  <h3>Quick Links</h3>
  <p>
    <a class="btn secondary" href="/admin/categories">Categories</a>
    <a class="btn secondary" href="/admin/payments">Payments</a>
  </p>
</div>
