<?php
namespace Core;

class View
{
    public static function render(string $template, array $data = []): string
    {
        $viewFile = __DIR__ . '/../app/Views/' . $template . '.php';
        if (!file_exists($viewFile)) { return 'View not found'; }
        extract($data, EXTR_SKIP);
        ob_start();
        include __DIR__ . '/../app/Views/layout.php';
        return ob_get_clean();
    }
}
