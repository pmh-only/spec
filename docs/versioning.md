# Date-Based Versioning

Each API is released independently under
`apis/<api-id>/releases/YYYY-MM-DD/`.

## Rules

1. Use the publication date, in UTC, as the release identifier.
2. If an API publishes more than once on a date, publish one consolidated
   release or defer the later release to a new date.
3. Treat a published release as immutable. Corrections require a new dated
   release so existing links remain reproducible.
4. Record behavioral, documentation, schema, and artifact changes in the new
   release's `CHANGELOG.md`.
5. Keep all historical release directories.
6. Mark compatibility and deprecation status explicitly in the release README;
   a date alone does not communicate semantic compatibility.

Before publishing, verify internal links, validate each machine-readable format
with its native tooling, and update both the API index and `apis/README.md`.
