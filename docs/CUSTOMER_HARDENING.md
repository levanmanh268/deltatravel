# Customer journey hardening

This branch rebases the reviewed customer-facing hardening pass onto the current `main`.

## Product changes

- Progressive cinematic loading with reduced-motion and constrained-network fallbacks.
- Practical tour search, budget and duration filters, and sorting.
- One coherent DELTA AI experience with session continuity and explicit approval before side effects.
- Checkout review before sign-in, preserved checkout drafts, and return to the interrupted checkout after authentication.
- Traveler names plus optional birth date and trip-specific requests, persisted with the booking.
- Booking utilities for copy code, calendar export, print/PDF, policy-aware cancellation, and production-only payment display.
- Public support, terms, privacy, payment/refund pages, dynamic tour metadata, structured data, and sitemap entries.
- Operations visibility for traveler details and verified collected revenue.

## Production configuration

Before accepting commercial payments, configure the public operator and support variables documented in `apps/web/.env.example`. Keep `NEXT_PUBLIC_SHOW_SANDBOX_PAYMENTS=false` in production unless sandbox methods are intentionally exposed for a demonstration.

## Verification

The repository CI is the release gate for formatting, TypeScript, AI-first source contracts, generated API contracts, unit tests, build, integration tests, and high-severity production dependency audit.
