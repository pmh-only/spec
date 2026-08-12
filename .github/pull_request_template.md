## Summary

Describe the problem and the smallest complete change.

Closes #

## Change Class

- [ ] Breaking
- [ ] Backward-compatible
- [ ] Editorial
- [ ] Repository-only

Explain the classification and who is affected:

## Release and Versioning

- Target API:
- Previous release:
- New release:
- Protocol/API version impact:
- Migration or deprecation plan:

## Contract Synchronization

- [ ] Normative documents are updated.
- [ ] Machine-readable specifications are updated.
- [ ] JSON Schemas or equivalent schemas are updated.
- [ ] Positive, negative, and edge-case examples are updated.
- [ ] Changelog and API indexes are updated.
- [ ] The new release is self-contained.
- [ ] No dated release already on the target branch was edited, moved, or deleted.
- [ ] Not applicable; this is repository-only. Explain below.

Not-applicable explanation:

## Security and Operations

Describe authentication, authorization, TLS, validation, replay, privacy,
performance, deployment, and connection-stability impact. Write "None" only with
a brief justification.

- [ ] I applied `docs/security-review.md`, or this change has no security-relevant trust boundary.
- [ ] This pull request contains no credentials, private vulnerability details, private endpoints, or sensitive production data.
- Threat model or security review link:
- Residual risks:

## Validation

List exact commands and results. Do not write only "tests pass."

```text
node scripts/build-pages.mjs
git diff --check
```

- [ ] Changed schemas compile and positive examples validate.
- [ ] Negative and edge cases were checked.
- [ ] OpenAPI, AsyncAPI, and other changed formats pass native validation.
- [ ] GitHub Pages builds and internal links resolve.

## Agent Disclosure

- Agent/tool used, or `None`:
- Human-provided requirements:
- Unresolved assumptions:
- Human reviewer for compatibility and security decisions:

## Reviewer Checklist

- [ ] The linked issue records the normative decision.
- [ ] Compatibility and migration claims are credible.
- [ ] Prose, schemas, specifications, and examples agree.
- [ ] Security boundaries are not weakened unintentionally.
- [ ] Validation evidence is reproducible.
