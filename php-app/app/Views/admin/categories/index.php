<?php
$title = 'Categories';
$categories = $categories ?? [];
?>
<h1>Categories</h1>
<form method="post" action="/admin/categories/create" class="row">
  <input type="hidden" name="_csrf" value="<?= htmlspecialchars(\Core\Csrf::token()) ?>">
  <div class="col">
    <label>Name</label>
    <input name="name" required>
  </div>
  <div class="col" style="align-self:flex-end">
    <button class="btn" type="submit">Add</button>
  </div>
</form>
<hr>
<?php if(!$categories): ?>
  <p>No categories yet.</p>
<?php else: ?>
  <ul>
    <?php foreach($categories as $c): ?>
      <li><?= htmlspecialchars($c['name']) ?> <small>(<?= htmlspecialchars($c['slug']) ?>)</small></li>
    <?php endforeach; ?>
  </ul>
<?php endif; ?>
