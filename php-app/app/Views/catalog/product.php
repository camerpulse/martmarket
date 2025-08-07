<?php
$product = $product ?? null;
if(!$product){ echo 'Not found'; return; }
$title = htmlspecialchars($product['title']);
?>
<h1><?= $title ?></h1>
<p><strong>Price (BTC):</strong> <?= htmlspecialchars($product['price_btc']) ?></p>
<p><?= nl2br(htmlspecialchars($product['description'] ?? '')) ?></p>
<div class="row">
  <div class="col"><a class="btn secondary" href="/checkout/start?product_id=<?= (int)$product['id'] ?>">Buy Now</a></div>
  <?php if(!empty($_SESSION['uid'])): ?>
  <div class="col">
    <form method="post" action="/wishlist/add">
      <input type="hidden" name="_csrf" value="<?= htmlspecialchars(\Core\Csrf::token()) ?>">
      <input type="hidden" name="product_id" value="<?= (int)$product['id'] ?>">
      <button class="btn" type="submit">Add to Wishlist</button>
    </form>
  </div>
  <?php endif; ?>
</div>
