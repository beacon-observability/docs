---
sidebar_position: 1
title: Java profiling
description: Export Beacon Java JFR profiles to local files or an HTTP receiver.
---

# Java profiling

Beacon Java profiling is experimental, disabled by default, and requires Java 11 or later with JFR available. Keep using the same `-javaagent` command from the [Java zero-code guide](../zero-code/java.md).

## Upload over HTTP

Use the compatibility HTTP exporter to send a JFR snapshot and its metadata as `multipart/form-data`:

```bash
export OTEL_SERVICE_NAME=my-java-service
export OTEL_PROFILING_ENABLED=true
export OTEL_PROFILING_EXPORTER=datakit
export OTEL_PROFILING_ENDPOINT=http://127.0.0.1:9529/profiling/v1/input
java -javaagent:./beacon-javaagent.jar -jar app.jar
```

The value `datakit` is the current compatibility exporter identifier. The configured receiver must accept `main.jfr` and `event.json` multipart fields. The default snapshot interval is one minute.

## Write JFR files locally

Use the file exporter for receiver-independent validation:

```bash
mkdir -p profiles
export OTEL_PROFILING_ENABLED=true
export OTEL_PROFILING_EXPORTER=file
export OTEL_PROFILING_EXPERIMENTAL_FILE_EXPORT_PATH="$PWD/profiles"
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
| `OTEL_PROFILING_STACK_DEPTH` | Positive integer | `64` | Maximum recorded stack depth. |
| `OTEL_PROFILING_MAX_SIZE` | Non-negative integer, bytes | `0` | Maximum active JFR recording size; `0` keeps the JFR default. |
| `OTEL_PROFILING_TEMP_DIR` | Directory path | Unset | Directory for temporary JFR data; unset uses the runtime temporary directory behavior. |
| `OTEL_PROFILING_MEMORY_ENABLED` | Boolean | `false` | Enables the memory-focused JFR settings. |
| `OTEL_PROFILING_MEMORY_ALLOCATION_SAMPLING` | Boolean | Unset | Overrides JFR allocation sampling when set. |
| `OTEL_PROFILING_MEMORY_OLD_OBJECT_SAMPLING` | Boolean | Unset | Overrides JFR old-object sampling when set. |
| `OTEL_PROFILING_EXPORTER` | `none`, `file`, `datakit` | `none` | Selects no export, local JFR files, or the compatibility HTTP multipart exporter. |
| `OTEL_PROFILING_ENDPOINT` | HTTP(S) URL | `http://localhost:9529/profiling/v1/input` | Upload endpoint used by the `datakit` exporter. |
| `OTEL_PROFILING_DATAKIT_TIMEOUT` | Positive duration | `10s` | HTTP upload timeout used by the compatibility exporter. |
| `OTEL_PROFILING_EXPERIMENTAL_FILE_EXPORT_PATH` | Directory path | `${java.io.tmpdir}/otel-profiles` | Output directory used by the `file` exporter. |

The `datakit` value and timeout variable are compatibility identifiers required by the current Java agent.
