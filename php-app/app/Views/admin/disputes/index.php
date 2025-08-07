<?php
$title = 'Manage Disputes';
$rows = $rows ?? [];
?>
<h1>Open / In-Review Disputes</h1>
<?php if(!$rows): ?>
  <p>No open disputes.</p>
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
          <td><?= (int)$r['id'] ?></td>
          <td>#<?= (int)$r['order_id'] ?></td>
          <td>User <?= (int)$r['opened_by'] ?></td>
          <td><?= htmlspecialchars($r['status']) ?></td>
          <td><?= nl2br(htmlspecialchars($r['reason'] ?? '')) ?></td>
          <td><?= nl2br(htmlspecialchars($r['resolution'] ?? '')) ?></td>
          <td>
            <form method="post" action="/admin/disputes/update" class="row" style="gap:8px;align-items:flex-start">
              <input type="hidden" name="_csrf" value="<?= htmlspecialchars(\Core\Csrf::token()) ?>">
              <input type="hidden" name="id" value="<?= (int)$r['id'] ?>">
              <div class="col">
                <label>Status</label>
                <select name="status">
                  <?php foreach(['open','in_review','resolved_buyer','resolved_vendor','cancelled'] as $s): ?>
                    <option value="<?= $s ?>" <?= $r['status']===$s?'selected':'' ?>><?= $s ?></option>
                  <?php endforeach; ?>
                </select>
              </div>
              <div class="col">
                <label>Resolution Notes</label>
                <textarea name="resolution" rows="2" placeholder="Add resolution details..."><?= htmlspecialchars($r['resolution'] ?? '') ?></textarea>
              </div>
              <div class="col" style="align-self:flex-end">
                <button class="btn" type="submit">Update</button>
              </div>
            </form>
          </td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
<?php endif; ?>
