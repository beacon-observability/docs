---
sidebar_position: 1
title: Java
description: Attach Beacon Java to an application with -javaagent.
---

# Java zero-code instrumentation

Beacon Java 1.1.0 ships as one agent JAR. It requires a JDK-supported runtime;
profiling requires JDK 11 or later. The same JAR contains the optional Security
capability.

## Install

```bash
curl -fL -o beacon-javaagent.jar \
  https://github.com/beacon-observability/beacon-java/releases/download/v1.1.0/beacon-javaagent-1.1.0.jar
```

## Run

```bash
export OTEL_SERVICE_NAME=my-java-service
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4317
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
java -javaagent:./beacon-javaagent.jar -jar app.jar
```

Put `-javaagent` before `-jar` or the application's main class. Keep all existing JVM and application arguments unchanged.

## Profiling

Java 11 and later can collect experimental JFR profiles and either write them to disk or upload them over HTTP. See the [Java profiling guide](../profiling/java.md).

## Security

The same Agent can export opt-in security findings and a runtime SBOM through
OpenTelemetry Logs. See the [Java Security guide](../security/java.md).
