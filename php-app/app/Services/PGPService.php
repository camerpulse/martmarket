<?php
namespace App\Services;

use OpenPGP_Message;
use OpenPGP_LiteralDataPacket;
use OpenPGP_Crypt_Symmetric;

class PGPService
{
    public static function fingerprintFromPublicKey(string $armored): string
    {
        $msg = OpenPGP_Message::parse($armored);
        foreach ($msg->packets as $p) {
            if ($p instanceof \OpenPGP_PublicKeyPacket) {
                return bin2hex($p->fingerprint());
            }
        }
        return substr(hash('sha256', $armored), 0, 40);
    }

    public static function encryptArmored(string $publicKeyArmored, string $plaintext): ?string
    {
        try {
            $key = OpenPGP_Message::parse($publicKeyArmored);
            $data = new OpenPGP_LiteralDataPacket($plaintext, ['format' => 'u']);
            $enc = OpenPGP_Crypt_Symmetric::encrypt($key, new OpenPGP_Message([$data]));
            return $enc->toArmoredString();
        } catch (\Throwable $e) {
            return null;
        }
    }

    public static function encryptToUser(int $userId, string $plaintext): ?string
    {
        $key = \App\Models\PGPKey::getDefaultForUser($userId);
        if (!$key) return null;
        return self::encryptArmored((string)$key['public_key'], $plaintext);
    }
}

