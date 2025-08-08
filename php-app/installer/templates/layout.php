<?php
// Shared installer layout and simple router for steps
$action = __DIR__ . '/../installer/index.php';
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MartMarket Installer</title>
  <style>
    body{font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#0b0c10;color:#e6edf3;margin:0}
    main{max-width:800px;margin:0 auto;padding:24px}
    .card{background:#111217;border:1px solid #1f2430;border-radius:12px;padding:16px;margin:16px 0}
    input,textarea,select{width:100%;padding:10px;border-radius:8px;border:1px solid #2b2f3a;background:#0f1116;color:#e6edf3}
    label{display:block;margin:8px 0 4px}
    .btn{background:#5ab1f6;border:none;color:#0b0c10;padding:10px 14px;border-radius:8px;cursor:pointer;font-weight:600}
    .row{display:flex;gap:16px}
    .col{flex:1}
  </style>
</head>
<body>
<main>
  <h1>MartMarket Installer</h1>
  <p>Step <?= (int)$step ?> of 4</p>
  <div class="card">
    <?php 
      $stepFile = __DIR__ . '/../steps/' . (int)$step . '_step.php';
      if (file_exists($stepFile)) {
        include $stepFile;
      } else {
        echo '<p style="color:#ff6b6b">Installer step file not found: ' . h($stepFile) . '</p>';
      }
    ?>
  </div>
</main>
</body>
</html>
