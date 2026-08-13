# Security Review

This review covers the closed-schema and closed-error changes proposed in issue
[#1](https://github.com/pmh-only/spec/issues/1). It is an agent-authored draft;
the accountable human reviewer must approve it before publication.

## Assets And Trust Boundaries

- Credentials, permissions, resource data, event data, cursors, schema integrity,
  and client parser state are protected assets.
- Discovery documents, fetched implementation schemas, filters, projections,
  error details, WebSocket messages, and referenced URLs are attacker-controlled
  inputs at client trust boundaries.
- Shared-token provisioning and implementation control of schema origins are
  operator trust boundaries that the protocol can require but cannot prove.

## Security Effects

- Closed object schemas reduce accidental data exposure, parser differentials,
  and silently accepted protocol extensions.
- Canonical schema ownership prevents one implementation from assigning objects
  identifiers in another party's namespace and makes cache identity match the
  discovered retrieval location.
- A finite error registry prevents attacker-controlled or implementation-specific
  error structures from silently changing client behavior.
- `resource-not-found` can conceal whether an unauthorized record exists. Error
  detail is prohibited from revealing credentials, protected fields, private
  locations, or another principal's identifiers.

## Abuse And Failure Cases

- Clients must apply response-size, redirect, recursion, reference-count, and
  evaluation limits when retrieving and evaluating untrusted schemas.
- Implementations must reject schema graphs that reopen an object through a
  referenced or conditional subschema. Root-only checks are insufficient.
- Closed schemas can cause availability failures during an uncoordinated rollout;
  implementations must publish a new API version and clients must refresh
  discovery before interpreting new payloads.
- `internal-error` remains the defined fallback for unexpected failures, but its
  detail must not expose diagnostics or secrets.
- Retry delays are attacker-controlled input to clients. Clients should apply a
  local maximum while never retrying earlier than a trusted server delay within
  that policy.

## Compatibility And Migration

This change is breaking. Implementations must replace foreign or mismatched
schema `$id` values, close every object in complete schema graphs, map custom
errors to registry entries, advertise expected errors by operation, and change
their implementation API version where existing clients or payloads are
invalidated.

## Unresolved Review

The human reviewer must confirm the closed error taxonomy is sufficient for every
supported operation and that prohibiting implementation error extensions is an
acceptable long-term compatibility constraint. No credentials or production data
are included in the release artifacts.
