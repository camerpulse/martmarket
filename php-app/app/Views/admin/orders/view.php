<?php
$order = $order ?? null; $items = $items ?? [];
if(!$order){ echo 'Order not found'; return; }
$title = 'Order #' . htmlspecialchars($order['order_number']);
?>
<h1><?= $title ?></h1>
<div class="card">
  <p><strong>Status:</strong> <?= htmlspecialchars($order['status']) ?></p>
  <p><strong>BTC Address:</strong> <?= htmlspecialchars($order['btc_address']) ?></p>
  <p><strong>Expected BTC:</strong> <?= htmlspecialchars($order['btc_expected_amount']) ?> • <strong>Paid:</strong> <?= htmlspecialchars($order['btc_paid_amount']) ?></p>
  <p><strong>Confirmations:</strong> <?= (int)$order['confirmations'] ?></p>
</div>
<div class="card">
  <h3>Update Status</h3>
  <form method="post" action="/admin/orders/update">
    <input type="hidden" name="_csrf" value="<?= htmlspecialchars(\Core\Csrf::token()) ?>">
    <input type="hidden" name="id" value="<?= (int)$order['id'] ?>">
    <select name="status">
      <?php foreach(['pending','awaiting_payment','paid','in_escrow','shipped','completed','cancelled','disputed'] as $s): ?>
        <option value="<?= $s ?>" <?= $order['status']===$s?'selected':'' ?>><?= ucfirst(str_replace('_',' ',$s)) ?></option>
      <?php endforeach; ?>
    </select>
    <button class="btn" type="submit">Save</button>
  </form>
</div>
<div class="card">
  <h3>Items</h3>
  <?php if(!$items): ?>
    <p>No items.</p>
  <?php else: ?>
    <table style="width:100%;border-collapse:collapse">
      <thead><tr><th style="text-align:left;border-bottom:1px solid #2b2f3a">Product</th><th style="text-align:left;border-bottom:1px solid #2b2f3a">Qty</th><th style="text-align:left;border-bottom:1px solid #2b2f3a">Price BTC</th><th style="text-align:left;border-bottom:1px solid #2b2f3a">Subtotal</th></tr></thead>
      <tbody>
        <?php foreach($items as $it): ?>
          <tr>
            <td><?= htmlspecialchars($it['title']) ?></td>
            <td><?= (int)$it['quantity'] ?></td>
            <td><?= htmlspecialchars($it['price_btc']) ?></td>
            <td><?= htmlspecialchars($it['subtotal_btc']) ?></td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  <?php endif; ?>
</div>
