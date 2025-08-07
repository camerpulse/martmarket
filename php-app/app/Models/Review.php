<?php
namespace App\Models;

use Core\DB;

class Review
{
    public static function create(?int $orderId, ?int $productId, ?int $vendorId, int $userId, int $rating, ?string $comment): void
    {
        DB::pdo()->prepare('INSERT INTO reviews (order_id, product_id, vendor_id, user_id, rating, comment) VALUES (?,?,?,?,?,?)')
            ->execute([$orderId, $productId, $vendorId, $userId, $rating, $comment]);
    }

    public static function forProduct(int $productId): array
    {
        $stmt = DB::pdo()->prepare('SELECT r.*, p.display_name FROM reviews r LEFT JOIN profiles p ON p.user_id = r.user_id WHERE r.product_id = ? ORDER BY r.created_at DESC');
        $stmt->execute([$productId]);
        return $stmt->fetchAll();
    }
}
