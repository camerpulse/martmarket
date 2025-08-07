<?php
namespace App\Models;

use Core\DB;

class VendorVerification
{
    public static function request(int $vendorId, ?string $notes = null): void
    {
        // If existing request, set to pending and update notes
        DB::pdo()->prepare('INSERT INTO vendor_verifications (vendor_id, status, notes) VALUES (?, "pending", ?)
            ON DUPLICATE KEY UPDATE status = VALUES(status), notes = VALUES(notes), updated_at = CURRENT_TIMESTAMP')
            ->execute([$vendorId, $notes]);
    }

    public static function pending(): array
    {
        $stmt = DB::pdo()->query('SELECT vv.*, v.user_id, v.store_name FROM vendor_verifications vv JOIN vendors v ON v.id = vv.vendor_id WHERE vv.status = "pending" ORDER BY vv.created_at ASC');
        return $stmt->fetchAll();
    }

    public static function approve(int $id): void
    {
        // Set verification status and mark vendor verified
        $pdo = DB::pdo();
        $pdo->beginTransaction();
        $stmt = $pdo->prepare('SELECT vendor_id FROM vendor_verifications WHERE id = ? FOR UPDATE');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if ($row) {
            $vendorId = (int)$row['vendor_id'];
            $pdo->prepare('UPDATE vendor_verifications SET status = "approved" WHERE id = ?')->execute([$id]);
            $pdo->prepare('UPDATE vendors SET is_verified = 1 WHERE id = ?')->execute([$vendorId]);
        }
        $pdo->commit();
    }

    public static function reject(int $id, ?string $notes = null): void
    {
        DB::pdo()->prepare('UPDATE vendor_verifications SET status = "rejected", notes = ? WHERE id = ?')->execute([$notes, $id]);
    }
}
