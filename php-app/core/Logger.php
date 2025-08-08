<?php
namespace Core;

class Logger
{
    private static function dir(): string
    {
        $dir = __DIR__ . '/../storage/logs';
        if (!is_dir($dir)) { @mkdir($dir, 0775, true); }
        return $dir;
    }

    private static function sanitize(array $context): array
    {
        $redactKeys = ['password','pass','passphrase','secret','private','token','email','address','pgp','key'];
        $sanitized = [];
        foreach ($context as $k => $v) {
            $kl = strtolower((string)$k);
            $needsRedact = false;
            foreach ($redactKeys as $rk) { if (str_contains($kl, $rk)) { $needsRedact = true; break; } }
            if ($needsRedact) {
                $sanitized[$k] = '[REDACTED]';
            } else if (is_scalar($v) || $v === null) {
                $sanitized[$k] = $v;
            } else {
                $sanitized[$k] = json_encode($v);
            }
        }
        return $sanitized;
    }

    public static function log(string $channel, string $level, string $message, array $context = []): void
    {
        $entry = [
            'ts' => date('c'),
            'channel' => $channel,
            'level' => strtoupper($level),
            'message' => $message,
            'context' => self::sanitize($context),
            'ip' => $_SERVER['REMOTE_ADDR'] ?? null,
            'uid' => $_SESSION['uid'] ?? null,
        ];
        $file = self::dir() . '/app-' . date('Y-m-d') . '.log';
        @file_put_contents($file, json_encode($entry, JSON_UNESCAPED_SLASHES) . PHP_EOL, FILE_APPEND | LOCK_EX);
    }

    public static function cleanup(int $days = 14): void
    {
        $dir = self::dir();
        foreach (glob($dir . '/app-*.log') as $file) {
            if (filemtime($file) < time() - ($days * 86400)) {
                @unlink($file);
            }
        }
    }
}
