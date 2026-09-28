# START HERE - Customer Request Router™

This is the UBuildOS Day 08 public release candidate.

Open `index.html` through a static web server. The public demo uses synthetic request data only.

Core behavior:
- known request types route deterministically;
- missing, unsupported, or ambiguous cases become visible `REVIEW` items with a reason;
- type, urgency, owner, and next action remain inspectable;
- JSON and CSV exports contain the exact currently visible filtered state.

No account, cloud database, live integration, autonomous action, or real customer data is included.
