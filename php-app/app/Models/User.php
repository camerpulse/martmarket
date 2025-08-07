<?php
namespace App\Models;

use Core\DB;
use Core\Hash;
use PDO;

class User
{
    public static function findByEmail(string $email): ?array
    {
        $stmt = DB::pdo()->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function find(int $id): ?array
    {
        $stmt = DB::pdo()->prepare('SELECT * FROM users WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function create(string $email, string $password, string $role, ?string $referredByCode): int
    {
        $code = self::generateReferralCode();
        $hash = Hash::make($password);
        $stmt = DB::pdo()->prepare('INSERT INTO users (email, password_hash, role, referral_code, referred_by_code) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([$email, $hash, $role, $code, $referredByCode]);
        return (int)DB::pdo()->lastInsertId();
    }

    public static function updatePasswordIfRehashNeeded(int $id, string $password, string $hash): void
    {
        if (Hash::needsRehash($hash)) {
            $new = Hash::make($password);
            DB::pdo()->prepare('UPDATE users SET password_hash = ? WHERE id = ?')->execute([$new, $id]);
        }
    }

private static function generateReferralCode(): string
    {
        return substr(bin2hex(random_bytes(8)), 0, 16);
    }

    public static function all(int $limit = 50, int $offset = 0): array
    {
        $stmt = DB::pdo()->prepare('SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?');
        $stmt->execute([$limit, $offset]);
        return $stmt->fetchAll();
    }

    public static function count(): int
    {
        return (int)DB::pdo()->query('SELECT COUNT(*) FROM users')->fetchColumn();
    }

    public static function setRole(int $id, string $role): void
    {
        $allowed = ['buyer','vendor','admin'];
        if (!in_array($role, $allowed, true)) { return; }
        DB::pdo()->prepare('UPDATE users SET role = ? WHERE id = ?')->execute([$role, $id]);
    }

    public static function setActive(int $id, bool $active): void
    {
        DB::pdo()->prepare('UPDATE users SET is_active = ? WHERE id = ?')->execute([$active ? 1 : 0, $id]);
    }
}

