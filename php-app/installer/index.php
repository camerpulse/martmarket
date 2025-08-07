<?php
// Installer entry
session_start();
$base = dirname(__FILE__);

function h($s){return htmlspecialchars((string)$s, ENT_QUOTES,'UTF-8');}

$step = isset($_GET['step']) ? (int)$_GET['step'] : 1;
$step = max(1, min($step, 4));

include __DIR__ . '/templates/layout.php';
