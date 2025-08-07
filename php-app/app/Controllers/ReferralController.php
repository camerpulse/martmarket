<?php
namespace App\Controllers;

use Core\Controller;
use Core\Csrf;
use App\Models\User;
use App\Models\Referral;
use App\Models\AffiliateCommission as Commission;
use App\Models\AffiliatePayout as Payout;

class ReferralController extends Controller
{
    public function index(): string
    {
        $this->ensureAuth();
        $user = User::find((int)$_SESSION['uid']);
        $code = $user['referral_code'] ?? '';
        $base = (($_SERVER['HTTPS'] ?? 'off') === 'on' ? 'https://' : 'http://') . ($_SERVER['HTTP_HOST'] ?? 'localhost');
        $link = $base . '/register?ref=' . urlencode($code);
        $rows = Referral::listByReferrer((int)$user['id']);
        $stats = Referral::statsForReferrer((int)$user['id']);
        $commissionStats = Commission::statsForReferrer((int)$user['id']);
        return $this->view('affiliate/index', [
            'title' => 'Affiliate & Referrals',
            'metaDescription' => 'Share your MartMarket referral link to invite friends and track signups.',
            'referralLink' => $link,
            'rows' => $rows,
            'stats' => $stats,
            'commissionStats' => $commissionStats,
        ]);
    }

    public function payouts(): string
    {
        $this->ensureAuth();
        $uid = (int)$_SESSION['uid'];
        $commissionStats = Commission::statsForReferrer($uid);
        $payoutStats = Payout::statsForReferrer($uid);
        $payouts = Payout::listByReferrer($uid);
        $commissions = Commission::listByReferrer($uid);
        return $this->view('affiliate/payouts', [
            'title' => 'Affiliate Payouts',
            'metaDescription' => 'View affiliate earnings and request Bitcoin payouts securely.',
            'commissionStats' => $commissionStats,
            'payoutStats' => $payoutStats,
            'payouts' => $payouts,
            'commissions' => $commissions,
        ]);
    }

    public function requestPayout(): string
    {
        $this->ensureAuth();
        if (!Csrf::check($_POST['_csrf'] ?? '')) { http_response_code(400); return 'Invalid CSRF'; }
        $address = trim((string)($_POST['btc_address'] ?? ''));
        $amount = trim((string)($_POST['amount_btc'] ?? '0'));
        if ($address === '' || $amount === '' || bccomp($amount, '0', 8) <= 0) {
            http_response_code(400); return 'Invalid payout request';
        }
        $uid = (int)$_SESSION['uid'];
        $available = Commission::statsForReferrer($uid)['available'] ?? '0';
        if (bccomp($amount, $available, 8) === 1) {
            http_response_code(400); return 'Amount exceeds available balance';
        }
        Payout::request($uid, $address, $amount);
        return $this->redirect('/affiliate/payouts');
    }
}
