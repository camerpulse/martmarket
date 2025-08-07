# DEPLOYMENT VERIFICATION CHECKLIST (Shared Hosting)

Use this checklist for Namecheap, Bluehost, and similar cPanel hosts to confirm a correct deployment.

1) Server Environment Compatibility
- [ ] PHP 8.1+ selected in cPanel → Select PHP Version
- [ ] MySQL/MariaDB available and database created
- [ ] Extensions enabled: pdo_mysql, openssl, bcmath, gmp
- [ ] public/ set as document root (or domain points to php-app/public)

2) Installation & Configuration
- [ ] Visit /installer and complete Steps 1–4
- [ ] Config files created in config/: app.php, database.php, security.php (and mail.php, payments.php if provided)
- [ ] Admin user created; login at /login works
- [ ] Delete or protect installer/ after setup

3) Payments & Escrow (Testnet)
- [ ] Admin → Payments configured: provider=Blockstream, network=Testnet, confirmations (1–3), optional XPUB
- [ ] Cron token set in Payments settings
- [ ] cPanel Cron job created (every 5–10 minutes) pointing to /cron/payments?token=YOUR_TOKEN
- [ ] Place a test order; send testnet BTC; verify status progresses to in_escrow

4) Application Functionality
- [ ] Register Buyer + Vendor, login/out
- [ ] Vendor can add/edit products with images
- [ ] Catalog search/filter, pagination works
- [ ] Wishlist works for buyer
- [ ] Checkout flow runs end-to-end
- [ ] Messaging works; optional PGP auto-encryption
- [ ] Reviews (post-completion) and Disputes (open/update) function
- [ ] Admin dashboard modules load and perform updates (users, vendors, orders, disputes, categories, translations, payments)

5) Security Checks
- [ ] HTTPS forced via hosting panel or .htaccess
- [ ] Sessions persist securely; logout clears session
- [ ] Role-based access enforced (ensureRole guards)
- [ ] CSRF tokens present and validated on all forms
- [ ] SMTP configured (mail.php) and test email sent

6) Backups, Upgrade & Rollback
- [ ] Run /installer/upgrade.php → confirm JSON snapshot written to storage/backups
- [ ] Re-apply migrations succeeds
- [ ] If failure simulated, restore DB using hosting backup or JSON snapshot + phpMyAdmin

7) Documentation Completeness
- [ ] DEPLOYMENT.md reviewed (paths, cron, SMTP, payments)
- [ ] TESTING.md executed (spot-checks)
- [ ] FEEDBACK_TEMPLATE.md used to record results

Quick Tips
- Error logs: check error_log in document root or via hosting logs
- Permissions: storage/ and config/ must be writable during install; restrict installer/ afterward
- DNS/Email: ensure SPF/DKIM for better SMTP deliverability
