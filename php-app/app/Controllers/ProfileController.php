<?php
namespace App\Controllers;

use Core\Controller;
use Core\Csrf;
use App\Models\Profile;
use App\Models\PGPKey;
use App\Services\PGPService;

class ProfileController extends Controller
{
    public function profileForm(): string
    {
        $this->ensureAuth();
        $profile = Profile::byUser((int)$_SESSION['uid']);
        $pgp = PGPKey::list((int)$_SESSION['uid']);
        return $this->view('account/profile', ['profile' => $profile, 'pgp' => $pgp]);
    }

    public function updateProfile(): string
    {
        $this->ensureAuth();
        if (!Csrf::check($_POST['_csrf'] ?? '')) { http_response_code(400); return 'Invalid CSRF'; }
        $display = trim((string)($_POST['display_name'] ?? ''));
        $bio = trim((string)($_POST['bio'] ?? ''));
        if ($display === '') { return $this->redirect('/account/profile'); }
        Profile::update((int)$_SESSION['uid'], $display, $bio ?: null);
        return $this->redirect('/account/profile');
    }

    public function addPGP(): string
    {
        $this->ensureAuth();
        if (!Csrf::check($_POST['_csrf'] ?? '')) { http_response_code(400); return 'Invalid CSRF'; }
        $name = trim((string)($_POST['key_name'] ?? 'Main'));
        $pub = (string)($_POST['public_key'] ?? '');
        $isDefault = isset($_POST['is_default']);
        if (strpos($pub, 'BEGIN PGP PUBLIC KEY BLOCK') === false) {
            return $this->redirect('/account/profile');
        }
        $fp = PGPService::fingerprintFromPublicKey($pub);
        PGPKey::add((int)$_SESSION['uid'], $name, $pub, $fp, $isDefault);
        return $this->redirect('/account/profile');
    }

    public function setDefaultPGP(): string
    {
        $this->ensureAuth();
        if (!Csrf::check($_POST['_csrf'] ?? '')) { http_response_code(400); return 'Invalid CSRF'; }
        $keyId = (int)($_POST['key_id'] ?? 0);
        if ($keyId > 0) { PGPKey::setDefault((int)$_SESSION['uid'], $keyId); }
        return $this->redirect('/account/profile');
    }

}
