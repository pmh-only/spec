# Read-Only JSON API

All resource endpoints MUST support `GET` and MAY support `HEAD` and `OPTIONS`.
They MUST NOT expose `POST`, `PUT`, `PATCH`, or `DELETE` as `rostack_v1`
operations.

## Representations

Clients send an `Accept` header using a media type advertised for the resource.
Every implementation MUST offer at least one `application/json` representation.
The response `Content-Type` MUST identify the selected representation. A `406`
problem response is returned when none is acceptable.

Domain data MAY have any JSON shape allowed by its advertised schema. Collection
responses use this standard envelope:

```json
{
  "items": [],
  "page": {
    "next_cursor": null,
    "has_more": false,
    "event_cursor": "opaque-event-position"
  }
}
```

For a resource with advertised events, `event_cursor` is REQUIRED and identifies
the resource-wide event-stream position represented by the collection snapshot.
It is independent of collection filters and MUST remain constant across every
page reached through `next_cursor`. The server MUST provide a consistent snapshot
for that pagination chain. After applying every page, a client can subscribe from
`event_cursor` without a gap between snapshot and live events. Resources without
events MAY omit it.

A recovery snapshot SHOULD be unfiltered so the client can rebuild complete
local state. If a client intentionally snapshots a filtered collection, the
cursor remains resource-wide and the server applies the subscription filter to
events after that boundary; the client is responsible for retaining enough state
to process leave transitions correctly.

An item endpoint returns the domain record directly, not the collection
envelope. It SHOULD include an `ETag`; clients MAY use `If-None-Match`.

## Standard Query Parameters

- `filter`: percent-encoded JSON conforming to the filter schema.
- `sort`: comma-separated fields; prefix descending fields with `-`.
- `fields`: comma-separated JSON Pointers to include in each result.
- `limit`: positive page size no greater than the discovered maximum.
- `cursor`: opaque continuation token returned by the server.

Servers MUST reject unsupported fields or operators with a `400` problem
response rather than silently ignoring them. Cursors are opaque, scoped to the
original resource and query, and MUST NOT be modified by clients.

Successful responses SHOULD include `X-Rostack-Protocol-Version: rostack_v1` and
MUST include `X-Rostack-API-Version` with the implementation API version from
discovery.
