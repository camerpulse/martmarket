<?php
$title = 'Forgot Password';
?>
<h1>Forgot Password</h1>
<?php if(!empty($success)): ?>
  <p>If the email exists, a reset link has been sent. Please check your inbox.</p>
<?php else: ?>
  <form method="post" action="/password/forgot">
    <input type="hidden" name="_csrf" value="<?= htmlspecialchars(\Core\Csrf::token()) ?>">
    <label>Email</label>
    <input type="email" name="email" required>
    <button class="btn" type="submit">Send Reset Link</button>
  </form>
<?php endif; ?>
