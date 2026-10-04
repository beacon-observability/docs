---
sidebar_position: 4
title: Security
description: Enable released Beacon Security runtimes and export findings and runtime SBOM records.
---

# Security

Beacon Security is an optional capability inside each language's normal
zero-code package. It is disabled by default and does not introduce a second
agent, wrapper command, or release lifecycle.

| Language | Released version | Runtime scope | Deployment |
| --- | --- | --- | --- |
| [Java](java.md) | 1.1.0 | The complete Java Agent | One Agent JAR |
| [Python](python.md) | 1.1.0 | Standard-GIL CPython 3.11–3.14 | The existing `beacon` command |
| [Node.js](nodejs.md) | 1.2.0 | Node.js 22.22.3+ or 24.11.1+ | The existing package with ESM preload |

When enabled, Security sends findings and runtime software inventory through
the application's OpenTelemetry Logs pipeline. Runtime SBOM collection is on
by default within the enabled Security lifecycle. Process-local diagnostic
files remain off unless explicitly enabled.

Findings describe bounded modeled-flow observations or candidate risks. They
are not confirmation that an application is vulnerable. Start with the guide
for the application's runtime and validate the exported Logs records before
rolling the configuration out broadly.

.NET and PHP do not currently have a released Beacon Security capability.
