<?php
$title = 'Orders';
$rows = $rows ?? [];
$page = (int)($page ?? 1);
$pages = (int)($pages ?? 1);
?>
<h1>Orders</h1>
<?php if(!$rows): ?>
  <p>No orders found.</p>
<?php else: ?>
  <table style="width:100%;border-collapse:collapse">
    <thead>
      <tr>
        <th style="text-align:left;border-bottom:1px solid #2b2f3a">ID</th>
        <th style="text-align:left;border-bottom:1px solid #2b2f3a">Order #</th>
        <th style="text-align:left;border-bottom:1px solid #2b2f3a">Status</th>
        <th style="text-align:left;border-bottom:1px solid #2b2f3a">Expected BTC</th>
        <th style="text-align:left;border-bottom:1px solid #2b2f3a">Paid BTC</th>
        <th style="text-align:left;border-bottom:1px solid #2b2f3a">Created</th>
        <th style="text-align:left;border-bottom:1px solid #2b2f3a">Action</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach($rows as $o): ?>
      <tr>
        <td><?= (int)$o['id'] ?></td>
        <td><?= htmlspecialchars($o['order_number']) ?></td>
        <td><?= htmlspecialchars($o['status']) ?></td>
        <td><?= htmlspecialchars($o['btc_expected_amount']) ?></td>
        <td><?= htmlspecialchars($o['btc_paid_amount']) ?></td>
        <td><?= htmlspecialchars($o['created_at']) ?></td>
        <td><a class="btn secondary" href="/admin/orders/view?id=<?= (int)$o['id'] ?>">View</a></td>
      </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
  <?php if($pages > 1): ?>
    <div class="row" style="justify-content:space-between">
      <div><?php if($page>1): ?><a class="btn secondary" href="?page=<?= $page-1 ?>">&larr; Prev</a><?php endif; ?></div>
      <div>Page <?= $page ?> of <?= $pages ?></div>
      <div><?php if($page<$pages): ?><a class="btn secondary" href="?page=<?= $page+1 ?>">Next &rarr;</a><?php endif; ?></div>
    </div>
  <?php endif; ?>
<?php endif; ?>
