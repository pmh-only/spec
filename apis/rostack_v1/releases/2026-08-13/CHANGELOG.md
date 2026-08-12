# Changelog

Changes relative to the `2026-08-12` release.

## Added

- Migration guidance for consumers that resolve or cache schemas by `$id`.

## Changed

- Canonical JSON Schema identifiers now use the production specification origin
  `https://spec.pmh.codes/` instead of the reserved example origin.

## Deprecated

- None.

## Removed

- Canonical identifiers under `https://spec.rostack.example/`.

## Fixed

- Canonical schema identifiers now resolve under the project documentation
  domain.
