<?php
// Public web-accessible shim for the installer
// This allows accessing the installer at /public/installer even when
// the root .htaccess blocks direct access to /installer.

// If already installed, redirect to site root
$base = dirname(__DIR__, 2); // points to php-app
if (file_exists($base . '/config/app.php') && file_exists($base . '/config/database.php') && file_exists($base . '/config/security.php')) {
    header('Location: /');
    exit;
}

// Include the real installer entry
require $base . '/installer/index.php';
