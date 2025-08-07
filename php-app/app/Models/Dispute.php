<?php
namespace App\Models;

use Core\DB;

class Dispute
{
    public static function open(int $orderId, int $userId, string $reason): int
    {
        DB::pdo()->prepare('INSERT INTO disputes (order_id, opened_by, reason) VALUES (?,?,?)')->execute([$orderId, $userId, $reason]);
        return (int)DB::pdo()->lastInsertId();
    }

    public static function forUser(int $userId): array
    {
        $stmt = DB::pdo()->prepare('SELECT d.* FROM disputes d WHERE d.opened_by = ? ORDER BY d.created_at DESC');
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public static function allOpen(): array
    {
        $stmt = DB::pdo()->query('SELECT * FROM disputes WHERE status IN ("open","in_review") ORDER BY created_at ASC');
        return $stmt->fetchAll();
    }

    public static function updateStatus(int $id, string $status, ?string $resolution): void
    {
        DB::pdo()->prepare('UPDATE disputes SET status = ?, resolution = ? WHERE id = ?')->execute([$status, $resolution, $id]);
    }
}
