<?php
$title = 'Translations';
$rows = $rows ?? [];
$locales = $locales ?? [];
$currentLocale = $currentLocale ?? '';
?>
<h1>Translations</h1>
<div class="card">
  <form method="get" action="/admin/translations" class="row">
    <div class="col">
      <label for="locale">Filter by Locale</label>
      <select name="locale" id="locale">
        <option value="">All</option>
        <?php foreach($locales as $loc): ?>
          <option value="<?= htmlspecialchars($loc) ?>" <?= $currentLocale===$loc?'selected':'' ?>><?= htmlspecialchars($loc) ?></option>
        <?php endforeach; ?>
      </select>
    </div>
    <div class="col" style="align-self:flex-end">
      <button class="btn secondary" type="submit">Filter</button>
    </div>
  </form>
</div>

<div class="card">
  <h2>Add / Update Translation</h2>
  <form method="post" action="/admin/translations/save">
    <input type="hidden" name="_csrf" value="<?= htmlspecialchars(\Core\Csrf::token()) ?>">
    <div class="row">
      <div class="col">
        <label>Locale (e.g., en, es, de)</label>
        <input type="text" name="locale" value="<?= htmlspecialchars($currentLocale) ?>" required>
      </div>
      <div class="col">
        <label>Key</label>
        <input type="text" name="key" placeholder="page.title" required>
      </div>
    </div>
    <label>Value</label>
    <textarea name="value" rows="3" placeholder="Translation text..."></textarea>
    <button class="btn" type="submit">Save</button>
  </form>
</div>

<?php if(!$rows): ?>
  <p>No translations found.</p>
<?php else: ?>
  <div class="card">
    <h2>Existing Translations<?= $currentLocale? ' - '.htmlspecialchars($currentLocale):'' ?></h2>
    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr>
          <th style="text-align:left;border-bottom:1px solid #2b2f3a">Locale</th>
          <th style="text-align:left;border-bottom:1px solid #2b2f3a">Key</th>
          <th style="text-align:left;border-bottom:1px solid #2b2f3a">Value</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach($rows as $r): ?>
          <tr>
            <td><?= htmlspecialchars($r['locale']) ?></td>
            <td><?= htmlspecialchars($r['key']) ?></td>
            <td><?= htmlspecialchars($r['value'] ?? '') ?></td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
<?php endif; ?>
