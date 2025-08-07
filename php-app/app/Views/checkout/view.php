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
<p><strong>Send exactly:</strong> <span id="amountText"><?= htmlspecialchars($amount) ?></span> BTC</p>
<p><strong>To address:</strong> <code><?= htmlspecialchars($address) ?></code></p>
<p><img alt="QR to pay BTC" src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=<?= urlencode($uri) ?>" loading="lazy" /></p>
<p>Status: <strong id="statusText"><?= htmlspecialchars($order['status']) ?></strong> (<span id="confText">requires <?= (int)$confirmationsRequired ?> confirmations</span>)</p>
<p>After payment confirms, funds will be held in escrow until completion or dispute.</p>
<script>
(function(){
  const orderId = <?= (int)$order['id'] ?>;
  const statusEl = document.getElementById('statusText');
  const confEl = document.getElementById('confText');
  const amountText = document.getElementById('amountText');
  async function poll(){
    try{
      const res = await fetch('/checkout/status?id=' + orderId, { headers: { 'Accept': 'application/json' } });
      if(!res.ok) return;
      const data = await res.json();
      if(data.status){ statusEl.textContent = data.status; }
      if(typeof data.confirmations !== 'undefined'){
        confEl.textContent = data.confirmations + ' / required <?= (int)$confirmationsRequired ?> confirmations';
      }
      if(data.received_btc){ amountText.textContent = data.received_btc + ' / ' + (data.expected_btc || '<?= htmlspecialchars($amount) ?>'); }
    }catch(e){}
  }
  poll();
  setInterval(poll, 10000);
})();
</script>
