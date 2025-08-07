<?php
$title = 'My Profile';
?>
<h1>My Profile</h1>
<div class="row">
  <div class="col">
    <h2>Profile Settings</h2>
    <form method="post" action="/account/profile">
      <input type="hidden" name="_csrf" value="<?= htmlspecialchars(\Core\Csrf::token()) ?>">
      <label>Display Name</label>
      <input type="text" name="display_name" value="<?= htmlspecialchars($profile['display_name'] ?? '') ?>" required>
      <label>Bio</label>
      <textarea name="bio" rows="4"><?= htmlspecialchars($profile['bio'] ?? '') ?></textarea>
      <button class="btn" type="submit">Save</button>
    </form>
    <p style="margin-top:12px">2FA: <?= !empty($profile['twofa_enabled']) ? 'Enabled' : 'Disabled' ?> 
      <?php if(empty($profile['twofa_enabled'])): ?>
        <a class="btn secondary" href="/2fa/setup">Enable 2FA</a>
      <?php endif; ?>
    </p>
  </div>
  <div class="col">
    <h2>PGP Keys</h2>
    <form method="post" action="/account/pgp/add">
      <input type="hidden" name="_csrf" value="<?= htmlspecialchars(\Core\Csrf::token()) ?>">
      <label>Key Name</label>
      <input type="text" name="key_name" placeholder="Main Key" required>
      <label>Public Key (ASCII-armored)</label>
      <textarea name="public_key" rows="6" required></textarea>
      <label><input type="checkbox" name="is_default"> Set as default</label>
      <button class="btn" type="submit">Add Key</button>
    </form>

    <h3>Existing Keys</h3>
    <?php if(!empty($pgp)): ?>
      <ul>
        <?php foreach($pgp as $k): ?>
          <li>
            <strong><?= htmlspecialchars($k['key_name']) ?></strong>
            (<?= htmlspecialchars($k['fingerprint']) ?>)
            <?= $k['is_default'] ? ' - Default' : '' ?>
            <?php if(!$k['is_default']): ?>
            <form method="post" action="/account/pgp/default" style="display:inline">
              <input type="hidden" name="_csrf" value="<?= htmlspecialchars(\Core\Csrf::token()) ?>">
              <input type="hidden" name="key_id" value="<?= (int)$k['id'] ?>">
              <button class="btn secondary" type="submit">Make Default</button>
            </form>
            <?php endif; ?>
          </li>
        <?php endforeach; ?>
      </ul>
    <?php else: ?>
      <p>No keys yet.</p>
    <?php endif; ?>
  </div>
</div>
