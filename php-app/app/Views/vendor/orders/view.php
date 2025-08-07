<?php
$order = $order ?? null; $items = $items ?? [];
if(!$order){ echo 'Order not found'; return; }
$title = 'Order #' . htmlspecialchars($order['order_number']);
?>
<h1><?= $title ?></h1>
<div class="card" style="display:flex;gap:16px;align-items:flex-start;justify-content:space-between">
  <div style="flex:1">
    <p><strong>Status:</strong> <?= htmlspecialchars($order['status']) ?></p>
    <p><strong>Buyer ID:</strong> #<?= (int)$order['buyer_id'] ?></p>
    <p><strong>Expected BTC:</strong> <?= htmlspecialchars($order['btc_expected_amount']) ?> • <strong>Paid:</strong> <?= htmlspecialchars($order['btc_paid_amount']) ?></p>
    <?php if(!empty($order['tracking_number'])): ?>
      <p><strong>Tracking:</strong> <?= htmlspecialchars($order['tracking_number']) ?> <?= !empty($order['shipped_at']) ? ' • Shipped: '.htmlspecialchars($order['shipped_at']) : '' ?></p>
      <?php if(!empty($order['shipping_note'])): ?><p><strong>Note:</strong> <?= nl2br(htmlspecialchars($order['shipping_note'])) ?></p><?php endif; ?>
    <?php endif; ?>
    <?php if(in_array($order['status'], ['in_escrow','paid'], true)): ?>
      <form method="post" action="/vendor/orders/ship">
        <input type="hidden" name="_csrf" value="<?= htmlspecialchars(\Core\Csrf::token()) ?>">
        <input type="hidden" name="id" value="<?= (int)$order['id'] ?>">
        <label>Tracking Number (optional)</label>
        <input type="text" name="tracking_number" placeholder="e.g. 1Z...">
        <label>Shipping Note (optional)</label>
        <textarea name="shipping_note" rows="3" placeholder="Any details for buyer..."></textarea>
        <button class="btn" type="submit">Mark as Shipped</button>
      </form>
    <?php endif; ?>
  </div>
  <aside style="min-width:280px">
    <h3>Contact Buyer</h3>
    <form method="post" action="/messages/start">
      <input type="hidden" name="_csrf" value="<?= htmlspecialchars(\Core\Csrf::token()) ?>">
      <input type="hidden" name="buyer_id" value="<?= (int)$order['buyer_id'] ?>">
      <input type="hidden" name="order_id" value="<?= (int)$order['id'] ?>">
      <input type="hidden" name="subject" value="Regarding Order #<?= htmlspecialchars($order['order_number']) ?>">
      <button class="btn secondary" type="submit">Message Buyer</button>
    </form>
    <p><small>Creates or reuses the thread linked to this order.</small></p>
    <p><a href="/messages">Open Inbox</a></p>
  </aside>
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
