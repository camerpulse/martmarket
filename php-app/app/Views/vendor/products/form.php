<?php
$title = 'Add Product';
$categories = $categories ?? [];
?>
<h1>Add Product</h1>
<form method="post" action="/vendor/product/store" enctype="multipart/form-data">
  <input type="hidden" name="_csrf" value="<?= htmlspecialchars(\Core\Csrf::token()) ?>">
  <label>Title</label>
  <input name="title" required>
  <label>Description</label>
  <textarea name="description" rows="5"></textarea>
  <label>Category</label>
  <select name="category_id">
    <option value="">—</option>
    <?php foreach($categories as $c): ?>
      <option value="<?= (int)$c['id'] ?>"><?= htmlspecialchars($c['name']) ?></option>
    <?php endforeach; ?>
  </select>
  <label>Price (BTC)</label>
  <input name="price_btc" type="text" placeholder="0.00000000" required>
  <label>Price (USD, optional)</label>
  <input name="price_usd" type="text" placeholder="0.00">
  <label>Stock (blank for unlimited)</label>
  <input name="stock_quantity" type="number" min="0">
  <label><input type="checkbox" name="is_active" checked> Active</label>
  <label>Image (JPG/PNG up to 2MB)</label>
  <input type="file" name="image" accept="image/jpeg,image/png">
  <button class="btn" type="submit">Save Product</button>
</form>
