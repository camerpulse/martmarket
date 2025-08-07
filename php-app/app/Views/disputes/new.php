<?php
$title = 'Open Dispute';
$orderId = $orderId ?? null;
?>
<h1>Open Dispute</h1>
<form method="post" action="/disputes/create">
  <input type="hidden" name="_csrf" value="<?= htmlspecialchars(\Core\Csrf::token()) ?>">
  <label>Order ID</label>
  <input name="order_id" type="number" value="<?= (int)$orderId ?>" required>
  <label>Reason</label>
  <textarea name="reason" rows="4" placeholder="Describe the issue..." required></textarea>
  <button class="btn" type="submit">Submit</button>
</form>
