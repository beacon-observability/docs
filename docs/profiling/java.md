---
sidebar_position: 1
title: Java profiling
description: Export Beacon Java JFR profiles to local files or an HTTP receiver.
---

# Java profiling

Beacon Java profiling is experimental, disabled by default, and requires Java 11 or later with JFR available. Keep using the same `-javaagent` command from the [Java zero-code guide](../zero-code/java.md).

For every supported option and its default, see [Profile configuration: Java](configuration.md#java).

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
