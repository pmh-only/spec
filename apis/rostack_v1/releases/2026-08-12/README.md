# rostack_v1: 2026-08-12

- Published: `2026-08-12`
- Status: `current`
- Compatibility: `initial protocol`
- Previous release: `none`
- Protocol version: `rostack_v1`

## Documentation

- [Protocol overview](documents/README.md)
- [Discovery](documents/discovery.md)
- [JSON API](documents/json-api.md)
- [Filtering](documents/filtering.md)
- [WebSocket gateway](documents/websocket.md)
- [Authentication](documents/authentication.md)
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
- [Example discovery document](examples/discovery.json)
- [Example compact event](examples/compact-event.json)
- [Example stability messages](examples/stability-messages.json)
- [Example WebSocket exchange](examples/websocket-exchange.md)

## Validation

JSON artifacts can be parsed with any RFC 8259 parser. OpenAPI and AsyncAPI
documents should additionally be checked with validators supporting OpenAPI 3.1
and AsyncAPI 3.1 respectively.
