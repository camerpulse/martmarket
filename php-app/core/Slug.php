<?php
namespace Core;

class Slug
{
    public static function generate(string $string): string
    {
        $s = trim($string);
        if ($s === '') return bin2hex(random_bytes(4));
        // Transliterate to ASCII when possible
        if (function_exists('iconv')) {
            $t = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $s);
            if ($t !== false) { $s = $t; }
        }
        $s = strtolower($s);
        $s = preg_replace('/[^a-z0-9]+/i', '-', $s);
        $s = preg_replace('/-+/', '-', $s);
        $s = trim((string)$s, '-');
        return $s !== '' ? $s : bin2hex(random_bytes(4));
    }

    public static function unique(string $table, string $column, string $base): string
    {
        $baseSlug = self::generate($base);
        $pdo = DB::pdo();
        $checkSql = "SELECT COUNT(*) FROM {$table} WHERE {$column} = ?";
        $stmt = $pdo->prepare($checkSql);
        $slug = $baseSlug;
        $i = 1;
        while (true) {
            $stmt->execute([$slug]);
            $exists = (int)$stmt->fetchColumn() > 0;
            if (!$exists) return $slug;
            $i++;
            $slug = $baseSlug . '-' . $i;
            if ($i > 50) {
                // Fallback to random suffix to avoid excessive loops
                return $baseSlug . '-' . substr(bin2hex(random_bytes(3)), 0, 6);
            }
        }
    }
}
