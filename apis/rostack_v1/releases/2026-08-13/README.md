# rostack_v1: 2026-08-13

- Planned publication: `2026-08-13`
- Status: `draft`
- Compatibility: `breaking`
- Previous release: [`2026-08-12`](../2026-08-12/)
- Protocol version: `rostack_v1`

## Documentation

- [Protocol overview](documents/README.md)
- [Discovery](documents/discovery.md)
- [JSON API](documents/json-api.md)
- [Filtering](documents/filtering.md)
- [WebSocket gateway](documents/websocket.md)
- [Authentication](documents/authentication.md)
- [Errors](documents/errors.md)
- [Security review](SECURITY-REVIEW.md)
- [Versioning](documents/versioning.md)

The key words MUST, MUST NOT, REQUIRED, SHALL, SHALL NOT, SHOULD, SHOULD NOT,
RECOMMENDED, NOT RECOMMENDED, MAY, and OPTIONAL are to be interpreted as
described in BCP 14 when, and only when, they appear in all capitals.

## Artifacts

- [OpenAPI 3.1 specification](specifications/openapi.yaml)
- [AsyncAPI 3.1 specification](specifications/asyncapi.yaml)
- [Discovery JSON Schema](schemas/discovery.schema.json)
- [Filter JSON Schema](schemas/filter.schema.json)
- [WebSocket message JSON Schema](schemas/websocket-message.schema.json)
- [HTTP problem JSON Schema](schemas/problem.schema.json)
- [Example discovery document](examples/discovery.json)
- [Example compact event](examples/compact-event.json)
- [Example stability messages](examples/stability-messages.json)
- [Example WebSocket exchange](examples/websocket-exchange.md)
- [Example HTTP problem](examples/problem.json)

## Validation

JSON artifacts can be parsed with any RFC 8259 parser. OpenAPI and AsyncAPI
documents should additionally be checked with validators supporting OpenAPI 3.1
and AsyncAPI 3.1 respectively.

## Migration

Canonical JSON Schema identifiers changed from the reserved
`https://spec.rostack.example/` origin to `https://spec.pmh.codes/`. Consumers
that cache, allowlist, bundle, or resolve schemas by `$id` MUST update those
identifiers. Relative references between release artifacts are unchanged.

Implementations MUST also migrate every advertised resource and event schema to
Draft 2020-12, set its canonical `$id` to the advertised `schema_url`, serve it
from an HTTPS origin they control, and close every object against undeclared
properties. Discovery MUST advertise the implementation's supported subset of
the specification error registry. Existing implementation-specific error types
and WebSocket codes must be mapped to registry entries. These changes require a
new implementation API version when they invalidate an existing contract.
