<?php
namespace App\Models;

use Core\DB;

class Message
{
    public static function list(int $threadId): array
    {
        $stmt = DB::pdo()->prepare('SELECT m.*, p.display_name FROM messages m LEFT JOIN profiles p ON p.user_id = m.sender_user_id WHERE m.thread_id = ? ORDER BY m.created_at ASC');
        $stmt->execute([$threadId]);
        return $stmt->fetchAll();
    }

    public static function send(int $threadId, int $senderId, string $body, bool $pgp, ?string $signature = null): void
    {
        DB::pdo()->prepare('INSERT INTO messages (thread_id, sender_user_id, is_pgp_encrypted, body, signature) VALUES (?,?,?,?,?)')
            ->execute([$threadId, $senderId, $pgp ? 1 : 0, $body, $signature]);
        DB::pdo()->prepare('UPDATE message_threads SET updated_at = CURRENT_TIMESTAMP WHERE id = ?')->execute([$threadId]);
    }
}
