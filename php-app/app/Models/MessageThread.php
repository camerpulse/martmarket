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
        // Reuse existing thread for same buyer/vendor/order if present
        if ($orderId) {
            $stmt = DB::pdo()->prepare('SELECT id FROM message_threads WHERE buyer_id = ? AND vendor_id = ? AND order_id = ? LIMIT 1');
            $stmt->execute([$buyerId, $vendorId, $orderId]);
            $existing = $stmt->fetchColumn();
            if ($existing) { return (int)$existing; }
        } else {
            $stmt = DB::pdo()->prepare('SELECT id FROM message_threads WHERE buyer_id = ? AND vendor_id = ? AND order_id IS NULL LIMIT 1');
            $stmt->execute([$buyerId, $vendorId]);
            $existing = $stmt->fetchColumn();
            if ($existing) { return (int)$existing; }
        }
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
