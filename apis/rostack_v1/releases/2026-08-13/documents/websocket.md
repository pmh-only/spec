# WebSocket Gateway

The gateway location is supplied by discovery and MUST use `wss` in production.
Clients request the `rostack.v1` WebSocket subprotocol. Every text frame contains
one JSON message conforming to `../schemas/websocket-message.schema.json`.

## Session

1. Client sends `authenticate` as the first message.
2. Server replies `authenticated` and includes the API version.
3. Client sends one or more `subscribe` messages with unique subscription IDs.
4. Server replies `subscribed`, then emits matching `event` messages.
5. Either peer may send `ping`; the recipient replies with `pong`.

A subscription names one discovered resource and zero or more discovered event
types. An omitted event-type list means every advertised event for that
resource. The optional filter uses the standard filter object and is allowed
only when discovery marks the resource `event_filtering: true`. The client MAY
request an advertised `event_encoding`; the server echoes the selected encoding
in `subscribed`. The default is `json`.

Subscription IDs are unique only within one connection. Sending `subscribe`
again with an active ID and the same normalized definition is idempotent: the
server MUST return the current `subscribed` state and MUST NOT restart replay or
create another delivery stream. Normalization applies the default `json`
encoding, treats omitted event types as the complete advertised set, compares
explicit event types as sets, compares filter JSON structurally without object
member order, and compares resource and cursor strings exactly. Reusing an
active ID with any different normalized definition MUST fail with
`subscription_id_conflict`. A client may reuse an ID after `unsubscribe` or on a
new connection.

## Events

An event contains stable envelope fields but no required domain payload:

- `event_id`: globally unique event identifier.
- `cursor`: opaque resume position.
- `occurred_at`: RFC 3339 timestamp.
- `event_type`, `resource_id`, and `resource_version`.
- optional `detail_url`: HTTPS item URL for the authoritative current
  representation.
- optional `data`: implementation-defined event data with a discovered schema.

Protocol version and API version are established by the subprotocol and
`authenticated` message. Resource is established by the subscription and MUST
not be repeated in an event. When `detail_url` is omitted, clients construct it
by RFC 6570 expansion of the resource's discovered `item_url_template` with
`resource_id`. Clients SHOULD retrieve that URL when full or current state is
required. Deletion events MAY return `404` or `410`; their optional event data
can carry a tombstone representation when discovery advertises one.

Event `data`, when present, MUST validate against the schema in the matching
discovery event descriptor. For a delete transition, `detail_url` may resolve to
`404` or `410`; `data` is a tombstone only when the descriptor declares
`tombstone: true`.

## Filter Transitions

For a filtered subscription, the server evaluates both the authorized resource
state immediately before a change and the state immediately after it. A missing
state never matches. Delivery is defined as follows:

- non-match to match: emit the discovered `create` transition event;
- match to match: emit the discovered `update` transition event;
- match to non-match: emit the discovered `delete` transition event;
- non-match to non-match: emit nothing.

This transition mapping applies even when the underlying storage operation was
an update. A resource that supports event filtering MUST advertise exactly one
event descriptor for each of `create`, `update`, and `delete`. Event payload data
uses the post-change state for create and update, and the pre-change state for a
delete tombstone.

## Compact JSON Events

Implementations SHOULD support `compact-json` for high-volume subscriptions. It
changes event messages only; control and error messages remain JSON objects. A
compact event is a positional JSON array:

```text
["e", subscription_id, event_id, cursor, occurred_at_unix_ms, event_type,
 resource_id, resource_version, detail_url_or_null, optional_data]
```

Positions zero through seven are REQUIRED. Position eight MAY contain a detail
URL or `null`. Position nine MAY contain event data; when data is present without
a detail URL, position eight MUST be `null`. Unix time is an integer count of
milliseconds since 1970-01-01T00:00:00Z, excluding leap seconds.

Servers and clients MUST NOT change the positional layout. Future layouts
require a different advertised encoding name. Compact encoding is most useful
when domain data is omitted and clients fetch details through the JSON API.

## Transport Compression

Discovery advertises supported WebSocket extensions. Clients MAY offer
`permessage-deflate` only when advertised; negotiation follows RFC 7692. Because
compression can increase CPU use and expose secrets through compression side
channels, servers SHOULD avoid compressing authentication messages and MAY
compress only messages above an implementation-defined size threshold. Compact
events remain valid whether or not transport compression is negotiated.

## Heartbeats and Liveness

Discovery supplies `heartbeat_interval_ms` and `heartbeat_timeout_ms`;
`heartbeat_timeout_ms` MUST be less than or equal to
`heartbeat_interval_ms`. A peer
that has sent no application message for one heartbeat interval SHOULD send a
`ping` with a unique `id`. The recipient MUST promptly return a `pong` with the
same `id`. Any valid application message proves inbound liveness; unnecessary
pings SHOULD be suppressed while traffic is flowing.

`ping` and `pong` messages MUST contain the same non-empty unique `id`. The
heartbeat timeout starts when `ping` is sent and is satisfied only by the
matching `pong`; unrelated traffic does not satisfy an outstanding ping. If it
expires, the connection is stale. The detecting peer MUST close it; a client
then reconnects, authenticates, and restores subscriptions. WebSocket
control-frame ping/pong MAY additionally be used by infrastructure but does not
replace this application heartbeat because it may not be visible to application
code.

## Graceful Draining

Before planned shutdown, the server SHOULD send `go_away` with a `reason`,
`reconnect_after_ms`, `drain_timeout_ms`, and an optional replacement gateway URL.
`reconnect_after_ms` is the minimum delay from receipt before opening a
replacement connection. `drain_timeout_ms` is the maximum time
from receipt before the server closes the old connection. It MUST be greater
than or equal to `reconnect_after_ms`. The server MUST continue serving the old
connection for that drain period unless a safety or authorization failure
requires immediate closure. Clients SHOULD restore subscriptions on a
replacement connection before closing the old one. Duplicate events during
overlap are expected and are deduplicated by `event_id`.

The following application close codes are reserved:

- `4400`: invalid protocol message.
- `4401`: authentication required, invalid, or expired.
- `4403`: permission denied.
- `4408`: authentication or heartbeat timeout.
- `4410`: server restart or planned drain.
- `4429`: rate limit; reconnect no earlier than the supplied retry delay.
- `4500`: transient server error.

## Resumption and Delivery

Clients MAY include the last processed cursor in `subscribe`. A cursor is an
exclusive resource-wide position: replay contains events strictly after it. It
is scoped to implementation ID, API version, resource, and authenticated
`principal_id`, but not to event types or filter. Using it outside that scope
fails with `cursor_scope_mismatch`.

The server first sends `subscribed` with `replaying: true`, replays matching
events in ascending cursor order, sends `replay_complete`, and only then emits
live events. With no cursor it sends `subscribed` with `replaying: false` and
starts live delivery immediately. No live event may overtake replay. Cursors
define authoritative order within a resource subscription. Delivery is at least
once; clients MUST deduplicate by `event_id`.

A durable client MUST persist each subscription definition and its cursor after,
not before, the corresponding event has been fully processed. After an
unexpected disconnect it:

1. stops using the failed connection and marks subscriptions interrupted;
2. reconnects with exponential backoff and full jitter, starting at discovery's
   `reconnect_min_delay_ms` and capped at `reconnect_max_delay_ms`;
3. honors a larger server `retry_after_ms` error value or
   `reconnect_after_ms` drain value when provided;
4. refreshes discovery after `discovery_refresh_after_ms`, on `go_away` with a
   replacement URL, or after repeated connection failures;
5. authenticates, waits for `authenticated`, then sends each saved `subscribe`
   using the same subscription ID, definition, encoding, and last processed
   cursor;
6. waits for `subscribed`, and for `replay_complete` when `replaying` is true,
   before considering that subscription restored.

Servers do not retain subscription definitions across connections. Clients MUST
resubscribe explicitly. Restoration order between subscriptions is undefined;
ordering within each restored subscription remains guaranteed.

If a cursor is invalid or expired, the gateway sends an `error` with code
`cursor_unavailable`. The client MUST fetch and atomically apply a complete,
consistent collection snapshot through the JSON API, persist the snapshot's
`event_cursor`, and subscribe from that cursor. It MUST NOT subscribe without a
cursor or silently skip resynchronization.

`reconnect_max_delay_ms` MUST be greater than or equal to
`reconnect_min_delay_ms`. Backoff resets only after the connection has remained
authenticated and healthy for at least one heartbeat interval, preventing rapid
failure loops from repeatedly returning to the minimum delay.
