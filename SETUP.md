> **Current release:** [INTEGRATION_SETTINGS_BN.md](INTEGRATION_SETTINGS_BN.md) is the current cPanel/integration guide. Outgoing mail and inbox credentials are now configured only in Admin Email Settings. Older SMTP/IMAP environment instructions below are historical.

# ShasthoCare Setup Guide

This guide is written for a fresh local development installation.

## 1. Requirements

Install:

- Node.js 20 or newer
- npm 10 or newer
- MySQL 8 or newer
- A modern browser

Check:

```powershell
node --version
npm --version
mysql --version
```

## 2. Extract and open the project

```powershell
cd "D:\path\to\shasthocare-fullstack"
```

## 3. Create environment files

Windows PowerShell:

```powershell
Copy-Item server\.env.example server\.env
Copy-Item client\.env.example client\.env
```

macOS/Linux:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

## 4. Configure MySQL

Edit `server/.env`.

```env
NODE_ENV=development
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=shasthocare
DB_USER=root
DB_PASSWORD=YOUR_REAL_MYSQL_PASSWORD
JWT_ACCESS_SECRET=replace_with_a_long_random_secret
JWT_REFRESH_SECRET=replace_with_another_long_random_secret
CLIENT_URL=http://localhost:5173
UPLOAD_DIR=./uploads
```

Do not copy a fake database user from another project. Use a MySQL account that actually exists on your computer.

Test it directly:

```powershell
mysql -u root -p
```

If you use another user, change `DB_USER` and `DB_PASSWORD` accordingly.

## 5. Install all dependencies

From project root:

```powershell
npm run install:all
```

This installs the root runner plus both server and client dependencies.

## 6. Create/update database schema

```powershell
npm run db:migrate
```

The migration command attempts to create the configured database if the account has permission, then applies the schema and upgrade checks.

## 7. Load development demo data

For a fresh development database:

```powershell
npm run db:seed
```

This creates the development Super Admin, customer, detailed products, categories, brands, manufacturers, inventory batches, orders, payments, prescription sample, reviews, returns, services/bookings, banners, CMS content, navigation, settings, supplier/purchase order and other admin demonstration data.

**Important:** seed data is for local/development use. The production guard blocks it by default when `NODE_ENV=production`.

## 8. Start the project

```powershell
npm run dev
```

Open:

- Store: `http://localhost:5173`
- Admin recovery login: `http://localhost:5173/admin/login`
- Seeded admin alias: `http://localhost:5173/control-center/login`
- API: `http://localhost:5000/api/v1`

## 9. Development login

Super Admin:

```text
admin@shasthocare.local
Admin@12345
```

Customer:

```text
customer@example.com
Customer@12345
```

Immediately change the admin email/password from **Admin → Settings → My Admin Account** if this installation will be shared.

## 10. Admin login troubleshooting

If admin login fails:

1. Use `/admin/login` even if you changed the admin alias.
2. Confirm the API is running at port 5000.
3. Open `http://localhost:5000/health`.
4. Confirm `VITE_API_URL=http://localhost:5000/api/v1` in `client/.env`.
5. Confirm `CLIENT_URL=http://localhost:5173` in `server/.env`.
6. Run `npm run db:migrate` then, only for a fresh/dev database, `npm run db:seed`.
7. Make sure the admin account has an active admin role under `user_roles`/`roles`.
8. Clear the site's cookies/local storage if an obsolete token from an older build remains, then sign in again.

The current login implementation fetches the account's active roles on login/refresh and marks `isAdmin` server-side. A normal customer account is rejected by the admin login screen.

## 11. MySQL troubleshooting

### Access denied

Typical error:

```text
Access denied for user '...'@'localhost'
```

Fix the values in `server/.env`. Verify the same credentials with:

```powershell
mysql -h 127.0.0.1 -P 3306 -u root -p
```

### MySQL service not running

On Windows, open **Services** and start the MySQL service, commonly `MySQL80`.

PowerShell may also show available services:

```powershell
Get-Service *mysql*
```

### Wrong port

Check your MySQL configuration and update `DB_PORT`. Standard MySQL is 3306.

### Unknown database

Run:

```powershell
npm run db:migrate
```

The configured MySQL account needs permission to create/use the database.

## 12. Product images and prescription uploads

- Product images: `server/uploads/products`
- General site/admin media: `server/uploads/media`
- Private prescriptions: `server/uploads/private/prescriptions`

Product/admin media are served publicly through the server. Prescription files are not exposed as a public static directory; authorized routes are used for access.

The image pipeline accepts JPG/JPEG/PNG/WebP and re-encodes admin image uploads through Sharp to optimized WebP.

## 13. Product JSON import

Use **Admin → Products → Add Product → JSON**, or call the admin API. Start from `docs/product-import-example.json`.

JSON may include `images` URL records and `batches`. Local computer image files cannot be embedded as a filesystem path in JSON; upload them through the cover/extra image uploader after creating the product.

## 14. Theme switching

Open **Admin → Settings → Website Theme**. Available themes:

- Clinical Teal
- Ocean Blue
- Emerald Care
- Violet Wellness

Changing the theme updates CSS variables only. Products, orders, customers and content remain unchanged.

## 15. Build and verify

```powershell
npm run verify
npm run build
npm test
```

## 16. Production notes

Before production:

- change development accounts and all secrets
- use HTTPS
- set a strict client origin
- use persistent/object storage for uploads
- connect real payment-provider adapters/credentials instead of mock mode
- configure SMTP
- configure backups and monitoring
- review all demo medical/catalog content against your official source data and local legal/regulatory requirements
- do not run demo seed data on the live database

See `docs/SECURITY.md` and `docs/DEPLOYMENT.md`.

## 17. Updating an older ShasthoCare database

If you are upgrading from the earlier ZIP, keep your existing database and run:

```powershell
npm run db:migrate
```

The migration adds the new unit/strip/box pricing columns, discount percentage, cart price type, mobile-payment verification fields and invoice snapshots without requiring a fresh database.

After migration, restart both client and server. If the browser has an old build cached, use a hard refresh once (`Ctrl+F5`).

## 18. SQL seed file

A complete development SQL seed is now available at:

```text
database/seed.sql
```

You can import it with:

```powershell
npm run db:seed:sql
```

or:

```powershell
mysql -h 127.0.0.1 -P 3306 -u root -p shasthocare < database\seed.sql
```

Use either `db:seed` or `db:seed:sql` on a development database. The JavaScript seed can additionally create demo local SVG files.

## 19. Theme, banners and hero slideshow

Theme cards in **Admin → Settings** apply immediately after clicking. General settings still have a **Save All Settings** button for batch changes.

For the homepage hero slideshow, go to **Admin → Marketing → Banners** and create multiple active banners with `Position = hero`. Upload desktop/mobile images and set Sort Order. The homepage rotates active hero banners automatically.

## 20. bKash and Nagad manual verification

Go to **Admin → Settings → Checkout, Shipping & Payments** and configure:

- bKash receiving number
- bKash formatted instructions
- Nagad receiving number
- Nagad formatted instructions

At checkout, customers see the configured number/instructions and enter either the sender account's last 4 digits or the transaction ID. Admin can review those values under **Payments & Refunds**.

## 21. Invoice

Customer: **Account → Orders → Invoice**.  
Admin: **Orders → open an order → Invoice**.

Use **Print / Save PDF** from the invoice page. The print layout is A4 and includes product/package quantities, physical units, discounts/savings, delivery, payment verification and total.


## Integration update

See [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md) for the new settings, migration, API routes, provider support, quantity offers, analytics and deployment acceptance checklist. This supplement supersedes older SMTP environment and mock-payment instructions.
