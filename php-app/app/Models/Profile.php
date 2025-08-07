<?php
namespace App\Models;

use Core\DB;

class Profile
{
    public static function create(int $userId, string $displayName): void
    {
        DB::pdo()->prepare('INSERT INTO profiles (user_id, display_name) VALUES (?, ?)')->execute([$userId, $displayName]);
    }

    public static function update(int $userId, string $displayName, ?string $bio): void
    {
        DB::pdo()->prepare('UPDATE profiles SET display_name = ?, bio = ? WHERE user_id = ?')->execute([$displayName, $bio, $userId]);
    }

    public static function byUser(int $userId): ?array
    {
        $stmt = DB::pdo()->prepare('SELECT * FROM profiles WHERE user_id = ? LIMIT 1');
        $stmt->execute([$userId]);
        $row = $stmt->fetch();
        return $row ?: null;
    }
}
