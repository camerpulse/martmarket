<?php
namespace App\Services;

use Core\DB;
use App\Models\Order;
use App\Models\User;
use App\Models\Referral;
use App\Models\AffiliateCommission;
use App\Models\Settings;

class AffiliateService
{
    public static function handleOrderCompleted(int $orderId): void
    {
        try {
            $order = Order::find($orderId);
            if (!$order) { return; }
            // Avoid duplicates
            if (AffiliateCommission::existsForOrder($orderId)) { return; }

            // Check if buyer was referred
            $buyerId = (int)$order['buyer_id'];
            $buyer = User::find($buyerId);
            if (!$buyer) { return; }
            $refCode = $buyer['referred_by_code'] ?? null;
            if (!$refCode) { return; }
            $refUser = Referral::findByCode($refCode);
            if (!$refUser || empty($refUser['id'])) { return; }
            $referrerId = (int)$refUser['id'];

            // Commission rate (default 5%)
            $ratePercent = (float)(Settings::get('affiliate.rate_percent', '5') ?? '5');
            if ($ratePercent <= 0) { return; }

            // Compute order total in BTC from items
            $stmt = DB::pdo()->prepare('SELECT COALESCE(SUM(subtotal_btc),0) FROM order_items WHERE order_id = ?');
            $stmt->execute([$orderId]);
            $totalBtc = (string)($stmt->fetchColumn() ?: '0');
            if (bccomp($totalBtc, '0', 8) <= 0) { return; }

            // amount_btc = totalBtc * rate / 100
            $amount = bcdiv(bcmul($totalBtc, (string)$ratePercent, 8), '100', 8);

            // Create confirmed commission
            AffiliateCommission::create($referrerId, $buyerId, $orderId, $amount, $ratePercent, 'confirmed');
        } catch (\Throwable $e) {
            // swallow errors to not block order flow
        }
    }
}
