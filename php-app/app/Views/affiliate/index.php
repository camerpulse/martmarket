<?php
$title = 'Affiliate & Referrals';
$link = $referralLink ?? '';
$rows = $rows ?? [];
$stats = $stats ?? ['count'=>0];
$commissionStats = $commissionStats ?? ['confirmed'=>'0','paid'=>'0','available'=>'0'];
?>
<h1>Affiliate Program</h1>
<div class="card">
  <h2>Your Referral Link</h2>
  <input type="text" value="<?= htmlspecialchars($link) ?>" readonly style="width:100%">
  <p>Share this link. When users register, they'll be linked to your account.</p>
  <p><strong>Total referrals:</strong> <?= (int)($stats['count'] ?? 0) ?></p>
</div>

<div class="card">
  <h2>Earnings</h2>
  <p><strong>Confirmed:</strong> <?= htmlspecialchars($commissionStats['confirmed']) ?> BTC</p>
  <p><strong>Paid:</strong> <?= htmlspecialchars($commissionStats['paid']) ?> BTC</p>
  <p><strong>Available:</strong> <?= htmlspecialchars($commissionStats['available']) ?> BTC</p>
  <p><a href="/affiliate/payouts">Go to payouts »</a></p>
</div>

<div class="card">
  <h2>Referred Users</h2>
  <?php if(!$rows): ?>
    <p>No referrals yet. Share your link to start earning.</p>
  <?php else: ?>
    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr>
          <th style="text-align:left;border-bottom:1px solid #2b2f3a">User</th>
          <th style="text-align:left;border-bottom:1px solid #2b2f3a">Email</th>
          <th style="text-align:left;border-bottom:1px solid #2b2f3a">Joined</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach($rows as $r): ?>
          <tr>
            <td>#<?= (int)$r['referred_user_id'] ?></td>
            <td><?= htmlspecialchars($r['referred_email'] ?? '') ?></td>
            <td><?= htmlspecialchars($r['referred_at'] ?? '') ?></td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  <?php endif; ?>
</div>
