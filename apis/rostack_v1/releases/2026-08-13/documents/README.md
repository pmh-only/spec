# Protocol Overview

`rostack_v1` exposes arbitrary implementation-owned data through a uniform,
read-only discovery and transport contract. It does not prescribe domain fields.

## Client Flow

1. Fetch `/.well-known/rostack` over HTTPS.
2. Verify that `protocol.version` is `rostack_v1` and select a supported
   representation for a discovered resource.
3. Obtain credentials for an advertised authentication method: OAuth 2.0 or a
   provisioned shared token.
4. Query collection or item URLs using the standard filters and pagination.
5. Connect to the discovered `wss` gateway and authenticate.
6. Subscribe to resource events, then follow each event's `detail_url` when the
   current full record is needed.

## Requirements

- Discovery, schema, API, and gateway URLs MUST use TLS in production.
- HTTP operations are read-only. Implementations MUST NOT advertise mutation
  operations as part of `rostack_v1`.
- Every available resource and representation MUST appear in discovery.
- Each representation MUST declare its media type and a retrievable schema URL.
- Every implementation-owned resource and event payload MUST be completely
  described by its referenced schema. Undeclared object properties are forbidden.
- Clients MUST treat resource data as implementation-defined and MUST NOT infer
  a representation from its resource name.

## Standard Error

Non-success HTTP responses use the closed registry and schema in
[`errors.md`](errors.md). Implementations MUST advertise every error they can
return and MUST NOT define additional protocol error types or codes.
