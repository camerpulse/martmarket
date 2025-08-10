<?php
namespace App\Controllers\Admin;

use Core\Controller;
use Core\Csrf;
use App\Models\AffiliatePayout as Payout;
use App\Models\AffiliateCommission as Commission;

class AffiliateAdminController extends Controller
{
    public function payouts(): string
    {
        $this->ensureRole('admin');
        $rows = $this->allPayouts();
        return $this->view('admin/affiliate/payouts', [
            'title' => 'Affiliate Payout Requests',
            'rows' => $rows,
        ]);
    }

    public function updatePayout(): string
    {
        $this->ensureRole('admin');
        if (!Csrf::check($_POST['_csrf'] ?? '')) { http_response_code(400); return 'Invalid CSRF'; }
        $id = (int)($_POST['id'] ?? 0);
        $status = (string)($_POST['status'] ?? 'requested');
        if ($id <= 0) { return $this->redirect('/admin/affiliate/payouts'); }
        $row = $this->findPayout($id);
        if (!$row) { return $this->redirect('/admin/affiliate/payouts'); }

        // Update status
        if (in_array($status, ['requested','approved','paid','rejected'], true)) {
            if ($status === 'paid') {
                $this->allocatePaidCommissions((int)$row['referrer_user_id'], (string)$row['amount_btc']);
                $this->updatePayoutStatus($id, 'paid');
            } else {
                $this->updatePayoutStatus($id, $status);
            }
        }
        return $this->redirect('/admin/affiliate/payouts');
    }

    private function allocatePaidCommissions(int $referrerUserId, string $amountBtc): void
    {
        $remaining = $amountBtc;
        $confirmed = Commission::confirmedByReferrer($referrerUserId);
        $toPayIds = [];
        foreach ($confirmed as $c) {
            if (bccomp($remaining, '0', 8) <= 0) break;
            $amt = (string)$c['amount_btc'];
            $cmp = bccomp($remaining, $amt, 8);
            if ($cmp >= 0) {
                $toPayIds[] = (int)$c['id'];
                $remaining = bcsub($remaining, $amt, 8);
            }
        }
        if ($toPayIds) {
            Commission::markPaid($toPayIds);
        }
    }

    private function allPayouts(): array
    {
        try {
            $pdo = \Core\DB::pdo();
            $stmt = $pdo->query('SELECT ap.*, u.email FROM affiliate_payouts ap JOIN users u ON u.id = ap.referrer_user_id ORDER BY ap.created_at DESC');
            return $stmt->fetchAll();
        } catch (\PDOException $e) {
            \Core\Logger::log('database', 'error', 'Fetch affiliate payouts failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    private function findPayout(int $id): ?array
    {
        try {
            $stmt = \Core\DB::pdo()->prepare('SELECT * FROM affiliate_payouts WHERE id = ?');
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            return $row ?: null;
        } catch (\PDOException $e) {
            \Core\Logger::log('database', 'error', 'Find affiliate payout failed', ['error' => $e->getMessage(), 'id' => $id]);
            return null;
        }
    }

    private function updatePayoutStatus(int $id, string $status): void
    {
        try {
            if ($status === 'paid') {
                \Core\DB::pdo()->prepare('UPDATE affiliate_payouts SET status = ?, paid_at = CURRENT_TIMESTAMP WHERE id = ?')->execute([$status, $id]);
            } else {
                \Core\DB::pdo()->prepare('UPDATE affiliate_payouts SET status = ? WHERE id = ?')->execute([$status, $id]);
            }
        } catch (\PDOException $e) {
            \Core\Logger::log('database', 'error', 'Update affiliate payout status failed', ['error' => $e->getMessage(), 'id' => $id, 'status' => $status]);
        }
    }
}
