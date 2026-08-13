# Authentication

An implementation MUST support at least one of `oauth2` or `shared_token` and
MUST advertise every supported method in discovery. A client chooses one method
supported by both parties. Credentials MUST be sent only over TLS and MUST NOT
appear in URLs, cookies, logs, or WebSocket subprotocol names.

Discovery declares named permissions used consistently by both methods. For
OAuth 2.0, permission names are scopes. For shared tokens, they are grants bound
to a token by the server. Each resource advertises separate read and subscribe
permissions. A credential MUST satisfy every permission listed for the requested
operation.

## OAuth 2.0

The OAuth method MUST provide an authorization-server metadata URL conforming to
RFC 8414. HTTP clients use the Bearer scheme from RFC 6750:

```http
Authorization: Bearer ACCESS_TOKEN
```

## Shared Token

A shared token is an opaque, high-entropy secret provisioned out of band by the
implementation operator. The specification does not define token creation or
distribution. Tokens SHOULD contain at least 256 bits of random entropy, MUST be
individually revocable, SHOULD have an expiration, and SHOULD be scoped to the
minimum required permissions. Implementations MUST store tokens using a secure
one-way verifier or equivalent secrets-management control rather than plaintext.

HTTP clients use the `Rostack-Token` authorization scheme. As required by HTTP,
authentication scheme matching is case-insensitive:

```http
Authorization: Rostack-Token SHARED_TOKEN
```

Shared tokens are suitable for controlled service-to-service deployments. OAuth
2.0 is RECOMMENDED when delegated user authorization, federation, or dynamic
client access is required.

## HTTP Failures

Servers return the `authentication-required` problem with `401` and the challenge
matching an enabled method for missing, expired, revoked, or invalid credentials. Examples are
`WWW-Authenticate: Bearer` and `WWW-Authenticate: Rostack-Token`. A server
supporting both methods SHOULD send both challenges as separate header fields.
It returns the `permission-denied` problem with `403` when valid credentials lack
a required permission.

Discovery MAY be public. If protected, bootstrap information for at least one
supported authentication method MUST be supplied out of band.

## WebSocket

After opening the discovered `wss` URL, the client MUST send an `authenticate`
message as its first message and within the discovered
`authentication_timeout_ms`:

```json
{"type":"authenticate","method":"oauth2","token":"ACCESS_TOKEN"}
```

```json
{"type":"authenticate","method":"shared_token","token":"SHARED_TOKEN"}
```

The gateway MUST NOT accept subscriptions or emit domain events before replying
with `authenticated`. That response includes `reauthenticate_at`, an RFC 3339
timestamp before credential expiry. If the credential has no known expiry, this
member MAY be omitted.

Before `reauthenticate_at`, the client SHOULD obtain a new credential and send
another `authenticate` message on the existing connection. The server validates
it atomically and replies with a new `authenticated` message. The replacement
MUST use the same authentication method and resolve to the same `principal_id`
as the active credential; otherwise the server rejects it with
`reauthentication_identity_mismatch`. Changing method or principal requires a
new connection. Existing
subscriptions MUST remain active and event delivery MUST preserve order during
successful reauthentication. A rejected replacement MUST NOT invalidate the
previous credential before its original expiry; the server sends a retryable
`authentication_failed` error. Once the active credential expires, the server
MUST stop event delivery and close with `4401`.

If refreshed credentials remove a permission required by an active subscription,
the server sends `error` with code `permission_revoked` for that subscription and
removes it. Other authorized subscriptions remain active.

`principal_id` is an opaque, stable identifier in the `authenticated` response.
It MUST NOT contain credentials or directly identifying user data. Event cursor
scope uses this identifier so another principal cannot replay the cursor.

The gateway MUST close failed or initially unauthenticated sessions with code
`4401`; insufficient permission uses `4403`. Implementations SHOULD avoid
logging authentication-message payloads.
