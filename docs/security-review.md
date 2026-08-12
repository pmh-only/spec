# Specification Security Review

Use this guide for every normative change and for repository changes that process
untrusted content. It supplements `SECURITY.md`; it is not a substitute for a
threat model tailored to an implementation.

## Review Inputs

Document:

- assets and security properties that must be protected;
- clients, servers, gateways, authorization servers, operators, and automated
  agents involved;
- trust boundaries and which inputs are attacker-controlled;
- transport, storage, logging, and administrative channels;
- attacker capabilities, prerequisites, and plausible abuse cases;
- assumptions that implementations must satisfy but the protocol cannot enforce.

Do not label an impact `None` without considering each section below.

## Authentication and Credentials

- Define credential type, issuer or provisioning method, audience, expiry,
  rotation, revocation, and validation rules.
- Require TLS for credentials in transit and prohibit credentials in URLs, logs,
  examples, discovery fields, and WebSocket subprotocol names.
- Define initial authentication, reauthentication, expiration, and failure states.
- Prevent credential replacement from silently changing principal or auth method.
- Ensure shared secrets have sufficient entropy, least privilege, revocability,
  secure storage, and an out-of-band provisioning boundary.

## Authorization

- State whether every permission is required or alternatives are allowed.
- Separate read, subscribe, administration, and mutation permissions.
- Evaluate authorization before filtering, projection, lookup, or error detail can
  reveal protected existence or values.
- Bind resumable state, cursors, and subscriptions to the correct principal,
  implementation, API version, and resource.
- Define behavior when permissions are reduced during a session.

## Integrity and Discovery

- Fetch discovery, schemas, API data, and event details over authenticated TLS.
- Treat discovery and schema documents as untrusted inputs with size, recursion,
  redirect, and parser limits.
- Prevent schema URLs and detail URLs from enabling server-side request forgery or
  access to private network locations.
- Define cache validation and version binding so stale discovery cannot silently
  reinterpret current data.
- Keep normative prose and machine artifacts consistent; permissive schemas can
  invalidate prose-only protections.

## Replay, Ordering, and State Recovery

- Define cursor inclusion or exclusion, scope, expiry, retention, and error
  handling precisely.
- Require event identifiers and idempotent processing where delivery can repeat.
- Prevent replay by another principal or against another resource/version.
- Ensure snapshot-to-stream recovery has no gap and cannot skip authorization
  changes.
- Define ordering across replay, live delivery, reconnect overlap, and
  reauthentication.

## Filtering and Data Exposure

- Define type comparisons, missing fields, pre/post transition state, and invalid
  filters.
- Reject unsupported fields and operators without revealing inaccessible field
  values or record existence.
- Consider inference through result counts, timing, pagination, errors,
  subscriptions, and enter/leave transitions.
- Apply projection only after authorization and avoid treating projection as an
  authorization mechanism.
- Describe event payload and tombstone schemas so deleted or previous state does
  not leak unexpectedly.

## WebSocket and Availability

- Authenticate before subscriptions or events and bound the authentication time.
- Limit connection count, message size, nesting, subscriptions, filter
  complexity, replay volume, and outbound queues.
- Define backpressure, slow-consumer, rate-limit, malformed-message, and close
  behavior.
- Use heartbeat and reconnect rules that avoid half-open connections and retry
  storms.
- Evaluate compression side channels and resource costs before advertising
  `permessage-deflate`.
- Ensure compact encodings have fixed layouts and validation equivalent to verbose
  encodings.

## Privacy and Logging

- Minimize stable identifiers and document their scope and retention.
- Prohibit credentials, sensitive payloads, and private URLs in logs and examples.
- Consider whether filters, cursors, event IDs, timestamps, or error details can
  become correlatable personal or operational data.
- Define redaction expectations for diagnostics and security reports.
- Avoid embedding production data in schemas, examples, tests, and generated
  documentation.

## Supply Chain and Repository Automation

- Pin or deliberately review third-party Actions, scripts, and browser-loaded
  dependencies.
- Grant workflows the minimum permissions and never expose deployment credentials
  to untrusted pull-request code.
- Treat Markdown, YAML, JSON, HTML, SVG, and generated documentation as untrusted
  content; prevent script injection and unsafe file publication.
- Never publish `_site/`, local logs, browser artifacts, tokens, or private
  advisories from the worktree.
- Review dependency updates for provenance, maintenance, and known vulnerabilities.

## Required Evidence

Security-sensitive pull requests should include:

- a concise threat model and affected trust boundaries;
- abuse and failure cases, including negative examples;
- authorization and credential lifecycle tests or schema assertions;
- parser, size, recursion, rate, and timeout limits where applicable;
- confirmation that examples contain synthetic data only;
- compatibility and migration analysis for strengthened requirements;
- the accountable human reviewer and any unresolved risk.

An automated agent may draft this analysis but must not approve its own security
decisions. Unresolved high-impact questions block publication.
