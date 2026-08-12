# Contributing

Contributions from people and automated agents are welcome. Specification work
has a higher compatibility burden than ordinary documentation changes, so every
change must follow the [specification modification protocol](docs/specification-modification-protocol.md).
Participation also requires following the [Code of Conduct](CODE_OF_CONDUCT.md).
Report vulnerabilities according to [SECURITY.md](SECURITY.md), never through a
public issue or pull request.

## Before Changing Files

1. Search existing issues and releases for the same problem.
2. Open a specification change proposal for new behavior, changed behavior, or
   deprecation. Open a defect report for contradictions, ambiguity, or incorrect
   artifacts.
3. Agree on scope and compatibility before implementation when the change affects
   normative behavior.
4. Do not edit a dated release already published on `main`. Create a new dated
   release as described by the protocol.
5. For security-sensitive changes, complete the
   [specification security review](docs/security-review.md) before implementation.

Small repository-only changes, such as CI, templates, or site styling, may go
directly to a pull request when they do not alter a published specification.

## Pull Requests

- Keep one logical specification change per pull request.
- Link the governing issue with `Closes #<issue>` or explain why no issue is
  needed.
- Complete every applicable section of the pull request template.
- State whether the change is breaking, backward-compatible, editorial, or
  repository-only.
- Include migration guidance for breaking changes.
- Keep normative prose, schemas, OpenAPI, AsyncAPI, examples, indexes, and
  changelogs synchronized.
- Do not include generated `_site/` output.

## Validation

At minimum, run:

```sh
node scripts/build-pages.mjs
git diff --check
```

Validate changed JSON Schemas, examples, OpenAPI, AsyncAPI, and any additional
formats with their native tools. Record exact commands and outcomes in the pull
request. The GitHub Pages workflow verifies the site and links but does not
replace format-specific contract validation.

## Automated Agents

Agents must also follow `AGENTS.md`. A human remains accountable for the final
protocol decision and merge. Agent-generated changes must identify themselves in
the pull request and provide the same rationale, compatibility analysis, and
validation evidence required from human contributors.
