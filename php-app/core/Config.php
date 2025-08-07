<?php
namespace Core;

class Config
{
    private static array $items = [];

    public static function load(string $file): void
    {
        if (file_exists($file)) {
            $data = include $file;
            if (is_array($data)) {
                self::$items = array_replace_recursive(self::$items, $data);
            }
        }
    }

    public static function get(string $key, $default = null)
    {
        $segments = explode('.', $key);
        $value = self::$items;
        foreach ($segments as $seg) {
            if (!is_array($value) || !array_key_exists($seg, $value)) {
                return $default;
            }
            $value = $value[$seg];
        }
        return $value;
    }
}
