<?php
namespace App\Controllers;

use Core\Controller;
use App\Models\User;
use App\Models\Referral;

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
        return $this->view('affiliate/index', [
            'title' => 'Affiliate & Referrals',
            'metaDescription' => 'Share your MartMarket referral link to invite friends and track signups.',
            'referralLink' => $link,
            'rows' => $rows,
            'stats' => $stats,
        ]);
    }

    private function ensureAuth(): void
    {
        if (empty($_SESSION['uid'])) { $this->redirect('/login'); }
    }
}
