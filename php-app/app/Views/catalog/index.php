<?php
$title = 'Browse Products';
$categories = $categories ?? [];
$products = $products ?? [];
$q = $q ?? '';
$categoryId = $categoryId ?? null;
?>
<h1>Browse Products</h1>
<form method="get" action="/catalog" class="row">
  <div class="col">
    <label>Search</label>
    <input name="q" value="<?= htmlspecialchars($q) ?>" placeholder="Search...">
  </div>
  <div class="col">
    <label>Category</label>
    <select name="category">
      <option value="">All</option>
      <?php foreach($categories as $c): ?>
        <option value="<?= (int)$c['id'] ?>" <?= $categoryId==(int)$c['id']?'selected':'' ?>><?= htmlspecialchars($c['name']) ?></option>
      <?php endforeach; ?>
    </select>
  </div>
  <div class="col" style="align-self:flex-end">
    <button class="btn" type="submit">Filter</button>
  </div>
</form>

<?php if(!$products): ?>
  <p>No products found.</p>
<?php else: ?>
  <div class="row" style="flex-wrap:wrap">
    <?php foreach($products as $p): ?>
      <div class="card" style="width:280px">
        <h3 style="margin:4px 0;"><?= htmlspecialchars($p['title']) ?></h3>
        <p style="opacity:.8">Category: <?= htmlspecialchars($p['category_name'] ?? '—') ?></p>
        <p><strong>Price (BTC):</strong> <?= htmlspecialchars($p['price_btc']) ?></p>
        <a class="btn" href="/product/view?id=<?= (int)$p['id'] ?>">View</a>
      </div>
    <?php endforeach; ?>
  </div>
<?php endif; ?>
