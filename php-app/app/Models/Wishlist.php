<?php
namespace App\Models;

use Core\DB;

class Wishlist
{
    public static function add(int $userId, int $productId): void
    {
        DB::pdo()->prepare('INSERT IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)')->execute([$userId, $productId]);
    }

    public static function remove(int $userId, int $productId): void
    {
        DB::pdo()->prepare('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?')->execute([$userId, $productId]);
    }

    public static function list(int $userId): array
    {
        $stmt = DB::pdo()->prepare('SELECT p.* FROM wishlists w JOIN products p ON p.id = w.product_id WHERE w.user_id = ? ORDER BY w.created_at DESC');
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }
}
