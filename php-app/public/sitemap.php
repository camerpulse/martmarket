<?php
// Simple dynamic sitemap generator
require_once __DIR__ . '/../core/Config.php';
require_once __DIR__ . '/../core/DB.php';

use Core\Config;
use Core\DB;

header('Content-Type: application/xml; charset=utf-8');

// Load configs (best-effort)
Config::load(__DIR__ . '/../config/app.php');
Config::load(__DIR__ . '/../config/database.php');

$base = rtrim((string)Config::get('app.base_url', ''), '/');
if (!$base) {
  $base = (($_SERVER['HTTPS'] ?? 'off') === 'on' ? 'https://' : 'http://') . ($_SERVER['HTTP_HOST'] ?? 'localhost');
}

$urls = [];
$add = function(string $loc, ?string $changefreq = 'daily', ?string $priority = '0.7') use (&$urls) {
  $urls[] = ['loc' => $loc, 'changefreq' => $changefreq, 'priority' => $priority];
};

$add($base . '/', 'daily', '0.8');
$add($base . '/catalog', 'daily', '0.7');

try {
  $stmt = DB::pdo()->query('SELECT slug, updated_at FROM products WHERE is_active = 1 ORDER BY updated_at DESC LIMIT 1000');
  foreach ($stmt->fetchAll() as $p) {
    $add($base . '/product/' . $p['slug'], 'weekly', '0.6');
  }
} catch (\Throwable $e) {
  // DB not available yet; continue with base URLs only
}

echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
echo "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n";
foreach ($urls as $u) {
  echo "  <url>\n";
  echo "    <loc>" . htmlspecialchars($u['loc'], ENT_XML1) . "</loc>\n";
  if ($u['changefreq']) echo "    <changefreq>{$u['changefreq']}</changefreq>\n";
  if ($u['priority']) echo "    <priority>{$u['priority']}</priority>\n";
  echo "  </url>\n";
}
echo "</urlset>\n";
