<?php
// Step 4: Write config, run migrations, create admin
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $installerRoot = dirname(__DIR__);
  $root = dirname($installerRoot);
  // write config files
  if (!is_dir($root . '/config')) mkdir($root . '/config', 0755, true);
  file_put_contents($root . '/config/app.php', "<?php\nreturn [\n  'app' => [\n    'name' => '".addslashes($_SESSION['app']['name'])."',\n    'base_url' => '".addslashes($_SESSION['app']['base_url'])."',\n    'timezone' => '".addslashes($_SESSION['app']['timezone'])."',\n    'debug' => ".(!empty($_SESSION['app']['debug']) ? 'true' : 'false')."\n  ]\n];\n");
  file_put_contents($root . '/config/database.php', "<?php\nreturn [\n  'db' => [\n    'host' => '".addslashes($_SESSION['db']['host'])."',\n    'port' => ".(int)$_SESSION['db']['port'].",\n    'database' => '".addslashes($_SESSION['db']['database'])."',\n    'user' => '".addslashes($_SESSION['db']['user'])."',\n    'password' => '".addslashes($_SESSION['db']['password'])."'\n  ]\n];\n");
  file_put_contents($root . '/config/security.php', "<?php\nreturn [\n  'security' => [\n    'app_key_base64' => '".$_SESSION['security']['app_key_base64']."'\n  ]\n];\n");
  // optional configs
  if (!empty($_SESSION['mail'])) {
    file_put_contents($root . '/config/mail.php', "<?php\nreturn [\n  'mail' => [\n    'host' => '".addslashes($_SESSION['mail']['host'])."',\n    'port' => ".(int)$_SESSION['mail']['port'].",\n    'username' => '".addslashes($_SESSION['mail']['username'])."',\n    'password' => '".addslashes($_SESSION['mail']['password'])."',\n    'encryption' => '".addslashes($_SESSION['mail']['encryption'])."',\n    'from_email' => '".addslashes($_SESSION['mail']['from_email'])."',\n    'from_name' => '".addslashes($_SESSION['mail']['from_name'])."'\n  ]\n];\n");
  }
  if (!empty($_SESSION['payments'])) {
    file_put_contents($root . '/config/payments.php', "<?php\nreturn [\n  'payments' => [\n    'btc_network' => '".addslashes($_SESSION['payments']['network'])."',\n    'btc_provider' => '".addslashes($_SESSION['payments']['provider'])."',\n    'btc_confirmations' => ".(int)$_SESSION['payments']['confirmations'].",\n    'btc_xpub' => '".addslashes($_SESSION['payments']['xpub'])."'\n  ]\n];\n");
  }

  // run migrations
  try {
    $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $_SESSION['db']['host'], (int)$_SESSION['db']['port'], $_SESSION['db']['database']);
    $pdo = new PDO($dsn, $_SESSION['db']['user'], $_SESSION['db']['password'], [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
    $sql = file_get_contents($installerRoot . '/migrations.sql');
    $pdo->exec($sql);

    // seed default category if none exists
    $cnt = (int)$pdo->query('SELECT COUNT(*) FROM categories')->fetchColumn();
    if ($cnt === 0) {
      $pdo->prepare('INSERT INTO categories (name, slug) VALUES (?, ?)')->execute(['General', 'general']);
    }

    // create admin user
    $hash = password_hash($_SESSION['admin']['password'], PASSWORD_ARGON2ID);
    $code = substr(bin2hex(random_bytes(8)), 0, 16);
    $pdo->prepare('INSERT INTO users (email, password_hash, role, referral_code, email_verified) VALUES (?, ?, "admin", ?, 1)')
        ->execute([$_SESSION['admin']['email'], $hash, $code]);
    $uid = (int)$pdo->lastInsertId();
    $pdo->prepare('INSERT INTO profiles (user_id, display_name, twofa_enabled) VALUES (?, ?, 0)')->execute([$uid, $_SESSION['admin']['display']]);

    // seed payment settings
    if (!empty($_SESSION['payments'])) {
      $pdo->prepare('INSERT INTO settings (`key`,`value`) VALUES ("btc_provider", ?)
        ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)')->execute([$_SESSION['payments']['provider']]);
      $pdo->prepare('INSERT INTO settings (`key`,`value`) VALUES ("btc_network", ?)
        ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)')->execute([$_SESSION['payments']['network']]);
      $pdo->prepare('INSERT INTO settings (`key`,`value`) VALUES ("btc_confirmations", ?)
        ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)')->execute([(string)$_SESSION['payments']['confirmations']]);
      if (!empty($_SESSION['payments']['xpub'])) {
        $pdo->prepare('INSERT INTO settings (`key`,`value`) VALUES ("btc_xpub", ?)
          ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)')->execute([$_SESSION['payments']['xpub']]);
      }
    }

    echo '<p>Installation complete. <a href="/">Go to site</a></p>';
    echo '<p><strong>Important:</strong> Delete the installer/ directory now, or restrict access. For future updates, use <code>/installer/upgrade.php</code>.</p>';
    session_destroy();
    exit;
  } catch (Exception $e) {
    $error = 'Migration or admin creation failed: ' . $e->getMessage();
  }
}
?>
<form method="post">
  <?php if(!empty($error)): ?><p style="color:#ff6b6b"><?= h($error) ?></p><?php endif; ?>
  <p>Ready to install with the provided settings.</p>
  <button class="btn" type="submit">Install</button>
</form>
