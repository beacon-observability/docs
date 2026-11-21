---
sidebar_label: Java
sidebar_position: 1
title: Java profiling
description: Export experimental Beacon Java profiles through OTLP or local JFR files.
---

# Java profiling

This guide targets [Beacon Java v1.4.1](https://github.com/beacon-observability/beacon-java/releases/tag/v1.4.1). Profiling is experimental, disabled by default, and requires Java 11+ with JFR available. Keep the `-javaagent` launch command from the [zero-code guide](../zero-code/java.md).

## Export through OTLP

The receiver must support the development OTLP Profiles schema; an OTLP traces endpoint alone cannot receive profiles. For HTTP/protobuf:

```bash
export OTEL_SERVICE_NAME=my-java-service
export OTEL_PROFILING_ENABLED=true
export OTEL_PROFILING_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_PROFILES_PROTOCOL=http/protobuf
export OTEL_EXPORTER_OTLP_PROFILES_ENDPOINT=http://127.0.0.1:4318/v1development/profiles
java -javaagent:./beacon-javaagent.jar -jar app.jar
```

For gRPC, set the protocol to `grpc` and the endpoint to `http://127.0.0.1:4317`, without a path, query, or fragment. `https://` enables TLS.

When the signal endpoint is unset, `OTEL_EXPORTER_OTLP_ENDPOINT` is reused: HTTP appends `/v1development/profiles`; gRPC keeps the endpoint unchanged. Protocol, timeout, and headers also inherit their shared OTLP settings when unset.

OTLP export converts JFR execution, native-method, allocation, and old-object samples to Profiles. File export preserves original JFR snapshots, including unconverted events. The default snapshot interval is one minute.

## Write local JFR files

```bash
mkdir -p profiles
export OTEL_PROFILING_ENABLED=true
export OTEL_PROFILING_EXPORTER=file
export OTEL_PROFILING_FILE_PATH="$PWD/profiles"
java -javaagent:./beacon-javaagent.jar -jar app.jar
```

Confirm `.jfr` files appear in the directory. File export ignores OTLP endpoint, protocol, headers, and timeout settings. Plan file retention and validate overhead under application load before enabling profiling in production.

## Upgrade from 1.3.x {#upgrade-from-13x}

Since 1.4.0, the old multipart exporter and `OTEL_PROFILING_ENDPOINT` / `OTEL_PROFILING_DATAKIT_TIMEOUT` settings are removed. Migrate to `OTEL_PROFILING_EXPORTER=otlp` and `OTEL_EXPORTER_OTLP_PROFILES_*`, with a receiver that supports OTLP Profiles. Replace `OTEL_PROFILING_EXPERIMENTAL_FILE_EXPORT_PATH` with `OTEL_PROFILING_FILE_PATH`. Disable collection with `OTEL_PROFILING_ENABLED=false`; the exporter no longer accepts `none`.

Since 1.3.5, `telemetry.distro.name` is `beacon-java-instrumentation`. Update queries or filters that depend on the previous name.

## Configuration reference

Environment-variable names are case-sensitive. Durations accept a number followed by `ns`, `us`, `ms`, `s`, `m`, `h`, or `d`.

| Environment variable | Type / accepted values | Default | Description |
| --- | --- | --- | --- |
| `OTEL_PROFILING_ENABLED` | Boolean | `false` | Enables profiling. |
| `OTEL_PROFILING_INTERVAL` | Positive duration | `1m` | Snapshot interval. |
| `OTEL_PROFILING_STARTUP_DELAY` | Non-negative duration | `0s` | Delay before profiling starts. |
| `OTEL_PROFILING_MAX_AGE` | Positive duration | `5m` | JFR retention window. |
| `OTEL_PROFILING_MAX_SIZE` | Non-negative integer, bytes | `0` | Recording size limit; 0 keeps the JFR default. |
| `OTEL_PROFILING_TEMP_DIR` | Directory | `JVM temporary directory` | Temporary detached final snapshots; independent of the JFR repository. |
| `OTEL_PROFILING_MEMORY_ENABLED` | Boolean | `false` | Enables memory-focused JFR settings. |
| `OTEL_PROFILING_MEMORY_ALLOCATION_SAMPLING` | Boolean | `Unset` | Overrides allocation sampling when set. |
| `OTEL_PROFILING_MEMORY_OLD_OBJECT_SAMPLING` | Boolean | `Unset` | Overrides old-object sampling when set. |
| `OTEL_PROFILING_EXPORTER` | otlp, file | `otlp` | Choose OTLP Profiles or local JFR files. |
| `OTEL_EXPORTER_OTLP_PROFILES_PROTOCOL` | http/protobuf, grpc | `Shared protocol, then http/protobuf` | OTLP transport. |
| `OTEL_EXPORTER_OTLP_PROFILES_ENDPOINT` | HTTP(S) URL | `Protocol-dependent` | Exact Profiles endpoint. |
| `OTEL_EXPORTER_OTLP_PROFILES_TIMEOUT` | Positive duration | `Shared timeout, then 10s` | OTLP export timeout. |
| `OTEL_EXPORTER_OTLP_PROFILES_HEADERS` | Percent-encoded key=value pairs | `Shared headers` | OTLP request headers. |
| `OTEL_PROFILING_FILE_PATH` | Directory | `${java.io.tmpdir}/otel-profiles` | Output directory for file export. |

JFR stack depth and its repository directory are JVM-wide settings. Configure them at JVM startup with `-XX:FlightRecorderOptions=stackdepth=128,repository=/path/to/jfr`; this affects all JFR recordings in the process. `OTEL_PROFILING_STACK_DEPTH` cannot configure per-recording depth and emits a warning when explicitly set. The file-export directory is separate from the JFR repository.

Shutdown serializes an in-flight export and the remaining interval, while the caller waits at most 10 seconds. JVM exit does not guarantee delivery beyond that deadline. Empty intervals produce no file or upload.
