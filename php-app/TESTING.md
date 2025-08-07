# TESTING CHECKLIST AND STEP-BY-STEP VALIDATION

This document provides end-to-end tests for MartMarket PHP on shared hosting. Each test includes Preconditions, Steps, and Expected Results.

Note: Use test accounts (buyer, vendor, admin). For Bitcoin tests, configure Admin → Payments to Testnet with a watch-only XPUB and set a cron token; optionally set a cPanel cron to /cron/payments?token=...

1) User Authentication & Profiles
1.1 Register (Buyer)
- Preconditions: None
- Steps:
  1) Visit /register
  2) Enter Display Name, unique Email, Password (≥8 chars), select Buyer
  3) Submit
- Expected: Redirect to /account/profile; session set (uid, role=buyer); profiles row created

1.2 Register (Vendor)
- Steps:
  1) /register → select Vendor
  2) Submit
- Expected: Redirect to /account/profile; vendor row exists and linked to user

1.3 Login/Logout
- Steps: /login → enter credentials → submit; then /logout
- Expected: Successful login creates session; logout destroys session

1.4 TOTP 2FA (optional)
- Preconditions: Logged in
- Steps:
  1) /2fa/setup → see secret & provisioning URI
  2) Add to Authenticator app → enter code → submit
  3) Logout; login with email/password; enter TOTP
- Expected: totp_secrets row saved encrypted; profile.twofa_enabled=1; login requires valid 6-digit code

1.5 PGP Key Management
- Steps:
  1) /account/profile → PGP Keys → add key (armored), set default
  2) Optionally set another key as default
- Expected: pgp_keys row saved; fingerprint computed; profiles.pgp_default_key_id updated for default

1.6 Referral Tracking
- Steps:
  1) /affiliate → copy referral link
  2) Open in private window; register a new buyer via the link
- Expected: referrals row created with referrer_user_id; stats on /affiliate reflect new referral

2) Product Catalog & Marketplace
2.1 Vendor Product Create + Image Upload
- Preconditions: Logged in as Vendor
- Steps:
  1) /vendor/product/new → fill fields, upload JPG/PNG ≤2MB, Active checked
  2) Submit
- Expected: products row created; image saved under /public/uploads/products; record in product_images

2.2 Edit Product
- Steps: /vendor/products → Edit → update fields, optionally upload a new image
- Expected: products updated; additional product_images row if new image

2.3 Category Assignment
- Steps: Choose Category during create/edit
- Expected: Category displayed on /catalog and /product/{slug}

2.4 Catalog Search/Filter/Pagination
- Steps:
  1) /catalog?q=term
  2) /catalog?category={id}
  3) Navigate pages if > per-page results
- Expected: Matching items rendered; counts paginate; SEO title/description present

2.5 Wishlist
- Preconditions: Logged in as buyer
- Steps: From /product/{slug} or /catalog → Wishlist button → /wishlist
- Expected: wishlists row created/removed; list displays items

2.6 Verified Vendor Storefront
- Preconditions: Vendor set is_verified=1 (admin can approve via /admin/vendors)
- Steps: Visit /vendor/{slug-id}
- Expected: “Verified” badge, products grid, rating summary if reviews exist

3) Orders & Bitcoin Payments with Escrow
3.1 Place Order
- Preconditions: Buyer logged in; Payments configured (Admin → Payments)
- Steps: /product/{slug} → Buy Now (to /checkout/start) → redirected /checkout/view?id=...
- Expected: orders+order_items rows; payments row; escrows row(holding); unique BTC address displayed with QR

3.2 Payment Status Polling (Manual)
- Steps: On /checkout/view page, observe periodic updates; or click Admin → Payments → Run Check Now
- Expected: Payment status: awaiting → confirmed; order status: awaiting_payment/paid → in_escrow once confirmations ≥ required

3.3 Cron Poller (Recommended)
- Preconditions: cPanel cron to /cron/payments?token=...
- Steps: Send testnet BTC to order address; wait for confirmations
- Expected: Payment confirmed; order moves to in_escrow; both buyer/vendor receive email

3.4 Shipment and Completion
- Steps:
  1) Vendor: /vendor/orders/view?id=... → mark shipped (tracking, note)
  2) Buyer: /orders/view?id=... → Mark as Received
- Expected: Order → shipped → completed; status history reflected

3.5 Escrow Release (Admin)
- Steps: /admin/orders/view?id=... → Release Escrow
- Expected: escrows.status=released; order set completed if not already; optional TXID recorded

4) Messaging, Reviews, Disputes
4.1 Secure Messaging with PGP
- Preconditions: Both buyer and vendor have default PGP keys
- Steps:
  1) Start thread from order or /messages/start
  2) In message form, check “Encrypt with recipient’s PGP key” → send
- Expected: messages.is_pgp_encrypted=1; body is armored text; recipient can decrypt locally

4.2 Product & Vendor Reviews
- Preconditions: Order completed
- Steps:
  1) /orders/view?id=... → Review Product or Review Vendor
  2) Submit rating+comment
- Expected: reviews rows with correct foreign keys; summary shows on product/vendor pages

4.3 Disputes
- Buyer:
  - Steps: /disputes/new?order_id=... → submit reason
  - Expected: disputes row (open); vendor notified by email; /disputes lists it; /disputes/view?id=... shows timeline
- Vendor:
  - Steps: /vendor/disputes → set status/resolution; submit
  - Expected: dispute updated; buyer emailed
- Admin:
  - Steps: /admin/disputes → set status/resolution; submit
  - Expected: both parties emailed

5) Admin Dashboard & Platform Controls
- /admin (stats, quick links, security alerts)
- /admin/users (role/active updates)
- /admin/vendors (pending verifications approve/reject)
- /admin/orders (update/release)
- /admin/categories (create)
- /admin/translations (manage)
- /admin/payments (BTC settings, poller)
- Expected: Role enforcement; CSRF on forms; changes persist

6) Installer & Deployment
6.1 Fresh Install
- Steps: Visit /installer → complete Steps 1–4
- Expected: Config files written; migrations executed; admin user created; redirect link shown

6.2 Upgrade + Rollback Snapshot
- Steps: /installer/upgrade.php → Run Upgrade
- Expected: JSON snapshot saved under storage/backups; migrations re-applied; success message

Appendix: Verification Tips
- Use phpMyAdmin to inspect tables during tests
- Check email deliverability (SMTP configured)
- For BTC: use testnet and Blockstream explorer to confirm tx/confirmations
