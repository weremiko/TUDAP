# KEYNOTE'26 Operations

The event page is available at `/keynote`. Registrations are stored in the shared PostgreSQL database in `keynote_registrations`; no confirmation email is sent. The ticket verification URL is a bearer link and displays the attendee's name, institution, department, ticket number, and check-in state. Treat QR codes as private.

## Production setup

- Configure a strong `KEYNOTE_TICKET_SECRET` in the deployment environment. If it is unset, ticket signatures fall back to `BETTER_AUTH_SECRET`; rotating the active secret invalidates previously issued ticket links.
- The registration API creates the `keynote_registrations` table on first use.
- QR codes are generated in the attendee's browser. The QR library is loaded from jsDelivr only when the attendee submits the form; the ticket URL itself is not sent to jsDelivr.
- Registration is unique by normalized email. There is no email delivery or self-service ticket recovery.
- `POST /api/keynote/check-in` accepts `{ "id": "...", "sig": "..." }` from an authenticated admin or moderator and marks a ticket checked in once.
- Before public launch, the event organizer must confirm the venue details, whether participation is free, the legal data-controller identity, privacy contact, and the registration data retention period. The ticket verification page is accessible to anyone who has its signed link.
