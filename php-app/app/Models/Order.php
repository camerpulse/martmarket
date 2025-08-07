<?php
namespace App\Models;

use Core\DB;

class Order
{
    public static function create(int $buyerId, int $vendorId, string $orderNumber, string $btcAddress, string $amountBtc): int
    {
        DB::pdo()->prepare('INSERT INTO orders (buyer_id, vendor_id, order_number, status, btc_address, btc_expected_amount) VALUES (?,?,?,?,?,?)')
            ->execute([$buyerId, $vendorId, $orderNumber, 'awaiting_payment', $btcAddress, $amountBtc]);
        return (int)DB::pdo()->lastInsertId();
    }

    public static function addItem(int $orderId, int $productId, string $title, string $priceBtc, int $qty): void
    {
        $subtotal = bcmul($priceBtc, (string)$qty, 8);
        DB::pdo()->prepare('INSERT INTO order_items (order_id, product_id, title, price_btc, quantity, subtotal_btc) VALUES (?,?,?,?,?,?)')
            ->execute([$orderId, $productId, $title, $priceBtc, $qty, $subtotal]);
    }

    public static function byUser(int $userId): array
    {
        $stmt = DB::pdo()->prepare('SELECT * FROM orders WHERE buyer_id = ? ORDER BY created_at DESC');
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public static function find(int $id): ?array
    {
        $stmt = DB::pdo()->prepare('SELECT * FROM orders WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

public static function updatePayment(int $orderId, string $paidAmount, int $confirmations, string $status): void
    {
        DB::pdo()->prepare('UPDATE orders SET btc_paid_amount = ?, confirmations = ?, status = ? WHERE id = ?')
            ->execute([$paidAmount, $confirmations, $status, $orderId]);
    }

    public static function list(int $limit = 50, int $offset = 0): array
    {
        $stmt = DB::pdo()->prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT ? OFFSET ?');
        $stmt->execute([$limit, $offset]);
        return $stmt->fetchAll();
    }

    public static function byVendor(int $vendorId, int $limit = 50, int $offset = 0): array
    {
        $stmt = DB::pdo()->prepare('SELECT * FROM orders WHERE vendor_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?');
        $stmt->execute([$vendorId, $limit, $offset]);
        return $stmt->fetchAll();
    }

    public static function count(): int
    {
        return (int)DB::pdo()->query('SELECT COUNT(*) FROM orders')->fetchColumn();
    }

    public static function items(int $orderId): array
    {
        $stmt = DB::pdo()->prepare('SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC');
        $stmt->execute([$orderId]);
        return $stmt->fetchAll();
    }

    public static function setStatus(int $orderId, string $status): void
    {
        $allowed = ['pending','awaiting_payment','paid','in_escrow','shipped','completed','cancelled','disputed'];
        if (!in_array($status, $allowed, true)) { return; }
        DB::pdo()->prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')->execute([$status, $orderId]);
    }

    public static function setShipment(int $orderId, string $trackingNumber, ?string $note = null): void
    {
        DB::pdo()->prepare('UPDATE orders SET status = "shipped", tracking_number = ?, shipping_note = ?, shipped_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
            ->execute([$trackingNumber ?: null, $note, $orderId]);
    }

