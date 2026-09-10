# Security review

Review date: 2026-09-06

## Data isolation

Migration `202609060005_workspace_isolation_and_demo_reset.sql` removes the original shared authenticated policies. `specialties`, `doctors`, and `patients` carry an authenticated owner. Policies for consultations, recommendations, appointments, follow-ups, calls, and results resolve ownership through their foreign-key chain. Profiles are self-readable/self-updatable. Webhook events remain service-role only.

## Secret boundary

`CALL_E_API_KEY`, `CALLE_API_KEY`, and `SUPABASE_SECRET_KEY` are read exclusively by modules marked `server-only`. The Settings page returns readiness booleans, never credential values. Only Supabase URL, publishable key, and the public application origin use the `NEXT_PUBLIC_` prefix.

## Call boundary

- Consent is required before scheduling and checked again before starting a call.
- Numbers must be strict E.164.
- The provider origin is restricted to `https://api.heycall-e.com`.
- The prompt identifies the automation and prohibits diagnosis, prescriptions, and emergency assistance.
- Worsening or new symptoms always force human review.

## Webhook boundary

- Maximum request body: 1 MB.
- JSON, event ID, matching event header, event type, and call ID are validated.
- The incoming body is not trusted as the result. CareLoop retrieves the canonical call with the server-side CALL-E credential.
- Unknown calls are rejected and event IDs are stored for idempotency.
- Structured text and transcript fields are length-limited before persistence.

## Remaining production work

This is a hackathon prototype, not a certified clinical system. A production release would additionally require organizational tenancy and roles, immutable audit trails, retention/deletion policies, regional privacy and health-data compliance, encrypted operational backups, incident response, rate limiting, notification delivery guarantees, and formal clinical/safety review.
