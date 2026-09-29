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

## Profiling

The same preload can collect wall and heap profiles and upload them over HTTP. See the [Node.js profiling guide](../profiling/nodejs.md).
