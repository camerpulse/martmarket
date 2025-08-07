<?php
$title = 'Affiliate Payouts';
$commissionStats = $commissionStats ?? ['available' => '0', 'confirmed' => '0', 'paid' => '0'];
$payoutStats = $payoutStats ?? ['pending' => '0', 'paid' => '0'];
$payouts = $payouts ?? [];
$commissions = $commissions ?? [];
?>
<h1>Affiliate Payouts</h1>
<div class="card">
  <h2>Your Earnings</h2>
  <p><strong>Confirmed:</strong> <?= htmlspecialchars($commissionStats['confirmed']) ?> BTC</p>
  <p><strong>Already Paid:</strong> <?= htmlspecialchars($commissionStats['paid']) ?> BTC</p>
  <p><strong>Available:</strong> <?= htmlspecialchars($commissionStats['available']) ?> BTC</p>
  <p><strong>Payouts Pending:</strong> <?= htmlspecialchars($payoutStats['pending']) ?> BTC</p>
</div>

<div class="card">
  <h2>Request Payout</h2>
  <form method="post" action="/affiliate/payout/request">
    <input type="hidden" name="_csrf" value="<?= htmlspecialchars(\Core\Csrf::token()) ?>">
    <label>BTC Address</label>
    <input type="text" name="btc_address" placeholder="Your Bitcoin address" required>
    <label>Amount BTC (max <?= htmlspecialchars($commissionStats['available']) ?>)</label>
    <input type="text" name="amount_btc" required>
    <button class="btn" type="submit">Request</button>
  </form>
  <p><small>Note: Minimums or approvals may apply. Admin will process payouts periodically.</small></p>
</div>

<div class="card">
  <h2>Recent Payout Requests</h2>
  <?php if(!$payouts): ?>
    <p>No payout requests yet.</p>
  <?php else: ?>
    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr>
          <th style="text-align:left;border-bottom:1px solid #2b2f3a">Date</th>
          <th style="text-align:left;border-bottom:1px solid #2b2f3a">Amount BTC</th>
          <th style="text-align:left;border-bottom:1px solid #2b2f3a">Address</th>
          <th style="text-align:left;border-bottom:1px solid #2b2f3a">Status</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach($payouts as $p): ?>
        <tr>
          <td><?= htmlspecialchars($p['created_at']) ?></td>
          <td><?= htmlspecialchars($p['amount_btc']) ?></td>
          <td><?= htmlspecialchars($p['btc_address']) ?></td>
          <td><?= htmlspecialchars($p['status']) ?></td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  <?php endif; ?>
</div>

<div class="card">
  <h2>Recent Commissions</h2>
  <?php if(!$commissions): ?>
    <p>No commissions yet.</p>
  <?php else: ?>
    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr>
          <th style="text-align:left;border-bottom:1px solid #2b2f3a">Order</th>
          <th style="text-align:left;border-bottom:1px solid #2b2f3a">Amount BTC</th>
          <th style="text-align:left;border-bottom:1px solid #2b2f3a">Rate %</th>
          <th style="text-align:left;border-bottom:1px solid #2b2f3a">Status</th>
          <th style="text-align:left;border-bottom:1px solid #2b2f3a">Date</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach($commissions as $c): ?>
        <tr>
          <td>#<?= (int)$c['order_id'] ?></td>
          <td><?= htmlspecialchars($c['amount_btc']) ?></td>
          <td><?= htmlspecialchars($c['rate_percent']) ?></td>
          <td><?= htmlspecialchars($c['status']) ?></td>
          <td><?= htmlspecialchars($c['created_at']) ?></td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  <?php endif; ?>
</div>
