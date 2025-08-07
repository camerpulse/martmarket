<?php
namespace App\Models;

use Core\DB;

class Translation
{
    public static function getAll(?string $locale = null): array
    {
        if ($locale) {
            $stmt = DB::pdo()->prepare('SELECT * FROM translations WHERE locale = ? ORDER BY `key` ASC');
            $stmt->execute([$locale]);
            return $stmt->fetchAll();
        }
        $stmt = DB::pdo()->query('SELECT * FROM translations ORDER BY locale ASC, `key` ASC');
        return $stmt->fetchAll();
    }

    public static function locales(): array
    {
        $stmt = DB::pdo()->query('SELECT DISTINCT locale FROM translations ORDER BY locale ASC');
        return array_map(fn($r) => $r['locale'], $stmt->fetchAll());
    }

    public static function upsert(string $locale, string $key, ?string $value): void
    {
        DB::pdo()->prepare('INSERT INTO translations (locale, `key`, `value`) VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), updated_at = CURRENT_TIMESTAMP')
            ->execute([$locale, $key, $value]);
    }
}
