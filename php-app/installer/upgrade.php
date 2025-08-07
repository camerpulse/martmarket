<?php
// Simple upgrader: re-run idempotent migrations
session_start();
$root = dirname(__DIR__);
$hasConfig = file_exists($root.'/config/app.php') && file_exists($root.'/config/database.php');

function h($s){return htmlspecialchars((string)$s, ENT_QUOTES,'UTF-8');}

if (!$hasConfig) {
  http_response_code(400);
  echo 'Config not found. Please run the installer first.';
  exit;
}

$db = include $root.'/config/database.php';
$err = null; $msg = null;
if ($_SERVER['REQUEST_METHOD']==='POST') {
  try{
    $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $db['db']['host'], (int)$db['db']['port'], $db['db']['database']);
    $pdo = new PDO($dsn, $db['db']['user'], $db['db']['password'], [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
    $sql = file_get_contents(__DIR__ . '/migrations.sql');
    $pdo->exec($sql);
    $msg = 'Migrations re-applied successfully.';
  }catch(Exception $e){
    $err = 'Upgrade failed: ' . $e->getMessage();
  }
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MartMarket Upgrade</title>
  <style>
    body{font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#0b0c10;color:#e6edf3;margin:0}
    main{max-width:800px;margin:0 auto;padding:24px}
    .card{background:#111217;border:1px solid #1f2430;border-radius:12px;padding:16px;margin:16px 0}
    .btn{background:#5ab1f6;border:none;color:#0b0c10;padding:10px 14px;border-radius:8px;cursor:pointer;font-weight:600}
  </style>
</head>
<body>
  <main>
    <h1>MartMarket Upgrade</h1>
    <div class="card">
      <p>This tool will re-run safe migrations to bring your database up to date.</p>
      <?php if($err): ?><p style="color:#ff6b6b"><?= h($err) ?></p><?php endif; ?>
      <?php if($msg): ?><p style="color:#7df59b"><?= h($msg) ?></p><?php endif; ?>
      <form method="post">
        <button class="btn" type="submit">Run Upgrade</button>
      </form>
      <p><a href="/">Back to site</a></p>
    </div>
  </main>
</body>
</html>
