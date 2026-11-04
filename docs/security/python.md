---
sidebar_position: 2
title: Python Security
description: Enable Beacon Security through the existing beacon command.
---

# Python Security

Beacon Python 1.2.4 includes Security in the `beacon-otel` wheel. It supports
standard-GIL CPython 3.11 through 3.14 and uses the existing `beacon` command;
there is no separate Security distribution.

## Enable Security

Upgrade to 1.2.4 in the application's existing virtual environment first. Retain
the framework extras used by the application; if the optional `beacon-profiling`
package is installed, upgrade it to 1.2.4 as well:

```bash
pip install 'beacon-otel==1.2.4'
beacon --version
```

```bash
export BEACON_SECURITY_ENABLED=true
export BEACON_SECURITY_PYTHON_INCLUDE=orders
export OTEL_SERVICE_NAME=orders
export OTEL_RESOURCE_ATTRIBUTES=service.namespace=shop
export OTEL_LOGS_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4317
beacon uvicorn orders.asgi:application --host 0.0.0.0 --port 8000
```

`BEACON_SECURITY_PYTHON_INCLUDE` contains Python module prefixes, not file
paths. Without it, the enabled lifecycle can export the runtime SBOM but does
not transform application modules or produce modeled-flow findings.

## Findings and analysis

Per-request occurrences and request-specific attack evidence are available from
1.2.0; schema v2 is available from 1.2.3. This page uses 1.2.4, with
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
unsupported syntax, imprecise taint, and inputs exceeding 8,192 Unicode code points or
64 taint marks remain `unknown`. Fixed bound values are separate from untrusted
templates assembled before preparation.

Shell analysis supports simple POSIX `sh`, `bash`, `dash`, `ksh`, and `zsh`
commands, quotes, escapes, and control separators. Expansion, redirection,
compound syntax, and other shells remain `unknown`. Ordinary argv and
fixed-destination path/query input are separate observations. Network allowlist
and filesystem-root policies are not implemented, so related boundary judgments
remain `unknown`; normalization does not establish safety. Byte strings are not
analyzed as a known textual dialect. See the
[version-pinned analysis reference](https://github.com/beacon-observability/beacon-python/blob/v1.2.4/beacon-otel/README.md).

### Exporting findings without attack evidence

1.2.4 excludes `no_evidence` findings from OpenTelemetry Logs and evidence
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
| `BEACON_SECURITY_PYTHON_INCLUDE` | Empty | Selects application module prefixes for finding collection. |
| `BEACON_SECURITY_PYTHON_EXCLUDE` | Empty | Excludes module prefixes and takes precedence over include. |
| `BEACON_SECURITY_FINDINGS_SAMPLE_SECONDS` | `300` | Full-evidence interval per finding in seconds. |
| `BEACON_SECURITY_ANALYSIS_SQL_DIALECT` | `unknown` | `ansi` enables the supported SQL lexical subset. |
| `BEACON_SECURITY_EXPORT_NO_EVIDENCE_ENABLED` | `false` | Also export `no_evidence` events. |
| `BEACON_SECURITY_SBOM_ENABLED` | `true` | Collects runtime SBOM while Security is enabled. |
| `BEACON_SECURITY_LOCAL_OUTPUT_ENABLED` | `false` | Enables process-local diagnostic files. |
| `BEACON_SECURITY_OUTPUT` | `./beacon-security-output/<instance-id>` | Sets the diagnostic directory. |
| `BEACON_SECURITY_EVIDENCE_FILE` | Unset | Sets an optional diagnostic JSONL file. |

Findings and SBOM records use the OpenTelemetry Logs pipeline. Local output is
diagnostic evidence and remains off by default.

## Kubernetes and Gunicorn

Install `beacon-otel==1.2.4` in the application image and follow the
[version-pinned Deployment example](https://github.com/beacon-observability/beacon-python/blob/v1.2.4/beacon-otel/examples/kubernetes/deployment.yaml).
No Security sidecar or init container is needed.

Gunicorn must initialize telemetry after each worker fork. Use the release's
`beacon_security.gunicorn` configuration, do not prefix that command with
`beacon`, and do not enable `preload_app`.

Remove `BEACON_SECURITY_ENABLED` or set it to `false` to disable Security while
leaving normal zero-code telemetry active.
