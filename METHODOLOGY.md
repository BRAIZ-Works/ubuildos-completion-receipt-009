# Methodology

The routing function is intentionally deterministic and inspectable.

1. Normalize request type and urgency.
2. Accept only explicitly supported values.
3. If type and urgency are both supported, apply the exact public routing rule.
4. If either value is missing, unsupported, or ambiguous, set status to `REVIEW`, retain the original input, and explain why.
5. Render the routed state visibly.
6. Export only the current visible filtered state.

The product does not infer a hidden customer intent or invent an owner/action for unsupported inputs.