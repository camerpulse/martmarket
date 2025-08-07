<?php
namespace App\Models;

use Core\DB;

class PGPKey
{
    public static function add(int $userId, string $keyName, string $publicKey, string $fingerprint, bool $isDefault): void
    {
        DB::pdo()->prepare('INSERT INTO pgp_keys (user_id, key_name, public_key, fingerprint, is_default) VALUES (?, ?, ?, ?, ?)')
            ->execute([$userId, $keyName, $publicKey, $fingerprint, $isDefault ? 1 : 0]);
        if ($isDefault) {
            DB::pdo()->prepare('UPDATE pgp_keys SET is_default = 0 WHERE user_id = ? AND id <> LAST_INSERT_ID()')->execute([$userId]);
            DB::pdo()->prepare('UPDATE profiles SET pgp_default_key_id = LAST_INSERT_ID() WHERE user_id = ?')->execute([$userId]);
        }
    }

    public static function setDefault(int $userId, int $keyId): void
    {
        DB::pdo()->prepare('UPDATE pgp_keys SET is_default = CASE WHEN id = ? THEN 1 ELSE 0 END WHERE user_id = ?')->execute([$keyId, $userId]);
        DB::pdo()->prepare('UPDATE profiles SET pgp_default_key_id = ? WHERE user_id = ?')->execute([$keyId, $userId]);
    }

public static function list(int $userId): array
    {
        $stmt = DB::pdo()->prepare('SELECT * FROM pgp_keys WHERE user_id = ? ORDER BY created_at DESC');
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public static function getDefaultForUser(int $userId): ?array
    {
        $stmt = DB::pdo()->prepare('SELECT k.* FROM pgp_keys k JOIN profiles p ON p.pgp_default_key_id = k.id WHERE p.user_id = ? LIMIT 1');
        $stmt->execute([$userId]);
        $row = $stmt->fetch();
        if ($row) return $row;
        // Fallback: first key
        $stmt = DB::pdo()->prepare('SELECT * FROM pgp_keys WHERE user_id = ? ORDER BY is_default DESC, created_at DESC LIMIT 1');
        $stmt->execute([$userId]);
        $row = $stmt->fetch();
        return $row ?: null;
    }
}
