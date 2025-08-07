<?php
namespace App\Controllers;

use Core\Controller;
use Core\Csrf;
use App\Models\MessageThread;
use App\Models\Message;
use App\Models\Vendor;

class MessageController extends Controller
{
    public function index(): string
    {
        $this->ensureAuth();
        $threads = MessageThread::forUser((int)$_SESSION['uid'], (string)($_SESSION['role'] ?? 'buyer'));
        return $this->view('messages/index', ['title' => 'Messages', 'threads' => $threads]);
    }

    public function start(): string
    {
        $this->ensureRole(['buyer','vendor']);
        if (!Csrf::check($_POST['_csrf'] ?? '')) { http_response_code(400); return 'Invalid CSRF'; }
        $subject = trim((string)($_POST['subject'] ?? '')) ?: null;
        $orderId = (int)($_POST['order_id'] ?? 0) ?: null;
        if (($_SESSION['role'] ?? 'buyer') === 'buyer') {
            $vendorId = (int)($_POST['vendor_id'] ?? 0);
            if ($vendorId <= 0) return $this->redirect('/messages');
            $threadId = MessageThread::create((int)$_SESSION['uid'], $vendorId, $orderId, $subject);
        } else {
            $buyerId = (int)($_POST['buyer_id'] ?? 0);
            $vendor = Vendor::byUser((int)$_SESSION['uid']);
            if (!$vendor || $buyerId <= 0) return $this->redirect('/messages');
            $threadId = MessageThread::create($buyerId, (int)$vendor['id'], $orderId, $subject);
        }
        return $this->redirect('/messages/view?id=' . $threadId);
    }

    public function view(): string
    {
        $this->ensureAuth();
        $id = (int)($_GET['id'] ?? 0);
        $thread = MessageThread::find($id);
        if (!$thread) { http_response_code(404); return 'Thread not found'; }
        // Authorization check
        $ok = false;
        if (($_SESSION['role'] ?? 'buyer') === 'vendor') {
            $vendor = Vendor::byUser((int)$_SESSION['uid']);
            $ok = $vendor && (int)$vendor['id'] === (int)$thread['vendor_id'];
        } else {
            $ok = (int)$thread['buyer_id'] === (int)$_SESSION['uid'];
        }
        if (!$ok) { http_response_code(403); return 'Forbidden'; }
        $msgs = Message::list($id);
        return $this->view('messages/thread', ['title' => 'Thread', 'thread' => $thread, 'messages' => $msgs]);
    }

public function send(): string
    {
        $this->ensureAuth();
        if (!Csrf::check($_POST['_csrf'] ?? '')) { http_response_code(400); return 'Invalid CSRF'; }
        $threadId = (int)($_POST['thread_id'] ?? 0);
        $body = trim((string)($_POST['body'] ?? ''));
        $pgpProvided = isset($_POST['pgp']); // user says they already encrypted
        $pgpAuto = isset($_POST['pgp_auto']); // auto-encrypt with recipient's key
        if ($threadId <= 0 || $body === '') return $this->redirect('/messages');

        $isEncrypted = false;
        if ($pgpProvided) {
            $isEncrypted = true;
        } elseif ($pgpAuto) {
            $thread = MessageThread::find($threadId);
            if ($thread) {
                $recipientUserId = null;
                if (($_SESSION['role'] ?? 'buyer') === 'vendor') {
                    // vendor sends to buyer
                    $recipientUserId = (int)$thread['buyer_id'];
                } else {
                    // buyer sends to vendor -> need vendor's user_id
                    $vendor = Vendor::find((int)$thread['vendor_id']);
                    $recipientUserId = $vendor ? (int)$vendor['user_id'] : null;
                }
                if ($recipientUserId) {
                    $enc = \App\Services\PGPService::encryptToUser($recipientUserId, $body);
                    if ($enc) { $body = $enc; $isEncrypted = true; }
                }
            }
        }

        Message::send($threadId, (int)$_SESSION['uid'], $body, $isEncrypted, null);
        return $this->redirect('/messages/view?id=' . $threadId);
    }
}
