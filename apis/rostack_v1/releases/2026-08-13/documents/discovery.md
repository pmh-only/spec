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
- the supported subset of specification-defined HTTP and WebSocket errors.

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

Every representation and event `schema_url` MUST be retrievable without resource
credentials over HTTPS and MUST return a JSON Schema using the advertised
`schema_dialect`. This release supports only JSON Schema Draft 2020-12 for
implementation-owned schemas. The schema MUST declare a canonical `$id` exactly
equal to `schema_url`; redirects do not change that requirement. The
implementation MUST control the origin of both values and MUST NOT place its
schemas under `https://spec.pmh.codes/`, which is reserved for artifacts owned by
this specification.

Every object-valued location reachable through an implementation-owned schema,
including locations reached through `$ref`, `$dynamicRef`, conditionals, and
combiners, MUST reject properties not explicitly described by that schema. Use
`additionalProperties: false` for a directly declared object, or
`unevaluatedProperties: false` when composition requires evaluation across
subschemas. `additionalProperties` and `unevaluatedProperties` MUST NOT contain a
schema other than `false`. Pattern properties are allowed only when the schema
defines the complete permitted name pattern. Schema validation tooling MUST audit
the complete referenced schema graph rather than only the root object.

The discovery error declarations MUST contain every registered error the
implementation can emit on the corresponding transport and every operation that
can emit it. `discovery`, `list`, and `get` identify HTTP operations;
`authenticate`, `subscribe`, `subscription`, and `session` identify WebSocket
contexts. These declarations are complete expected-error contracts, not extension
points. Each HTTP problem type and WebSocket code MUST occur in at most one
declaration; all applicable operations belong in that declaration. See
[`errors.md`](errors.md).

Discovery responses SHOULD provide `ETag` and `Cache-Control`. Clients SHOULD
revalidate cached discovery before assuming a previously discovered resource or
capability still exists.

Removing a resource, representation, event, field, operator, authentication
method, or permission is a breaking implementation change and requires a new
implementation API version.
