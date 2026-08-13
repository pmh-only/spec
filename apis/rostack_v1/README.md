# rostack_v1

`rostack_v1` is a discoverable protocol for implementation-defined data. It
combines a read-only JSON API with a WebSocket notification gateway. Clients
discover available resources and representations, subscribe to relevant events,
and follow event detail URLs to retrieve authoritative records.

## Ownership

- Owner: rostack maintainers
- Contact: implementation-defined

## Releases

| Release | Status | Compatibility | Notes |
| --- | --- | --- | --- |
| [2026-08-13](releases/2026-08-13/) | Draft | Breaking | Closed schemas, canonical implementation schema ownership, and a closed error registry |
| [2026-08-12](releases/2026-08-12/) | Current | Initial protocol | Discovery, JSON API, filtering, OAuth 2.0 or shared-token auth, and WebSocket gateway |
