<?php
// Step 4: Write config, run migrations, create admin
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $root = dirname(__DIR__);
  // write config files
  if (!is_dir($root . '/config')) mkdir($root . '/config', 0755, true);
  file_put_contents($root . '/config/app.php', "<?php\nreturn [\n  'app' => [\n    'name' => '".addslashes($_SESSION['app']['name'])."',\n    'base_url' => '".addslashes($_SESSION['app']['base_url'])."',\n    'timezone' => '".addslashes($_SESSION['app']['timezone'])."'\n  ]\n];\n");
  file_put_contents($root . '/config/database.php', "<?php\nreturn [\n  'db' => [\n    'host' => '".addslashes($_SESSION['db']['host'])."',\n    'port' => ".(int)$_SESSION['db']['port'].",\n    'database' => '".addslashes($_SESSION['db']['database'])."',\n    'user' => '".addslashes($_SESSION['db']['user'])."',\n    'password' => '".addslashes($_SESSION['db']['password'])."'\n  ]\n];\n");
  file_put_contents($root . '/config/security.php', "<?php\nreturn [\n  'security' => [\n    'app_key_base64' => '".$_SESSION['security']['app_key_base64']."'\n  ]\n];\n");

  // run migrations
  try {
    $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $_SESSION['db']['host'], (int)$_SESSION['db']['port'], $_SESSION['db']['database']);
    $pdo = new PDO($dsn, $_SESSION['db']['user'], $_SESSION['db']['password'], [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
    $sql = file_get_contents(__DIR__ . '/migrations.sql');
    $pdo->exec($sql);

    // create admin user
    $hash = password_hash($_SESSION['admin']['password'], PASSWORD_ARGON2ID);
    $code = substr(bin2hex(random_bytes(8)), 0, 16);
    $pdo->prepare('INSERT INTO users (email, password_hash, role, referral_code, email_verified) VALUES (?, ?, "admin", ?, 1)')
        ->execute([$_SESSION['admin']['email'], $hash, $code]);
    $uid = (int)$pdo->lastInsertId();
    $pdo->prepare('INSERT INTO profiles (user_id, display_name, twofa_enabled) VALUES (?, ?, 0)')->execute([$uid, $_SESSION['admin']['display']]);

    echo '<p>Installation complete. <a href="/">Go to site</a></p>';
    echo '<p><strong>Important:</strong> Delete the installer/ directory now.</p>';
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
