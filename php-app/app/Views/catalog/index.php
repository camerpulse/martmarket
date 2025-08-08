<?php
// $title is set by controller
$categories = $categories ?? [];
$products = $products ?? [];
$q = $q ?? '';
$categoryId = $categoryId ?? null;
$page = (int)($page ?? 1);
$pages = (int)($pages ?? 1);
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

<nav aria-label="Browse by category" style="margin:8px 0">
  <?php foreach($categories as $c): ?>
    <a class="btn secondary" href="/category/<?= htmlspecialchars($c['slug']) ?>" style="margin-right:6px;margin-bottom:6px;display:inline-block"><?= htmlspecialchars($c['name']) ?></a>
  <?php endforeach; ?>
</nav>

<?php if(!$products): ?>
  <p>No products found.</p>
<?php else: ?>
  <div class="row" style="flex-wrap:wrap">
    <?php foreach($products as $p): ?>
      <div class="card" style="width:280px">
        <?php if(!empty($p['image_path'])): ?>
          <img src="<?= htmlspecialchars($p['image_path']) ?>" alt="<?= htmlspecialchars($p['title']) ?> product image" style="width:100%;height:160px;object-fit:cover;border-radius:8px;margin-bottom:8px">
        <?php endif; ?>
        <h3 style="margin:4px 0;"><?= htmlspecialchars($p['title']) ?></h3>
        <p style="opacity:.8">Category: <?= htmlspecialchars($p['category_name'] ?? '—') ?></p>
        <p><strong>Price (BTC):</strong> <?= htmlspecialchars($p['price_btc']) ?></p>
        <div class="row">
          <div class="col"><a class="btn secondary" href="/product/<?= htmlspecialchars($p['slug']) ?>">View</a></div>
          <?php if(!empty($_SESSION['uid'])): ?>
          <div class="col">
            <form method="post" action="/wishlist/add">
              <input type="hidden" name="_csrf" value="<?= htmlspecialchars(\Core\Csrf::token()) ?>">
              <input type="hidden" name="product_id" value="<?= (int)$p['id'] ?>">
              <button class="btn" type="submit">Wishlist</button>
            </form>
          </div>
          <?php endif; ?>
        </div>
      </div>
    <?php endforeach; ?>
  </div>
  <?php if($pages > 1): ?>
    <div class="row" style="justify-content:space-between">
      <div>
        <?php if($page > 1): $prev = $page-1; ?>
          <a class="btn secondary" href="?<?= http_build_query(['q'=>$q,'category'=>$categoryId,'page'=>$prev]) ?>">&larr; Prev</a>
        <?php endif; ?>
      </div>
      <div>Page <?= $page ?> of <?= $pages ?></div>
      <div>
        <?php if($page < $pages): $next = $page+1; ?>
          <a class="btn secondary" href="?<?= http_build_query(['q'=>$q,'category'=>$categoryId,'page'=>$next]) ?>">Next &rarr;</a>
        <?php endif; ?>
      </div>
    </div>
  <?php endif; ?>
<?php endif; ?>
