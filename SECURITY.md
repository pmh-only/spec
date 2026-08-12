# Security Policy

## Scope

This repository publishes API specifications, schemas, examples, and supporting
site tooling. Security reports are in scope when they concern:

- a protocol design that enables authentication, authorization, confidentiality,
  integrity, replay, privacy, or availability failures;
- contradictory or ambiguous requirements that can cause insecure interoperable
  behavior;
- machine-readable artifacts that weaken or misrepresent normative security
  requirements;
- repository automation or Pages content that can compromise contributors or
  consumers;
- exposed credentials, private endpoints, sensitive production data, or malicious
  content committed to this repository.

Vulnerabilities in a product that implements a specification, but do not result
from the specification itself, should be reported privately to that product's
maintainer. This project cannot coordinate fixes for independent implementations.

## Supported Specification Releases

Published dated releases are immutable. The latest release marked `Current` in
each API's release index receives security analysis and, when necessary, a new
corrective dated release. Older releases remain available for reproducibility but
normally receive no corrections in place.

| Release status | Security handling |
| --- | --- |
| Current | Analyzed; corrections are published as a new dated release |
| Deprecated | Assessed when the issue also affects a current release or migration |
| Retired | Retained for reference; consumers should migrate |

A security correction can be breaking. The new release must state compatibility,
migration impact, and affected prior releases.

## Report Privately

Use [GitHub private vulnerability reporting](https://github.com/pmh-only/spec/security/advisories/new).
Do not open a public issue, pull request, discussion, or commit containing
exploitable details, credentials, proof-of-concept attacks, private endpoints, or
sensitive data.

If private vulnerability reporting is unavailable, contact a repository
maintainer through a private method listed on their GitHub profile. If no private
channel is available, report only that a private contact is needed; do not include
vulnerability details publicly.

Include when available:

- affected API, release, files, and sections;
- vulnerability class and violated security property;
- prerequisites, threat actor, trust boundary, and affected parties;
- minimal reproduction or protocol exchange with secrets and personal data
  removed;
- expected and observed behavior;
- impact, likely severity, and affected implementations;
- suggested mitigation or specification wording;
- whether the issue is known publicly and any disclosure deadline.

Use synthetic credentials and data. Do not test against systems without explicit
authorization.

## Response and Disclosure

Maintainers will make a best effort to:

1. acknowledge the report and establish a private communication channel;
2. determine whether the issue belongs to this specification or an independent
   implementation;
3. assess affected releases, compatibility, severity, and immediate mitigations;
4. coordinate a corrective dated release and implementation guidance when needed;
5. agree on disclosure timing with the reporter and affected maintainers;
6. publish an advisory or release notes after mitigations are available.

Response and remediation times depend on maintainer availability and issue
complexity; this policy does not promise a fixed service-level agreement. Please
avoid public disclosure while active coordination is making reasonable progress.
Maintainers may request earlier disclosure when exploitation is active or users
need immediate mitigation.

Credit is offered when requested and legally possible. Reporters may remain
anonymous. Good-faith reports, research, and accidental findings are welcome;
this policy does not authorize access to third-party systems or data.

## Handling Sensitive Material

- Restrict report access to people needed for triage and remediation.
- Do not paste report details into public agent prompts, logs, issues, or CI output.
- Do not commit live secrets, even temporarily. Revoke exposed credentials before
  removing them from current content and assess whether history must be cleaned.
- Use placeholders in examples and sanitize packet captures, URLs, identifiers,
  and metadata.
- Coordinate public wording so it gives consumers actionable mitigation without
  unnecessarily increasing exploitation risk before fixes are available.

Security fixes follow the
[specification modification protocol](docs/specification-modification-protocol.md)
except that issue discussion and review may remain private until coordinated
disclosure.
