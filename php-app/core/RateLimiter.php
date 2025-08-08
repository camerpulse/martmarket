<?php
namespace Core;

class RateLimiter
{
    private string $key;
    private int $limit;
    private int $window; // seconds
    private string $storeDir;

    public function __construct(string $key, int $limit, int $windowSeconds)
    {
        $this->key = preg_replace('/[^a-zA-Z0-9:_\-]/', '_', $key);
        $this->limit = max(1, $limit);
        $this->window = max(1, $windowSeconds);
        $this->storeDir = __DIR__ . '/../storage/ratelimits';
        if (!is_dir($this->storeDir)) {
            @mkdir($this->storeDir, 0775, true);
        }
    }

    private function filePath(): string
    {
        return $this->storeDir . '/' . $this->key . '.json';
    }

    public function hit(): array
    {
        $now = time();
        $path = $this->filePath();
        $data = ['reset_at' => $now + $this->window, 'count' => 0];
        if (is_file($path)) {
            $raw = @file_get_contents($path);
            $prev = json_decode($raw ?: 'null', true);
            if (is_array($prev)) {
                if (($prev['reset_at'] ?? 0) > $now) {
                    $data = $prev;
                }
            }
        }
        if ($data['reset_at'] <= $now) {
            $data['reset_at'] = $now + $this->window;
            $data['count'] = 0;
        }
        $data['count']++;
        @file_put_contents($path, json_encode($data), LOCK_EX);
        return $data;
    }

    public function tooManyAttempts(): bool
    {
        $now = time();
        $path = $this->filePath();
        if (!is_file($path)) { return false; }
        $raw = @file_get_contents($path);
        $data = json_decode($raw ?: 'null', true);
        if (!is_array($data)) { return false; }
        if (($data['reset_at'] ?? 0) <= $now) { return false; }
        return (int)($data['count'] ?? 0) >= $this->limit;
    }

    public function remaining(): int
    {
        $now = time();
        $path = $this->filePath();
        $raw = @file_get_contents($path);
        $data = json_decode($raw ?: 'null', true) ?: [];
        if (($data['reset_at'] ?? 0) <= $now) return $this->limit;
        $count = (int)($data['count'] ?? 0);
        return max(0, $this->limit - $count);
    }

    public function resetAt(): int
    {
        $now = time();
        $path = $this->filePath();
        $raw = @file_get_contents($path);
        $data = json_decode($raw ?: 'null', true) ?: [];
        return (int)($data['reset_at'] ?? ($now + $this->window));
    }
}
