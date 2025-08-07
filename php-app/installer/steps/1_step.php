<?php
// Requirements check
$requirements = [
  'php' => version_compare(PHP_VERSION, '8.1.0', '>='),
  'pdo' => extension_loaded('pdo'),
  'openssl' => extension_loaded('openssl'),
  'bcmath' => extension_loaded('bcmath'),
  'gmp' => extension_loaded('gmp'),
];
$allGood = !in_array(false, $requirements, true);

// Step 1: DB config and test
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  if (!$allGood) {
    $error = 'Server does not meet requirements. Please enable missing PHP extensions or upgrade PHP.';
  } else {
    $_SESSION['db'] = [
      'host' => trim($_POST['host'] ?? 'localhost'),
      'port' => (int)($_POST['port'] ?? 3306),
      'database' => trim($_POST['database'] ?? ''),
      'user' => trim($_POST['user'] ?? ''),
      'password' => (string)($_POST['password'] ?? ''),
    ];
    // test connection
    try{
      $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $_SESSION['db']['host'], $_SESSION['db']['port'], $_SESSION['db']['database']);
      new PDO($dsn, $_SESSION['db']['user'], $_SESSION['db']['password']);
      header('Location: ?step=2'); exit;
    }catch(Exception $e){
      $error = 'Connection failed. Please verify credentials.';
    }
  }
}
?>
<div class="card">
  <h3>Server Requirements</h3>
  <ul>
    <li>PHP >= 8.1: <strong><?= $requirements['php'] ? 'OK' : 'Missing' ?></strong></li>
    <li>PDO extension: <strong><?= $requirements['pdo'] ? 'OK' : 'Missing' ?></strong></li>
    <li>OpenSSL extension: <strong><?= $requirements['openssl'] ? 'OK' : 'Missing' ?></strong></li>
    <li>BCMath extension: <strong><?= $requirements['bcmath'] ? 'OK' : 'Missing' ?></strong></li>
    <li>GMP extension: <strong><?= $requirements['gmp'] ? 'OK' : 'Missing' ?></strong></li>
  </ul>
  <?php if(!$allGood): ?><p style="color:#ff6b6b">Please fix the missing requirements before continuing.</p><?php endif; ?>
</div>
<form method="post">
  <?php if(!empty($error)): ?><p style="color:#ff6b6b"><?= h($error) ?></p><?php endif; ?>
  <label>DB Host</label><input name="host" value="<?= h($_SESSION['db']['host'] ?? 'localhost') ?>" required>
  <label>DB Port</label><input name="port" type="number" value="<?= h($_SESSION['db']['port'] ?? 3306) ?>" required>
  <label>Database</label><input name="database" value="<?= h($_SESSION['db']['database'] ?? '') ?>" required>
  <label>DB User</label><input name="user" value="<?= h($_SESSION['db']['user'] ?? '') ?>" required>
  <label>DB Password</label><input name="password" type="password" value="<?= h($_SESSION['db']['password'] ?? '') ?>">
  <button class="btn" type="submit" <?= $allGood ? '' : 'disabled' ?>>Next</button>
</form>
