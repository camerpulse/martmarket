<?php
namespace App\Models;

use Core\DB;

class Vendor
{
    public static function createForUser(int $userId, ?string $storeName = null): int
    {
        DB::pdo()->prepare('INSERT IGNORE INTO vendors (user_id, store_name) VALUES (?, ?)')->execute([$userId, $storeName]);
        // fetch id
        $row = self::byUser($userId);
        return (int)($row['id'] ?? 0);
    }

    public static function byUser(int $userId): ?array
    {
        $stmt = DB::pdo()->prepare('SELECT * FROM vendors WHERE user_id = ? LIMIT 1');
        $stmt->execute([$userId]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function setStoreName(int $userId, string $storeName): void
    {
        DB::pdo()->prepare('UPDATE vendors SET store_name = ? WHERE user_id = ?')->execute([$storeName, $userId]);
    }
}
