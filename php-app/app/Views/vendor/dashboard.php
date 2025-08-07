<?php
$title = 'Vendor Dashboard';
$vendor = $vendor ?? null;
?>
<h1>Vendor Dashboard</h1>
<?php if(!$vendor): ?>
  <p>No vendor profile yet. It will be created automatically when you request verification.</p>
<?php else: ?>
  <p><strong>Store Name:</strong> <?= htmlspecialchars($vendor['store_name'] ?? 'Not set') ?></p>
  <p><strong>Verified:</strong> <?= !empty($vendor['is_verified']) ? 'Yes' : 'No' ?></p>
  <p><strong>Bond Amount:</strong> <?= htmlspecialchars($vendor['bond_amount'] ?? '0.00') ?></p>
  <p><a href="/vendor/orders">View Orders</a> • <a href="/vendor/products">Manage Products</a></p>
<?php endif; ?>
<hr>
<h2>Request Verification</h2>
<form method="post" action="/vendor/request-verification">
  <input type="hidden" name="_csrf" value="<?= htmlspecialchars(\Core\Csrf::token()) ?>">
  <label>Notes for Admin (optional)</label>
  <textarea name="notes" rows="3" placeholder="Provide any relevant info..."></textarea>
  <button class="btn" type="submit">Request Verification</button>
</form>
