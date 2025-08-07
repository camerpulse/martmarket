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
}
