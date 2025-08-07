<?php
namespace Core;

class Controller
{
    protected function view(string $template, array $data = []): string
    {
        return View::render($template, $data);
    }

    protected function redirect(string $to): void
    {
        header('Location: ' . $to);
        exit;
    }

    protected function ensureAuth(): void
    {
        if (empty($_SESSION['uid'])) {
            $this->redirect('/login');
        }
    }

    protected function ensureRole(string|array $roles): void
    {
        $this->ensureAuth();
        $roles = (array)$roles;
        $role = $_SESSION['role'] ?? 'buyer';
        if (!in_array($role, $roles, true)) {
            http_response_code(403);
            echo 'Forbidden';
            exit;
        }
    }
}
