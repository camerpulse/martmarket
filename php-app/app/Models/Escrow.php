<?php
namespace App\Models;

use Core\DB;

class Escrow
{
    public static function create(int $orderId): void
    {
        DB::pdo()->prepare('INSERT INTO escrows (order_id, status) VALUES (?, "holding")')->execute([$orderId]);
    }

    public static function release(int $orderId, int $adminUserId, string $txid): void
    {
        DB::pdo()->prepare('UPDATE escrows SET status = "released", released_by = ?, released_txid = ? WHERE order_id = ?')
            ->execute([$adminUserId, $txid, $orderId]);
    }
}
