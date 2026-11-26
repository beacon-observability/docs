---
sidebar_label: Java
sidebar_position: 1
title: Java Security
description: Enable Beacon Security in the complete Beacon Java Agent.
---

# Java Security

This guide uses Beacon Java 1.5.0. Security has been embedded in the complete
Agent JAR since 1.1.0. Keep the same `-javaagent` setup from the [Java zero-code guide](../zero-code/java.md); there
is no separate Security JAR to install or version.

## Enable Security

Before enabling Security, download the complete Agent JAR from the
[1.5.0 Release](https://github.com/beacon-observability/beacon-java/releases/tag/v1.5.0)
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

## SIEM output and upgrade {#siem-output-and-upgrade}

Java 1.5.0 changes the OpenTelemetry LogRecord string Body and evidence JSONL to
`beacon-security-siem-v1`. Update consumers when upgrading from 1.4.x or earlier;
there is no legacy-output switch. The fifteen base fields are required strings:

| Field | Finding | Runtime inventory |
| --- | --- | --- |
| `time` | Original `observed_at` | Original `observed_at` |
| `event_id` | Original `occurrence_id` | Deterministic inventory ID |
| `event_class` | `security_finding` | `software_inventory_info` |
| `source` | `beacon_security` | `beacon_security_sbom` |
| `service` | Resource `service.name`, or empty | Same |
| `tenant_id` | Resource `tenant.id`, or `default` | Same |
| `actor` | Empty | Empty |
| `ip` | Empty | Empty |
| `action` | Original `rule` | `inventory_snapshot` |
| `target` | Original `finding_id` | Process `instance_id` |
| `target_type` | `finding` | `process` |
| `outcome` | `unknown` | `success` for local collection |
| `status` | `info` | `info` |
| `severity` | `informational` | `informational` |
| `message` | Complete serialized v2 finding | Complete serialized v2 inventory part |

The envelope also requires `instance_id` and preserves available `trace_id`,
`span_id`, and numeric `trace_flags` (0–255, including zero). Missing trace fields
are omitted; inventories do not inherit request context. Within a finding's
`message`, `current_span_id` becomes `span_id` and `server_span_id` is removed.
The native LogRecord associates with the observed invocation span; an unavailable
invocation span is not replaced with a request-entry span.

Actor and client IP are not collected by this change. To set an application
provided tenant, add `tenant.id=customer-a` to `OTEL_RESOURCE_ATTRIBUTES`;
otherwise the emitted tenant is `default`. This field is not an authorization
boundary. `status=info` and `severity=informational` describe the log level,
not vulnerability severity. Read `attack_evidence.status` inside `message`
for `unknown`, `no_evidence`, or `suspected`.

For migration:

1. Parse the outer envelope, then parse `message` as JSON to access
   `schema_version`, `event_name`, attack evidence, and dependency multipart metadata.
2. Retain `message` exactly as received. It preserves the original serialized v2
   event at the export boundary, after existing evidence sampling and declared
   truncation. It cannot recover evidence that was never collected or was dropped.
   JSONL and OTLP use the same envelope; local diagnostic snapshots keep their formats.
3. Assemble inventories by embedded `instance_id + observed_at` and
   `part_index/part_count`; replace an inventory only after every part arrives.
4. Configure the receiving pipeline to bind envelope `source` to the intended
   measurement and `time` to event time, retaining `message` as the original payload.
   Upgrading the Agent does not deploy a receiving pipeline.

Final envelope bytes, including JSON escaping, count toward export limits.
Oversized envelopes can be dropped with local loss counters rather than silently
shortening `message`. The default `no_evidence` filter and fingerprint v1 remain
unchanged. See the [version-pinned SIEM reference](https://github.com/beacon-observability/beacon-java/blob/v1.5.0/extensions/security/SIEM.md)
and [envelope schema](https://github.com/beacon-observability/beacon-java/blob/v1.5.0/extensions/security/schema-siem-v1.json).

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
resolution. Java 1.5.0 has no network allowlist or filesystem-root policy;
boundary-dependent SSRF, executable-selection, and path judgments remain
`unknown`. Normalization does not establish safety. See the
[released analysis reference](https://github.com/beacon-observability/beacon-java/blob/v1.5.0/extensions/security/README.md#analysis-support-and-limits).

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

Place the released 1.5.0 Agent JAR in the application image or a mounted volume and load it with `JAVA_TOOL_OPTIONS=-javaagent:/path/to/beacon-javaagent.jar`. Container images are published separately; deploy an image whose JAR version and digest match your chosen release. Keep local output disabled for normal workloads.

Remove `BEACON_SECURITY_ENABLED` or set it to `false` to disable Security while
leaving normal zero-code telemetry active.
