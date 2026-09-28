---
sidebar_position: 3
title: Common configuration
description: Configure service identity, OTLP transport, resources, and authentication.
---

# Common configuration

Beacon agents use standard OpenTelemetry environment variables for telemetry export.

| Variable | Purpose | Example |
| --- | --- | --- |
| `OTEL_SERVICE_NAME` | Stable logical service name | `checkout-api` |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Base OTLP receiver URL | `http://collector:4317` |
| `OTEL_EXPORTER_OTLP_PROTOCOL` | Transport accepted by the receiver | `grpc` or `http/protobuf` |
| `OTEL_EXPORTER_OTLP_HEADERS` | Comma-separated request headers | `authorization=Bearer%20token` |
| `OTEL_RESOURCE_ATTRIBUTES` | Extra resource identity | `service.version=1.4.0,deployment.environment.name=prod` |

Use port `4317` for OTLP/gRPC and `4318` for OTLP/HTTP unless the receiver is configured differently. Signal-specific variables such as `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` override the shared endpoint.

## Minimal configuration

```bash
export OTEL_SERVICE_NAME=checkout-api
export OTEL_EXPORTER_OTLP_ENDPOINT=http://collector:4317
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
```

Do not put credentials directly in process arguments or committed files. Inject headers from the deployment platform's secret store.

