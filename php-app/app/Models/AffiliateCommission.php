<?php
namespace App\Models;

use Core\DB;

class AffiliateCommission
{
    public static function existsForOrder(int $orderId): bool
    {
        $stmt = DB::pdo()->prepare('SELECT id FROM affiliate_commissions WHERE order_id = ? LIMIT 1');
        $stmt->execute([$orderId]);
        return (bool)$stmt->fetchColumn();
    }

    public static function create(int $referrerUserId, int $referredUserId, int $orderId, string $amountBtc, float $ratePercent, string $status = 'pending'): void
    {
        DB::pdo()->prepare('INSERT INTO affiliate_commissions (referrer_user_id, referred_user_id, order_id, amount_btc, rate_percent, status, confirmed_at) VALUES (?,?,?,?,?,?, CASE WHEN ? = "confirmed" THEN CURRENT_TIMESTAMP ELSE NULL END)')
            ->execute([$referrerUserId, $referredUserId, $orderId, $amountBtc, $ratePercent, $status, $status]);
    }

    public static function listByReferrer(int $referrerUserId): array
    {
        $stmt = DB::pdo()->prepare('SELECT * FROM affiliate_commissions WHERE referrer_user_id = ? ORDER BY created_at DESC');
        $stmt->execute([$referrerUserId]);
        return $stmt->fetchAll();
    }

    public static function statsForReferrer(int $referrerUserId): array
    {
        $stmt = DB::pdo()->prepare('SELECT 
            COALESCE(SUM(CASE WHEN status = "pending" THEN amount_btc END), 0) AS pending,
            COALESCE(SUM(CASE WHEN status = "confirmed" THEN amount_btc END), 0) AS confirmed,
            COALESCE(SUM(CASE WHEN status = "paid" THEN amount_btc END), 0) AS paid
        FROM affiliate_commissions WHERE referrer_user_id = ?');
        $stmt->execute([$referrerUserId]);
        $row = $stmt->fetch();
        $confirmed = (string)($row['confirmed'] ?? '0');
        $paid = (string)($row['paid'] ?? '0');
        return [
            'pending' => (string)($row['pending'] ?? '0'),
            'confirmed' => $confirmed,
            'paid' => $paid,
            'available' => bcsub($confirmed, $paid, 8),
        ];
    }

    public static function confirmedByReferrer(int $referrerUserId): array
    {
        $stmt = DB::pdo()->prepare('SELECT id, amount_btc FROM affiliate_commissions WHERE referrer_user_id = ? AND status = "confirmed" ORDER BY created_at ASC, id ASC');
        $stmt->execute([$referrerUserId]);
        return $stmt->fetchAll();
    }

    public static function markPaid(array $ids): void
    {
        if (!$ids) { return; }
        $in = implode(',', array_fill(0, count($ids), '?'));
        $sql = 'UPDATE affiliate_commissions SET status = "paid", paid_at = CURRENT_TIMESTAMP WHERE id IN (' . $in . ')';
        DB::pdo()->prepare($sql)->execute($ids);
    }
}
