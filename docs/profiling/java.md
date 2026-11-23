---
sidebar_label: Java
sidebar_position: 1
title: Java profiling
description: Export Beacon Java JFR profiles to local files or an HTTP receiver.
---

# Java profiling

This guide uses [Beacon Java v1.5.0](https://github.com/beacon-observability/beacon-java/releases/tag/v1.5.0). Profiling is experimental, disabled by default, and requires Java 11 or later with JFR available. Keep using the same `-javaagent` command from the [Java zero-code guide](../zero-code/java.md).

## Upload over HTTP

Use the compatibility HTTP exporter to send a JFR snapshot and its metadata as `multipart/form-data`:

```bash
export OTEL_SERVICE_NAME=my-java-service
export OTEL_PROFILING_ENABLED=true
export OTEL_PROFILING_EXPORTER=http
export OTEL_PROFILING_ENDPOINT=http://127.0.0.1:9529/profiling/v1/input
java -javaagent:./beacon-javaagent.jar -jar app.jar
```

Use `http` for multipart JFR uploads; `datakit` remains an alias. The configured receiver must accept `main.jfr` and `event.json` multipart fields. The default snapshot interval is one minute.

## Write JFR files locally

Use the file exporter for receiver-independent validation:

```bash
mkdir -p profiles
export OTEL_PROFILING_ENABLED=true
export OTEL_PROFILING_EXPORTER=file
export OTEL_PROFILING_FILE_PATH="$PWD/profiles"
java -javaagent:./beacon-javaagent.jar -jar app.jar
```

Confirm that `.jfr` files appear in `profiles/`. Plan disk retention and validate overhead under application load before enabling profiling in production.

## Optional memory events

```bash
export OTEL_PROFILING_MEMORY_ENABLED=true
```

This applies memory-focused JFR settings on top of the standard profile template.

## Configuration reference

Environment-variable names are case-sensitive. Duration values accept a number followed by `ns`, `us`, `ms`, `s`, `m`, `h`, or `d`.

| Environment variable | Type / accepted values | Default | Description |
| --- | --- | --- | --- |
| `OTEL_PROFILING_ENABLED` | Boolean | `false` | Enables the JFR profiler. |
| `OTEL_PROFILING_INTERVAL` | Positive duration | `1m` | Time between JFR snapshots. |
| `OTEL_PROFILING_STARTUP_DELAY` | Non-negative duration | `0s` | Delay before profiling starts. |
| `OTEL_PROFILING_MAX_AGE` | Positive duration | `5m` | Maximum age retained in the active JFR recording. |
| `OTEL_PROFILING_STACK_DEPTH` | Integer (compatibility only) | `64` | Does not set per-recording depth; configure the JVM JFR option instead. |
| `OTEL_PROFILING_MAX_SIZE` | Non-negative integer, bytes | `0` | Maximum active JFR recording size; `0` keeps the JFR default. |
| `OTEL_PROFILING_TEMP_DIR` | Directory path | Unset | Directory for temporary JFR data; unset uses the runtime temporary directory behavior. |
| `OTEL_PROFILING_MEMORY_ENABLED` | Boolean | `false` | Enables the memory-focused JFR settings. |
| `OTEL_PROFILING_MEMORY_ALLOCATION_SAMPLING` | Boolean | Unset | Overrides JFR allocation sampling when set. |
| `OTEL_PROFILING_MEMORY_OLD_OBJECT_SAMPLING` | Boolean | Unset | Overrides JFR old-object sampling when set. |
| `OTEL_PROFILING_EXPORTER` | `http`, `file`, `none`, `datakit` | `http` | Selects HTTP multipart uploads, local JFR files, or no export; `datakit` aliases `http`. |
| `OTEL_PROFILING_ENDPOINT` | HTTP(S) URL | `http://localhost:9529/profiling/v1/input` | Upload endpoint used by the `http` exporter. |
| `OTEL_PROFILING_DATAKIT_TIMEOUT` | Duration of at least 1ms | `10s` | HTTP upload timeout used by the compatibility exporter. |
| `OTEL_PROFILING_FILE_PATH` | Directory path | `${java.io.tmpdir}/otel-profiles` | Output directory used by the `file` exporter. |

## Upgrade to 1.4.2 {#upgrade-from-13x}

For 1.4.0/1.4.1 installations, replace `OTEL_PROFILING_EXPORTER=otlp` with `http` and set `OTEL_PROFILING_ENDPOINT` to a receiver accepting JFR multipart uploads. The `otlp` exporter is reserved for future support and rejected in 1.4.2; `OTEL_EXPORTER_OTLP_PROFILES_*` does not configure this uploader. Trace, metric, and log OTLP export is unchanged.

Existing 1.3.x `datakit`, endpoint, and timeout settings remain compatible. Prefer `OTEL_PROFILING_FILE_PATH` for local files; `OTEL_PROFILING_EXPERIMENTAL_FILE_EXPORT_PATH` remains a fallback. Disable collection with `OTEL_PROFILING_ENABLED=false`, or select `none` to disable export.

JFR stack depth is JVM-wide. Set `-XX:FlightRecorderOptions=stackdepth=128` at JVM startup when needed; `OTEL_PROFILING_STACK_DEPTH` only emits a compatibility warning. Validate overhead under application load.
