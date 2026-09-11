# ShasthoCare Admin Control Center

The admin panel is designed so ordinary storefront changes do not require editing React source code.

## Login and recovery

- Permanent recovery login: `/admin/login`
- Configurable login alias: `/control-center/login` by default
- Alias setting: **Administration → Settings → Admin Panel URL Alias**

Changing the alias never disables `/admin/login`. Admin status is determined from active server-side roles rather than trusting a frontend flag.

Development Super Admin: `admin@shasthocare.local` / `Admin@12345`.

## Dashboard

The overview provides revenue/orders/customer/product counts, low/out-of-stock items, pending prescriptions and returns, sales trend data, recent orders, low-stock items and expiring batches.

## Catalog

### Products

The product manager supports searchable/paginated listing, create, edit and archive. The full product editor includes:

- name, editable slug, SKU, barcode and generic name
- category, brand and manufacturer
- product type, dosage form, strength and pack size
- regular/MRP price, sale price, cost price, tax and low-stock threshold
- prescription-required, active, featured, best-seller and new-arrival flags
- SEO title and SEO description
- rich-formatted short description, full description, ingredients, catalog/usage information, warnings and storage information
- cover image plus multiple extra gallery images
- current gallery management, set-primary and delete-image actions
- current inventory batch visibility

Complex text uses the reusable rich-text editor. Its toolbar supports headings/format, bold, italic, underline, ordered/unordered lists, alignment, links, text color and clear formatting. Server-side sanitization is applied to rich HTML before storage.

### JSON product import

On the new-product screen select the **JSON** tab. Import one object, an array, or a `{ "products": [...] }` envelope. Up to 100 products may be imported in one request. Each product may include up to 12 remote/existing upload image URLs and up to 50 initial batches.

`docs/product-import-example.json` is the canonical example. Use the normal image uploader for local JPG/PNG/WebP files.

### Categories / Brands / Manufacturers

Create/edit/deactivate catalog classification records. Their public names, descriptions, images/logos and slugs are admin controlled.

## Inventory & procurement

### Stock & batches

Inventory is batch based. Admin can see batch number, manufacture/expiry dates, supplier, purchase/selling cost and remaining quantity. Stock adjustments write inventory-movement history. Checkout allocates non-expired stock in FEFO order (first expiry, first out) inside a database transaction.

### Suppliers / purchase orders

Create suppliers, create purchase orders with product lines, update procurement status and receive ordered goods into inventory batches. Receiving stock writes batch and stock-movement records.

## Orders, payments and returns

Order administration supports searching/filtering, order details, item snapshots, delivery address, status timeline, admin notes, courier/tracking data and payment state. Cancelling a previously active order restores the stock that was deducted for that order and records the restore movement. Cancelled orders are not silently reopened.

The payments view shows provider/status/reference/amount data. Mock/manual refund flow records a refund and payment state for development. Real providers should be connected through verified gateway/webhook adapters before production.

Returns are listed and can be reviewed/updated through their workflow.

## Pharmacy / prescriptions

Prescription files remain private. Admin/pharmacist users with permission can list prescriptions, securely open the file, set review status and write administrative review notes. Customer order flow enforces an approved prescription when a product is marked prescription-required.

## Customers, reviews and support

Admin can browse customer records and detail/history, activate/deactivate accounts, moderate/delete reviews, manage contact messages and inspect service bookings.

## Marketing & public-site content

### Coupons

Manage code, rich description, discount type/value, order threshold, maximum discount, date window, usage limits and active state.

### Banners

Manage hero and promotion banners, rich subtitle/content, CTA text/URL, image/mobile image, position, order and active state.

### Homepage

Edit homepage section title/subtitle, enable/disable sections and reorder them. Product membership in best-seller/featured/new-arrival areas is driven by the product flags.

### Navigation & footer links

`Content → Navigation & Footer` controls public header and grouped footer links. Items support label, URL, location, parent/child relationship, sort order, new-tab behavior and active state.

### CMS pages

Create/edit pages such as About, FAQ, Terms, Privacy, Shipping, Returns, Refund and Medicine Disclaimer with rich formatted content and SEO fields.

### Newsletter / contact messages

Subscriber records and incoming support/contact messages are visible and manageable from admin.

## Healthcare

Create/edit services with rich description, pricing, CTA and image. Service bookings can be reviewed and status-updated from admin.

## Reports

Available admin report data covers sales, inventory, customers and prescriptions. Inventory/report tables are database backed and permission protected.

## Website settings

`Administration → Settings` controls:

- one of four themes: Clinical Teal, Ocean Blue, Emerald Care, Violet Wellness
- brand name, tagline, logo, favicon, currency code/symbol
- header search text, announcement and hero helper text
- homepage trust-bar text
- support email/phone/address/hours
- rich footer-about text, copyright and social links
- default shipping fee/free-shipping threshold and payment-method visibility
- admin login alias
- current administrator name, email/Gmail, phone and password

For email/phone/password changes, the current admin password is required. Password changes revoke refresh tokens and force a new sign-in.

## Staff and RBAC

Super Admin can create staff, assign active roles, change staff profile/status/password and configure role permissions. Backend middleware checks permissions; hiding a menu item is not the security boundary.

Seeded role examples: Super Admin, Admin, Pharmacist, Inventory Manager, Order Manager, Content Manager and Support Agent.

## Audit logs

Sensitive admin actions such as product changes, stock changes, order changes, content/settings changes, prescription review and staff/role changes are written to `audit_logs` for accountability.

## Storefront refresh and theme behavior

Theme selection now persists immediately. Admin media/settings/content saves invalidate and refresh public `site-config` and homepage queries. Public configuration endpoints use no-cache response headers so saved data is not masked by stale browser/API cache.

Multiple active banners whose position is `hero` form the homepage slideshow. Add/edit them from Marketing → Banners; images are optimized to WebP and served from `/uploads/media`.

## Tiered medicine pricing and discounts

Products can store a single-unit label/price, units per strip, strip price, strips per box, total units per box, box price, plus discount percentage. Inventory remains tracked in physical units; ordering one strip or box deducts the correct physical-unit multiplier. The default medicine discount is 20% but can be changed on each product.

## Mobile payments

Admin → Settings controls bKash/Nagad receiving numbers and rich instructions. Checkout captures sender last four digits or a transaction ID. The Payments page exposes the verification reference for admin review.

## Invoices

Order details expose an A4 invoice action. The invoice includes item package type, count, physical units, selling price, product markdown saving, coupon/order discount, shipping, payment details, order status and store/customer information.
