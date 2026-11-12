---
sidebar_position: 1
title: Java
description: Attach Beacon Java to an application with -javaagent.
---

# Java zero-code instrumentation

Beacon Java 1.3.4 ships as one Agent JAR, including the optional Security capability.

## Supported versions

| Runtime | Tracing | Experimental profiling |
| --- | --- | --- |
| JDK 1.8 (Java 8) | Supported | Not supported |
| JDK 11 | Supported | Supported |
| JDK 17 | Supported | Supported |
| JDK 21 | Supported | Supported |
| JDK 25 | Supported | Supported |
| JDK 26 | Supported | Supported |

## Install

[Download the Agent JAR](https://github.com/beacon-observability/beacon-java/releases/download/v1.3.4/beacon-javaagent-1.3.4.jar) and save it as `beacon-javaagent.jar`, or run:

```bash
curl -fL -o beacon-javaagent.jar \
  https://github.com/beacon-observability/beacon-java/releases/download/v1.3.4/beacon-javaagent-1.3.4.jar
```

## Run

```bash
export OTEL_SERVICE_NAME=my-java-service
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4317
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
java -javaagent:./beacon-javaagent.jar -jar app.jar
```

Put `-javaagent` before `-jar` or the application's main class. Keep all existing JVM and application arguments unchanged.

## Debugging and diagnostics

Keep the service name and OTLP settings above. Temporarily enable Agent debug logging and capture the output:

```bash
OTEL_JAVAAGENT_DEBUG=true \
  java -javaagent:./beacon-javaagent.jar -jar app.jar \
  > beacon-java-debug.log 2>&1
```

Alternatively, add `-Dotel.javaagent.debug=true` before `-jar`. The JVM system property takes precedence over the environment variable. Use these logs to inspect Agent loading, instrumentation matching, and export errors.

Return to the normal launch command after troubleshooting. If the variable or JVM property was added to service configuration, remove it and restart the application.

## Text log correlation

Java 1.3.4 can add missing `service.name`, `trace_id`, and `span_id` fields to existing text patterns without editing application logging configuration. Enable this at JVM startup; the default is `false`:

```bash
export OTEL_INSTRUMENTATION_LOGGING_PATTERN_INJECTION_ENABLED=true
java -javaagent:./beacon-javaagent.jar -jar app.jar
```

The JVM option `-Dotel.instrumentation.logging.pattern-injection.enabled=true` is equivalent. Supported layouts are Logback classic 1.0+, Log4j 1.2 PatternLayout, and Log4j2 2.7+ PatternLayout; keep the corresponding MDC/context-data instrumentation enabled. JSON layouts and Log4j2 PatternSelector branches are excluded. The service name remains available outside a valid span, but the Agent does not generate Trace/Span IDs for those logs. See the [release logging reference](https://github.com/beacon-observability/beacon-java/blob/v1.3.4/beacon/LOGGING.md).

## Profiling

Java 11 and later can collect experimental JFR profiles and either write them to disk or upload them over HTTP. See the [Java profiling guide](../profiling/java.md).

## Security

The same Agent can export opt-in security findings and a runtime SBOM through
OpenTelemetry Logs. See the [Java Security guide](../security/java.md).
