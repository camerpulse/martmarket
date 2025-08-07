<?php
$product = $product ?? null;
if(!$product){ echo 'Not found'; return; }
$title = htmlspecialchars($product['title']);
?>
<h1><?= $title ?></h1>
<p><strong>Price (BTC):</strong> <?= htmlspecialchars($product['price_btc']) ?></p>
<p><?= nl2br(htmlspecialchars($product['description'] ?? '')) ?></p>
<p><a class="btn" href="/checkout/start?product_id=<?= (int)$product['id'] ?>">Buy Now</a></p>
