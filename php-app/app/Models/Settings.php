<?php
namespace App\Models;

use Core\DB;

class Settings
{
    public static function get(string $key, $default = null)
    {
        $stmt = DB::pdo()->prepare('SELECT value FROM settings WHERE `key` = ? LIMIT 1');
        try {
            $stmt->execute([$key]);
            $row = $stmt->fetch();
            return $row ? $row['value'] : $default;
        } catch (\Throwable $e) {
            return $default;
        }
    }

    public static function set(string $key, string $value): void
    {
        DB::pdo()->prepare('INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)')
            ->execute([$key, $value]);
    }
}
