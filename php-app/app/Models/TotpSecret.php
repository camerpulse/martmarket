<?php
namespace App\Models;

use Core\DB;

class TotpSecret
{
    public static function set(int $userId, string $ciphertext, string $nonce): void
    {
        DB::pdo()->prepare('REPLACE INTO totp_secrets (user_id, secret, nonce) VALUES (?, ?, ?)')->execute([$userId, $ciphertext, $nonce]);
        DB::pdo()->prepare('UPDATE profiles SET twofa_enabled = 1 WHERE user_id = ?')->execute([$userId]);
    }

    public static function get(int $userId): ?array
    {
        $stmt = DB::pdo()->prepare('SELECT * FROM totp_secrets WHERE user_id = ? LIMIT 1');
        $stmt->execute([$userId]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function disable(int $userId): void
    {
        DB::pdo()->prepare('DELETE FROM totp_secrets WHERE user_id = ?')->execute([$userId]);
        DB::pdo()->prepare('UPDATE profiles SET twofa_enabled = 0 WHERE user_id = ?')->execute([$userId]);
    }
}
