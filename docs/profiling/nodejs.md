---
sidebar_label: Node.js
sidebar_position: 3
title: Node.js profiling
description: Upload Beacon Node.js wall and heap profiles over HTTP.
---

# Node.js profiling

Profiling is included in `@beacon-observability/nodejs`. Keep the preload from the [Node.js zero-code guide](../zero-code/nodejs.md), then configure an HTTP receiver that accepts the compatible pprof multipart layout:

```bash
export NODE_OPTIONS="--require @beacon-observability/nodejs/register"
export OTEL_SERVICE_NAME=my-node-service
export OTEL_PROFILING_ENABLED=true
export OTEL_PROFILING_EXPORTER=http
export OTEL_PROFILING_ENDPOINT=http://127.0.0.1:9529/profiling/v1/input
node app.js
```

Wall profiling is enabled by default. Add heap profiles with:

```bash
export OTEL_PROFILING_MEMORY_ENABLED=true
```

The default upload interval is 60 seconds. `OTEL_PROFILING_EXPORT_INTERVAL` changes it in seconds, and `OTEL_PROFILING_PPROF_HEADERS` supplies comma-separated `name:value` HTTP headers.


This guide targets [Beacon Node.js 4.0.0](https://github.com/beacon-observability/beacon-nodejs/releases/tag/v4.0.0). Export remains multipart/pprof; the native sampler and encoding are unchanged. The legacy `OTEL_PROFILING_PPROF_UPLOAD_URL` remains valid and takes precedence over `OTEL_PROFILING_ENDPOINT` when both are set. `OTEL_PROFILING_EXPORTER=none` disables profiling; `otlp` is not supported and is not an HTTP multipart alias.

## Configuration reference

Environment-variable names are case-sensitive.

| Environment variable | Type / accepted values | Default | Description |
| --- | --- | --- | --- |
| `OTEL_PROFILING_ENABLED` | Boolean: `true`, `1`, `yes`, `on` enable it | `false` | Enables pprof collection. |
| `OTEL_PROFILING_EXPORTER` | `http`, `none` | `http` | Selects multipart/pprof export or disables profiling. |
| `OTEL_PROFILING_ENDPOINT` | HTTP(S) URL | Unset | Shared profiling endpoint; must accept multipart/pprof. |
| `OTEL_PROFILING_PPROF_UPLOAD_URL` | HTTP(S) URL | Unset | Legacy endpoint with precedence over the shared endpoint; configure at least one when enabled. |
| `OTEL_PROFILING_EXPORT_INTERVAL` | Positive number, seconds | `60` | Profile collection and upload interval. |
| `OTEL_PROFILING_MEMORY_ENABLED` | Boolean | `false` | Adds heap profiles to the default wall-time profiles. |
| `OTEL_PROFILING_PPROF_HEADERS` | Comma-separated `name=value` or `name:value` pairs | Empty | Extra HTTP request headers. |

The exporter also reads `OTEL_SERVICE_NAME` and the `service.version`, `deployment.environment.name` (or `deployment.environment`), and `host.name` entries in `OTEL_RESOURCE_ATTRIBUTES` as profile metadata.
