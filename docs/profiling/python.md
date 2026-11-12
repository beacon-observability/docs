---
sidebar_label: Python
sidebar_position: 2
title: Python profiling
description: Export Beacon Python profiles with OTLP/HTTP or pprof.
---

# Python profiling

Install the profiling extra in the application's virtual environment:

```bash
pip install 'beacon-otel[fastapi,profiling]==1.2.6'
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

## Write pprof files locally

```bash
export OTEL_PROFILING_ENABLED=true
export OTEL_PROFILING_EXPORTER=file
export OTEL_PROFILING_FILE_PATH="$PWD/profiles"
beacon uvicorn myapp:app
```

Beacon creates the target directory and writes gzip-compressed pprof files. Include it in the deployment's retention policy. File mode ignores OTLP endpoint and transport settings.

## Upgrade to 1.2.6

When upgrading, replace `pprof` with `file` and replace `OTEL_PROFILING_PPROF_PATH` with the directory variable `OTEL_PROFILING_FILE_PATH`. `pprof_http`, `none`, and the old pprof HTTP upload settings have been removed; use OTLP for remote export. Disable profiling with `OTEL_PROFILING_ENABLED=false`.

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
| `OTEL_PROFILING_EXPORTER` | `otlp`, `file` | `otlp` | Selects OTLP or local file export. Disable profiling with `OTEL_PROFILING_ENABLED=false`. |
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

### File export

| Environment variable | Type / accepted values | Default | Description |
| --- | --- | --- | --- |
| `OTEL_PROFILING_FILE_PATH` | Directory path | `otel-profiles` | Directory for gzip pprof files from the `file` exporter; created automatically. |

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
