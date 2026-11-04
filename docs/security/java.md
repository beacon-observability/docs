---
sidebar_position: 1
title: Java Security
description: Enable Beacon Security in the complete Beacon Java Agent.
---

# Java Security

Beacon Java 1.3.4 embeds Security in the complete Agent JAR. Keep the same
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
| `BEACON_SECURITY_EXPORT_NO_EVIDENCE_ENABLED` | `false` | Exports findings classified as `attack_evidence.status=no_evidence` when set to `true`. |
| `BEACON_SECURITY_SBOM_ENABLED` | `true` | Collects runtime SBOM while Security is enabled. |
| `BEACON_SECURITY_LOCAL_OUTPUT_ENABLED` | `false` | Enables process-local diagnostic snapshots. |
| `BEACON_SECURITY_OUTPUT` | `./beacon-security-output/<instance-id>` | Sets the diagnostic snapshot directory. |
| `BEACON_SECURITY_EVIDENCE_FILE` | Unset | Sets an optional diagnostic JSONL file. |

Normal OpenTelemetry variables configure resource identity, transport, and
authentication. Local output is for diagnosis only and is not durable or
cluster-wide delivery.

## Finding export policy

Findings classified as `attack_evidence.status=no_evidence` are not exported by default. `unknown`, `suspected`, and SBOM records remain eligible for export. Set `BEACON_SECURITY_EXPORT_NO_EVIDENCE_ENABLED=true` to restore the previous behavior. The switch controls OpenTelemetry Logs and evidence JSONL; internal detection, local finding snapshots, span summaries, and same-request evidence upgrades remain available. See the [shared export policy](index.md#finding-export-policy).

Java also accepts `-Dbeacon.security.export.no-evidence.enabled=true`; put the JVM option before `-jar`.

## Kubernetes

Put the complete released Agent JAR in the application image, or follow the [version-pinned initContainer example](https://github.com/beacon-observability/beacon-java/blob/v1.3.4/extensions/security/examples/kubernetes/init-container.yaml). When using the public image, change the example image to `ghcr.io/beacon-observability/beacon-java:1.3.4` and pin its digest for production. The init container copies the same JAR into an `emptyDir`; the application loads it with `JAVA_TOOL_OPTIONS`. Keep local output disabled for normal workloads.

Remove `BEACON_SECURITY_ENABLED` or set it to `false` to disable Security while
leaving normal zero-code telemetry active.
