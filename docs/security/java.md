---
sidebar_label: Java
sidebar_position: 1
title: Java Security
description: Enable Beacon Security in the complete Beacon Java Agent.
---

# Java Security

This guide uses Beacon Java 1.5.1. Security has been embedded in the complete
Agent JAR since 1.1.0. Keep the same `-javaagent` setup from the [Java zero-code guide](../zero-code/java.md); there
is no separate Security JAR to install or version.

## Enable Security

Before enabling Security, download the complete Agent JAR from the
[1.5.1 Release](https://github.com/beacon-observability/beacon-java/releases/tag/v1.5.1)
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

## Native log output and migration

[Java 1.5.1](https://github.com/beacon-observability/beacon-java/releases/tag/v1.5.1)
exports one compact, single-line JSON object directly as the OTel LogRecord Body.
There is no SIEM envelope or `message` wrapper. `schema_version=2` remains at the
Body top level; fingerprint v1, detection, sampling, and the default `no_evidence`
filter are unchanged.

| Information | 1.5.1 transmitted location |
| --- | --- |
| Event time, formerly logical `observed_at` | Native `time_unix_nano`, epoch nanoseconds; omitted from Body |
| Finding occurrence ID, formerly `occurrence_id` | LogRecord `attributes.event_id`; omitted from Body |
| Stable finding ID | Body `finding_id` |
| Inventory event ID | LogRecord `attributes.event_id`, deterministic per collection round and part |
| Source | Existing Body `source` and LogRecord `attributes.source` |

Parse Body once for all remaining fields, including request/sink context, attack
evidence, dependencies, process identity, and available trace/span context.
`event_id` is the same logical occurrence value, not a new ID and not a Resource
or service-instance ID. Event time retains available precision up to nanoseconds,
remains stable across queued export, and is not replaced by flush time. Invalid
or out-of-range timestamps fail export explicitly.

Assemble inventory using Body `instance_id`, native event time, and Body
`part_index`/`part_count`. Parts of a collection share event time; an incomplete
round must not clear prior completed inventory. Preserve the supplied inventory
ID rather than recomputing it from a reformatted time string. `started_at` and
`uptime_ms` retain their separate process-start/uptime meanings.

Body limits and inventory splitting use final compact UTF-8 Body bytes, without
SIEM double-escaping overhead. Native metadata also counts toward whole-record
transport limits. Local evidence JSONL is a file-only logical record containing
`time_unix_nano` as a decimal string, the exact online Body string in `body`, and
LogRecord `attributes`. This wrapper is never sent as the OTLP Body. A Body-only
archive cannot recover the moved time or occurrence ID.

### Historical 1.5.0 SIEM output {#siem-output-and-upgrade}

Coordinate Agent and receiver/file-decoder upgrades. Java 1.5.0 emitted SIEM
records with evidence inside `message`; older complete v2 records included
`observed_at` and `occurrence_id` in Body. Historical records keep their original
decoder. For rollback, reinstall the chosen version and restore its matching
decoder. The historical [1.5.0 SIEM reference](https://github.com/beacon-observability/beacon-java/blob/v1.5.0/extensions/security/SIEM.md) describes that format. See the [released log binding](https://github.com/beacon-observability/beacon-java/blob/v1.5.1/extensions/security/LOG-OUTPUT.md)
and [bound-Body schema](https://github.com/beacon-observability/beacon-java/blob/v1.5.1/extensions/security/schema-log-body-v1.json).

## Findings and analysis

[Java 1.3.0](https://github.com/beacon-observability/beacon-java/releases/tag/v1.3.0)
introduced per-request occurrences and request-specific attack evidence.
[Java 1.3.3](https://github.com/beacon-observability/beacon-java/releases/tag/v1.3.3)
introduced schema v2: logical `occurrence_id` replaces `evidence_id`, online
cumulative counts are removed, and empty evidence arrays can be omitted. In
1.5.1, that occurrence value is transmitted only as LogRecord
`attributes.event_id`, as described above. See
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
resolution. Java 1.5.1 has no network allowlist or filesystem-root policy;
boundary-dependent SSRF, executable-selection, and path judgments remain
`unknown`. Normalization does not establish safety. See the
[released analysis reference](https://github.com/beacon-observability/beacon-java/blob/v1.5.1/extensions/security/README.md#analysis-support-and-limits).

## Configuration reference

| Environment variable | Default | Purpose |
| --- | --- | --- |
| `BEACON_SECURITY_ENABLED` | `false` | Enables the Security lifecycle and runtime observation. |
| `BEACON_SECURITY_EXPORT_NO_EVIDENCE_ENABLED` | `false` | Exports findings classified as `attack_evidence.status=no_evidence` when set to `true`. |
| `BEACON_SECURITY_SBOM_ENABLED` | `true` | Collects runtime SBOM while Security is enabled. |
| `BEACON_SECURITY_LOCAL_OUTPUT_ENABLED` | `false` | Enables process-local diagnostic snapshots. |
| `BEACON_SECURITY_OUTPUT` | `./beacon-security-output/<instance-id>` | Sets the diagnostic snapshot directory. |
| `BEACON_SECURITY_FINDINGS_SAMPLE_SECONDS` | `300` | Full-evidence interval per finding in seconds; does not control occurrence or trace sampling. |
| `BEACON_SECURITY_ANALYSIS_SQL_DIALECT` | `unknown` | Set to `ansi` for the supported SQL lexical subset. |
| `BEACON_SECURITY_EVIDENCE_FILE` | Unset | Sets an optional diagnostic JSONL file. |

Normal OpenTelemetry variables configure resource identity, transport, and
authentication. Local output is for diagnosis only and is not durable or
cluster-wide delivery.

## Finding export policy

Findings classified as `attack_evidence.status=no_evidence` are not exported by default. `unknown`, `suspected`, and SBOM records remain eligible for export. Set `BEACON_SECURITY_EXPORT_NO_EVIDENCE_ENABLED=true` to restore the previous behavior. The switch controls OpenTelemetry Logs and evidence JSONL; internal detection, local finding snapshots, span summaries, and same-request evidence upgrades remain available. See the [shared export policy](index.md#finding-export-policy).

Java also accepts `-Dbeacon.security.export.no-evidence.enabled=true`; put the JVM option before `-jar`.

## Kubernetes

Place the released 1.5.1 Agent JAR in the application image or a mounted volume and load it with `JAVA_TOOL_OPTIONS=-javaagent:/path/to/beacon-javaagent.jar`. Container images are published separately; deploy an image whose JAR version and digest match your chosen release. Keep local output disabled for normal workloads.

Remove `BEACON_SECURITY_ENABLED` or set it to `false` to disable Security while
leaving normal zero-code telemetry active.
