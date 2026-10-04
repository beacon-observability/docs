---
sidebar_position: 2
title: Python Security
description: Enable Beacon Security through the existing beacon command.
---

# Python Security

Beacon Python 1.1.0 includes Security in the `beacon-otel` wheel. It supports
standard-GIL CPython 3.11 through 3.14 and uses the existing `beacon` command;
there is no separate Security distribution.

## Enable Security

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

## Configuration reference

| Environment variable | Default | Purpose |
| --- | --- | --- |
| `BEACON_SECURITY_ENABLED` | `false` | Enables the Security lifecycle and runtime SBOM. |
| `BEACON_SECURITY_PYTHON_INCLUDE` | Empty | Selects application module prefixes for finding collection. |
| `BEACON_SECURITY_PYTHON_EXCLUDE` | Empty | Excludes module prefixes and takes precedence over include. |
| `BEACON_SECURITY_SBOM_ENABLED` | `true` | Collects runtime SBOM while Security is enabled. |
| `BEACON_SECURITY_LOCAL_OUTPUT_ENABLED` | `false` | Enables process-local diagnostic files. |
| `BEACON_SECURITY_OUTPUT` | `./beacon-security-output/<instance-id>` | Sets the diagnostic directory. |
| `BEACON_SECURITY_EVIDENCE_FILE` | Unset | Sets an optional diagnostic JSONL file. |

Findings and SBOM records use the OpenTelemetry Logs pipeline. Local output is
diagnostic evidence and remains off by default.

## Kubernetes and Gunicorn

Install `beacon-otel==1.1.0` in the application image and follow the
[version-pinned Deployment example](https://github.com/beacon-observability/beacon-python/blob/v1.1.0/beacon-otel/examples/kubernetes/deployment.yaml).
No Security sidecar or init container is needed.

Gunicorn must initialize telemetry after each worker fork. Use the release's
`beacon_security.gunicorn` configuration, do not prefix that command with
`beacon`, and do not enable `preload_app`.

Remove `BEACON_SECURITY_ENABLED` or set it to `false` to disable Security while
leaving normal zero-code telemetry active.
