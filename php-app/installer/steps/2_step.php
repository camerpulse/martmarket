<?php
// Step 2: App + Email + Payments config
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $_SESSION['app'] = [
    'name' => trim($_POST['name'] ?? 'MartMarket'),
    'base_url' => trim($_POST['base_url'] ?? ''),
    'timezone' => trim($_POST['timezone'] ?? 'UTC'),
    'debug' => isset($_POST['debug']),
  ];
  $_SESSION['security'] = [
    'app_key_base64' => base64_encode(random_bytes(32))
  ];
  $_SESSION['mail'] = [
    'host' => trim($_POST['mail_host'] ?? ''),
    'port' => (int)($_POST['mail_port'] ?? 587),
    'username' => trim($_POST['mail_user'] ?? ''),
    'password' => (string)($_POST['mail_pass'] ?? ''),
    'encryption' => in_array($_POST['mail_enc'] ?? 'tls', ['tls','ssl','none']) ? $_POST['mail_enc'] : 'tls',
    'from_email' => trim($_POST['mail_from_email'] ?? ''),
    'from_name' => trim($_POST['mail_from_name'] ?? 'MartMarket'),
  ];
  $_SESSION['payments'] = [
    'network' => in_array($_POST['btc_network'] ?? 'testnet', ['mainnet','testnet']) ? $_POST['btc_network'] : 'testnet',
    'provider' => in_array($_POST['btc_provider'] ?? 'blockstream', ['blockstream','blockcypher']) ? $_POST['btc_provider'] : 'blockstream',
    'confirmations' => max(1, min(6, (int)($_POST['btc_confirmations'] ?? 3))),
    'xpub' => trim($_POST['btc_xpub'] ?? ''),
  ];
  header('Location: ?step=3'); exit;
}
?>
<form method="post">
  <div class="card">
    <h3>Site Settings</h3>
    <label>Site Name</label><input name="name" value="<?= h($_SESSION['app']['name'] ?? 'MartMarket') ?>" required>
    <label>Base URL (e.g., https://example.com)</label><input name="base_url" value="<?= h($_SESSION['app']['base_url'] ?? '') ?>" required>
    <label>Timezone</label><input name="timezone" value="<?= h($_SESSION['app']['timezone'] ?? 'UTC') ?>" required>
    <label><input type="checkbox" name="debug" value="1" <?= !empty($_SESSION['app']['debug']) ? 'checked' : '' ?>> Enable debug mode (development)</label>
  </div>
  <div class="card">
    <h3>Email (optional)</h3>
    <div class="row">
      <div class="col"><label>SMTP Host</label><input name="mail_host" value="<?= h($_SESSION['mail']['host'] ?? '') ?>"></div>
      <div class="col"><label>SMTP Port</label><input name="mail_port" type="number" value="<?= h($_SESSION['mail']['port'] ?? 587) ?>"></div>
    </div>
    <div class="row">
      <div class="col"><label>Username</label><input name="mail_user" value="<?= h($_SESSION['mail']['username'] ?? '') ?>"></div>
      <div class="col"><label>Password</label><input name="mail_pass" type="password" value="<?= h($_SESSION['mail']['password'] ?? '') ?>"></div>
    </div>
    <div class="row">
      <div class="col"><label>Encryption</label>
        <select name="mail_enc">
          <?php foreach(['tls','ssl','none'] as $enc): ?>
            <option value="<?= $enc ?>" <?= (($_SESSION['mail']['encryption'] ?? 'tls')===$enc)?'selected':'' ?>><?= strtoupper($enc) ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <div class="col"><label>From Email</label><input name="mail_from_email" type="email" value="<?= h($_SESSION['mail']['from_email'] ?? '') ?>"></div>
    </div>
    <label>From Name</label><input name="mail_from_name" value="<?= h($_SESSION['mail']['from_name'] ?? 'MartMarket') ?>">
  </div>
  <div class="card">
    <h3>Bitcoin Payments</h3>
    <div class="row">
      <div class="col"><label>Network</label>
        <select name="btc_network">
          <?php foreach(['testnet','mainnet'] as $n): ?>
            <option value="<?= $n ?>" <?= (($_SESSION['payments']['network'] ?? 'testnet')===$n)?'selected':'' ?>><?= ucfirst($n) ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <div class="col"><label>Provider</label>
        <select name="btc_provider">
          <?php foreach(['blockstream','blockcypher'] as $p): ?>
            <option value="<?= $p ?>" <?= (($_SESSION['payments']['provider'] ?? 'blockstream')===$p)?'selected':'' ?>><?= ucfirst($p) ?></option>
          <?php endforeach; ?>
        </select>
      </div>
    </div>
    <div class="row">
      <div class="col"><label>Confirmations Required</label><input name="btc_confirmations" type="number" min="1" max="6" value="<?= h($_SESSION['payments']['confirmations'] ?? 3) ?>"></div>
      <div class="col"><label>XPUB (optional)</label><input name="btc_xpub" value="<?= h($_SESSION['payments']['xpub'] ?? '') ?>" placeholder="For derived addresses"></div>
    </div>
  </div>
  <button class="btn" type="submit">Next</button>
</form>
