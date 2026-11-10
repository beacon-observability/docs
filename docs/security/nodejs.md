---
sidebar_label: Node.js
sidebar_position: 3
title: Node.js Security
description: Enable Beacon Security through the Node.js ESM preload.
---

# Node.js Security

Beacon Node.js 2.0.2 includes Security in
`@beacon-observability/nodejs`. Applications normally install only that
complete package. Security requires Node.js 22.22.3+ or 24.11.1+ because it
uses synchronous module hooks for scoped source transformation.

## Enable Security

Use the ESM `--import` preload. The CommonJS `--require` preload still starts
normal telemetry and profiling but cannot activate Security transformation.

```bash
npm install @beacon-observability/nodejs@2.0.2

export NODE_OPTIONS="--import @beacon-observability/nodejs/register"
export BEACON_SECURITY_ENABLED=true
export BEACON_SECURITY_NODE_INCLUDE=/srv/app
export OTEL_SERVICE_NAME=orders
export OTEL_RESOURCE_ATTRIBUTES=service.namespace=shop
export OTEL_LOGS_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4318
node /srv/app/server.mjs
```

`BEACON_SECURITY_NODE_INCLUDE` selects application source roots. Package
dependencies, Node.js built-ins, and explicitly excluded roots are not
transformed.

## Findings and analysis

Per-request occurrences and request-specific attack evidence are available from
1.3.0; schema v2 is available from 2.0.0. This page uses 2.0.2, with
`occurrence_id` identifying the request occurrence. Detail sampling is independent
of occurrence export and trace sampling; empty evidence arrays may be omitted,
and sampling alone does not mean truncation. Online bodies have no cumulative
occurrence total; consumers aggregate received occurrences after deduplication.
See [Findings and evidence](findings.md) for `unknown`, `no_evidence`, `suspected`,
evidence upgrades, and delivery limits. No status guarantees successful exploitation.

SQL analysis defaults to `unknown`. Set `BEACON_SECURITY_ANALYSIS_SQL_DIALECT=ansi`
only for compatible SQL to enable the bounded lexical subset: quoted strings and
identifiers, doubled quote escapes, numbers, simple operators, and comments.
This is not a complete parser. Other dialects, backslash or dollar quoting,
unsupported syntax, imprecise taint, and inputs exceeding 8,192 UTF-16 code units or
64 taint marks remain `unknown`. Fixed bound values are separate from untrusted
templates assembled before preparation.

Shell analysis supports simple POSIX `sh`, `bash`, `dash`, `ksh`, and `zsh`
commands, quotes, escapes, and control separators. Expansion, redirection,
compound syntax, and other shells remain `unknown`. Ordinary argv and
fixed-destination path/query input are separate observations. Network allowlist
and filesystem-root policies are not implemented, so related boundary judgments
remain `unknown`; normalization does not establish safety. Byte strings are not
analyzed as a known textual dialect. See the
[version-pinned analysis reference](https://github.com/beacon-observability/beacon-nodejs/blob/v2.0.2/packages/security-nodejs/README.md).

### Exporting findings without attack evidence

2.0.2 excludes `no_evidence` findings from OpenTelemetry Logs and evidence
JSONL by default. Set `BEACON_SECURITY_EXPORT_NO_EVIDENCE_ENABLED=true` to restore
their export. `unknown` and `suspected` remain eligible, and SBOM is unaffected.
Filtering happens before queue admission and is not export loss; internal
detection, same-request deduplication, and upgrades still run. Local finding
snapshots and span summaries can retain excluded observations. `no_evidence`
is not a safety verdict, and an absent exported event does not prove no risk
was detected.

## Configuration reference

| Environment variable | Default | Purpose |
| --- | --- | --- |
| `BEACON_SECURITY_ENABLED` | `false` | Enables the Security lifecycle and runtime SBOM. |
| `BEACON_SECURITY_NODE_INCLUDE` | Empty | Selects application source roots for finding collection. |
| `BEACON_SECURITY_NODE_EXCLUDE` | Empty | Excludes source roots and takes precedence over include. |
| `BEACON_SECURITY_FINDINGS_SAMPLE_SECONDS` | `300` | Full-evidence interval per finding in seconds. |
| `BEACON_SECURITY_ANALYSIS_SQL_DIALECT` | `unknown` | `ansi` enables the supported SQL lexical subset. |
| `BEACON_SECURITY_EXPORT_NO_EVIDENCE_ENABLED` | `false` | Also export `no_evidence` events. |
| `BEACON_SECURITY_SBOM_ENABLED` | `true` | Collects runtime SBOM while Security is enabled. |
| `BEACON_SECURITY_LOCAL_OUTPUT_ENABLED` | `false` | Enables process-local diagnostic files. |
| `BEACON_SECURITY_OUTPUT` | `./beacon-security-output/<instance-id>` | Sets the diagnostic directory. |

Findings and SBOM records use the OpenTelemetry Logs pipeline. Local output is
diagnostic evidence and remains off by default.

## Kubernetes

Install the complete package in the application image and follow the
[version-pinned Deployment example](https://github.com/beacon-observability/beacon-nodejs/blob/v2.0.2/packages/security-nodejs/examples/kubernetes/deployment.yaml).
The normal application container only needs the ESM preload and environment
variables; no Security sidecar or init container is required.

Remove `BEACON_SECURITY_ENABLED` or set it to `false` to disable Security while
leaving normal zero-code telemetry active.
