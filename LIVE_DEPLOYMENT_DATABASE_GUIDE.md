# Live / cPanel deployment

The complete current guide is [INTEGRATION_SETTINGS_BN.md](INTEGRATION_SETTINGS_BN.md). It covers database upgrades, cPanel Node startup, frontend API URLs, uploads, email, payment, SMS, notifications and analytics.

1. Back up the existing database, project and uploaded files.
2. Preserve your existing server/.env and SETTINGS_ENCRYPTION_KEY. Use server/.env.example for the exact supported variable names.
3. Install dependencies with npm run install:all.
4. Run npm --prefix server run setup:key, then npm run db:migrate. The migration runner includes migrations 002, 003 and 004. Do not reset or seed an existing live database.
5. In cPanel, use the server directory as application root and app.cjs as startup file. Restart after environment changes.
6. Set VITE_API_URL for your deployment, rebuild with npm run build and deploy client/dist. Configure SPA fallback without intercepting API/upload requests.
7. Configure SMTP and optional IMAP in Admin → Email Settings. No SMTP/IMAP .env duplication is required.
8. Perform the hosting checks described in the Bengali guide and VERIFICATION.md.

Full schema reference: database/full_schema.sql. Existing installations should use the migration runner after taking a backup. Keep server files, .env and private prescriptions outside the public frontend document root.
