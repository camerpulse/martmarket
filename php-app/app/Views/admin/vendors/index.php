<?php
$title = 'Vendor Verifications';
$rows = $rows ?? [];
?>
<h1>Pending Vendor Verifications</h1>
<?php if(!$rows): ?>
  <p>No pending requests.</p>
<?php else: ?>
  <table style="width:100%;border-collapse:collapse">
    <thead>
      <tr>
        <th style="text-align:left;border-bottom:1px solid #2b2f3a">ID</th>
        <th style="text-align:left;border-bottom:1px solid #2b2f3a">Vendor ID</th>
        <th style="text-align:left;border-bottom:1px solid #2b2f3a">Store</th>
        <th style="text-align:left;border-bottom:1px solid #2b2f3a">Status</th>
        <th style="text-align:left;border-bottom:1px solid #2b2f3a">Notes</th>
        <th style="text-align:left;border-bottom:1px solid #2b2f3a">Actions</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach($rows as $r): ?>
        <tr>
          <td><?= (int)$r['id'] ?></td>
          <td><?= (int)$r['vendor_id'] ?></td>
          <td><?= htmlspecialchars($r['store_name'] ?? '') ?></td>
          <td><?= htmlspecialchars($r['status']) ?></td>
          <td><?= htmlspecialchars($r['notes'] ?? '') ?></td>
          <td>
            <form method="post" action="/admin/vendors/approve" style="display:inline">
              <input type="hidden" name="_csrf" value="<?= htmlspecialchars(\Core\Csrf::token()) ?>">
              <input type="hidden" name="id" value="<?= (int)$r['id'] ?>">
              <button class="btn" type="submit">Approve</button>
            </form>
            <form method="post" action="/admin/vendors/reject" style="display:inline;margin-left:8px">
              <input type="hidden" name="_csrf" value="<?= htmlspecialchars(\Core\Csrf::token()) ?>">
              <input type="hidden" name="id" value="<?= (int)$r['id'] ?>">
              <input type="text" name="notes" placeholder="Reason" style="width:180px">
              <button class="btn secondary" type="submit">Reject</button>
            </form>
          </td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
<?php endif; ?>
