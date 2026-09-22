# ShasthoCare REST API

Base URL: `/api/v1`

Successful responses use `{ "success": true, "data": ... }`; errors use `{ "success": false, "message": "..." }`. Paginated endpoints may also include a `pagination` object.

Authentication uses a short-lived Bearer access token. Refresh is performed with a rotating HttpOnly cookie. Admin routes verify the authenticated account and server-side roles/permissions.

## Public/auth routes

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/auth/register` | Customer registration |
| POST | `/auth/login` | Customer/admin login |
| POST | `/auth/refresh` | Rotate refresh session and issue access token |
| POST | `/auth/logout` | Revoke refresh session |
| GET | `/auth/me` | Current authenticated account |
| GET | `/home` | Admin-controlled homepage payload |
| GET | `/site-config` | Public branding/theme/navigation/settings |
| GET | `/products` | Product catalog/search/filter |
| GET | `/products/:slug` | Product details/images/batches-derived stock/reviews |
| GET | `/categories` | Public categories |
| GET | `/brands` | Public brands |
| GET | `/search/suggestions` | Search autocomplete |
| GET | `/track-order` | Verified public order tracking |
| GET | `/services` | Active healthcare services |
| GET | `/services/:slug` | Service detail |
| GET | `/pages/:slug` | CMS page |
| POST | `/newsletter` | Newsletter signup |
| POST | `/contact` | Contact/support message |

## Authenticated customer routes

Customer routes are under `/user` and include profile, addresses, wishlist, cart, private prescription upload/listing, coupons, checkout preview/checkout, order history/details, notifications, reviews, return requests and service bookings.

Important examples:

| Method | Path |
| --- | --- |
| GET/PATCH | `/user/profile` |
| GET/POST/PATCH/DELETE | `/user/addresses...` |
| GET/POST/DELETE | `/user/wishlist...` |
| GET/POST/PATCH/DELETE | `/user/cart...` |
| POST/GET | `/user/prescriptions` |
| POST | `/user/coupons/validate` |
| POST | `/user/checkout/preview` |
| POST | `/user/checkout` |
| GET | `/user/orders` |
| GET | `/user/orders/:id` |
| POST | `/user/orders/:id/returns` |
| GET/PATCH | `/user/notifications...` |
| POST | `/user/products/:id/reviews` |
| GET/POST | `/user/service-bookings` |

Checkout recomputes catalog prices, coupon and shipping server-side, locks FEFO inventory batches, rejects expired/insufficient stock and writes order/payment/item/status/stock records transactionally.

## Admin routes

All paths below are prefixed by `/admin` and require an active admin role; individual operations also require permission codes.

### Catalog

- `GET /admin/products`
- `GET /admin/products/:id`
- `POST /admin/products`
- `PATCH /admin/products/:id`
- `DELETE /admin/products/:id` (soft archive)
- `POST /admin/products/import-json`
- `POST /admin/products/:id/images` (`cover` and `images[]` multipart fields)
- `PATCH /admin/products/:id/images/:imageId`
- `DELETE /admin/products/:id/images/:imageId`
- CRUD `/admin/categories`
- CRUD `/admin/brands`
- CRUD `/admin/manufacturers`

### Operations

- `GET /admin/dashboard`
- `GET/PATCH /admin/orders...`
- `GET /admin/inventory`
- `GET/POST /admin/inventory/batches`
- `POST /admin/inventory/batches/:id/adjust`
- `GET /admin/inventory/movements`
- CRUD `/admin/suppliers`
- `GET/POST/PATCH /admin/purchase-orders...`
- `POST /admin/purchase-orders/:id/receive`
- `GET /admin/payments`
- `GET /admin/refunds`
- `POST /admin/payments/:id/refund`
- `GET /admin/prescriptions`
- `GET /admin/prescriptions/:id/file`
- `PATCH /admin/prescriptions/:id`
- `GET/PATCH /admin/customers...`
- `GET/PATCH/DELETE /admin/reviews...`
- `GET/PATCH /admin/returns...`
- `GET/PATCH /admin/service-bookings...`
- `GET /admin/reports/sales`
- `GET /admin/reports/inventory`
- `GET /admin/reports/customers`
- `GET /admin/reports/prescriptions`

### Content and storefront control

- CRUD `/admin/banners`
- CRUD `/admin/services`
- CRUD `/admin/coupons`
- CRUD `/admin/pages`
- `GET/PATCH /admin/homepage-sections...`
- `POST /admin/homepage-sections/reorder`
- CRUD `/admin/navigation`
- `GET/PATCH/DELETE /admin/newsletter...`
- `GET/PATCH/DELETE /admin/contact-messages...`
- `POST /admin/media`

### Administration/system

- `GET/PUT /admin/settings...`
- `GET/PUT /admin/profile`
- `GET /admin/permissions`
- `GET/POST/PATCH /admin/roles...`
- `GET/POST/PATCH/DELETE /admin/staff...`
- CRUD `/admin/shipping-zones`
- `GET /admin/audit-logs`

## Product JSON import format

Use `docs/product-import-example.json`. API accepts:

- a single product object
- `{ "product": {...} }`
- an array of products
- `{ "products": [...] }`

Up to 100 products/request. An item can include `images` and `batches`. Image URLs must be `http://`, `https://` or an existing `/uploads/...` URL. Local files are uploaded with the multipart image endpoint instead.

## Payment note

Development mode uses mock/non-provider-finalized flows for electronic methods. Real bKash/Nagad/Rocket/SSLCommerz production integration requires official credentials, provider-specific initiation/callback logic and webhook/signature verification.


## Integration update

See [INTEGRATIONS.md](INTEGRATIONS.md) for the new settings, migration, API routes, provider support, quantity offers, analytics and deployment acceptance checklist. This supplement supersedes older SMTP environment and mock-payment instructions.
