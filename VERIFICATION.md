# Release verification — 2026-09-22

Based on the latest supplied medicine_corrected_complete(1).zip.

## Completed
- npm test: 20 backend tests and 5 frontend tests passed.
- npm run verify: project structure checks passed.
- Production frontend build passed. Vite reports a non-blocking chunk-size advisory (main JavaScript about 617 kB).
- Backend JavaScript syntax checked with node --check.
- HTTP regression test serves an actual bundled PNG with correct MIME type and PNG signature.
- Tests cover quantity-offer API selection, encrypted email settings including IMAP, selected IMAP mailbox locking, image URL normalization and existing integration behavior.
- Final ZIP CRC integrity, source preservation and required-file checks performed.

## Limits and hosting checks
- Browser smoke testing could not run because Chromium is absent from this environment. Visual interaction is not verified.
- No live MySQL instance: migrations and SQL were inspected but were not executed against a production database. Back up the database before migrating.
- SMTP/IMAP, SMS, payment callbacks and external analytics require your real hosting settings and credentials; no real provider transaction was performed here.
- Run the hosting checklist in INTEGRATION_SETTINGS_BN.md, including SMTP verification and a test email, sandbox payment callbacks, product image loading and consent-based analytics.
- Passing checks do not guarantee absence of every possible defect.
