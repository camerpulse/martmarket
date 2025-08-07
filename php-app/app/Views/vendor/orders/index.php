<?php
$title = 'Vendor Orders';
$rows = $rows ?? [];
?>
<h1>Vendor Orders</h1>
<div class="card">
  <?php if(!$rows): ?>
    <p>No orders yet.</p>
  <?php else: ?>
    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr>
          <th style="text-align:left;border-bottom:1px solid #2b2f3a">Order #</th>
          <th style="text-align:left;border-bottom:1px solid #2b2f3a">Buyer</th>
          <th style="text-align:left;border-bottom:1px solid #2b2f3a">Status</th>
          <th style="text-align:left;border-bottom:1px solid #2b2f3a">BTC</th>
          <th style="text-align:left;border-bottom:1px solid #2b2f3a">Created</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <?php foreach($rows as $o): ?>
        <tr>
          <td><?= htmlspecialchars($o['order_number']) ?></td>
          <td>#<?= (int)$o['buyer_id'] ?></td>
          <td><?= htmlspecialchars($o['status']) ?></td>
          <td><?= htmlspecialchars($o['btc_expected_amount']) ?></td>
          <td><?= htmlspecialchars($o['created_at']) ?></td>
          <td><a href="/vendor/orders/view?id=<?= (int)$o['id'] ?>">View</a></td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  <?php endif; ?>
</div>
