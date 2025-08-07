<?php
$title = 'Login';
?>
<h1>Login</h1>
<?php if(!empty($error)): ?><p class="error"><?= htmlspecialchars($error) ?></p><?php endif; ?>
<form method="post" action="/login">
  <input type="hidden" name="_csrf" value="<?= htmlspecialchars(\Core\Csrf::token()) ?>">
  <label>Email</label>
  <input type="email" name="email" required>
  <label>Password</label>
  <input type="password" name="password" required>
  <label>2FA Code (if enabled)</label>
  <input type="text" name="totp" pattern="\\d{6}" placeholder="123456">
  <button class="btn" type="submit">Sign In</button>
</form>
<?php if(!empty($twofa_setup)): ?>
  <hr>
  <h2>Enable 2FA</h2>
  <p>Secret: <code><?= htmlspecialchars($secret) ?></code></p>
  <p>Scan this URI with Google Authenticator: <code><?= htmlspecialchars($uri) ?></code></p>
  <form method="post" action="/2fa/setup">
    <input type="hidden" name="_csrf" value="<?= htmlspecialchars(\Core\Csrf::token()) ?>">
    <label>Enter code to confirm</label>
    <input type="text" name="code" pattern="\\d{6}" required>
    <button class="btn" type="submit">Confirm 2FA</button>
  </form>
<?php endif; ?>
