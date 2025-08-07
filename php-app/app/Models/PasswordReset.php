<?php
namespace App\Models;

use Core\DB;

class PasswordReset
{
    public static function create(int $userId, string $token, string $expiresAt): void
    {
        DB::pdo()->prepare('INSERT INTO password_resets (user_id, token, expires_at) VALUES (?,?,?)')
            ->execute([$userId, $token, $expiresAt]);
    }

    public static function findValidByToken(string $token): ?array
    {
        $stmt = DB::pdo()->prepare('SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW() LIMIT 1');
        $stmt->execute([$token]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function consume(string $token): void
    {
        DB::pdo()->prepare('DELETE FROM password_resets WHERE token = ?')->execute([$token]);
    }

    public static function deleteByUser(int $userId): void
    {
        DB::pdo()->prepare('DELETE FROM password_resets WHERE user_id = ?')->execute([$userId]);
    }
}
