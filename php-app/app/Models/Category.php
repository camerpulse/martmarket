<?php
namespace App\Models;

use Core\DB;

class Category
{
    public static function all(): array
    {
        $stmt = DB::pdo()->query('SELECT * FROM categories ORDER BY name');
        return $stmt->fetchAll();
    }

    public static function create(string $name, string $slug, ?int $parentId = null): void
    {
        DB::pdo()->prepare('INSERT INTO categories (name, slug, parent_id) VALUES (?, ?, ?)')
            ->execute([$name, $slug, $parentId]);
    }

    public static function findBySlug(string $slug): ?array
    {
        $stmt = DB::pdo()->prepare('SELECT * FROM categories WHERE slug = ? LIMIT 1');
        $stmt->execute([$slug]);
        $row = $stmt->fetch();
        return $row ?: null;
    }
}
