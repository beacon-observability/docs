---
sidebar_position: 3
title: Node.js
description: Preload Beacon Node.js without changing application source.
---

# Node.js zero-code instrumentation

Beacon Node.js 1.2.0 supports the maintained Node.js runtime lines tested by
the package, starting with Node.js 18.19. Security has a narrower runtime
requirement documented below.

## Install

```bash
npm install @beacon-observability/nodejs@1.2.0
```

## Run

```bash
export OTEL_SERVICE_NAME=my-node-service
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4317
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
export NODE_OPTIONS="--require @beacon-observability/nodejs/register"
node app.js
```

Keep the application's existing `node` command. If `NODE_OPTIONS` already contains options, append the `--require` entry instead of replacing them.

## Debugging and diagnostics

Retain the `NODE_OPTIONS` preload configuration above and temporarily enable OpenTelemetry diagnostic logging:

```bash
OTEL_LOG_LEVEL=debug node app.js > beacon-nodejs-debug.log 2>&1
```

Diagnostic logs go to the console; this command captures both standard output and standard error. When Security is enabled, keep its required ESM `--import` preload.

Return to the normal launch command after troubleshooting. If `OTEL_LOG_LEVEL=debug` was added to the deployment environment, remove it and restart the application.

## Profiling

The same preload can collect wall and heap profiles and upload them over HTTP. See the [Node.js profiling guide](../profiling/nodejs.md).

## Security

Security is included and opt in on Node.js 22.22.3+ or 24.11.1+. It requires
the ESM `--import` preload instead of `--require`. See the
[Node.js Security guide](../security/nodejs.md).
