<?php
namespace App\Models;

use Core\DB;

class Referral
{
    public static function record(int $referrerId, int $referredUserId, string $code): void
    {
        DB::pdo()->prepare('INSERT INTO referrals (referrer_user_id, referred_user_id, code) VALUES (?, ?, ?)')
            ->execute([$referrerId, $referredUserId, $code]);
    }

    public static function findByCode(string $code): ?array
    {
        $stmt = DB::pdo()->prepare('SELECT * FROM users WHERE referral_code = ? LIMIT 1');
        $stmt->execute([$code]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function listByReferrer(int $referrerId): array
    {
        $stmt = DB::pdo()->prepare('SELECT r.*, u.email AS referred_email, u.created_at AS referred_at
          FROM referrals r JOIN users u ON u.id = r.referred_user_id
          WHERE r.referrer_user_id = ? ORDER BY r.created_at DESC');
        $stmt->execute([$referrerId]);
        return $stmt->fetchAll();
    }

    public static function statsForReferrer(int $referrerId): array
    {
        $stmt = DB::pdo()->prepare('SELECT COUNT(*) AS cnt FROM referrals WHERE referrer_user_id = ?');
        $stmt->execute([$referrerId]);
        $count = (int)($stmt->fetchColumn() ?: 0);
        return ['count' => $count];
    }
}
