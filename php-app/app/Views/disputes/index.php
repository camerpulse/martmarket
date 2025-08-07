<?php
$title = 'My Disputes';
$rows = $rows ?? [];
?>
<h1>My Disputes</h1>
<p><a class="btn" href="/disputes/new">Open Dispute</a></p>
<?php if(!$rows): ?>
  <p>No disputes yet.</p>
<?php else: ?>
  <table style="width:100%;border-collapse:collapse">
    <thead>
      <tr>
        <th style="text-align:left;border-bottom:1px solid #2b2f3a">ID</th>
        <th style="text-align:left;border-bottom:1px solid #2b2f3a">Order</th>
        <th style="text-align:left;border-bottom:1px solid #2b2f3a">Status</th>
        <th style="text-align:left;border-bottom:1px solid #2b2f3a">Reason</th>
        <th style="text-align:left;border-bottom:1px solid #2b2f3a">Resolution</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach($rows as $r): ?>
        <tr>
          <td><?= (int)$r['id'] ?></td>
          <td>#<?= (int)$r['order_id'] ?></td>
          <td><?= htmlspecialchars($r['status']) ?></td>
          <td><?= nl2br(htmlspecialchars($r['reason'] ?? '')) ?></td>
          <td><?= nl2br(htmlspecialchars($r['resolution'] ?? '')) ?></td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
<?php endif; ?>
