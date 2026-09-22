# Security Notes

## Authentication

Passwords are hashed with bcrypt. Access tokens are short-lived Bearer JWTs. Refresh tokens are rotated; their server-side representation is stored as a SHA-256 hash and the browser receives the raw refresh value only in an HttpOnly cookie. Admin status and permission checks come from active database roles.

Admin email/phone/password changes require the current password for sensitive changes. Changing the password revokes existing refresh sessions.

## HTTP/API protections

The server uses Helmet, CORS configuration, rate limiting, centralized error handling and prepared SQL placeholders. Never trust client-submitted prices, totals, roles or permissions.

## Rich text

Admin rich text is sanitized by the backend before being written to supported content fields. Client rich content should be rendered only from this sanitized data path.

## File uploads

Product/media upload types are limited to accepted image MIME types and file-size limits, then re-encoded through Sharp. Prescription uploads accept the configured safe image/PDF types, use UUID filenames and remain in a private directory.

For production, add malware scanning for prescription/document uploads and use private object storage with expiring authorized download URLs.

## Checkout/inventory

Checkout executes inside a MySQL transaction. It locks eligible FEFO inventory rows, validates availability, validates approved prescription state for prescription-required items, recomputes shipping/coupon/price server-side, writes the order and stock movements, and rolls back on failure.

## Payments

No card number or CVV is stored. Development electronic payment options are mock adapters/records. Production provider integrations must verify official callback/webhook signatures and payment amounts/status server-side.

## Audit

Sensitive admin mutations write audit records containing actor/action/entity context. Logs must not store passwords, JWTs, raw payment secrets or prescription contents.

## Production checklist

- Replace all demo passwords and JWT secrets.
- Use HTTPS and secure cookies.
- Restrict CORS to exact production origins.
- Configure provider webhook verification.
- Configure SMTP securely.
- Use persistent encrypted storage/object storage for uploads and private prescriptions.
- Apply least-privilege MySQL credentials.
- Add database backups and restore tests.
- Review CSP and proxy headers.
- Add monitoring and alerting.
- Keep Node/npm/dependencies patched.
- Review medical/catalog data and regulatory/legal obligations for your operating jurisdiction.
- Do not run development seed data against production.
