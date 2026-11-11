---
sidebar_label: .NET
sidebar_position: 4
title: .NET Security
description: Enable experimental Security and runtime assembly inventory in Beacon .NET.
---

# .NET Security

[Beacon .NET 1.1.2](https://github.com/beacon-observability/beacon-dotnet/releases/tag/v1.1.2) includes experimental Security in the existing zero-code package. It is disabled by default and uses the normal [`beacon-dotnet run` launcher](../zero-code/dotnet.md).

## Enable and verify

Configure a receiver with an OTLP Logs pipeline, then launch the application:

```bash
export OTEL_SERVICE_NAME=my-dotnet-service
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4317
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
export OTEL_LOGS_EXPORTER=otlp
export BEACON_SECURITY_ENABLED=true
beacon-dotnet run dotnet MyApp.dll
```

Check the receiver for records from instrumentation scope `io.beacon.security`: `beacon.security.sbom.inventory` and `beacon.security.finding`, using schema 2 and fingerprint version 1. Initial inventory runs asynchronously; subsequent collections use the configured refresh delay. Findings require an actual request through a modeled source and sink. Successful startup, installation status and local files do not confirm receiver delivery.

Security reuses standard [OpenTelemetry transport and resource configuration](../configuration/index.md). Automatic SDK setup must remain enabled. Disabling automatic Logs stops OTLP Security export; separately enabled local output can still receive records. Disabling automatic SDK setup stops both the Security worker and local writer.

## Configuration

| Environment variable | Default | Purpose |
| --- | --- | --- |
| `BEACON_SECURITY_ENABLED` | `false` | Enables the Security lifecycle. |
| `BEACON_SECURITY_SBOM_ENABLED` | `true` | Collects loaded assembly inventory while Security is enabled. |
| `BEACON_SECURITY_SBOM_REFRESH_SECONDS` | `300` | Positive integer delay after a completed collection; invalid or zero values use 300. |
| `BEACON_SECURITY_LOCAL_OUTPUT_ENABLED` | `false` | Separately enables local diagnostic output. |
| `BEACON_SECURITY_OUTPUT` | System temporary directory + `/beacon-security` | Snapshot parent directory; each process uses its instance UUID subdirectory. |
| `BEACON_SECURITY_EVIDENCE_FILE` | Unset | Optional finding JSONL path; requires Security and local output to be enabled. |

These are environment-variable bindings. Setting an output path alone does not enable local files. To disable Security, remove the enablement variable or set it to `false`, then restart the application.

## Coverage and compatibility

Security flow and export tests cover CoreCLR .NET 8, 9 and 10 on Linux glibc x64, Windows x64 and macOS ARM64. .NET Framework runtime behavior, cross-AppDomain identity, other Security architectures and production performance remain outside the verified scope. Downloadable archives for other platforms do not imply Security acceptance on those platforms.

The model tracks ASP.NET Core query values by string identity through the two-, three- and four-string `String.Concat` overloads. Supported sensitive calls observe file reads through `File.ReadAllText(string)`, ADO.NET text-command templates, asynchronous HTTP destinations and `Process.Start` invocations. Bound SQL parameter values do not taint a constant command template.

These are bounded candidate observations, not confirmed exploits or blocking decisions. Headers, cookies, request bodies, forms and transformations outside the concat model are not covered. File path boundaries and SQL dialect attack syntax are not assessed. Raw query values, SQL, command lines and scripts are not exported in finding fields.

Runtime inventory describes observed loaded CLR assembly names and assembly versions. It is not a full NuGet dependency graph, package-version mapping, artifact-hash inventory or reachability analysis. Collection is limited to 4,096 unique non-dynamic assembly identities; failed or incomplete scans do not replace the accepted snapshot. Wire records are bounded to 65,536 UTF-8 bytes and inventories may use multipart records. Delivery remains best effort.

## Optional local diagnostics

Enable `BEACON_SECURITY_LOCAL_OUTPUT_ENABLED=true` separately when local snapshots are needed. The process directory contains `inventory.jsonl` for the latest complete inventory round and `finding.json` for the latest finding. An optional `BEACON_SECURITY_EVIDENCE_FILE` contains finding JSONL with an 8 MiB current file and one `.1` rotated file; use a distinct path per process.

Local writing is asynchronous and bounded. Overload or filesystem failure can lose diagnostics while OTLP export continues independently. Files are neither a durable history nor a multi-process aggregation mechanism, and old process directories are not automatically removed. Return local output to `false` after diagnosis and manage retained files separately.

See the [versioned Security reference](https://github.com/beacon-observability/beacon-dotnet/tree/v1.1.2/beacon/security) for modeled calls, request budgets and contract provenance, and the [release notes](https://github.com/beacon-observability/beacon-dotnet/releases/tag/v1.1.2) for release acceptance and limitations.
