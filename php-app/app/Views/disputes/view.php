<?php
$d = $d ?? null;
if (!$d) { echo 'Dispute not found'; return; }
$title = $title ?? ('Dispute #' . (int)$d['id']);
?>
<h1><?= htmlspecialchars($title) ?></h1>

<div class="card">
  <h3>Overview</h3>
  <p><strong>Status:</strong> <?= htmlspecialchars($d['status']) ?></p>
  <p><strong>Order:</strong> <a href="/orders/view?id=<?= (int)$d['order_id'] ?>">#<?= (int)$d['order_id'] ?></a></p>
  <p><strong>Opened by:</strong> User #<?= (int)$d['opened_by'] ?></p>
  <p><strong>Opened at:</strong> <?= htmlspecialchars($d['created_at'] ?? '') ?></p>
  <p><strong>Last update:</strong> <?= htmlspecialchars($d['updated_at'] ?? '') ?></p>
</div>

<div class="card">
  <h3>Timeline</h3>
  <ul>
    <li><strong>Opened</strong> — <?= htmlspecialchars($d['created_at'] ?? '') ?></li>
    <li><strong>Current status:</strong> <?= htmlspecialchars($d['status']) ?> — <?= htmlspecialchars($d['updated_at'] ?? $d['created_at'] ?? '') ?></li>
  </ul>
</div>

<div class="card">
  <h3>Reason</h3>
  <p><?= nl2br(htmlspecialchars($d['reason'] ?? '')) ?></p>
</div>

<div class="card">
  <h3>Resolution Notes</h3>
  <?php if(!empty($d['resolution'])): ?>
    <p><?= nl2br(htmlspecialchars($d['resolution'])) ?></p>
  <?php else: ?>
    <p>No resolution notes yet.</p>
  <?php endif; ?>
</div>

<p><a class="btn" href="/disputes">Back to My Disputes</a></p>
