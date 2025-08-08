<?php
// Requirements & filesystem check
$requirements = [
  'php' => version_compare(PHP_VERSION, '8.1.0', '>='),
  'pdo' => extension_loaded('pdo'),
  'pdo_mysql' => extension_loaded('pdo_mysql'),
  'openssl' => extension_loaded('openssl'),
  'bcmath' => extension_loaded('bcmath'),
  'gmp' => extension_loaded('gmp'),
  'mbstring' => extension_loaded('mbstring'),
  'json' => extension_loaded('json'),
  'curl' => extension_loaded('curl'),
  'fileinfo' => extension_loaded('fileinfo'),
  'gd_or_imagick' => (extension_loaded('gd') || extension_loaded('imagick')),
];
$allGood = !in_array(false, $requirements, true);

// Ensure required folders exist & are writable
$installerRoot = dirname(__DIR__);
$root = dirname($installerRoot);
$fsTargets = [
  'config' => $root . '/config',
  'logs' => $root . '/storage/logs',
  'uploads' => $root . '/storage/uploads',
  'products' => $root . '/storage/uploads/products',
];
$fsStatus = [];
foreach ($fsTargets as $key => $path) {
  if (!is_dir($path)) { @mkdir($path, 0775, true); }
  $writable = is_dir($path) && is_writable($path);
  // try to write a temp file for certainty
  if ($writable) {
    $test = @file_put_contents($path . '/.perm_test', 'ok');
    if ($test === false) { $writable = false; } else { @unlink($path . '/.perm_test'); }
  }
  $fsStatus[$key] = $writable;
}
$fsAllGood = !in_array(false, $fsStatus, true);

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
    <li>PDO: <strong><?= $requirements['pdo'] ? 'OK' : 'Missing' ?></strong></li>
    <li>PDO MySQL: <strong><?= $requirements['pdo_mysql'] ? 'OK' : 'Missing' ?></strong></li>
    <li>OpenSSL: <strong><?= $requirements['openssl'] ? 'OK' : 'Missing' ?></strong></li>
    <li>BCMath: <strong><?= $requirements['bcmath'] ? 'OK' : 'Missing' ?></strong></li>
    <li>GMP: <strong><?= $requirements['gmp'] ? 'OK' : 'Missing' ?></strong></li>
    <li>mbstring: <strong><?= $requirements['mbstring'] ? 'OK' : 'Missing' ?></strong></li>
    <li>JSON: <strong><?= $requirements['json'] ? 'OK' : 'Missing' ?></strong></li>
    <li>cURL: <strong><?= $requirements['curl'] ? 'OK' : 'Missing' ?></strong></li>
    <li>Fileinfo: <strong><?= $requirements['fileinfo'] ? 'OK' : 'Missing' ?></strong></li>
    <li>GD or Imagick: <strong><?= $requirements['gd_or_imagick'] ? 'OK' : 'Missing' ?></strong></li>
  </ul>
  <h4>Filesystem Permissions</h4>
  <ul>
    <li>/config: <strong><?= $fsStatus['config'] ? 'Writable' : 'Not writable' ?></strong></li>
    <li>/storage/logs: <strong><?= $fsStatus['logs'] ? 'Writable' : 'Not writable' ?></strong></li>
    <li>/storage/uploads: <strong><?= $fsStatus['uploads'] ? 'Writable' : 'Not writable' ?></strong></li>
    <li>/storage/uploads/products: <strong><?= $fsStatus['products'] ? 'Writable' : 'Not writable' ?></strong></li>
  </ul>
  <?php if(!$allGood || !$fsAllGood): ?><p style="color:#ff6b6b">Please fix the missing requirements and make folders writable before continuing.</p><?php endif; ?>
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
