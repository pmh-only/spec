# Repository Conventions

## Names

- API identifiers use lowercase kebab-case, for example `billing-api`.
- Release directories use ISO 8601 dates in `YYYY-MM-DD` form.
- Document and artifact names use lowercase kebab-case with an extension.
- Relative links are preferred so a release can be viewed independently.

## API Directory

Every `apis/<api-id>/README.md` describes the API, identifies its maintainers,
and indexes every release. Do not rely on a mutable `latest` directory or
symlink; mark the latest release in the index instead.

## Release Directory

Every release is self-contained:

- `README.md` records release metadata and links to its contents.
- `CHANGELOG.md` describes changes relative to the previous release.
- `documents/` contains the primary human-readable documentation.
- `specifications/` contains machine-readable API descriptions in any format.
- `schemas/` contains standalone data schemas used by documents or specs.
- `examples/` contains request, response, event, query, and usage examples.
- `assets/` contains images and other files embedded by documentation.

Directories that are not needed for a release may be removed. Add subdirectories
when a category contains multiple formats, such as `specifications/openapi/` and
`specifications/protobuf/`.

## Portability

A published release must not depend on files in another dated release. Shared
source material may be maintained elsewhere, but generated or copied artifacts
needed by consumers must be included in each release.
