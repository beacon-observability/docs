---
sidebar_position: 2
title: Python profiling
description: Export Beacon Python profiles with OTLP/HTTP or pprof.
---

# Python profiling

Install the profiling extra in the application's virtual environment:

```bash
pip install 'beacon-otel[fastapi,profiling]==1.0.1'
```

Replace `fastapi` with the integration used by the application.

## Export with OTLP/HTTP

```bash
export OTEL_SERVICE_NAME=my-python-service
export OTEL_PROFILING_ENABLED=true
export OTEL_PROFILING_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_PROFILES_PROTOCOL=http/protobuf
export OTEL_EXPORTER_OTLP_PROFILES_ENDPOINT=http://127.0.0.1:4318/v1development/profiles
beacon uvicorn myapp:app
```

The receiver must implement the OpenTelemetry development Profiles endpoint.

## Upload pprof over HTTP

```bash
export OTEL_SERVICE_NAME=my-python-service
export OTEL_PROFILING_ENABLED=true
export OTEL_PROFILING_EXPORTER=pprof_http
export OTEL_PROFILING_PPROF_UPLOAD_URL=http://127.0.0.1:9529/profiling/v1/input
beacon uvicorn myapp:app
```

When authentication is required, set `OTEL_PROFILING_PPROF_HEADERS` to a comma-separated list of `name:value` headers.

## Write pprof files locally

```bash
export OTEL_PROFILING_ENABLED=true
export OTEL_PROFILING_EXPORTER=pprof
export OTEL_PROFILING_PPROF_PATH="$PWD/profiles"
beacon uvicorn myapp:app
```

Create the target directory first and include it in the deployment's retention policy.

## Additional collectors

Stack sampling is enabled with profiling. Add collectors only as needed:

```bash
export OTEL_PROFILING_MEMORY_ENABLED=true
export OTEL_PROFILING_LOCK_ENABLED=true
# Python 3.12 or later
export OTEL_PROFILING_EXCEPTION_ENABLED=true
```

The default export interval is 60 seconds. The process must remain alive beyond that interval to produce periodic uploads.

## Configuration reference

Environment-variable names are case-sensitive. Interval values in the runtime table are seconds.

### Runtime and collectors

| Environment variable | Type / accepted values | Default | Description |
| --- | --- | --- | --- |
| `OTEL_PROFILING_ENABLED` | Boolean | `false` | Starts the profiler during auto-instrumentation bootstrap. |
| `OTEL_PROFILING_EXPORTER` | `none`, `pprof`, `pprof_http`, `otlp` | Automatic | Selects the exporter. If unset, a configured pprof upload URL selects `pprof_http`; otherwise Beacon selects `otlp`. |
| `OTEL_PROFILING_SAMPLE_INTERVAL` | Positive number | `0.01` | Stack sampling interval. |
| `OTEL_PROFILING_EXPORT_INTERVAL` | Positive number | `60` | Profile flush and export interval. |
| `OTEL_PROFILING_MAX_FRAMES` | Positive integer | `64` | Maximum stack frames captured per sample. |
| `OTEL_PROFILING_INCLUDE_TRACE_CONTEXT` | Boolean | `true` | Adds active trace and span context when available. |
| `OTEL_PROFILING_EXCEPTION_ENABLED` | Boolean | `false` | Enables exception profiling. |
| `OTEL_PROFILING_EXCEPTION_SAMPLING_INTERVAL` | Positive integer | `100` | Exception sampling stride. |
| `OTEL_PROFILING_EXCEPTION_COLLECT_MESSAGE` | Boolean | `false` | Includes exception messages. Review sensitive-data implications before enabling. |
| `OTEL_PROFILING_LOCK_ENABLED` | Boolean | `false` | Enables threading and asyncio lock collectors. |
| `OTEL_PROFILING_MEMORY_ENABLED` | Boolean | `false` | Enables memory profiling. |
| `OTEL_PROFILING_MEMORY_INTERVAL` | Positive number | Export interval | Memory capture interval. |
| `OTEL_PROFILING_MEMORY_TOP_STATS` | Positive integer | `200` | Maximum memory statistics retained per capture. |
| `OTEL_PROFILING_MEMORY_IGNORE_PROFILER` | Boolean | `true` | Excludes allocations attributed to the profiler itself. |

### pprof export

| Environment variable | Type / accepted values | Default | Description |
| --- | --- | --- | --- |
| `OTEL_PROFILING_PPROF_PATH` | File-path prefix | `otel-profiles` | Prefix for generated `.pprof` files. Both pprof exporters write a local copy. |
| `OTEL_PROFILING_PPROF_UPLOAD_URL` | HTTP(S) URL | `http://localhost:8126/profiling/v1/input` | Upload URL used by `pprof_http`. Setting it while the exporter is unset also selects `pprof_http`. |
| `OTEL_PROFILING_PPROF_HEADERS` | Comma-separated `name:value` pairs | Empty | Extra HTTP request headers. |

### OTLP Profiles export

Profile-specific variables take precedence over their shared `OTEL_EXPORTER_OTLP_*` counterparts.

| Environment variable | Type / accepted values | Default | Description |
| --- | --- | --- | --- |
| `OTEL_EXPORTER_OTLP_PROFILES_PROTOCOL` | `grpc`, `http/protobuf` | Shared OTLP protocol, then `grpc` | Selects the transport. |
| `OTEL_EXPORTER_OTLP_PROFILES_ENDPOINT` | URL | Protocol-dependent | HTTP defaults to `http://localhost:4318/v1development/profiles`; gRPC falls back to the shared OTLP endpoint and exporter default. |
| `OTEL_EXPORTER_OTLP_PROFILES_INSECURE` | Boolean | Unset | Enables an insecure gRPC channel; not used by HTTP. |
| `OTEL_EXPORTER_OTLP_PROFILES_HEADERS` | Comma-separated key-value pairs | Shared OTLP headers, then empty | Request metadata or HTTP headers. |
| `OTEL_EXPORTER_OTLP_PROFILES_TIMEOUT` | Positive number, seconds | Shared OTLP timeout, then `10` | Export timeout. |
| `OTEL_EXPORTER_OTLP_PROFILES_COMPRESSION` | `none`, `gzip`, `deflate` for HTTP; gRPC-supported compression | Shared OTLP compression, then none | Payload compression; `deflate` is HTTP-only. |
| `OTEL_EXPORTER_OTLP_PROFILES_CERTIFICATE` | File path | Shared OTLP certificate, then system trust | Server CA certificate. |
| `OTEL_EXPORTER_OTLP_PROFILES_CLIENT_KEY` | File path | Shared OTLP client key, then unset | Client private key for mutual TLS. |
| `OTEL_EXPORTER_OTLP_PROFILES_CLIENT_CERTIFICATE` | File path | Shared OTLP client certificate, then unset | Client certificate for mutual TLS. |
