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
}
