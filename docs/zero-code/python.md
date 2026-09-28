---
sidebar_position: 2
title: Python
description: Run a Python application through the Beacon command.
---

# Python zero-code instrumentation

Beacon Python 1.0.1 supports Python 3.10 through 3.14. Install it in the same virtual environment as the application.

## Install

Choose the extra that matches the application:

```bash
# FastAPI; use flask or requests for those integrations
pip install 'beacon-otel[fastapi]==1.0.1'
```

## Run

```bash
export OTEL_SERVICE_NAME=my-python-service
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4317
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
beacon uvicorn myapp:app
```

Replace `uvicorn myapp:app` with the application's existing command. `beacon --version` verifies which distribution is active.

## Enable profiling

Install the profiling extra and configure a compatible pprof HTTP receiver:

```bash
pip install 'beacon-otel[fastapi,profiling]==1.0.1'
export OTEL_PROFILING_ENABLED=true
export OTEL_PROFILING_PPROF_UPLOAD_URL=http://127.0.0.1:8081/profiles
beacon uvicorn myapp:app
```

Stack profiling starts automatically. To opt into additional collectors, set `OTEL_PROFILING_MEMORY_ENABLED=true`, `OTEL_PROFILING_LOCK_ENABLED=true`, or, on Python 3.12 and later, `OTEL_PROFILING_EXCEPTION_ENABLED=true`.

