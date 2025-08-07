<?php
namespace App\Models;

use Core\DB;

class Product
{
    public static function create(array $data): int
    {
        $stmt = DB::pdo()->prepare('INSERT INTO products (vendor_id, category_id, title, slug, description, price_btc, price_usd, stock_quantity, is_active) VALUES (?,?,?,?,?,?,?,?,?)');
        $stmt->execute([
            $data['vendor_id'], $data['category_id'] ?: null, $data['title'], $data['slug'], $data['description'] ?? null,
            $data['price_btc'], $data['price_usd'] ?: null, $data['stock_quantity'] ?: null, $data['is_active'] ? 1 : 0
        ]);
        return (int)DB::pdo()->lastInsertId();
    }

    public static function update(int $id, int $vendorId, array $data): void
    {
        DB::pdo()->prepare('UPDATE products SET category_id=?, title=?, slug=?, description=?, price_btc=?, price_usd=?, stock_quantity=?, is_active=? WHERE id=? AND vendor_id=?')
            ->execute([
                $data['category_id'] ?: null, $data['title'], $data['slug'], $data['description'] ?? null,
                $data['price_btc'], $data['price_usd'] ?: null, $data['stock_quantity'] ?: null, $data['is_active'] ? 1 : 0,
                $id, $vendorId
            ]);
    }

    public static function byVendor(int $vendorId): array
    {
        $stmt = DB::pdo()->prepare('SELECT * FROM products WHERE vendor_id = ? ORDER BY created_at DESC');
        $stmt->execute([$vendorId]);
        return $stmt->fetchAll();
    }

    public static function find(int $id): ?array
    {
        $stmt = DB::pdo()->prepare('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

public static function search(?int $categoryId, ?string $q, int $limit = 20, int $offset = 0): array
    {
        $w = ['p.is_active = 1'];
        $args = [];
        if ($categoryId) { $w[] = 'p.category_id = ?'; $args[] = $categoryId; }
        if ($q) { $w[] = '(p.title LIKE ? OR p.description LIKE ?)'; $args[] = "%$q%"; $args[] = "%$q%"; }
        $where = $w ? ('WHERE ' . implode(' AND ', $w)) : '';
        $sql = 'SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id ' . $where . ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
        $args[] = $limit; $args[] = $offset;
        $stmt = DB::pdo()->prepare($sql);
        $stmt->execute($args);
        return $stmt->fetchAll();
    }

    public static function countSearch(?int $categoryId, ?string $q): int
    {
        $w = ['is_active = 1'];
        $args = [];
        if ($categoryId) { $w[] = 'category_id = ?'; $args[] = $categoryId; }
        if ($q) { $w[] = '(title LIKE ? OR description LIKE ?)'; $args[] = "%$q%"; $args[] = "%$q%"; }
        $where = $w ? ('WHERE ' . implode(' AND ', $w)) : '';
        $stmt = DB::pdo()->prepare('SELECT COUNT(*) FROM products ' . $where);
        $stmt->execute($args);
        return (int)$stmt->fetchColumn();
    }
}
