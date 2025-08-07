# Legacy Mapping (React + Supabase → PHP)

Archive snapshot: legacy-react-supabase-2025-08-07 (in /archives)

What was archived (moved out of active code paths):
- src/components → archives/legacy-react-supabase-2025-08-07/src/components
- src/pages → archives/legacy-react-supabase-2025-08-07/src/pages
- src/hooks → archives/legacy-react-supabase-2025-08-07/src/hooks
- src/lib → archives/legacy-react-supabase-2025-08-07/src/lib
- src/integrations/supabase/client.ts → archives/legacy-react-supabase-2025-08-07/src/integrations/supabase/client.ts
- src/App.tsx, src/main.tsx, src/index.css → archives/legacy-react-supabase-2025-08-07/src/
- supabase/functions/* → archives/legacy-react-supabase-2025-08-07/supabase/functions
- Build tooling (index.html, vite.config.ts, tailwind.config.ts, eslint.config.js) → archives/legacy-react-supabase-2025-08-07/
- Vite public robots.txt → archives/legacy-react-supabase-2025-08-07/public/robots.txt

What remains (platform-managed or useful for PHP app):
- php-app/** (active PHP application, public assets in php-app/public)
- supabase/config.toml (platform-managed, read-only)
- src/integrations/supabase/types.ts (platform-managed, read-only; retained for tooling compatibility, not used by PHP app)
- public/favicon.ico, public/placeholder.svg (platform-managed, read-only)

Notes and recommendations:
- The PHP app serves assets from php-app/public. Add images/fonts/icons under php-app/public/assets and CSS under php-app/public/css as needed.
- React-specific styles were archived. If any CSS is desired for PHP, recompile or copy only what’s needed into php-app/public/css.
- No functional references to archived code exist in the PHP app; this repo now centers on php-app for shared-hosting deployment.
- For a Git-level archive, we recommend creating a tag (e.g., legacy-2025-08-07) and a legacy branch. Lovable’s in-editor tools don’t create Git tags/branches, so please tag in GitHub if required.

Verification checklist (post-archive):
- [ ] Installer runs via php-app/installer/index.php on shared hosting
- [ ] Public routes resolve via php-app/public/index.php and .htaccess
- [ ] BTC escrow, auth (2FA/PGP), messaging, orders, disputes smoke tests pass per TESTING.md
- [ ] No references to archived React/Supabase code in PHP views or controllers
