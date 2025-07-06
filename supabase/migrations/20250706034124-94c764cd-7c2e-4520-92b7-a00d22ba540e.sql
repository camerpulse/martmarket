-- Update vendor profile to be verified
UPDATE vendor_profiles 
SET is_verified = true, 
    trust_score = 95,
    updated_at = now()
WHERE vendor_id = '465d3389-b658-46dd-9e41-97fbf160d345';

-- Create an active vendor bond for the user
INSERT INTO vendor_bonds (
    vendor_id,
    bond_amount,
    is_active,
    paid_at,
    expires_at,
    payment_txid
) VALUES (
    '465d3389-b658-46dd-9e41-97fbf160d345',
    250.00,
    true,
    now(),
    now() + interval '1 year',
    'admin_verified_bond'
);