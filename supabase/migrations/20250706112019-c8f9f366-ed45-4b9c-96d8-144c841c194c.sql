-- Initialize system configuration for Bitcoin address generation
INSERT INTO system_config (config_key, config_value, description) VALUES 
  ('xpub_master', 'xpub6CatWdiZiodmUeTDp8LT5or8nmbKNcuyvz7WyksVFkKB4RHwCD3XyuvPEbvqAeVjRnoc8o2pLjqL3k7NL2MKtXQfv7oKKVnSn6EWpz9tkQ', 'Master xPub key for Bitcoin address generation (demo key)'),
  ('address_index_order_payment', '0', 'Current address index for order payments'),
  ('address_index_vendor_bond', '0', 'Current address index for vendor bonds'),
  ('address_index_user_deposit', '0', 'Current address index for user deposits'),
  ('btc_usd_rate', '100000', 'Current BTC to USD exchange rate in USD cents'),
  ('vendor_bond_amount_satoshis', '25000000', 'Required vendor bond amount in satoshis')
ON CONFLICT (config_key) DO UPDATE SET 
  config_value = EXCLUDED.config_value,
  description = EXCLUDED.description;