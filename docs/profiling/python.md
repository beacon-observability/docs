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
export OTEL_PROFILING_EXPORTER=pprof
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
