<?php
namespace Core;

use PDO;
use PDOException;

class DB
{
    private static ?PDO $pdo = null;

/**
 * Get shared PDO connection (MySQL).
 * @return \PDO
 */
public static function pdo(): PDO
    {
        if (!self::$pdo) {
            $cfg = [
                'host' => Config::get('db.host'),
                'port' => Config::get('db.port', 3306),
                'database' => Config::get('db.database'),
                'user' => Config::get('db.user'),
                'pass' => Config::get('db.password'),
                'charset' => 'utf8mb4'
            ];
            $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=%s', $cfg['host'], $cfg['port'], $cfg['database'], $cfg['charset']);
            try {
                self::$pdo = new PDO($dsn, $cfg['user'], $cfg['pass'], [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]);
            } catch (PDOException $e) {
                http_response_code(500);
                exit('DB connection error.');
            }
        }
        return self::$pdo;
    }
}
