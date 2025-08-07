<?php
// Step 2: App config
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $_SESSION['app'] = [
    'name' => trim($_POST['name'] ?? 'MartMarket'),
    'base_url' => trim($_POST['base_url'] ?? ''),
    'timezone' => trim($_POST['timezone'] ?? 'UTC'),
  ];
  $_SESSION['security'] = [
    'app_key_base64' => base64_encode(random_bytes(32))
  ];
  header('Location: ?step=3'); exit;
}
?>
<form method="post">
  <label>Site Name</label><input name="name" value="<?= h($_SESSION['app']['name'] ?? 'MartMarket') ?>" required>
  <label>Base URL (e.g., https://example.com)</label><input name="base_url" value="<?= h($_SESSION['app']['base_url'] ?? '') ?>" required>
  <label>Timezone</label><input name="timezone" value="<?= h($_SESSION['app']['timezone'] ?? 'UTC') ?>" required>
  <button class="btn" type="submit">Next</button>
</form>
