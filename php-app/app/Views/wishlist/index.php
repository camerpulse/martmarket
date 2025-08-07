<?php
$title = 'My Wishlist';
$items = $items ?? [];
?>
<h1>My Wishlist</h1>
<?php if(!$items): ?>
  <p>Your wishlist is empty.</p>
<?php else: ?>
  <div class="row" style="flex-wrap:wrap">
    <?php foreach($items as $p): ?>
      <div class="card" style="width:280px">
        <h3 style="margin:4px 0;"><?= htmlspecialchars($p['title']) ?></h3>
        <p><strong>Price (BTC):</strong> <?= htmlspecialchars($p['price_btc']) ?></p>
        <div class="row">
          <div class="col"><a class="btn secondary" href="/product/view?id=<?= (int)$p['id'] ?>">View</a></div>
          <div class="col">
            <form method="post" action="/wishlist/remove">
              <input type="hidden" name="_csrf" value="<?= htmlspecialchars(\Core\Csrf::token()) ?>">
              <input type="hidden" name="product_id" value="<?= (int)$p['id'] ?>">
              <button class="btn" type="submit">Remove</button>
            </form>
          </div>
        </div>
      </div>
    <?php endforeach; ?>
  </div>
<?php endif; ?>
