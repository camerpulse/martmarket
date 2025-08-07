<?php
$title = 'Users';
$rows = $rows ?? [];
$page = (int)($page ?? 1);
$pages = (int)($pages ?? 1);
?>
<h1>Users</h1>
<?php if(!$rows): ?>
  <p>No users found.</p>
<?php else: ?>
  <table style="width:100%;border-collapse:collapse">
    <thead>
      <tr>
        <th style="text-align:left;border-bottom:1px solid #2b2f3a">ID</th>
        <th style="text-align:left;border-bottom:1px solid #2b2f3a">Email</th>
        <th style="text-align:left;border-bottom:1px solid #2b2f3a">Role</th>
        <th style="text-align:left;border-bottom:1px solid #2b2f3a">Active</th>
        <th style="text-align:left;border-bottom:1px solid #2b2f3a">Actions</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach($rows as $u): ?>
      <tr>
        <td><?= (int)$u['id'] ?></td>
        <td><?= htmlspecialchars($u['email']) ?></td>
        <td>
          <form method="post" action="/admin/users/update" class="row" style="gap:8px;align-items:center">
            <input type="hidden" name="_csrf" value="<?= htmlspecialchars(\Core\Csrf::token()) ?>">
            <input type="hidden" name="id" value="<?= (int)$u['id'] ?>">
            <select name="role">
              <?php foreach(['buyer','vendor','admin'] as $r): ?>
                <option value="<?= $r ?>" <?= $u['role']===$r?'selected':'' ?>><?= ucfirst($r) ?></option>
              <?php endforeach; ?>
            </select>
        </td>
        <td>
            <label><input type="checkbox" name="is_active" <?= !empty($u['is_active'])?'checked':'' ?>> Active</label>
        </td>
        <td>
            <button class="btn" type="submit">Save</button>
          </form>
        </td>
      </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
  <?php if($pages > 1): ?>
    <div class="row" style="justify-content:space-between">
      <div><?php if($page>1): ?><a class="btn secondary" href="?page=<?= $page-1 ?>">&larr; Prev</a><?php endif; ?></div>
      <div>Page <?= $page ?> of <?= $pages ?></div>
      <div><?php if($page<$pages): ?><a class="btn secondary" href="?page=<?= $page+1 ?>">Next &rarr;</a><?php endif; ?></div>
    </div>
  <?php endif; ?>
<?php endif; ?>
