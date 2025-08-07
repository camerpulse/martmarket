<?php
namespace App\Models;

use Core\DB;

class AffiliatePayout
{
    public static function request(int $referrerUserId, string $btcAddress, string $amountBtc): void
    {
        DB::pdo()->prepare('INSERT INTO affiliate_payouts (referrer_user_id, amount_btc, btc_address, status) VALUES (?,?,?,"requested")')
            ->execute([$referrerUserId, $amountBtc, $btcAddress]);
    }

    public static function listByReferrer(int $referrerUserId): array
    {
        $stmt = DB::pdo()->prepare('SELECT * FROM affiliate_payouts WHERE referrer_user_id = ? ORDER BY created_at DESC');
        $stmt->execute([$referrerUserId]);
        return $stmt->fetchAll();
    }

    public static function statsForReferrer(int $referrerUserId): array
    {
        $stmt = DB::pdo()->prepare('SELECT 
            COALESCE(SUM(CASE WHEN status IN ("requested","approved") THEN amount_btc END), 0) AS pending,
            COALESCE(SUM(CASE WHEN status = "paid" THEN amount_btc END), 0) AS paid
        FROM affiliate_payouts WHERE referrer_user_id = ?');
        $stmt->execute([$referrerUserId]);
        $row = $stmt->fetch();
        return [
            'pending' => (string)($row['pending'] ?? '0'),
            'paid' => (string)($row['paid'] ?? '0'),
        ];
    }
}
