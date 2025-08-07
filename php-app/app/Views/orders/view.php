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
  <?php if(!empty($order['tracking_number'])): ?>
    <p><strong>Tracking:</strong> <?= htmlspecialchars($order['tracking_number']) ?> <?= !empty($order['shipped_at']) ? ' • Shipped: '.htmlspecialchars($order['shipped_at']) : '' ?></p>
    <?php if(!empty($order['shipping_note'])): ?><p><strong>Note from vendor:</strong> <?= nl2br(htmlspecialchars($order['shipping_note'])) ?></p><?php endif; ?>
  <?php endif; ?>
  <?php if(in_array($order['status'], ['in_escrow','shipped','paid'], true)): ?>
    <form method="post" action="/orders/received" style="display:inline-block;margin-right:8px">
      <input type="hidden" name="_csrf" value="<?= htmlspecialchars(\Core\Csrf::token()) ?>">
      <input type="hidden" name="id" value="<?= (int)$order['id'] ?>">
      <button class="btn" type="submit">Mark as Received</button>
    </form>
    <a class="btn secondary" href="/disputes/new?order_id=<?= (int)$order['id'] ?>" style="margin-right:8px">Open Dispute</a>
    <form method="post" action="/messages/start" style="display:inline-block">
      <input type="hidden" name="_csrf" value="<?= htmlspecialchars(\Core\Csrf::token()) ?>">
      <input type="hidden" name="vendor_id" value="<?= (int)$order['vendor_id'] ?>">
      <input type="hidden" name="order_id" value="<?= (int)$order['id'] ?>">
      <input type="hidden" name="subject" value="Regarding Order #<?= htmlspecialchars($order['order_number']) ?>">
      <button class="btn secondary" type="submit">Message Vendor</button>
    </form>
  <?php endif; ?>
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
