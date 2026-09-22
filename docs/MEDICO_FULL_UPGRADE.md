> **Current release:** [INTEGRATION_SETTINGS_BN.md](../INTEGRATION_SETTINGS_BN.md) is the current cPanel/integration guide. Outgoing mail and inbox credentials are now configured only in Admin Email Settings. Older SMTP/IMAP environment instructions below are historical.

# Medico Full Upgrade Summary

## Major new/expanded functionality

- Backend-only cPanel SMTP + IMAP integration.
- Admin Email Center with paginated inbox/sent, search, compose/reply, read/unread, delete and authenticated attachment download.
- Website Contact Message admin reply by SMTP and DB reply audit.
- Admin SMTP/IMAP connection tests without exposing secrets.
- DB-driven Admin Email Templates.
- Welcome email on successful signup.
- Secure forgot-password OTP and password-changed notification.
- Email-or-phone login and Bangladesh phone normalization.
- One Full Name UI while preserving legacy `first_name`/`last_name` compatibility.
- Editable user profile, verified email-change flow and current-password change.
- User addresses CRUD/default with ownership authorization.
- User prescription view/edit/replace/soft-delete with authenticated file access.
- User order address edit/cancel/hide rules; cancellation restores inventory transactionally.
- Admin-controlled WhatsApp floating button.
- Home navbar `ALL` and public all-products route through existing catalog.
- New secure name-prefix + random 7-digit order reference.
- Public order tracking requires reference + matching email/phone.
- Database-driven Admin Offers and public Offers page.
- Expanded Admin customer edit/view behavior without password/hash disclosure.
- Production-safe DB migration and complete current schema.

## New files

### Server
- `server/src/utils/identity.js`
- `server/src/utils/orderRef.js`
- `server/src/services/mail.js`
- `server/src/services/imap.js`
- `server/src/routes/admin/medico.routes.js`

### Client
- `client/src/components/WhatsAppFloat.jsx`
- `client/src/pages/ForgotPassword.jsx`
- `client/src/pages/Offers.jsx`
- `client/src/pages/admin/Offers.jsx`
- `client/src/pages/admin/EmailCenter.jsx`
- `client/src/pages/admin/EmailTemplates.jsx`

### Database / docs
- `database/migrations/002_medico_full_upgrade.sql`
- `database/MEDICO_FULL_UPDATE.sql`
- `LIVE_DEPLOYMENT_DATABASE_GUIDE.md`
- `docs/MEDICO_FULL_UPGRADE.md`

## Important modified files

- `server/package.json`
- `server/.env.example`
- `server/src/config/env.js`
- `server/src/routes/auth.routes.js`
- `server/src/routes/user.routes.js`
- `server/src/routes/public.routes.js`
- `server/src/routes/admin.routes.js`
- `server/src/routes/admin/catalog.routes.js`
- `server/src/routes/admin/operations.routes.js`
- `server/src/scripts/migrate.js`
- `client/src/App.jsx`
- `client/src/components/Header.jsx`
- `client/src/pages/Login.jsx`
- `client/src/pages/Register.jsx`
- `client/src/pages/account/Profile.jsx`
- `client/src/pages/account/Addresses.jsx`
- `client/src/pages/account/Orders.jsx`
- `client/src/pages/account/Prescriptions.jsx`
- `client/src/pages/admin/AdminLayout.jsx`
- `client/src/pages/admin/Settings.jsx`
- `client/src/pages/admin/OperationalPages.jsx`
- `database/schema.sql`
- `database/migrations/001_schema.sql`

See `LIVE_DEPLOYMENT_DATABASE_GUIDE.md` for production deployment, environment variables, migration and testing.


## Corrected integration release

This update is based on medicine(4).zip. Read docs/INTEGRATIONS.md (INTEGRATIONS.md from inside docs) and SETUP_BN.md for current SMTP configuration and migration 003. Existing IMAP/account OTP features are retained. SMTP credentials now belong in Admin Email Settings.
