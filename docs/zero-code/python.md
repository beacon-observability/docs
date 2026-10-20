---
sidebar_position: 2
title: Python
description: Run a Python application through the Beacon command.
---

# Python zero-code instrumentation

Beacon Python 1.1.0 supports the documented zero-code workflow on Python 3.10
through 3.14. Install it in the same virtual environment as the application.

## Install

Choose the extra that matches the application:

```bash
# FastAPI; use flask or requests for those integrations
pip install 'beacon-otel[fastapi]==1.1.0'
```

## Run

```bash
export OTEL_SERVICE_NAME=my-python-service
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4317
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
beacon uvicorn myapp:app
```

Replace `uvicorn myapp:app` with the application's existing command. `beacon --version` verifies which distribution is active.

## Debugging and diagnostics

The Beacon Python 1.1.0 zero-code entry point does not provide a unified SDK debug-log switch. `OTEL_LOG_LEVEL=debug` does not automatically configure Python `logging` levels. For detailed logs, use the application's existing logging configuration to set the `opentelemetry` logger to `DEBUG` and attach an output handler.

For an initial check without application source changes, add console Span output while retaining OTLP export:

```bash
beacon --version
OTEL_TRACES_EXPORTER=otlp,console \
  beacon uvicorn myapp:app > beacon-python-diagnostic.log 2>&1
```

Keep the service name, OTLP endpoint, and protocol above. Send a request through a supported framework and inspect Spans in the file. Console output helps distinguish missing Spans from receiver export failures; it neither confirms OTLP delivery nor enables SDK debug logs.

Return to the normal launch command, remove the additional `console` exporter, and restore application logging levels after troubleshooting.

## Profiling

Python can export profiles through OTLP/HTTP, upload pprof over HTTP, or write pprof files locally. See the [Python profiling guide](../profiling/python.md).

## Security

The same `beacon-otel` wheel contains opt-in Security for standard-GIL CPython
3.11 through 3.14. See the [Python Security guide](../security/python.md).
