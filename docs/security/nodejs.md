---
sidebar_position: 3
title: Node.js Security
description: Enable Beacon Security through the Node.js ESM preload.
---

# Node.js Security

Beacon Node.js 1.2.0 includes Security in
`@beacon-observability/nodejs`. Applications normally install only that
complete package. Security requires Node.js 22.22.3+ or 24.11.1+ because it
uses synchronous module hooks for scoped source transformation.

## Enable Security

Use the ESM `--import` preload. The CommonJS `--require` preload still starts
normal telemetry and profiling but cannot activate Security transformation.

```bash
npm install @beacon-observability/nodejs@1.2.0

export NODE_OPTIONS="--import @beacon-observability/nodejs/register"
export BEACON_SECURITY_ENABLED=true
export BEACON_SECURITY_NODE_INCLUDE=/srv/app
export OTEL_SERVICE_NAME=orders
export OTEL_RESOURCE_ATTRIBUTES=service.namespace=shop
export OTEL_LOGS_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4318
node /srv/app/server.mjs
```

`BEACON_SECURITY_NODE_INCLUDE` selects application source roots. Package
dependencies, Node.js built-ins, and explicitly excluded roots are not
transformed.

## Configuration reference

| Environment variable | Default | Purpose |
| --- | --- | --- |
| `BEACON_SECURITY_ENABLED` | `false` | Enables the Security lifecycle and runtime SBOM. |
| `BEACON_SECURITY_NODE_INCLUDE` | Empty | Selects application source roots for finding collection. |
| `BEACON_SECURITY_NODE_EXCLUDE` | Empty | Excludes source roots and takes precedence over include. |
| `BEACON_SECURITY_SBOM_ENABLED` | `true` | Collects runtime SBOM while Security is enabled. |
| `BEACON_SECURITY_LOCAL_OUTPUT_ENABLED` | `false` | Enables process-local diagnostic files. |
| `BEACON_SECURITY_OUTPUT` | `./beacon-security-output/<instance-id>` | Sets the diagnostic directory. |

Findings and SBOM records use the OpenTelemetry Logs pipeline. Local output is
diagnostic evidence and remains off by default.

## Kubernetes

Install the complete package in the application image and follow the
[version-pinned Deployment example](https://github.com/beacon-observability/beacon-nodejs/blob/v1.2.0/packages/security-nodejs/examples/kubernetes/deployment.yaml).
The normal application container only needs the ESM preload and environment
variables; no Security sidecar or init container is required.

Remove `BEACON_SECURITY_ENABLED` or set it to `false` to disable Security while
leaving normal zero-code telemetry active.
