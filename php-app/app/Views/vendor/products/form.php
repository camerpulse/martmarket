<?php
$title = $title ?? (($product ?? null) ? 'Edit Product' : 'Add Product');
$categories = $categories ?? [];
$product = $product ?? null;
$images = $images ?? [];
?>
<h1><?= htmlspecialchars($title) ?></h1>
<form method="post" action="<?= $product ? '/vendor/product/update' : '/vendor/product/store' ?>" enctype="multipart/form-data">
  <input type="hidden" name="_csrf" value="<?= htmlspecialchars(\Core\Csrf::token()) ?>">
  <?php if($product): ?><input type="hidden" name="id" value="<?= (int)$product['id'] ?>"><?php endif; ?>
  <label>Title</label>
  <input name="title" value="<?= htmlspecialchars($product['title'] ?? '') ?>" required>
  <?php if($product): ?>
  <label>Slug</label>
  <input name="slug" value="<?= htmlspecialchars($product['slug'] ?? '') ?>" required>
  <?php endif; ?>
  <label>Description</label>
  <textarea name="description" rows="5"><?= htmlspecialchars($product['description'] ?? '') ?></textarea>
  <label>Category</label>
  <select name="category_id">
    <option value="">—</option>
    <?php foreach($categories as $c): ?>
      <option value="<?= (int)$c['id'] ?>" <?= isset($product['category_id']) && (int)$product['category_id']===(int)$c['id']?'selected':'' ?>><?= htmlspecialchars($c['name']) ?></option>
    <?php endforeach; ?>
  </select>
  <label>Price (BTC)</label>
  <input name="price_btc" type="text" placeholder="0.00000000" value="<?= htmlspecialchars($product['price_btc'] ?? '') ?>" required>
  <label>Price (USD, optional)</label>
  <input name="price_usd" type="text" placeholder="0.00" value="<?= htmlspecialchars($product['price_usd'] ?? '') ?>">
  <label>Stock (blank for unlimited)</label>
  <input name="stock_quantity" type="number" min="0" value="<?= htmlspecialchars((string)($product['stock_quantity'] ?? '')) ?>">
  <label><input type="checkbox" name="is_active" <?= !isset($product) || ((int)($product['is_active'] ?? 1)===1) ? 'checked' : '' ?>> Active</label>
  <label>Image (JPG/PNG up to 2MB)</label>
  <input type="file" name="image" accept="image/jpeg,image/png">
  <?php if($images): ?>
  <div class="row" style="gap:8px;margin-top:8px;flex-wrap:wrap">
    <?php foreach($images as $img): ?>
      <img src="<?= htmlspecialchars($img['image_path']) ?>" alt="Existing image" style="width:120px;height:120px;object-fit:cover;border-radius:6px">
    <?php endforeach; ?>
  </div>
  <?php endif; ?>
  <button class="btn" type="submit"><?= $product ? 'Update Product' : 'Save Product' ?></button>
</form>

