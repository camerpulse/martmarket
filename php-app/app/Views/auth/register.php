<?php
$title = 'Register';
?>
<h1>Create Account</h1>
<?php if(!empty($error)): ?><p class="error"><?= htmlspecialchars($error) ?></p><?php endif; ?>
<form method="post" action="/register">
  <input type="hidden" name="_csrf" value="<?= htmlspecialchars(\Core\Csrf::token()) ?>">
  <label>Display Name</label>
  <input type="text" name="display_name" required>
  <label>Email</label>
  <input type="email" name="email" required>
  <label>Password (min 8 chars)</label>
  <input type="password" name="password" minlength="8" required>
  <label>Account Type</label>
  <select name="role">
    <option value="buyer">Buyer</option>
    <option value="vendor">Vendor</option>
  </select>
  <label>Referral Code (optional)</label>
  <input type="text" name="referral_code" value="<?= isset($ref)?htmlspecialchars($ref):'' ?>" maxlength="16">
  <button class="btn" type="submit">Create Account</button>
</form>
<p>By default, 2FA and PGP can be configured from your profile page after sign-in.</p>
