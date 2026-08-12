# Versioning

Three independent versions prevent protocol evolution from being confused with
implementation data evolution.

- **Protocol version**: `rostack_v1`. It defines discovery, auth, filtering,
  HTTP envelopes, and gateway messages. It appears in discovery and the
  `X-Rostack-Protocol-Version` response header.
- **API version**: an implementation-selected opaque string. It changes whenever
  discovered resources or behavior change incompatibly. It appears in discovery,
  HTTP responses, and gateway messages.
- **Resource version**: an opaque value identifying one record revision. It
  appears in events and SHOULD correspond to the item's HTTP `ETag`.

Additive schema changes are compatible only when the existing JSON Schema and
documented client behavior permit additional fields. Removing or renaming
resources, representations, fields, events, operators, authentication methods,
or permissions; changing field types; or changing semantics requires a new API
version.

An implementation MAY serve multiple API versions. Each version MUST have its
own discovery URL or be explicitly listed as an alternate in discovery. Event
detail URLs are version-specific and MUST NOT silently resolve to another API
version.
