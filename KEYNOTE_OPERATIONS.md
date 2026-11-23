# KEYNOTE'26 Operations

The event page is available at `/keynote`. Registrations are stored in the shared PostgreSQL database in `keynote_registrations`; no confirmation email is sent. The ticket verification URL is a bearer link that displays ticket validity, ticket number, and check-in state, but no attendee name, institution, department, or email. Treat QR codes as private.

## Production setup

- Configure a strong `KEYNOTE_TICKET_SECRET` in the deployment environment. If it is unset, ticket signatures fall back to `BETTER_AUTH_SECRET`; rotating the active secret invalidates previously issued ticket links.
- The registration API creates the `keynote_registrations` table on first use.
- QR codes are generated in the attendee's browser by the locally bundled `qrcode-generator` package; no third-party QR service is contacted.
- Registration is unique by normalized email. There is no email delivery or self-service ticket recovery.
- `POST /api/keynote/check-in` accepts `{ "id": "...", "sig": "..." }` from an authenticated admin or moderator and marks a ticket checked in once.
- Admins can scan QR codes from `/admin/keynote` on browsers that provide `BarcodeDetector`; the verification URL can also be entered manually when camera scanning is unavailable.
- Before public launch, the event organizer must confirm the venue details, whether participation is free, the legal data-controller identity, privacy contact, and the registration data retention period. The ticket verification page is accessible to anyone who has its signed link.
