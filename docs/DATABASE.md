# Database Design

MySQL 8+ is the system of record. Monetary columns use `DECIMAL` rather than floating-point values. Foreign keys and indexes are defined in `database/schema.sql`; `database/migrations/001_schema.sql` is kept synchronized.

## Major table groups

- Accounts/RBAC: `users`, `refresh_tokens`, `roles`, `permissions`, `user_roles`, `role_permissions`, `user_addresses`.
- Catalog: `categories`, `brands`, `manufacturers`, `products`, `product_images`.
- Procurement/inventory: `suppliers`, `purchase_orders`, `purchase_order_items`, `inventory_batches`, `inventory_movements`.
- Shopping: `cart_items`, `wishlist_items`, `coupons`, `coupon_usages`, `shipping_zones`.
- Orders/finance: `orders`, `order_items`, `order_status_history`, `payments`, `refunds`.
- Pharmacy/customer engagement: `prescriptions`, `reviews`, `returns`, `notifications`.
- Healthcare: `services`, `service_bookings`.
- Site control: `banners`, `homepage_sections`, `navigation_items`, `cms_pages`, `store_settings`, `newsletter_subscribers`, `contact_messages`.
- Governance: `audit_logs`.

## Product model

Products hold catalog identity, classification, formatted descriptions, medicine/catalog fields, prices, status/merchandising flags, low-stock threshold and SEO data. Images are a one-to-many relationship in `product_images`; one row can be marked primary and the rest form the gallery.

## Inventory and FEFO

A product can have multiple `inventory_batches`. Each batch stores batch number, manufacture/expiry date, supplier, purchase/selling values, original quantity and remaining quantity. Customer checkout locks eligible non-expired batch rows, verifies total availability and deducts from the earliest-expiring batches first. Each deduction/adjustment/receiving/restore operation writes `inventory_movements`.

Cancelled orders restore the quantities represented by the original `sale` movements once, using a `cancellation_restore` movement marker to prevent duplicate restocking.

## Orders

`orders` holds totals, payment state, fulfillment state, delivery-address JSON snapshot, courier/tracking and notes. `order_items` stores immutable name/SKU/image/unit price/quantity/subtotal snapshots so historic orders do not change when the product catalog changes. `order_status_history` preserves the timeline.

## Prescription privacy

`prescriptions` stores metadata and a private file path. The file directory is not registered as public static content. Authorized customer/admin endpoints expose metadata or the reviewed file as appropriate.

## Storefront configuration

`store_settings` is a key/value store for branding, theme, contact/social data, checkout defaults and admin alias. `navigation_items` controls header/footer links. `homepage_sections` controls ordering/visibility/text of home sections. Banners, services and CMS pages store editable website content.

## Migrations

Run:

```text
npm run db:migrate
```

The migration script creates the database when permitted, runs the schema and applies compatibility/upgrade checks. Do not manually edit a production schema without a reviewed migration plan.
