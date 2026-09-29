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

## Profiling

Python can export profiles through OTLP/HTTP, upload pprof over HTTP, or write pprof files locally. See the [Python profiling guide](../profiling/python.md).
