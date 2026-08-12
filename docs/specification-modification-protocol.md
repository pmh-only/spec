# Specification Modification Protocol

This protocol governs changes to API documents, schemas, machine-readable
specifications, examples, and release metadata. It applies equally to human and
automated contributors.

## Principles

- Published dated releases are immutable and reproducible.
- Normative prose and machine-readable artifacts form one contract.
- Compatibility is an explicit decision, not an inference from a date.
- Security and interoperability requirements require human accountability.
- Every normative change is traceable to rationale, review, and validation.

## Change Classes

Choose exactly one primary class:

| Class | Meaning | Release requirement |
| --- | --- | --- |
| Breaking | Existing conforming clients or servers may fail or change behavior | New dated release and migration guidance; change protocol/API version when required |
| Backward-compatible | Adds optional behavior without invalidating existing conforming behavior | New dated release |
| Editorial | Clarifies wording without changing observable requirements | New dated release if published content is affected |
| Repository-only | Changes tooling, templates, CI, or site presentation without changing an API contract | No API release required |

A correction that changes what an implementation must do is not editorial. It is
breaking or backward-compatible based on its effect on existing conforming
implementations.

## Proposal

Normative changes begin with a specification change issue. The proposal must
state:

- the problem and affected API/release;
- proposed observable behavior;
- compatibility class and affected clients, servers, and operators;
- security, privacy, performance, and operational impact;
- migration or rollout plan;
- alternatives considered;
- acceptance and validation criteria.

Security-sensitive proposals must apply the
[specification security review](security-review.md). Public proposals must omit
exploitable details until coordinated disclosure permits publication.

Defects and ambiguities use the defect form. If resolving a defect changes
observable behavior, convert or link it to a change proposal before merging.

## Decision

At least one accountable human maintainer must approve normative behavior,
compatibility classification, and security-sensitive decisions. Automated agents
may analyze, draft, and validate changes but cannot supply this approval.

The decision and rejected alternatives should remain in the issue or linked pull
request. Unresolved interoperability questions block merging.

## Implementation

For any change to a release already on the target branch:

1. Copy the latest complete release to a new UTC `YYYY-MM-DD` directory.
2. Change only the new release. Never patch the old release in place.
3. Set `Previous release` and compatibility metadata in the new release README.
4. Update the new release changelog with observable additions, changes,
   deprecations, removals, and fixes.
5. Update the API release index and `apis/README.md` latest-release link.
6. Update every affected representation of the contract: normative documents,
   JSON Schemas, OpenAPI, AsyncAPI, examples, and validation notes.
7. Keep the release self-contained; do not link to artifacts in another release.

If one calendar date would contain multiple releases, consolidate them or defer
the later publication according to `docs/versioning.md`.

## Compatibility Rules

The following normally require a breaking classification:

- removing or renaming resources, fields, events, representations, permissions,
  authentication methods, filters, or operations;
- making an optional member required;
- narrowing accepted values or changing types, defaults, ordering, timing, cursor
  scope, delivery guarantees, or error behavior;
- changing security or authorization semantics;
- reinterpreting an existing message or field.

Additions are backward-compatible only when old implementations can ignore them
and the existing schema permits them. When the protocol identifier or an
implementation API version must change, follow the target API's versioning
document and include migration guidance.

## Validation Evidence

A pull request must record:

- exact validation commands and pass/fail results;
- schema validation of positive examples;
- negative or edge-case coverage for changed constraints;
- OpenAPI, AsyncAPI, and other native format validation;
- internal link and GitHub Pages build results;
- compatibility and security review outcomes.

At minimum, the repository site must build with `node scripts/build-pages.mjs`
and `git diff --check` must pass. Validation failures must be fixed or explicitly
documented as merge blockers; they must not be silently ignored.

## Review and Merge

Reviewers verify that:

- the issue decision matches the implementation;
- old dated releases are unchanged;
- compatibility and migration claims are credible;
- prose and machine contracts agree;
- examples demonstrate the changed behavior;
- security boundaries are not weakened unintentionally;
- required validation evidence is present.

The pull request uses squash, merge, or rebase according to maintainer preference,
but its final history must retain the issue link and change summary. Publishing
occurs only after merge to the protected default branch and successful Pages
deployment.

## Emergency Security Changes

Follow `SECURITY.md`. Do not disclose exploitable details in a public issue,
pull request, branch, build log, or agent transcript. A security fix still
receives a new dated release, compatibility analysis, security review, and
validation, but proposal and review details may remain private until coordinated
disclosure. Public release notes should identify affected releases and actionable
mitigations without exposing secrets or unnecessary exploit detail.
