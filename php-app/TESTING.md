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
  1) Go to /2fa/setup → a QR, secret, and provisioning URI are shown
  2) Add to an Authenticator app (TOTP, 30s) → enter current 6‑digit code → Submit
  3) Logout; login with email/password → prompted for TOTP → enter valid code
  4) Negative: enter an invalid/old code → expect rejection and retry prompt
- Expected: totp_secrets row saved (encrypted); profile.twofa_enabled=1; login requires a valid 6‑digit code; minor clock drift (±1 step) is accepted; invalid codes are rejected without revealing details

1.5 PGP Key Management
- Steps:
  1) /account/profile → PGP Keys → paste an ASCII‑armored public key → Save and set as Default
  2) Add a second key → set it as Default
  3) Negative: paste malformed text → expect validation error, no row created
- Expected: pgp_keys row persisted; fingerprint computed and shown; profiles.pgp_default_key_id updated when default changes; only your own keys can be set as default

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
- Preconditions: Buyer logged in; Admin → Payments configured (Testnet recommended)
- Steps:
  1) /product/{slug} → Buy Now → redirected to /checkout/view?id=...
- Expected:
  - orders and order_items rows created; payments row created with status='awaiting'; escrows row with status='holding'
  - A unique Bitcoin address is displayed with a scannable QR; amount and testnet notice shown; address is unique vs prior orders

3.2 Manual Payment Check (Admin)
- Steps:
  1) From Admin → Payments click Run Check Now (or visit /cron/payments?token=YOUR_TOKEN in browser)
  2) Send exact testnet BTC amount to the order address; wait for 0→N confirmations
- Expected: payments.status transitions awaiting → confirmed as confirmations reach the configured threshold; orders.status moves awaiting_payment/paid → in_escrow; timestamps and confirmation count update visibly

3.3 Cron Poller (Recommended)
- Preconditions: cPanel cron pointing to /cron/payments?token=YOUR_TOKEN every 5–10 minutes
- Steps:
  1) Send testnet BTC; wait for next cron run
  2) Negative: call /cron/payments with an invalid or missing token
- Expected: With valid token, payment/order states update as in 3.2; with invalid/missing token the endpoint responds 401/403 and makes no changes

3.4 Shipment and Completion
- Steps:
  1) Vendor: /vendor/orders/view?id=... → Mark Shipped (tracking optional)
  2) Buyer: /orders/view?id=... → Mark as Received
- Expected: Order moves shipped → completed; status history shows transitions; both parties receive email notifications

3.5 Escrow Release (Admin)
- Steps: /admin/orders/view?id=... → Release Escrow
- Expected: escrows.status=released; order becomes completed if not already; optional payout TXID recorded

3.6 Display/UX Checks
- Steps:
  1) On /checkout/view ensure QR renders, copy buttons work, and a testnet block explorer link (if shown) opens the correct address
  2) Refresh page periodically to observe status polling without manual actions
- Expected: No duplicate address generation; no page errors; status, confirmations, and totals are accurate

4) Messaging, Reviews, Disputes
4.1 Secure Messaging with PGP
- Preconditions: Both buyer and vendor have a default PGP key
- Steps:
  1) Start a thread from an order or /messages/start
  2) Check “Encrypt with recipient’s PGP key” → type message → Send
  3) Negative: uncheck encryption and send; also try when recipient has no default key
- Expected: When encrypted: messages.is_pgp_encrypted=1 and message body stored as ASCII‑armored text containing 'BEGIN PGP MESSAGE'; recipient can decrypt locally; when not encrypted: plaintext stored and flag=0; if recipient lacks a key, UI should prevent encryption or fall back to plaintext with a clear warning

4.2 Product & Vendor Reviews
- Preconditions: Order completed
- Steps:
  1) /orders/view?id=... → Review Product or Review Vendor
  2) Submit rating+comment
- Expected: reviews rows with correct foreign keys; summary shows on product/vendor pages

4.3 Disputes
- Buyer:
  - Steps: /disputes/new?order_id=... → enter reason and details → Submit
  - Expected: disputes row created with status=open; visible in /disputes and /disputes/view?id=... with a timeline entry; vendor is notified by email
- Vendor:
  - Steps: /vendor/disputes → open dispute → provide response or propose resolution → Submit
  - Expected: dispute updated; new timeline entry; buyer notified by email
- Admin:
  - Steps: /admin/disputes → change status (e.g., under_review/resolved/rejected) and add notes → Submit
  - Expected: status transitions saved; both parties emailed; only involved parties and admins can view the dispute; CSRF tokens validated on forms

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
