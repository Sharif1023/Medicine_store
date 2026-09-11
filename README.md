# ShasthoCare — Full-Stack Pharmacy & Healthcare Commerce

ShasthoCare is an original JavaScript-only pharmacy and healthcare ecommerce project with a customer storefront and a full administration control center. The UI follows a clean teal/healthcare visual direction while using original branding and assets.

## Stack

- Client: React 18, Vite, Tailwind CSS, JavaScript, React Router, TanStack Query, Zustand, Axios, Lucide React.
- Server: Node.js, Express, JavaScript, MySQL 8+, mysql2/promise, JWT access tokens, rotating refresh cookies, bcrypt, Multer, Sharp.
- Database: MySQL migrations/schema plus development seed data.
- Security: Helmet, CORS, rate limiting, prepared SQL, RBAC, private prescription files, audit logging.

## What is included

The public site is database/admin driven: brand, logo, favicon, four switchable themes, announcement, header/footer navigation, hero/promo banners, homepage section order/visibility/titles, categories, brands, manufacturers, products, product cover and gallery images, pricing, stock, prescription flags, healthcare services, CMS pages, contact/social information, shipping zones, coupons and payment-method visibility can all be managed from the admin panel.

Administration includes dashboard analytics; products and JSON product import; rich-text editing; categories/brands/manufacturers; FEFO batches, stock movement and adjustments; suppliers and purchase orders; orders, payments and refunds; prescriptions; customers; reviews and returns; coupons, banners and newsletter; services and bookings; homepage, navigation/footer, CMS and contact messages; reports; staff, roles/permissions and audit logs; website/admin settings.

## Admin login fix

Two admin login routes are available:

- Recovery route: `http://localhost:5173/admin/login` — always available.
- Configurable alias: seeded as `http://localhost:5173/control-center/login`.

The server hydrates the signed-in user's roles and exposes the admin flag only after role verification. Changing the alias never removes the recovery route, so a bad custom slug cannot lock you out.

Development Super Admin:

- Email: `admin@shasthocare.local`
- Password: `Admin@12345`

Development customer:

- Email: `customer@example.com`
- Password: `Customer@12345`

Change development credentials and JWT secrets before production.

## Quick start

Requirements: Node.js 20+, npm 10+, MySQL 8+.

```powershell
Copy-Item server\.env.example server\.env
Copy-Item client\.env.example client\.env
# Edit server\.env with your real MySQL username/password first.
npm run install:all
npm run db:migrate
npm run db:seed
npm run dev
```

Storefront: `http://localhost:5173`  
Admin: `http://localhost:5173/admin/login`  
API: `http://localhost:5000/api/v1`  
Health check: `http://localhost:5000/health`

`npm run db:seed` is development/demo data. Do not use it casually against a live production database. The seed script refuses to run when `NODE_ENV=production` unless `ALLOW_DEMO_SEED=1` is deliberately set.

## Product JSON import

Go to **Admin → Catalog → Products → Add Product → JSON**. You can paste one product, `{ "products": [...] }`, or an array through the API. JSON import supports product content, pricing, flags, remote or existing `/uploads/...` image URLs and initial FEFO batches. For local image files, create/import the product and then use the image uploader to upload the cover and extra images.

See `docs/product-import-example.json` for a complete example.

## Verification

After dependencies are installed:

```powershell
npm run verify
npm run build
npm test
```

`npm run verify` is dependency-free and checks required admin files, routes, themes, rich-text controls and key database tables.

For detailed setup and admin usage read `SETUP.md` and `docs/ADMIN.md`.

## September 2026 fixes and additions

This build also includes the following reliability and workflow upgrades:

- Website theme changes are persisted immediately and public site queries are invalidated/refetched without browser cache. Logo/favicon uploads are also saved immediately.
- Banner, service, CMS, navigation and other admin resource changes broadcast a storefront refresh. Multiple active `hero` banners are used as a timed hero slideshow.
- Customer Account now includes a live dashboard plus Profile, Orders/Invoices, Prescriptions, Wishlist, Addresses, Reviews, Returns, Service Bookings and Notifications.
- Wishlist hearts use an active filled red/rose state on cards and product details.
- Products support single-unit, strip and box pricing, units-per-strip, strips-per-box, total units-per-box and physical-stock deductions. Medicine forms default to a 20% discount, adjustable per product.
- bKash/Nagad receiving numbers and rich payment instructions are controlled from Admin → Settings. Customers can submit sender last 4 digits or a transaction ID, and admins can review these values in Payments.
- A4 printable invoices are available for customer orders and from Admin → Orders. Invoice lines include package type, quantity, physical units, product markdown savings, order/coupon discount, shipping, payment reference and totals.
- Generic admin CRUD editors and homepage/order editors use full-page layouts instead of narrow drawers.
- `database/seed.sql` is included alongside the JavaScript seed script.

### SQL seed alternative

After migration/schema creation, you may seed using SQL instead of the JavaScript generator:

```powershell
npm run db:seed:sql
```

Or with the MySQL CLI:

```powershell
mysql -h 127.0.0.1 -P 3306 -u root -p shasthocare < database\seed.sql
```

`npm run db:seed` remains recommended for the richest local demo because it can also generate local demo SVG assets.
