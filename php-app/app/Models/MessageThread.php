<?php
namespace App\Models;

use Core\DB;

class MessageThread
{
    public static function forUser(int $userId, string $role): array
    {
        if ($role === 'vendor') {
            $sql = 'SELECT mt.* FROM message_threads mt JOIN vendors v ON v.id = mt.vendor_id WHERE v.user_id = ? ORDER BY mt.updated_at DESC';
        } else {
            $sql = 'SELECT * FROM message_threads WHERE buyer_id = ? ORDER BY updated_at DESC';
        }
        $stmt = DB::pdo()->prepare($sql);
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public static function create(int $buyerId, int $vendorId, ?int $orderId, ?string $subject): int
    {
        DB::pdo()->prepare('INSERT INTO message_threads (buyer_id, vendor_id, order_id, subject) VALUES (?,?,?,?)')
            ->execute([$buyerId, $vendorId, $orderId, $subject]);
        return (int)DB::pdo()->lastInsertId();
    }

    public static function find(int $id): ?array
    {
        $stmt = DB::pdo()->prepare('SELECT * FROM message_threads WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }
}
