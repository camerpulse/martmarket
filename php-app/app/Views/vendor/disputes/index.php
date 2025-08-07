<?php
$title = $title ?? 'Disputes';
$rows = $rows ?? [];
?>
<h1><?= htmlspecialchars($title) ?></h1>
<?php if(!$rows): ?>
  <p>No disputes for your orders.</p>
<?php else: ?>
  <table style="width:100%;border-collapse:collapse">
    <thead>
      <tr>
        <th style="text-align:left;border-bottom:1px solid #2b2f3a">ID</th>
        <th style="text-align:left;border-bottom:1px solid #2b2f3a">Order</th>
        <th style="text-align:left;border-bottom:1px solid #2b2f3a">Opened By</th>
        <th style="text-align:left;border-bottom:1px solid #2b2f3a">Status</th>
        <th style="text-align:left;border-bottom:1px solid #2b2f3a">Reason</th>
        <th style="text-align:left;border-bottom:1px solid #2b2f3a">Resolution</th>
        <th style="text-align:left;border-bottom:1px solid #2b2f3a">Actions</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach($rows as $r): ?>
        <tr>
          <td>#<?= (int)$r['id'] ?></td>
          <td>
            <a href="/vendor/orders/view?id=<?= (int)$r['order_id'] ?>">Order #<?= (int)$r['order_id'] ?></a>
          </td>
          <td>User #<?= (int)$r['opened_by'] ?></td>
          <td><?= htmlspecialchars($r['status']) ?></td>
          <td><?= nl2br(htmlspecialchars($r['reason'] ?? '')) ?></td>
          <td><?= nl2br(htmlspecialchars($r['resolution'] ?? '')) ?></td>
          <td>
            <form method="post" action="/vendor/disputes/update" style="display:flex;flex-direction:column;gap:6px;max-width:340px">
              <input type="hidden" name="_csrf" value="<?= htmlspecialchars(\Core\Csrf::token()) ?>">
              <input type="hidden" name="id" value="<?= (int)$r['id'] ?>">
              <label>Status
                <select name="status">
                  <?php $opts = ['open'=>'Open','in_review'=>'In review','resolved_buyer'=>'Resolved (Buyer)','resolved_vendor'=>'Resolved (Vendor)','cancelled'=>'Cancelled']; ?>
                  <?php foreach($opts as $val=>$label): ?>
                    <option value="<?= $val ?>" <?= ($r['status']===$val?'selected':'') ?>><?= $label ?></option>
                  <?php endforeach; ?>
                </select>
              </label>
              <label>Resolution / Reply
                <textarea name="resolution" rows="3" placeholder="Write your reply or resolution..."><?= htmlspecialchars($r['resolution'] ?? '') ?></textarea>
              </label>
              <button class="btn" type="submit">Update</button>
            </form>
          </td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
<?php endif; ?>
