<?php
namespace App\Services;

use OTPHP\TOTP;

class TOTPService
{
    public static function generateSecret(): string
    {
        // TOTP library handles secret generation
        $totp = TOTP::create();
        return $totp->getSecret();
    }

    public static function provisioningUri(string $secret, string $label, string $issuer): string
    {
        $totp = TOTP::create($secret);
        $totp->setLabel($label);
        $totp->setIssuer($issuer);
        return $totp->getProvisioningUri();
    }

    public static function verify(string $secret, string $code): bool
    {
        $totp = TOTP::create($secret);
        return $totp->verify($code, null, 1); // allow 1 time-step drift
    }
}
