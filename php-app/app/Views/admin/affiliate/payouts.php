<?php
$title = 'Affiliate Payout Requests';
$rows = $rows ?? [];
?>
<h1>Affiliate Payout Requests</h1>
<div class="card">
  <?php if(!$rows): ?>
    <p>No payout requests.</p>
  <?php else: ?>
    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr>
          <th style="text-align:left;border-bottom:1px solid #2b2f3a">ID</th>
          <th style="text-align:left;border-bottom:1px solid #2b2f3a">User</th>
          <th style="text-align:left;border-bottom:1px solid #2b2f3a">Amount BTC</th>
          <th style="text-align:left;border-bottom:1px solid #2b2f3a">Address</th>
          <th style="text-align:left;border-bottom:1px solid #2b2f3a">Status</th>
          <th style="text-align:left;border-bottom:1px solid #2b2f3a">Requested</th>
          <th style="text-align:left;border-bottom:1px solid #2b2f3a">Actions</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach($rows as $r): ?>
        <tr>
          <td>#<?= (int)$r['id'] ?></td>
          <td><?= htmlspecialchars($r['email'] ?? ('User #'.(int)$r['referrer_user_id'])) ?></td>
          <td><?= htmlspecialchars($r['amount_btc']) ?></td>
          <td><?= htmlspecialchars($r['btc_address']) ?></td>
          <td><?= htmlspecialchars($r['status']) ?></td>
          <td><?= htmlspecialchars($r['created_at']) ?></td>
          <td>
            <form method="post" action="/admin/affiliate/payouts/update" style="display:inline-block;margin-right:8px">
              <input type="hidden" name="_csrf" value="<?= htmlspecialchars(\Core\Csrf::token()) ?>">
              <input type="hidden" name="id" value="<?= (int)$r['id'] ?>">
              <input type="hidden" name="status" value="approved">
              <button class="btn secondary" type="submit">Approve</button>
            </form>
            <form method="post" action="/admin/affiliate/payouts/update" style="display:inline-block">
              <input type="hidden" name="_csrf" value="<?= htmlspecialchars(\Core\Csrf::token()) ?>">
              <input type="hidden" name="id" value="<?= (int)$r['id'] ?>">
              <input type="hidden" name="status" value="paid">
              <button class="btn" type="submit">Mark Paid</button>
            </form>
          </td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  <?php endif; ?>
</div>
