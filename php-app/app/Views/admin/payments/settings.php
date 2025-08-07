<?php
$title = 'Payments Settings';
$cfg = $cfg ?? ['provider'=>'blockstream','network'=>'testnet','confirmations'=>3,'xpub'=>''];
?>
<h1>Payments Settings</h1>
<form method="post" action="/admin/payments/save">
  <input type="hidden" name="_csrf" value="<?= htmlspecialchars(\Core\Csrf::token()) ?>">
  <label>Provider</label>
  <select name="provider">
    <option value="blockstream" <?= $cfg['provider']==='blockstream'?'selected':'' ?>>Blockstream (no API key)</option>
    <option value="blockcypher" <?= $cfg['provider']==='blockcypher'?'selected':'' ?>>BlockCypher (API key req.)</option>
  </select>
  <label>Network</label>
  <select name="network">
    <option value="testnet" <?= $cfg['network']==='testnet'?'selected':'' ?>>Testnet</option>
    <option value="mainnet" <?= $cfg['network']==='mainnet'?'selected':'' ?>>Mainnet</option>
  </select>
  <label>Required Confirmations (1-6)</label>
  <input type="number" name="confirmations" min="1" max="6" value="<?= (int)$cfg['confirmations'] ?>">
  <label>Watch-only XPUB</label>
  <input type="text" name="xpub" value="<?= htmlspecialchars($cfg['xpub']) ?>" placeholder="tpub... or xpub..." />
  <label>Affiliate Commission Rate (%)</label>
  <input type="number" name="affiliate_rate" min="0" max="50" step="0.1" value="<?= htmlspecialchars($cfg['affiliate_rate'] ?? '5') ?>">
  <button class="btn" type="submit">Save Settings</button>
</form>
<hr>
<h2>Payment Poller</h2>
<p>Click to check awaiting payments and update escrow status.</p>
<form method="post" action="/admin/payments/check">
  <input type="hidden" name="_csrf" value="<?= htmlspecialchars(\Core\Csrf::token()) ?>">
  <button class="btn secondary" type="submit">Run Check Now</button>
</form>
