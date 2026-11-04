---
sidebar_position: 1
title: Java Security
description: Enable Beacon Security in the complete Beacon Java Agent.
---

# Java Security

This guide uses Beacon Java 1.3.3. Security has been embedded in the complete
Agent JAR since 1.1.0. Keep the same `-javaagent` setup from the [Java zero-code guide](../zero-code/java.md); there
is no separate Security JAR to install or version.

## Enable Security

Before enabling Security, download the complete Agent JAR from the
[1.3.3 Release](https://github.com/beacon-observability/beacon-java/releases/tag/v1.3.3)
and name it `beacon-javaagent.jar`.

```bash
export BEACON_SECURITY_ENABLED=true
export OTEL_SERVICE_NAME=orders
export OTEL_RESOURCE_ATTRIBUTES=service.namespace=shop
export OTEL_LOGS_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4318
java -javaagent:./beacon-javaagent.jar -jar orders.jar
```

The Agent exports findings and runtime dependency inventories through
OpenTelemetry Logs. Local CycloneDX files require explicit diagnostic output.
Security is disabled by default. Findings are modeled runtime observations or candidate risks rather than confirmed vulnerabilities.

## Findings and analysis

[Java 1.3.0](https://github.com/beacon-observability/beacon-java/releases/tag/v1.3.0)
introduced per-request occurrences and request-specific attack evidence.
[Java 1.3.3](https://github.com/beacon-observability/beacon-java/releases/tag/v1.3.3)
uses schema v2: `occurrence_id` replaces `evidence_id`, online cumulative counts
are removed, and empty evidence arrays can be omitted. See
[Findings and evidence](findings.md) for the Java 1.3.0 A/B/C example, v1 fields,
v2 migration, status meanings, and delivery limits. Occurrence export, detailed
evidence sampling, and OpenTelemetry trace sampling are independent.

SQL analysis is opt-in. Set `BEACON_SECURITY_ANALYSIS_SQL_DIALECT=ansi` only for
compatible SQL; the default is `unknown`. The bounded lexical subset supports
single-quoted strings, doubled quote escapes, quoted identifiers, decimal
numbers, operators, parentheses, and comments. It is not a complete SQL parser
or keyword detector. Backslash escapes, dollar quoting, backticks, bracket
quoting, incomplete quotes, and tainted identifiers alone remain `unknown`.
Fixed templates with separately bound values differ from untrusted SQL assembled
before preparation; normal bound values do not create SQL-template findings.

Shell analysis supports simple POSIX scripts passed as a separate argument to
`sh`, `bash`, `dash`, `ksh`, or `zsh`, including quotes, escapes, and control
separators. Expansions, substitutions, redirections, compound syntax, Windows
shells, and scripts reconstructed from `Runtime.exec(String)` remain `unknown`.
Ordinary argv input is not classified as shell injection; application-specific
argument risks remain possible.

Analysis is limited to 8,192 UTF-16 code units and 64 exact taint ranges.
Unsupported inputs, imprecise ranges, and exhausted budgets retain uncertainty.
There is no exploit replay, network probing, JDBC metadata lookup, or filesystem
resolution. Java 1.3.3 has no network allowlist or filesystem-root policy;
boundary-dependent SSRF, executable-selection, and path judgments remain
`unknown`. Normalization does not establish safety. See the
[released analysis reference](https://github.com/beacon-observability/beacon-java/blob/v1.3.3/extensions/security/README.md#analysis-support-and-limits).

## Configuration reference

| Environment variable | Default | Purpose |
| --- | --- | --- |
| `BEACON_SECURITY_ENABLED` | `false` | Enables the Security lifecycle and runtime observation. |
| `BEACON_SECURITY_SBOM_ENABLED` | `true` | Collects runtime SBOM while Security is enabled. |
| `BEACON_SECURITY_LOCAL_OUTPUT_ENABLED` | `false` | Enables process-local diagnostic snapshots. |
| `BEACON_SECURITY_OUTPUT` | `./beacon-security-output/<instance-id>` | Sets the diagnostic snapshot directory. |
| `BEACON_SECURITY_FINDINGS_SAMPLE_SECONDS` | `300` | Full-evidence interval per finding in seconds; does not control occurrence or trace sampling. |
| `BEACON_SECURITY_ANALYSIS_SQL_DIALECT` | `unknown` | Set to `ansi` for the supported SQL lexical subset. |
| `BEACON_SECURITY_EVIDENCE_FILE` | Unset | Sets an optional diagnostic JSONL file. |

Normal OpenTelemetry variables configure resource identity, transport, and
authentication. Local output is for diagnosis only and is not durable or
cluster-wide delivery.

## Kubernetes

Put this guide's released Agent JAR in the application image, or build a private
init image and use the
[version-pinned initContainer example](https://github.com/beacon-observability/beacon-java/blob/v1.3.3/extensions/security/examples/kubernetes/init-container.yaml).
The init container copies the same complete Agent JAR into an `emptyDir`; the
application enables it with `JAVA_TOOL_OPTIONS`. Keep local output disabled for
normal workloads.

Remove `BEACON_SECURITY_ENABLED` or set it to `false` to disable Security while
leaving normal zero-code telemetry active.
