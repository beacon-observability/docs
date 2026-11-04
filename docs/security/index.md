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
| [Java](java.md) | [1.3.4](https://github.com/beacon-observability/beacon-java/releases/tag/v1.3.4) | The complete Java Agent | One Agent JAR |
| [Python](python.md) | [1.2.4](https://github.com/beacon-observability/beacon-python/releases/tag/v1.2.4) | Standard-GIL CPython 3.11–3.14 | The existing `beacon` command |
| [Node.js](nodejs.md) | [2.0.1](https://github.com/beacon-observability/beacon-nodejs/releases/tag/v2.0.1) | Node.js 22.22.3+ or 24.11.1+ | The existing package with ESM preload |

When enabled, Security sends findings and runtime software inventory through
the application's OpenTelemetry Logs pipeline. Runtime SBOM collection is on
by default within the enabled Security lifecycle. Process-local diagnostic
files remain off unless explicitly enabled.

Findings describe bounded modeled-flow observations or candidate risks. They
are not confirmation that an application is vulnerable. Start with the guide
for the application's runtime and validate the exported Logs records before
rolling the configuration out broadly.

## Finding export policy {#finding-export-policy}

Java 1.3.4, Python 1.2.4, and Node.js 2.0.1 exclude findings classified as `attack_evidence.status=no_evidence` from OpenTelemetry Logs and evidence JSONL by default. To diagnose ordinary modeled flows or restore the previous export behavior, enable:

```bash
export BEACON_SECURITY_EXPORT_NO_EVIDENCE_ENABLED=true
```

The default is `false`. `no_evidence` means supported analysis found no exploitation evidence; it is not a safety verdict and does not mean no modeled flow exists. `unknown` retains analysis uncertainty, while `suspected` records supported syntax-control evidence. Both remain eligible for export, and neither alone confirms successful exploitation.

Filtering happens before queue admission, consumes no queue or export-rate budget, and does not count as export loss. Internal detection, request deduplication, same-request evidence upgrades, local finding snapshots, and span summaries remain available. SBOM inventories are unchanged. Analysis coverage still differs by language; this shared export policy does not imply identical detection coverage.

.NET and PHP do not currently have a released Beacon Security capability.
