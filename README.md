# Versioned API Specifications

This repository contains documentation and specification artifacts for multiple,
independently released APIs. Releases use calendar dates and are immutable once
published.

The documentation site and canonical specification origin are available at
[spec.pmh.codes](https://spec.pmh.codes/). Repository content is licensed under
the [MIT License](LICENSE).

## Layout

```text
.
|-- apis/
|   `-- <api-id>/
|       |-- README.md
|       `-- releases/
|           `-- YYYY-MM-DD/
|               |-- README.md
|               |-- CHANGELOG.md
|               |-- documents/
|               |-- specifications/
|               |-- schemas/
|               |-- examples/
|               `-- assets/
|-- docs/
|   |-- repository-conventions.md
|   `-- versioning.md
`-- templates/
    `-- api/
```

`documents/` is the primary, human-readable API documentation. The remaining
release directories support any machine-readable format, including OpenAPI,
AsyncAPI, GraphQL SDL, JSON Schema, Protocol Buffers, XML, and format-specific
examples.

## Add an API

1. Copy `templates/api/` to `apis/<api-id>/`.
2. Replace template placeholders and list the API in `apis/README.md`.
3. Rename `releases/YYYY-MM-DD/` to the API's first release date.
4. Add documentation and any supporting specification artifacts.

See `docs/repository-conventions.md` and `docs/versioning.md` before publishing.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) and the
[specification modification protocol](docs/specification-modification-protocol.md)
before proposing or implementing changes. Published dated releases are immutable;
corrections and protocol changes are published as new releases.
All project participation is governed by the [Code of Conduct](CODE_OF_CONDUCT.md).
Report vulnerabilities privately using the process in [SECURITY.md](SECURITY.md).

## Documentation Site

GitHub Pages publishes the entire repository as a searchable documentation site:

- Markdown files render as documentation pages.
- JSON and YAML artifacts have syntax-highlighted source pages and raw downloads.
- Navigation is generated from API and dated release directories.
- Templates are included for implementers creating new APIs.

Build the site locally with:

```sh
node scripts/build-pages.mjs
npx --yes serve _site
```

The generated `_site/` directory is ignored by Git. Pushes to `main` deploy with
`.github/workflows/pages.yml`; pull requests run the same build and broken-link
validation without deploying. In the repository settings, configure Pages to use
**GitHub Actions** as its source.
