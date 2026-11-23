---
sidebar_label: Python
sidebar_position: 2
title: Python profiling
description: Export Beacon Python profiles with multipart HTTP or local pprof files.
---

# Python profiling

Install the profiling extra in the application's virtual environment:

```bash
pip install 'beacon-otel[fastapi,profiling]==1.3.0'
```

Replace `fastapi` with the integration used by the application.

## Export over HTTP

```bash
export OTEL_SERVICE_NAME=my-python-service
export OTEL_PROFILING_ENABLED=true
export OTEL_PROFILING_EXPORTER=http
export OTEL_PROFILING_ENDPOINT=http://127.0.0.1:9529/profiling/v1/input
beacon uvicorn myapp:app
```

The receiver must accept multipart pprof uploads. `OTEL_PROFILING_PPROF_UPLOAD_URL`
overrides `OTEL_PROFILING_ENDPOINT` when both are configured. The `datakit` and
`pprof_http` exporter names remain aliases of `http`. Disable profiling with
`OTEL_PROFILING_ENABLED=false`. Profiling remains experimental.

## Write pprof files locally

```bash
export OTEL_PROFILING_ENABLED=true
export OTEL_PROFILING_EXPORTER=file
export OTEL_PROFILING_FILE_PATH="$PWD/profiles"
beacon uvicorn myapp:app
```

## Upgrade from 1.2.6

Replace the `otlp` exporter with `http` and configure the multipart endpoint above.
Environment-selected upload no longer uses `OTEL_EXPORTER_OTLP_PROFILES_*`.
The `otlp` name is reserved for future protocol support.

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
| `OTEL_PROFILING_EXPORTER` | `http`, `file` | `http` | Selects multipart pprof HTTP or local file export. Disable profiling with `OTEL_PROFILING_ENABLED=false`. |
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

### HTTP export

| Environment variable | Purpose |
| --- | --- |
| `OTEL_PROFILING_ENDPOINT` | Multipart pprof receiver URL; configure explicitly. |
| `OTEL_PROFILING_PPROF_UPLOAD_URL` | Explicit upload URL, taking precedence over the endpoint. |
