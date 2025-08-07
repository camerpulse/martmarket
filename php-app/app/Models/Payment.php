<?php
namespace App\Models;

use Core\DB;

class Payment
{
    public static function create(int $orderId, string $address, string $expected): void
    {
        DB::pdo()->prepare('INSERT INTO payments (order_id, address, expected_amount, status) VALUES (?, ?, ?, "awaiting")')
            ->execute([$orderId, $address, $expected]);
    }

    public static function updateByOrder(int $orderId, ?string $txid, string $received, string $status, ?string $lastChecked = null): void
    {
        DB::pdo()->prepare('UPDATE payments SET txid = ?, received_amount = ?, status = ?, last_checked_at = ? WHERE order_id = ?')
            ->execute([$txid, $received, $status, $lastChecked, $orderId]);
    }

    public static function awaiting(): array
    {
        $stmt = DB::pdo()->query('SELECT * FROM payments WHERE status = "awaiting"');
        return $stmt->fetchAll();
    }
}
