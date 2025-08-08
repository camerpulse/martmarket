<?php
namespace App\Services;

use App\Models\Settings;
use BitWasp\Bitcoin\Address\AddressCreator;
use BitWasp\Bitcoin\Bitcoin;
use BitWasp\Bitcoin\Network\NetworkFactory;
use BitWasp\Bitcoin\Key\Deterministic\HdPrefix\GlobalPrefixConfig;
use BitWasp\Bitcoin\Key\Deterministic\Slip132\Slip132;
use BitWasp\Bitcoin\Key\Deterministic\HdPrefix; 
use BitWasp\Bitcoin\Key\Deterministic\HierarchicalKeyFactory;

class PaymentService
{
    public static function getNetwork()
    {
        $net = Settings::get('btc_network', 'testnet');
        return $net === 'mainnet' ? NetworkFactory::bitcoin() : NetworkFactory::testnet();
    }

    public static function deriveAddress(string $xpub, int $index): string
    {
        $network = self::getNetwork();
        Bitcoin::setNetwork($network);
        $slip132 = new Slip132(new GlobalPrefixConfig([new HdPrefix(HdPrefix::XPUB, $network)]));
        $key = HierarchicalKeyFactory::fromExtended($xpub, $slip132);
        $child = $key->derivePath("0/{$index}");
        $pubKey = $child->getPublicKey();
        $addr = (new AddressCreator())->fromKey($pubKey);
        return $addr->getAddress($network);
    }

    public static function checkAddressStatus(string $address): array
    {
        $provider = Settings::get('btc_provider', 'blockstream');
        $network = Settings::get('btc_network', 'testnet');
        if ($provider === 'blockstream') {
            $base = $network === 'mainnet' ? 'https://blockstream.info/api' : 'https://blockstream.info/testnet/api';
            $info = self::httpGet("$base/address/" . urlencode($address));
            $txs = self::httpGet("$base/address/" . urlencode($address) . "/txs");
            $received = isset($info['chain_stats']['funded_txo_sum']) ? $info['chain_stats']['funded_txo_sum'] : 0;
            // sats to BTC
            $receivedBtc = bcdiv((string)$received, '100000000', 8);
            $conf = 0; $txid = null;
            if (is_array($txs) && count($txs) > 0) {
                $tx = $txs[0];
                $txid = $tx['txid'] ?? null;
                $conf = (int)($tx['status']['confirmations'] ?? 0);
            }
            return ['received_btc' => $receivedBtc, 'confirmations' => $conf, 'txid' => $txid];
        }
        return ['received_btc' => '0', 'confirmations' => 0, 'txid' => null];
    }

    private static function httpGet(string $url)
    {
        // Prefer cURL when available (shared hosting friendly)
        if (function_exists('curl_init')) {
            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_CONNECTTIMEOUT => 5,
                CURLOPT_TIMEOUT => 10,
                CURLOPT_USERAGENT => 'MartMarket/1.0',
                CURLOPT_HTTPHEADER => ['Accept: application/json'],
            ]);
            $res = curl_exec($ch);
            curl_close($ch);
            $data = json_decode($res ?: 'null', true);
            return is_array($data) ? $data : [];
        }
        // Fallback to file_get_contents
        $opts = [
            'http' => [
                'method' => 'GET',
                'timeout' => 10,
                'header' => "User-Agent: MartMarket/1.0\r\nAccept: application/json\r\n",
            ],
        ];
        $ctx = stream_context_create($opts);
        $res = @file_get_contents($url, false, $ctx);
        $data = json_decode($res ?: 'null', true);
        return is_array($data) ? $data : [];
    }
}
