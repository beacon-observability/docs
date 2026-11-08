---
sidebar_position: 4
title: Security
description: Enable released Beacon Security runtimes and export findings and runtime SBOM records.
---

# Security

Beacon Security is an optional capability inside the normal zero-code packages
for Java, Python, Node.js, .NET and PHP. Ruby distributes an opt-in gem with
explicit Rack/SDK setup. Security is disabled by default.

| Language | Version used by this guide | Runtime scope | Deployment |
| --- | --- | --- | --- |
| [Java](java.md) | [1.3.4](https://github.com/beacon-observability/beacon-java/releases/tag/v1.3.4) | The complete Java Agent | One Agent JAR |
| [Python](python.md) | [1.2.4](https://github.com/beacon-observability/beacon-python/releases/tag/v1.2.4) | Standard-GIL CPython 3.11–3.14 | The existing `beacon` command |
| [Node.js](nodejs.md) | [2.0.2](https://github.com/beacon-observability/beacon-nodejs/releases/tag/v2.0.2) | Node.js 22.22.3+ or 24.11.1+ | The existing package with ESM preload |
| [.NET](dotnet.md) | 1.1.1, experimental | CoreCLR .NET 8–10: Linux glibc x64, Windows x64, macOS ARM64 | The existing `beacon-dotnet run` command |
| [PHP](php.md) | 1.3.0, experimental | PHP 8.2–8.4, Linux glibc x86_64 validated | The existing installer and Agent runtime |
| [Ruby](ruby.md) | 1.1.0 / gem 0.1.0 | Linux CRuby 3.3/3.4/4.0 CI; 3.3.12 Collector acceptance | GitHub gem and Rack middleware |

When enabled, Security sends findings and runtime software inventory through
the application's OpenTelemetry Logs pipeline. Runtime SBOM collection is on
by default within the enabled Security lifecycle. Process-local diagnostic
files remain off unless explicitly enabled.

Findings describe bounded modeled-flow observations or candidate risks. They
are not confirmation that an application is vulnerable. Start with the guide
for the application's runtime and validate the exported Logs records before
rolling the configuration out broadly.

## Interpret findings

See [Findings and evidence](findings.md) for code risk, request attack evidence,
unassessed outcomes, per-request counts, trace correlation, and evidence sampling.
It lists minimum Java, Node.js, and Python versions and schema v1/v2 differences;
these do not imply PHP, .NET or Ruby parity. See [.NET Security](dotnet.md) for
its released scope. Ruby v2 findings always retain unknown attack evidence and
approximate correlation; see [Ruby Security](ruby.md) for its coverage.

## Finding export policy {#finding-export-policy}

Java 1.3.4, Node.js 2.0.2, and Python 1.2.4 filter `no_evidence` events by default, so an absent event does not mean no risk was detected. Set `BEACON_SECURITY_EXPORT_NO_EVIDENCE_ENABLED=true` to include them; the default is `false`. See [Findings and evidence](findings.md) for status meanings, same-request upgrades, and delivery limits.
