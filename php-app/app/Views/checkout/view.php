<?php
$title = 'Checkout';
$order = $order ?? null; if(!$order){ echo 'Order not found'; return; }
$amount = $order['btc_expected_amount'];
$address = $order['btc_address'];
$uri = 'bitcoin:'.$address.'?amount='.$amount;
$confirmationsRequired = (int)($confirmationsRequired ?? 3);
?>
<h1>Checkout</h1>
<p><strong>Order #:</strong> <?= htmlspecialchars($order['order_number']) ?></p>
<p><strong>Send exactly:</strong> <?= htmlspecialchars($amount) ?> BTC</p>
<p><strong>To address:</strong> <code><?= htmlspecialchars($address) ?></code></p>
<p><img alt="QR to pay BTC" src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=<?= urlencode($uri) ?>" /></p>
<p>Status: <strong><?= htmlspecialchars($order['status']) ?></strong> (requires <?= (int)$confirmationsRequired ?> confirmations)</p>
<p>After payment confirms, funds will be held in escrow until completion or dispute.</p>
