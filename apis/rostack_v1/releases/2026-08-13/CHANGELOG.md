# Changelog

Changes relative to the `2026-08-12` release.

## Added

- Migration guidance for consumers that resolve or cache schemas by `$id`.
- A closed HTTP problem-type registry, WebSocket error-code registry, discovery
  declarations for supported errors, and a machine-readable HTTP problem schema.
- Requirements that implementation-owned schema `$id` values equal their
  advertised URLs and use origins controlled by the implementation.

## Changed

- Canonical JSON Schema identifiers now use the production specification origin
  `https://spec.pmh.codes/` instead of the reserved example origin.
- Protocol objects and implementation-owned schemas now reject undeclared object
  properties throughout their complete referenced schema graphs.
- Implementation-owned schemas use JSON Schema Draft 2020-12 and must be
  retrievable without resource credentials.
- Shared-token authentication scheme matching is explicitly case-insensitive as
  required by HTTP.

## Deprecated

- None.

## Removed

- Canonical identifiers under `https://spec.rostack.example/`.
- Implementation-defined HTTP problem types and WebSocket error codes.
- Implementation-owned schema identifiers under the specification origin.

## Fixed

- Canonical schema identifiers now resolve under the project documentation
  domain.
- Error behavior is now finite and discoverable before an operation is attempted.
