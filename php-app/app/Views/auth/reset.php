<?php
$title = 'Reset Password';
$token = $token ?? '';
?>
<h1>Reset Password</h1>
<?php if(!empty($error)): ?><p class="error"><?= htmlspecialchars($error) ?></p><?php endif; ?>
<form method="post" action="/password/reset">
  <input type="hidden" name="_csrf" value="<?= htmlspecialchars(\Core\Csrf::token()) ?>">
  <input type="hidden" name="token" value="<?= htmlspecialchars($token) ?>">
  <label>New Password (min 12 chars)</label>
  <input type="password" name="password" minlength="12" required>
  <label>Confirm Password</label>
  <input type="password" name="password_confirm" minlength="12" required>
  <button class="btn" type="submit">Reset Password</button>
</form>
