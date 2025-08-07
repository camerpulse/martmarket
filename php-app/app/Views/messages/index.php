<?php
$title = 'Messages';
$threads = $threads ?? [];
?>
<h1>Messages</h1>
<?php if(!$threads): ?>
  <p>No threads yet.</p>
<?php else: ?>
  <ul>
    <?php foreach($threads as $t): ?>
      <li>
        <a href="/messages/view?id=<?= (int)$t['id'] ?>">
          <?= htmlspecialchars($t['subject'] ?: ('Thread #' . (int)$t['id'])) ?>
        </a>
      </li>
    <?php endforeach; ?>
  </ul>
<?php endif; ?>
<hr>
<h2>Start New Thread</h2>
<form method="post" action="/messages/start">
  <input type="hidden" name="_csrf" value="<?= htmlspecialchars(\Core\Csrf::token()) ?>">
  <label>Subject</label>
  <input name="subject">
  <?php if(($_SESSION['role'] ?? 'buyer') === 'buyer'): ?>
    <label>Vendor ID</label>
    <input type="number" name="vendor_id" min="1" required>
  <?php else: ?>
    <label>Buyer User ID</label>
    <input type="number" name="buyer_id" min="1" required>
  <?php endif; ?>
  <label>Order ID (optional)</label>
  <input type="number" name="order_id" min="1">
  <button class="btn" type="submit">Create Thread</button>
</form>
