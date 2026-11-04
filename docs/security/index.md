---
sidebar_position: 4
title: Security
description: Enable released Beacon Security runtimes and export findings and runtime SBOM records.
---

# Security

Beacon Security is an optional capability inside each language's normal
zero-code package. It is disabled by default and does not introduce a second
agent, wrapper command, or release lifecycle.

| Language | Version used by this guide | Runtime scope | Deployment |
| --- | --- | --- | --- |
| [Java](java.md) | 1.3.3 | The complete Java Agent | One Agent JAR |
| [Python](python.md) | 1.2.4 | Standard-GIL CPython 3.11–3.14 | The existing `beacon` command |
| [Node.js](nodejs.md) | 2.0.1 | Node.js 22.22.3+ or 24.11.1+ | The existing package with ESM preload |
| [PHP](php.md) | 1.3.0, experimental | PHP 8.2–8.4, Linux glibc x86_64 validated | The existing installer and Agent runtime |

When enabled, Security sends findings and runtime software inventory through
the application's OpenTelemetry Logs pipeline. Runtime SBOM collection is on
by default within the enabled Security lifecycle. Process-local diagnostic
files remain off unless explicitly enabled.

Findings describe bounded modeled-flow observations or candidate risks. They
are not confirmation that an application is vulnerable. Start with the guide
for the application's runtime and validate the exported Logs records before
rolling the configuration out broadly.

.NET does not currently have a released Beacon Security capability.

## Interpret findings

See [Findings and evidence](findings.md) for code risk, request attack evidence,
unassessed outcomes, per-request counts, trace correlation, and evidence sampling.
It lists minimum Java, Node.js, and Python versions and schema v1/v2 differences;
these do not imply PHP parity. Node.js 2.0.1 and Python 1.2.4 filter `no_evidence`
events by default, so an absent event does not mean no risk was detected.
