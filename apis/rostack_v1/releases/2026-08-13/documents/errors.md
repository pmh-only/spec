# Errors

Every protocol error is defined by this specification. Discovery advertises the
subset an implementation can return in `errors.http` and `errors.websocket`.
Each declaration also lists the operations that can produce that error. An
implementation MUST NOT return an HTTP problem type
or WebSocket error code outside the registry below, and MUST NOT return a
registered error that it did not advertise for the current operation. Clients MUST NOT infer additional
error semantics from `title`, `detail`, or `message`.

## HTTP Problems

Non-success HTTP responses use `application/problem+json` as defined by RFC 9457.
The object MUST contain `type`, `title`, `status`, and only the optional or
conditionally required members defined by the problem schema. No other members
are allowed. `type` MUST be an absolute registry URI. `title` is the stable title
below and `status` is the listed HTTP status.

| Type suffix | Status | Title | Required member | Meaning |
| --- | --- | --- | --- | --- |
| `invalid-request` | 400 | Invalid request | None | Request syntax or a standard parameter is malformed. |
| `invalid-filter` | 400 | Invalid filter | None | The filter does not conform to the filter schema. |
| `unsupported-filter` | 400 | Unsupported filter | None | A valid filter uses an unadvertised field or operator. |
| `invalid-sort` | 400 | Invalid sort | None | Sort syntax or a sort field is invalid. |
| `invalid-fields` | 400 | Invalid fields | None | Projection syntax or a projected field is invalid. |
| `invalid-cursor` | 400 | Invalid cursor | None | A collection cursor is malformed, expired, or outside its query scope. |
| `authentication-required` | 401 | Authentication required | None | Credentials are missing, invalid, expired, or revoked. |
| `permission-denied` | 403 | Permission denied | None | Valid credentials lack a required permission. |
| `resource-not-found` | 404 | Resource not found | None | The requested item does not exist or is not visible to the principal. |
| `method-not-allowed` | 405 | Method not allowed | None | The requested method is not a permitted read-only operation. |
| `representation-not-acceptable` | 406 | Representation not acceptable | None | No advertised representation satisfies `Accept`. |
| `resource-gone` | 410 | Resource gone | None | A deleted event detail is known to be permanently unavailable. |
| `rate-limited` | 429 | Rate limited | `retry_after_ms` | The client must delay another attempt. |
| `internal-error` | 500 | Internal error | None | An unexpected server failure occurred. |
| `service-unavailable` | 503 | Service unavailable | `retry_after_ms` | A transient dependency or server condition prevents service. |

Every type URI has the prefix `https://spec.pmh.codes/problems/`. A response MAY
include `detail`, `instance`, and `request_id` only when their corresponding
members are defined by the problem schema. Those values MUST NOT expose
credentials, inaccessible resources or fields, private network locations, or
other principals' identifiers. `retry_after_ms` is an integer delay from receipt
and MUST be present only for `rate-limited` or `service-unavailable`.

An implementation that cannot safely distinguish an absent resource from an
unauthorized resource MUST use `resource-not-found` for both. Unexpected failures
MUST use `internal-error`; an implementation-specific type is not a fallback.
HTTP cache validation may return `304 Not Modified`; it is not an error and does
not carry a problem object.

## WebSocket Errors

The WebSocket `error.code` registry is closed:

| Code | Retryable | Required context | Meaning |
| --- | --- | --- | --- |
| `invalid_message` | No | None | The message is malformed or violates protocol sequencing. |
| `authentication_failed` | Yes | None | Initial or replacement credentials are invalid. |
| `reauthentication_identity_mismatch` | No | None | Replacement credentials change method or principal. |
| `permission_denied` | No | Subscription ID when applicable | The principal lacks a required permission. |
| `permission_revoked` | No | Subscription ID | A required permission was removed. |
| `resource_not_found` | No | Subscription ID | The named resource is unavailable to the principal. |
| `unsupported_event_type` | No | Subscription ID | A requested event type was not advertised for the resource. |
| `unsupported_filter` | No | Subscription ID | Event filtering or a requested field or operator was not advertised. |
| `unsupported_encoding` | No | Subscription ID | The requested event encoding was not advertised. |
| `subscription_id_conflict` | No | Subscription ID | An active ID was reused with a different definition. |
| `cursor_scope_mismatch` | No | Subscription ID | A cursor belongs to another implementation, version, resource, or principal. |
| `cursor_unavailable` | No | Subscription ID | Replay from the cursor is no longer available. |
| `rate_limited` | Yes | `retry_after_ms` | The client must delay another attempt. |
| `internal_error` | Yes | None | An unexpected gateway failure occurred. |
| `service_unavailable` | Yes | `retry_after_ms` | A transient condition prevents the operation. |

`retryable` MUST equal the value in this table. `retry_after_ms` MUST be present
for `rate_limited` and `service_unavailable` and MUST be absent for every other
code. `subscription_id` MUST be present where the table requires it and MUST be
absent when the error cannot be assigned to a subscription. A server closes the
connection only when continued protocol operation is unsafe or when a close rule
elsewhere in this specification requires it.
