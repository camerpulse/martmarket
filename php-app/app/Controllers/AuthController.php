<?php
namespace App\Controllers;

use Core\Controller;
use Core\Csrf;
use Core\Session;
use Core\Config;
use Core\DB;
use Core\RateLimiter;
use Core\Logger;
use App\Models\User;
use App\Models\Profile;
use App\Models\TotpSecret;
use App\Models\Referral as ReferralModel;
use App\Services\TOTPService;
use App\Models\Vendor;

class AuthController extends Controller
{
    public function loginForm(): string
    {
        return $this->view('auth/login', ['title' => 'Login']);
    }

public function login(): string
    {
        if (!Csrf::check($_POST['_csrf'] ?? '')) { http_response_code(400); return 'Invalid CSRF'; }
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $rl = new RateLimiter('login:' . $ip, 5, 300); // 5 attempts per 5 minutes
        if ($rl->tooManyAttempts()) {
            header('Retry-After: ' . max(1, $rl->resetAt() - time()));
            http_response_code(429);
            Logger::log('auth', 'warning', 'Rate limit exceeded for login', ['ip' => $ip]);
            return $this->view('auth/login', ['error' => 'Too many attempts. Please try again later.']);
        }
        $rl->hit();

        $email = trim((string)($_POST['email'] ?? ''));
        $password = (string)($_POST['password'] ?? '');
        $code = trim((string)($_POST['totp'] ?? ''));

        $user = User::findByEmail($email);
        if (!$user || !password_verify($password, $user['password_hash'])) {
            Logger::log('auth', 'warning', 'Invalid login credentials', ['ip' => $ip, 'email' => $email]);
            http_response_code(401);
            return $this->view('auth/login', ['error' => 'Invalid credentials']);
        }

        // Rehash if needed
        User::updatePasswordIfRehashNeeded((int)$user['id'], $password, $user['password_hash']);

        // TOTP check if enabled
        $profile = Profile::byUser((int)$user['id']);
        if ($profile && (int)$profile['twofa_enabled'] === 1) {
            $row = TotpSecret::get((int)$user['id']);
            if (!$row) { http_response_code(500); return '2FA misconfigured'; }
            $secret = self::decrypt($row['secret'], $row['nonce']);
            if (!TOTPService::verify($secret, $code)) {
                http_response_code(401);
                return $this->view('auth/login', ['error' => 'Invalid 2FA code']);
            }
        }

        Session::regenerate();
        $_SESSION['uid'] = (int)$user['id'];
        $_SESSION['role'] = $user['role'];
        Logger::log('auth', 'info', 'Login success', ['ip' => $ip, 'uid' => (int)$user['id']]);
        return $this->redirect('/account/profile');
    }

    public function registerForm(): string
    {
        $ref = isset($_GET['ref']) ? substr(preg_replace('/[^a-zA-Z0-9]/', '', $_GET['ref']), 0, 16) : null;
        return $this->view('auth/register', ['title' => 'Register', 'ref' => $ref]);
    }

    public function register(): string
    {
        if (!Csrf::check($_POST['_csrf'] ?? '')) { http_response_code(400); return 'Invalid CSRF'; }
        $email = trim((string)($_POST['email'] ?? ''));
        $password = (string)($_POST['password'] ?? '');
        $display = trim((string)($_POST['display_name'] ?? ''));
        $role = in_array(($_POST['role'] ?? 'buyer'), ['buyer','vendor','admin']) ? $_POST['role'] : 'buyer';
        $refCode = trim((string)($_POST['referral_code'] ?? '')) ?: null;

        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 8 || $display === '') {
            return $this->view('auth/register', ['error' => 'Invalid input', 'ref' => $refCode]);
        }
        if (User::findByEmail($email)) {
            return $this->view('auth/register', ['error' => 'Email in use', 'ref' => $refCode]);
        }

        $referredBy = null;
        if ($refCode) {
            $refUser = ReferralModel::findByCode($refCode);
            if ($refUser) { $referredBy = $refCode; }
        }

$uid = User::create($email, $password, $role === 'admin' ? 'buyer' : $role, $referredBy);
Profile::create($uid, $display);
if (($role === 'vendor')) { \App\Models\Vendor::createForUser($uid); }

        // Record referral row if applicable
        if ($refCode && isset($refUser['id'])) {
            ReferralModel::record((int)$refUser['id'], $uid, $refCode);
        }

        Session::regenerate();
        $_SESSION['uid'] = $uid;
        $_SESSION['role'] = $role === 'admin' ? 'buyer' : $role; // prevent public registering as admin
        return $this->redirect('/account/profile');
    }

    public function logout(): string
    {
        session_destroy();
        return $this->redirect('/login');
    }

    public function twofaSetupForm(): string
    {
        $this->ensureAuth();
        $secret = bin2hex(random_bytes(10)); // fallback seed displayed until confirmed
        $_SESSION['2fa_tmp_secret'] = $secret;
        $issuer = Config::get('app.name', 'MartMarket');
        $label = 'user:' . ($_SESSION['uid'] ?? '');
        // Use TOTP lib to create real secret + URI
        $secret = \App\Services\TOTPService::generateSecret();
        $_SESSION['2fa_tmp_secret'] = $secret;
        $uri = \App\Services\TOTPService::provisioningUri($secret, $label, $issuer);
        return $this->view('auth/login', ['twofa_setup' => true, 'secret' => $secret, 'uri' => $uri]);
    }

    public function twofaSetup(): string
    {
        $this->ensureAuth();
        if (!Csrf::check($_POST['_csrf'] ?? '')) { http_response_code(400); return 'Invalid CSRF'; }
        $code = trim((string)($_POST['code'] ?? ''));
        $secret = (string)($_SESSION['2fa_tmp_secret'] ?? '');
        if (!$secret || !\App\Services\TOTPService::verify($secret, $code)) {
            return $this->view('auth/login', ['error' => 'Invalid 2FA code', 'twofa_setup' => true, 'secret' => $secret]);
        }
        $this->storeEncryptedTotp($secret);
        unset($_SESSION['2fa_tmp_secret']);
        return $this->redirect('/account/profile');
    }

    public function twofaVerify(): string
    {
        // This endpoint can be used for separate verification flows if needed
        return $this->redirect('/account/profile');
    }

    // Password reset
    public function forgotForm(): string
    {
        return $this->view('auth/forgot', ['title' => 'Forgot Password']);
    }

public function forgot(): string
    {
        if (!Csrf::check($_POST['_csrf'] ?? '')) { http_response_code(400); return 'Invalid CSRF'; }
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $rl = new RateLimiter('forgot:' . $ip, 3, 900); // 3 per 15 minutes
        if ($rl->tooManyAttempts()) {
            header('Retry-After: ' . max(1, $rl->resetAt() - time()));
            http_response_code(429);
            Logger::log('auth', 'warning', 'Rate limit exceeded for password reset', ['ip' => $ip]);
            return $this->view('auth/forgot', ['title' => 'Forgot Password', 'error' => 'Too many requests. Try again later.']);
        }
        $rl->hit();
        $email = trim((string)($_POST['email'] ?? ''));
        $user = $email ? User::findByEmail($email) : null;
        if ($user) {
            $token = rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
            $expires = date('Y-m-d H:i:s', time() + 3600);
            \App\Models\PasswordReset::deleteByUser((int)$user['id']);
            \App\Models\PasswordReset::create((int)$user['id'], $token, $expires);
            $base = rtrim((string)Config::get('app.base_url', ''), '/');
            $link = ($base ?: ((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS']==='on' ? 'https://' : 'http://') . ($_SERVER['HTTP_HOST'] ?? 'localhost'))) . '/password/reset?token=' . urlencode($token);
            $body = '<p>Use the link below to reset your password. This link expires in 1 hour.</p><p><a href="'.$link.'">Reset Password</a></p>';
            \App\Services\MailService::send($email, $user['email'], 'Reset your MartMarket password', $body);
            Logger::log('auth', 'info', 'Password reset initiated', ['ip' => $ip, 'uid' => (int)$user['id']]);
        }
        // Always show success to avoid user enumeration
        return $this->view('auth/forgot', ['title' => 'Forgot Password', 'success' => true]);
    }

    public function resetForm(): string
    {
        $token = (string)($_GET['token'] ?? '');
        return $this->view('auth/reset', ['title' => 'Reset Password', 'token' => $token]);
    }

    public function reset(): string
    {
        if (!Csrf::check($_POST['_csrf'] ?? '')) { http_response_code(400); return 'Invalid CSRF'; }
        $token = (string)($_POST['token'] ?? '');
        $pass = (string)($_POST['password'] ?? '');
        $confirm = (string)($_POST['password_confirm'] ?? '');
        if (strlen($pass) < 12 || $pass !== $confirm) {
            return $this->view('auth/reset', ['title' => 'Reset Password', 'token' => $token, 'error' => 'Passwords must match and be at least 12 characters.']);
        }
        $row = \App\Models\PasswordReset::findValidByToken($token);
        if (!$row) {
            return $this->view('auth/reset', ['title' => 'Reset Password', 'error' => 'Invalid or expired link.']);
        }
        $hash = \Core\Hash::make($pass);
        DB::pdo()->prepare('UPDATE users SET password_hash = ? WHERE id = ?')->execute([$hash, (int)$row['user_id']]);
        \App\Models\PasswordReset::consume($token);
        return $this->redirect('/login');
    }

    private function ensureAuth(): void
    {
        if (empty($_SESSION['uid'])) { $this->redirect('/login'); }
    }

    private function storeEncryptedTotp(string $secret): void
    {
        $key = base64_decode(Config::get('security.app_key_base64'));
        $nonce = random_bytes(12);
        $cipher = openssl_encrypt($secret, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $nonce, $tag);
        $payload = base64_encode($cipher . $tag);
        TotpSecret::set((int)$_SESSION['uid'], $payload, base64_encode($nonce));
    }

    private static function decrypt(string $payload, string $nonceB64): string
    {
        $key = base64_decode(Config::get('security.app_key_base64'));
        $raw = base64_decode($payload);
        $nonce = base64_decode($nonceB64);
        $ciphertext = substr($raw, 0, -16);
        $tag = substr($raw, -16);
        return openssl_decrypt($ciphertext, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $nonce, $tag) ?: '';
    }
}
