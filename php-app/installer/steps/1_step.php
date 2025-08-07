<?php
// Step 1: DB config and test
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
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
?>
<form method="post">
  <?php if(!empty($error)): ?><p style="color:#ff6b6b"><?= h($error) ?></p><?php endif; ?>
  <label>DB Host</label><input name="host" value="<?= h($_SESSION['db']['host'] ?? 'localhost') ?>" required>
  <label>DB Port</label><input name="port" type="number" value="<?= h($_SESSION['db']['port'] ?? 3306) ?>" required>
  <label>Database</label><input name="database" value="" required>
  <label>DB User</label><input name="user" value="" required>
  <label>DB Password</label><input name="password" type="password" value="">
  <button class="btn" type="submit">Next</button>
</form>
