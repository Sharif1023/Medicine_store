# Changes in this release

Source: medicine_corrected_complete(1).zip. Production client/dist rebuilt.

## Main changes
- Public quantity offers with cart actions.
- Image URL handling, PNG serving and 41 catalog image backfills.
- Single database-backed cPanel SMTP/IMAP settings screen.
- One-time encryption key setup, cPanel entry point and notification cron command.
- Auth API URL, password-reset attempt handling, IMAP mailbox operations and tracking fixes.
- Bengali setup/integration/dashboard guide and verification notes.

## Updated source files
- `LIVE_DEPLOYMENT_DATABASE_GUIDE.md`
- `README.md`
- `SETUP.md`
- `SETUP_BN.md`
- `VERIFICATION.md`
- `client/.env.example`
- `client/src/api/http.js`
- `client/src/components/ProductCard.jsx`
- `client/src/pages/Cart.jsx`
- `client/src/pages/Offers.jsx`
- `client/src/pages/ProductDetail.jsx`
- `client/src/pages/admin/IntegrationSettings.jsx`
- `client/src/pages/admin/ProductForm.jsx`
- `client/src/pages/admin/Settings.jsx`
- `client/src/services/tracking.js`
- `client/src/store/auth.js`
- `client/vite.config.js`
- `database/MEDICO_FULL_UPDATE.sql`
- `database/full_schema.sql`
- `database/seed.sql`
- `docs/DEPLOYMENT.md`
- `docs/INTEGRATIONS.md`
- `docs/MEDICO_FULL_UPGRADE.md`
- `server/.env.example`
- `server/package.json`
- `server/src/app.js`
- `server/src/config/env.js`
- `server/src/routes/admin/catalog.routes.js`
- `server/src/routes/admin/integrations.routes.js`
- `server/src/routes/admin/medico.routes.js`
- `server/src/routes/analytics.routes.js`
- `server/src/routes/auth.routes.js`
- `server/src/routes/public.routes.js`
- `server/src/scripts/migrate.js`
- `server/src/scripts/seed.js`
- `server/src/services/credentials.js`
- `server/src/services/imap.js`
- `server/src/services/integrationSettings.js`
- `server/src/services/mail.js`
- `server/tests/integrations.test.js`

## Added files
- `INTEGRATION_SETTINGS_BN.md`
- `client/src/api/assets.js`
- `client/src/pages/admin/EmailSettings.jsx`
- `client/tests/assets.test.js`
- `database/migrations/004_mailbox_and_images.sql`
- `server/app.cjs`
- `server/src/scripts/notifications-process.js`
- `server/src/scripts/setup-key.js`
