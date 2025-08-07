<?php
$title = 'Thread';
$thread = $thread ?? null; $messages = $messages ?? [];
?>
<h1><?= htmlspecialchars($thread['subject'] ?: ('Thread #' . (int)$thread['id'])) ?></h1>
<?php if(!$messages): ?>
  <p>No messages yet.</p>
<?php else: ?>
  <ul>
    <?php foreach($messages as $m): ?>
      <li>
        <strong><?= htmlspecialchars($m['display_name'] ?? ('User#' . (int)$m['sender_user_id'])) ?>:</strong>
        <pre style="white-space:pre-wrap;word-wrap:break-word;"><?= htmlspecialchars($m['body']) ?></pre>
        <?php if((int)$m['is_pgp_encrypted']===1): ?><small>PGP encrypted</small><?php endif; ?>
      </li>
    <?php endforeach; ?>
  </ul>
<?php endif; ?>
<hr>
<h2>Send Message</h2>
<form method="post" action="/messages/send">
  <input type="hidden" name="_csrf" value="<?= htmlspecialchars(\Core\Csrf::token()) ?>">
  <input type="hidden" name="thread_id" value="<?= (int)$thread['id'] ?>">
  <label>Message</label>
  <textarea name="body" rows="4" required></textarea>
  <label><input type="checkbox" name="pgp"> Message is already PGP-encrypted</label>
  <button class="btn" type="submit">Send</button>
</form>
