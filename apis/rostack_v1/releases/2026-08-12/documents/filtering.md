# Standard Filtering

The `filter` query parameter is a percent-encoded JSON object conforming to
`../schemas/filter.schema.json`. Field names are RFC 6901 JSON Pointers into a
resource representation. Values are JSON literals and retain their JSON types.

## Operators

- `eq`, `ne`: equality and inequality.
- `gt`, `gte`, `lt`, `lte`: ordered comparison.
- `in`, `nin`: membership; operand MUST be an array.
- `contains`: string substring or array membership.
- `starts_with`, `ends_with`: string comparison.
- `exists`: field-presence test; operand MUST be boolean.

Implementations advertise the supported subset globally and per resource.

## Boolean Form

Field predicates in the same object are ANDed. Multiple operators on one field
are also ANDed. `$and`, `$or`, and `$not` provide explicit composition.

```json
{
  "$and": [
    {"/status": {"eq": "active"}},
    {"/temperature": {"gte": 20, "lt": 30}},
    {"$or": [
      {"/site": {"in": ["north", "west"]}},
      {"/priority": {"eq": true}}
    ]}
  ]
}
```

Comparisons MUST follow the type declared by the resource representation's JSON
Schema. There is no implicit conversion between strings, numbers, or booleans.
String operations are case-sensitive Unicode code-point comparisons unless the
resource advertises another collation in its description.

Filtering affects which records are returned, but does not alter their shape.
Use `fields` for projection. A server MUST evaluate authorization before
filtering and MUST NOT reveal inaccessible field values through errors.

For event subscriptions, predicates are evaluated against full authorized
resource state, not projected HTTP fields. The transition rules in
`websocket.md` determine whether pre-change state, post-change state, or both are
evaluated.
