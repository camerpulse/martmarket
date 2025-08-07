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
}
