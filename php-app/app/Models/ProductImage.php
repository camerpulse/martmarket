<?php
namespace App\Models;

use Core\DB;

class ProductImage
{
    public static function listByProduct(int $productId): array
    {
        $stmt = DB::pdo()->prepare('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC, id ASC');
        $stmt->execute([$productId]);
        return $stmt->fetchAll();
    }

    public static function firstPath(int $productId): ?string
    {
        $stmt = DB::pdo()->prepare('SELECT image_path FROM product_images WHERE product_id = ? ORDER BY sort_order ASC, id ASC LIMIT 1');
        $stmt->execute([$productId]);
        $row = $stmt->fetch();
        return $row['image_path'] ?? null;
    }
}
