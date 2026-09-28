---
sidebar_position: 1
title: Java
description: Attach Beacon Java to an application with -javaagent.
---

# Java zero-code instrumentation

Beacon Java 1.0.0 ships as one agent JAR. It requires a JDK-supported runtime; profiling requires JDK 11 or later.

## Install

```bash
curl -fL -o beacon-javaagent.jar \
  https://github.com/beacon-observability/beacon-java/releases/download/beacon-v1.0.0/beacon-javaagent-1.0.0.jar
```

## Run

```bash
export OTEL_SERVICE_NAME=my-java-service
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4317
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
java -javaagent:./beacon-javaagent.jar -jar app.jar
```

Put `-javaagent` before `-jar` or the application's main class. Keep all existing JVM and application arguments unchanged.

## Enable profiling

Profiling is experimental and disabled by default. The shortest receiver-independent check writes JFR snapshots to disk:

```bash
mkdir -p profiles
export OTEL_PROFILING_ENABLED=true
export OTEL_PROFILING_EXPORTER=file
export OTEL_PROFILING_EXPERIMENTAL_FILE_EXPORT_PATH="$PWD/profiles"
java -javaagent:./beacon-javaagent.jar -jar app.jar
```

Confirm that `.jfr` files appear in `profiles/`. Enable profiling in a load test before production use and account for local disk retention.

