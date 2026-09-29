---
sidebar_position: 1
title: Profile configuration
description: Environment-variable reference for Beacon Java, Python, and Node.js profiling.
---

# Profile configuration

Profile environment-variable names are case-sensitive. Time values use the unit shown in the table. An “unset” default means Beacon does not supply a value; the runtime, exporter, or shared OpenTelemetry setting may still provide one.

## Java {#java}

Java duration values accept a number followed by `ns`, `us`, `ms`, `s`, `m`, `h`, or `d`.

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

## Python {#python}

### Runtime and collectors

Python interval values in this section are seconds.

| Environment variable | Type / accepted values | Default | Description |
| --- | --- | --- | --- |
| `OTEL_PROFILING_ENABLED` | Boolean | `false` | Starts the profiler during auto-instrumentation bootstrap. |
| `OTEL_PROFILING_EXPORTER` | `none`, `pprof`, `pprof_http`, `otlp` | Automatic | Selects the exporter. If unset, a configured pprof upload URL selects `pprof_http`; otherwise Beacon selects `otlp`. |
| `OTEL_PROFILING_SAMPLE_INTERVAL` | Positive number, seconds | `0.01` | Stack sampling interval. |
| `OTEL_PROFILING_EXPORT_INTERVAL` | Positive number, seconds | `60` | Profile flush and export interval. |
| `OTEL_PROFILING_MAX_FRAMES` | Positive integer | `64` | Maximum stack frames captured per sample. |
| `OTEL_PROFILING_INCLUDE_TRACE_CONTEXT` | Boolean | `true` | Adds active trace and span context to samples when available. |
| `OTEL_PROFILING_EXCEPTION_ENABLED` | Boolean | `false` | Enables exception profiling. |
| `OTEL_PROFILING_EXCEPTION_SAMPLING_INTERVAL` | Positive integer | `100` | Exception sampling stride. |
| `OTEL_PROFILING_EXCEPTION_COLLECT_MESSAGE` | Boolean | `false` | Includes exception messages in collected data. Review sensitive-data implications before enabling. |
| `OTEL_PROFILING_LOCK_ENABLED` | Boolean | `false` | Enables threading and asyncio lock collectors. |
| `OTEL_PROFILING_MEMORY_ENABLED` | Boolean | `false` | Enables memory profiling. |
| `OTEL_PROFILING_MEMORY_INTERVAL` | Positive number, seconds | Export interval | Memory capture interval; defaults to `OTEL_PROFILING_EXPORT_INTERVAL`. |
| `OTEL_PROFILING_MEMORY_TOP_STATS` | Positive integer | `200` | Maximum number of memory statistics retained per capture. |
| `OTEL_PROFILING_MEMORY_IGNORE_PROFILER` | Boolean | `true` | Excludes allocations attributed to the profiler itself. |

### pprof export

| Environment variable | Type / accepted values | Default | Description |
| --- | --- | --- | --- |
| `OTEL_PROFILING_PPROF_PATH` | File-path prefix | `otel-profiles` | Prefix for generated `.pprof` files. Both pprof exporters write a local copy. |
| `OTEL_PROFILING_PPROF_UPLOAD_URL` | HTTP(S) URL | `http://localhost:8126/profiling/v1/input` | Upload URL used by `pprof_http`. Setting it while the exporter is unset also selects `pprof_http`. |
| `OTEL_PROFILING_PPROF_HEADERS` | Comma-separated `name:value` pairs | Empty | Extra HTTP request headers. |

### OTLP Profiles export

Profile-specific OTLP variables take precedence over their shared `OTEL_EXPORTER_OTLP_*` counterparts.

| Environment variable | Type / accepted values | Default | Description |
| --- | --- | --- | --- |
| `OTEL_EXPORTER_OTLP_PROFILES_PROTOCOL` | `grpc`, `http/protobuf` | Shared OTLP protocol, then `grpc` | Selects the OTLP Profiles transport. |
| `OTEL_EXPORTER_OTLP_PROFILES_ENDPOINT` | URL | Protocol-dependent | Profiles endpoint. HTTP defaults to `http://localhost:4318/v1development/profiles`; gRPC falls back to the shared OTLP endpoint and exporter default. |
| `OTEL_EXPORTER_OTLP_PROFILES_INSECURE` | Boolean | Unset | Enables an insecure gRPC channel. Not used by the HTTP exporter. |
| `OTEL_EXPORTER_OTLP_PROFILES_HEADERS` | Comma-separated key-value pairs | Shared OTLP headers, then empty | Request metadata or HTTP headers. |
| `OTEL_EXPORTER_OTLP_PROFILES_TIMEOUT` | Positive number, seconds | Shared OTLP timeout, then `10` | Export timeout. |
| `OTEL_EXPORTER_OTLP_PROFILES_COMPRESSION` | `none`, `gzip`, `deflate` for HTTP; gRPC-supported compression | Shared OTLP compression, then none | Payload compression. `deflate` applies only to HTTP. |
| `OTEL_EXPORTER_OTLP_PROFILES_CERTIFICATE` | File path | Shared OTLP certificate, then system trust | Server CA certificate. |
| `OTEL_EXPORTER_OTLP_PROFILES_CLIENT_KEY` | File path | Shared OTLP client key, then unset | Client private key for mutual TLS. |
| `OTEL_EXPORTER_OTLP_PROFILES_CLIENT_CERTIFICATE` | File path | Shared OTLP client certificate, then unset | Client certificate for mutual TLS. |

## Node.js {#nodejs}

| Environment variable | Type / accepted values | Default | Description |
| --- | --- | --- | --- |
| `OTEL_PROFILING_ENABLED` | Boolean: `true`, `1`, `yes`, `on` enable it | `false` | Enables pprof collection. |
| `OTEL_PROFILING_PPROF_UPLOAD_URL` | HTTP(S) URL | Unset | Required when profiling is enabled; receives multipart pprof uploads. |
| `OTEL_PROFILING_EXPORT_INTERVAL` | Positive number, seconds | `60` | Profile collection and upload interval. |
| `OTEL_PROFILING_MEMORY_ENABLED` | Boolean | `false` | Adds heap profiles to the default wall-time profiles. |
| `OTEL_PROFILING_PPROF_HEADERS` | Comma-separated `name=value` or `name:value` pairs | Empty | Extra HTTP request headers. |

### Profile metadata

Node.js also reads standard OpenTelemetry resource settings to label uploaded profiles.

| Environment variable | Default | Profile fields |
| --- | --- | --- |
| `OTEL_SERVICE_NAME` | Unset | Service name. |
| `OTEL_RESOURCE_ATTRIBUTES` | Unset | `service.version`, `deployment.environment.name` (or `deployment.environment`), and `host.name`. |
