---
sidebar_position: 3
title: Node.js
description: Preload Beacon Node.js without changing application source.
---

# Node.js zero-code instrumentation

Beacon Node.js 1.1.0 supports the maintained Node.js runtime lines tested by the package, starting with Node.js 18.19.

## Install

```bash
npm install @beacon-observability/nodejs@1.1.0
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

## Enable profiling

The same preload can collect wall profiles and upload them to a compatible pprof HTTP receiver:

```bash
export OTEL_PROFILING_ENABLED=true
export OTEL_PROFILING_PPROF_UPLOAD_URL=http://127.0.0.1:8081/profiles
node app.js
```

Set `OTEL_PROFILING_MEMORY_ENABLED=true` to add heap profiles. The default upload interval is 60 seconds; change it with `OTEL_PROFILING_EXPORT_INTERVAL` only after validating receiver load.

