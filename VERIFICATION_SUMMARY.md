# Verification summary

Producer verification for the frozen release candidate covers:
- deterministic known-type routing;
- fail-closed REVIEW behavior for missing, unsupported, and ambiguous inputs;
- urgency validation;
- visibility of type, urgency, owner, next action, status, and reason;
- current-visible-state JSON/CSV export logic;
- synthetic-only dataset classification;
- root canonical entrypoint and runtime dependency closure;
- mobile/tablet/desktop rendering;
- accessibility-oriented labels, focus styles, and touch-size controls;
- public documentation and claim boundaries;
- manifest/checksum parity;
- cold extraction/replay and recovery;
- publication-convergence dry run.

Independent Fresh IQA remains separate from producer verification.
