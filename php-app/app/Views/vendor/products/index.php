<?php
$title = 'My Products';
$products = $products ?? [];
?>
<h1>My Products</h1>
<p><a class="btn" href="/vendor/product/new">Add Product</a></p>
<?php if(!$products): ?>
  <p>No products yet.</p>
<?php else: ?>
  <table style="width:100%;border-collapse:collapse">
    <thead>
      <tr>
        <th style="text-align:left;border-bottom:1px solid #2b2f3a">Title</th>
        <th style="text-align:left;border-bottom:1px solid #2b2f3a">Price BTC</th>
        <th style="text-align:left;border-bottom:1px solid #2b2f3a">Active</th>
        <th style="text-align:left;border-bottom:1px solid #2b2f3a">Link</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach($products as $p): ?>
        <tr>
          <td><?= htmlspecialchars($p['title']) ?></td>
          <td><?= htmlspecialchars($p['price_btc']) ?></td>
          <td><?= ((int)$p['is_active'])===1?'Yes':'No' ?></td>
          <td><a class="btn secondary" href="/product/<?= htmlspecialchars($p['slug']) ?>">View</a></td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
<?php endif; ?>
