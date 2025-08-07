<?php
$title = 'Vendor Orders';
$rows = $rows ?? [];
$page = (int)($page ?? 1);
$pages = (int)($pages ?? 1);
$filters = $filters ?? ['status'=>'','q'=>'','from'=>'','to'=>''];
$qs = function(array $overrides = []) use ($filters) {
  $params = array_merge($filters, $overrides);
  return http_build_query(array_filter($params, fn($v) => $v !== '' && $v !== null));
};
?>
<h1>Vendor Orders</h1>
<div class="card">
  <form method="get" action="/vendor/orders" class="row">
    <div class="col">
      <label>Status</label>
      <select name="status">
        <option value="">All</option>
        <?php foreach(['pending','awaiting_payment','paid','in_escrow','shipped','completed','cancelled','disputed'] as $s): ?>
          <option value="<?= $s ?>" <?= ($filters['status'] ?? '')===$s?'selected':'' ?>><?= ucfirst(str_replace('_',' ',$s)) ?></option>
        <?php endforeach; ?>
      </select>
    </div>
    <div class="col">
      <label>From</label>
      <input type="date" name="from" value="<?= htmlspecialchars($filters['from'] ?? '') ?>">
    </div>
    <div class="col">
      <label>To</label>
      <input type="date" name="to" value="<?= htmlspecialchars($filters['to'] ?? '') ?>">
    </div>
    <div class="col">
      <label>Search</label>
      <input type="text" name="q" placeholder="Order #" value="<?= htmlspecialchars($filters['q'] ?? '') ?>">
    </div>
    <div class="col" style="align-self:flex-end">
      <button class="btn" type="submit">Filter</button>
      <a class="btn secondary" href="/vendor/orders/export?<?= $qs() ?>">Export CSV</a>
    </div>
  </form>
</div>

<div class="card">
  <?php if(!$rows): ?>
    <p>No orders match your filters.</p>
  <?php else: ?>
    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr>
          <th style="text-align:left;border-bottom:1px solid #2b2f3a">Order #</th>
          <th style="text-align:left;border-bottom:1px solid #2b2f3a">Buyer</th>
          <th style="text-align:left;border-bottom:1px solid #2b2f3a">Status</th>
          <th style="text-align:left;border-bottom:1px solid #2b2f3a">BTC</th>
          <th style="text-align:left;border-bottom:1px solid #2b2f3a">Created</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <?php foreach($rows as $o): ?>
        <tr>
          <td><?= htmlspecialchars($o['order_number']) ?></td>
          <td>#<?= (int)$o['buyer_id'] ?></td>
          <td><?= htmlspecialchars($o['status']) ?></td>
          <td><?= htmlspecialchars($o['btc_expected_amount']) ?></td>
          <td><?= htmlspecialchars($o['created_at']) ?></td>
          <td><a href="/vendor/orders/view?id=<?= (int)$o['id'] ?>">View</a></td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  <?php endif; ?>
</div>

<div class="card">
  <div class="row">
    <div class="col">
      <strong>Page <?= $page ?> of <?= $pages ?></strong>
    </div>
    <div class="col" style="text-align:right">
      <?php if($page>1): ?>
        <a class="btn secondary" href="/vendor/orders?<?= $qs(['page'=>$page-1]) ?>">Prev</a>
      <?php endif; ?>
      <?php if($page<$pages): ?>
        <a class="btn" href="/vendor/orders?<?= $qs(['page'=>$page+1]) ?>">Next</a>
      <?php endif; ?>
    </div>
  </div>
</div>
