<?php
// Step 3: Admin account
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $_SESSION['admin'] = [
    'email' => trim($_POST['email'] ?? ''),
    'password' => (string)($_POST['password'] ?? ''),
    'display' => trim($_POST['display'] ?? 'Admin')
  ];
  if (!filter_var($_SESSION['admin']['email'], FILTER_VALIDATE_EMAIL) || strlen($_SESSION['admin']['password']) < 12) {
    $error = 'Invalid email or weak password (min 12 chars).';
  } else {
    header('Location: ?step=4'); exit;
  }
}
?>
<form method="post">
  <?php if(!empty($error)): ?><p style="color:#ff6b6b"><?= h($error) ?></p><?php endif; ?>
  <label>Admin Email</label><input name="email" type="email" required>
  <label>Admin Password (min 12 chars)</label><input name="password" type="password" minlength="12" required>
  <label>Display Name</label><input name="display" value="Admin" required>
  <button class="btn" type="submit">Next</button>
</form>
