# Discovery

The discovery document is available at `GET /.well-known/rostack`. It is the
authoritative description of one implementation's available data.

The response MUST use `application/json`, conform to
`../schemas/discovery.schema.json`, and include:

- protocol name and version;
- implementation identity and documentation URL;
- JSON API base URL and WebSocket gateway URL;
- supported authentication methods and permissions, including OAuth 2.0
  metadata when OAuth is available;
- every available resource, typed event descriptor, and representation;
- each representation's media type, schema URL, and schema dialect;
- supported filter operators, sortable fields, and maximum page size.
- supported WebSocket event encodings and compression extensions.

Resource names are stable identifiers within an implementation. A resource MUST
provide collection and item URL templates. Templates use RFC 6570 syntax. The
only required item-template variable is `{id}`.

Each resource separately declares `read_permissions` and
`subscribe_permissions`. Every listed permission MUST exist in the discovery
permission registry. All listed permissions are required; an empty
`subscribe_permissions` array means an authenticated principal needs no
additional permission to subscribe. Read permission does not imply subscribe
permission, or vice versa.

Each event descriptor declares its stable name, JSON Schema URL and dialect,
state transition, and whether its optional `data` is a tombstone. Event `data`,
when present, MUST validate against that event's schema. Event names MUST be
unique within a resource.

Discovery responses SHOULD provide `ETag` and `Cache-Control`. Clients SHOULD
revalidate cached discovery before assuming a previously discovered resource or
capability still exists.

Removing a resource, representation, event, field, operator, authentication
method, or permission is a breaking implementation change and requires a new
implementation API version.
