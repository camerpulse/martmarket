<?php
$title = 'Checkout Error';
?>
<h1>Checkout Unavailable</h1>
<p><?= htmlspecialchars($message ?? 'Payments are not yet configured by the administrator.') ?></p>
