# WebSocket Exchange

```json
{"type":"authenticate","method":"shared_token","token":"SHARED_TOKEN"}
```

```json
{"type":"authenticated","method":"shared_token","protocol_version":"rostack_v1","api_version":"2026-08","principal_id":"service-monitor-7","reauthenticate_at":"2026-08-12T15:25:00Z"}
```

```json
{"type":"subscribe","subscription_id":"sub-1","resource":"observations","event_types":["observation.created","observation.updated"],"filter":{"/station_id":{"eq":"north-1"}},"event_encoding":"compact-json"}
```

```json
{"type":"subscribed","subscription_id":"sub-1","event_encoding":"compact-json","replaying":false}
```

```json
["e","sub-1","evt-01K2E4M6","opaque-42",1786545000000,"observation.updated","obs-983","rev-7"]
```

After fully processing the event, the client persists `opaque-42`. Before
credential expiry it reauthenticates without interrupting the subscription:

```json
{"type":"authenticate","method":"shared_token","token":"REFRESHED_SHARED_TOKEN"}
```

```json
{"type":"authenticated","method":"shared_token","protocol_version":"rostack_v1","api_version":"2026-08","principal_id":"service-monitor-7","reauthenticate_at":"2026-08-12T16:25:00Z"}
```

After a later disconnect, the client reconnects, authenticates, and restores the
same subscription from its processed cursor:

```json
{"type":"subscribe","subscription_id":"sub-1","resource":"observations","event_types":["observation.created","observation.updated"],"filter":{"/station_id":{"eq":"north-1"}},"cursor":"opaque-42","event_encoding":"compact-json"}
```

```json
{"type":"subscribed","subscription_id":"sub-1","event_encoding":"compact-json","replaying":true}
```

After zero or more replayed events:

```json
{"type":"replay_complete","subscription_id":"sub-1"}
```
