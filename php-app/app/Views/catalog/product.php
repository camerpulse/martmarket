<?php
$product = $product ?? null;
$images = $images ?? [];
$vendor = $vendor ?? null;
if(!$product){ echo 'Not found'; return; }
$title = htmlspecialchars($product['title']);
?>
<h1><?= $title ?></h1>
<div class="row">
  <div class="col">
    <?php if($images): ?>
      <div class="row" style="flex-wrap:wrap;gap:8px">
        <?php foreach($images as $img): ?>
          <img src="<?= htmlspecialchars($img['image_path']) ?>" alt="<?= $title ?> image" style="width:220px;height:220px;object-fit:cover;border-radius:8px">
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </div>
  <div class="col">
    <p><strong>Price (BTC):</strong> <?= htmlspecialchars($product['price_btc']) ?></p>
    <p><?= nl2br(htmlspecialchars($product['description'] ?? '')) ?></p>
    <?php if($vendor): ?>
      <p>Sold by: <a href="/vendor/view?id=<?= (int)$vendor['id'] ?>"><?= htmlspecialchars($vendor['store_name'] ?? ('Vendor #' . (int)$vendor['id'])) ?></a>
        <?php if(!empty($vendor['is_verified'])): ?><span style="font-size:12px;background:#2b2f3a;border-radius:6px;padding:2px 6px;margin-left:6px">Verified</span><?php endif; ?>
      </p>
    <?php endif; ?>
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
  </div>
</div>
<script type="application/ld+json">
<?= json_encode([
  '@context' => 'https://schema.org/',
  '@type' => 'Product',
  'name' => $product['title'],
  'description' => substr(strip_tags((string)($product['description'] ?? '')),0,160),
  'image' => array_map(fn($i) => $i['image_path'], $images),
  'brand' => $vendor ? ($vendor['store_name'] ?? ('Vendor #' . (int)$vendor['id'])) : null,
  'offers' => [
    '@type' => 'Offer',
    'price' => (string)$product['price_btc'],
    'priceCurrency' => 'XBT',
    'availability' => 'https://schema.org/InStock'
  ]
], JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT) ?>
</script>
