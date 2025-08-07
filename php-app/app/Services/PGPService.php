<?php
namespace App\Services;

use OpenPGP; // from singpolyma/openpgp-php
use OpenPGP_Message;
use OpenPGP_PublicKey;

class PGPService
{
    public static function fingerprintFromPublicKey(string $armored): string
    {
        // Basic parse to get fingerprint; library returns key id/fingerprint
        $msg = OpenPGP_Message::parse($armored);
        foreach ($msg->packets as $p) {
            if ($p instanceof \OpenPGP_PublicKeyPacket) {
                return bin2hex($p->fingerprint());
            }
        }
        return substr(hash('sha256', $armored), 0, 40);
    }
}
