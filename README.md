# Customer Request Router™ - UBuildOS Day 08

A bounded public demo for one question: **what should happen next when a customer request arrives?**

The router uses an explicit rule table for four known request types: `BILLING`, `TECHNICAL`, `SALES`, and `GENERAL`. Known type + supported urgency routes deterministically. Missing, unsupported, or ambiguous inputs fail closed to visible `REVIEW` with a reason.

## Inspectable fields
Every visible item shows:
- type;
- urgency;
- owner;
- next action;
- status (`ROUTED` or `REVIEW`);
- review reason when applicable.

## Export
The UI exports the **current visible filtered state** as JSON or CSV. The export does not silently include hidden rows.

## Data
All included request records are synthetic examples created for this release. No customer data is required or included.

## Boundaries
This release does **not** include CRM/ticketing integrations, authentication, notifications, autonomous external actions, production customer data, or business-outcome claims.

## Run locally
Serve this directory with any static server, then open the root URL. Example with Python:

```text
python -m http.server 8000
```

## Verification
See `VERIFICATION_SUMMARY.md`, `METHODOLOGY.md`, `LIMITATIONS.md`, `PRIVACY.md`, `SECURITY.md`, `RIGHTS_AND_USE.md`, `PUBLIC_MANIFEST.json`, and `SHA256SUMS.txt`.
