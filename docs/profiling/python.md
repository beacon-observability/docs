---
sidebar_label: Python
sidebar_position: 2
title: Python profiling
description: Upload Beacon Python pprof profiles over HTTP or write local files.
---

# Python profiling

Install the profiling extra in the application's virtual environment:

```bash
pip install 'beacon-otel[fastapi,profiling]==1.2.7'
```

Replace `fastapi` with the integration used by the application.

## Upload with HTTP

```bash
export OTEL_SERVICE_NAME=my-python-service
export OTEL_PROFILING_ENABLED=true
export OTEL_PROFILING_EXPORTER=http
export OTEL_PROFILING_ENDPOINT=http://127.0.0.1:9529/profiling/v1/input
beacon uvicorn myapp:app
```

Enable the DataKit profiling input before starting the application. The exporter sends multipart gzip pprof and event metadata; it does not use OTLP Profiles. Across hosts or containers, replace `127.0.0.1` with an address reachable by the application.

## Write pprof files locally

```bash
export OTEL_PROFILING_ENABLED=true
export OTEL_PROFILING_EXPORTER=file
export OTEL_PROFILING_FILE_PATH="$PWD/profiles"
beacon uvicorn myapp:app
```

Beacon creates the target directory and writes gzip-compressed pprof files. Include it in the deployment's retention policy. File mode does not upload profiles.

## Upgrade to 1.2.7

When upgrading from 1.2.6, select `http` and set `OTEL_PROFILING_ENDPOINT` as above. Environment configuration no longer selects OTLP Profiles export; `otlp` is reserved for future protocol support. Legacy `datakit` and `pprof_http` aliases remain compatible, and an explicit `OTEL_PROFILING_PPROF_UPLOAD_URL` takes precedence over the shared profiling endpoint. The `file` configuration remains available. Disable profiling with `OTEL_PROFILING_ENABLED=false`.

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
| `OTEL_PROFILING_EXPORTER` | `http`, `file` | `http` | Selects multipart HTTP or local file export. Legacy `datakit` and `pprof_http` aliases remain accepted. |
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

### HTTP upload

| Environment variable | Type / accepted values | Default | Description |
| --- | --- | --- | --- |
| `OTEL_PROFILING_ENDPOINT` | HTTP(S) URL | `http://127.0.0.1:9529/profiling/v1/input` | Receiver for multipart pprof uploads. |
| `OTEL_PROFILING_PPROF_UPLOAD_URL` | HTTP(S) URL | Unset | Compatibility override; takes precedence over `OTEL_PROFILING_ENDPOINT`. |
| `OTEL_PROFILING_PPROF_HEADERS` | Comma-separated `name:value` pairs | Empty | Extra HTTP request headers. |

An HTTP success only confirms receiver acceptance; verify stored profiles by service name at the backend.
