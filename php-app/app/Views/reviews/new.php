<?php
$title = 'Write Review';
$productId = $productId ?? null; $vendorId = $vendorId ?? null;
?>
<h1>Write a Review</h1>
<form method="post" action="/reviews/create">
  <input type="hidden" name="_csrf" value="<?= htmlspecialchars(\Core\Csrf::token()) ?>">
  <label>Product ID (optional)</label>
  <input type="number" name="product_id" value="<?= (int)($productId ?: 0) ?>">
  <label>Vendor ID (optional)</label>
  <input type="number" name="vendor_id" value="<?= (int)($vendorId ?: 0) ?>">
  <label>Rating (1-5)</label>
  <input type="number" name="rating" min="1" max="5" value="5" required>
  <label>Comment</label>
  <textarea name="comment" rows="4"></textarea>
  <button class="btn" type="submit">Submit Review</button>
</form>
