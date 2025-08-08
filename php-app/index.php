<?php
// Fallback entry to avoid 403 when mod_rewrite is off or document root is public_html
// Redirect to /public/ (front controller lives there)
$base = rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? ''), '/\\');
$target = ($base === '' || $base === '/') ? '/public/' : ($base . '/public/');
if (!headers_sent()) {
    http_response_code(302);
    header('Location: ' . $target);
    header('Cache-Control: no-store');
    exit;
}
// If headers already sent, include directly as last resort
require __DIR__ . '/public/index.php';
