<?php
namespace App\Controllers\Admin;

use Core\Controller;
use Core\Csrf;
use App\Models\Translation;

class TranslationAdminController extends Controller
{
    public function index(): string
    {
        $this->ensureRole('admin');
        $locale = $_GET['locale'] ?? null;
        $locales = Translation::locales();
        $rows = $locale ? Translation::getAll($locale) : Translation::getAll();
        return $this->view('admin/translations/index', [
            'title' => 'Translations',
            'rows' => $rows,
            'locales' => $locales,
            'currentLocale' => $locale,
        ]);
    }

    public function save(): string
    {
        $this->ensureRole('admin');
        if (!Csrf::check($_POST['_csrf'] ?? '')) { http_response_code(400); return 'Invalid CSRF'; }
        $locale = trim((string)($_POST['locale'] ?? ''));
        $key = trim((string)($_POST['key'] ?? ''));
        $value = (string)($_POST['value'] ?? '');
        if ($locale && $key) {
            Translation::upsert($locale, $key, $value);
        }
        $redir = '/admin/translations' . ($locale ? ('?locale=' . urlencode($locale)) : '');
        return $this->redirect($redir);
    }
}
