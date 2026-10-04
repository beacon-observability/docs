---
sidebar_position: 1
title: Java Security
description: Enable Beacon Security in the complete Beacon Java Agent.
---

# Java Security

Beacon Java 1.1.0 embeds Security in the complete Agent JAR. Keep the same
`-javaagent` setup from the [Java zero-code guide](../zero-code/java.md); there
is no separate Security JAR to install or version.

## Enable Security

```bash
export BEACON_SECURITY_ENABLED=true
export OTEL_SERVICE_NAME=orders
export OTEL_RESOURCE_ATTRIBUTES=service.namespace=shop
export OTEL_LOGS_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4318
java -javaagent:./beacon-javaagent.jar -jar orders.jar
```

The Agent exports findings and runtime CycloneDX SBOM records through
OpenTelemetry Logs. Security is disabled by default. Findings are modeled
runtime observations or candidate risks rather than confirmed vulnerabilities.

## Configuration reference

| Environment variable | Default | Purpose |
| --- | --- | --- |
| `BEACON_SECURITY_ENABLED` | `false` | Enables the Security lifecycle and runtime observation. |
| `BEACON_SECURITY_SBOM_ENABLED` | `true` | Collects runtime SBOM while Security is enabled. |
| `BEACON_SECURITY_LOCAL_OUTPUT_ENABLED` | `false` | Enables process-local diagnostic snapshots. |
| `BEACON_SECURITY_OUTPUT` | `./beacon-security-output/<instance-id>` | Sets the diagnostic snapshot directory. |
| `BEACON_SECURITY_EVIDENCE_FILE` | Unset | Sets an optional diagnostic JSONL file. |

Normal OpenTelemetry variables configure resource identity, transport, and
authentication. Local output is for diagnosis only and is not durable or
cluster-wide delivery.

## Kubernetes

Release 1.1.0 does not publish a Beacon-owned container image. Put the released
Agent JAR in the application image, or build a private init image and use the
[version-pinned initContainer example](https://github.com/beacon-observability/beacon-java/blob/cc55c77be6247d4f0e3835639002415b683a220b/extensions/security/examples/kubernetes/init-container.yaml).
The init container copies the same complete Agent JAR into an `emptyDir`; the
application enables it with `JAVA_TOOL_OPTIONS`. Keep local output disabled for
normal workloads.

Remove `BEACON_SECURITY_ENABLED` or set it to `false` to disable Security while
leaving normal zero-code telemetry active.
