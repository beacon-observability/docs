---
sidebar_position: 6
title: OBI (eBPF)
description: Collect Linux HTTP server traces and metrics with the standalone Beacon OBI executable.
---

# OBI eBPF instrumentation

Beacon OBI **0.1.0** provides a standalone Linux amd64 executable based on upstream OpenTelemetry eBPF Instrumentation 1.0.0. It attaches eBPF probes to a selected application without adding an application SDK. Beacon versions and upstream versions are independent.

The accepted environment is Ubuntu 24.04, kernel 6.11, CPython 3.14.3, HTTP/1 server requests, and a local OTLP HTTP/protobuf receiver. Other platforms, protocols, runtimes, production receivers, Kubernetes, Profiling, and Security are outside this release's validated scope.

## Download and verify

Download the archive and checksum manifest from the [0.1.0 release](https://github.com/beacon-observability/beacon-obi/releases/tag/v0.1.0):

```bash
curl -fLO https://github.com/beacon-observability/beacon-obi/releases/download/v0.1.0/beacon-obi-0.1.0-linux-amd64.tar.gz
curl -fLO https://github.com/beacon-observability/beacon-obi/releases/download/v0.1.0/SHA256SUMS
sha256sum --check --ignore-missing SHA256SUMS
mkdir beacon-obi-0.1.0
tar -xzf beacon-obi-0.1.0-linux-amd64.tar.gz -C beacon-obi-0.1.0
cd beacon-obi-0.1.0
./obi --version
```

The command remains `obi`. Check that its output includes `Beacon OBI 0.1.0` and the release source commit. The release includes licenses, third-party notices, a component inventory, local build provenance, and an acceptance record. It does not claim a Beacon artifact signature or GitHub build attestation; checksums detect corruption.

## Run

The host needs kernel BTF at `/sys/kernel/btf/vmlinux` and root privileges or equivalent probe capabilities. Leave the application running, then select its listening port and configure the receiver:

```bash
sudo env \
  OTEL_EBPF_OPEN_PORT=8080 \
  OTEL_SERVICE_NAME=my-service \
  OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4318 \
  OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
  OTEL_EBPF_ENFORCE_SYS_CAPS=true \
  OTEL_EBPF_JAVAAGENT_ENABLED=false \
  ./obi
```

Replace the port, service name, and endpoint. This command uses the retained upstream legacy environment configuration path. Keep Java injection disabled for the accepted 0.1.0 setup. Select only the intended application and avoid running another agent over the same target until duplicate telemetry has been checked.

## Verify and diagnose

Send requests to the application. Verify the service name, nonzero trace/span identifiers, HTTP server spans with the expected response status, and `http.server.request.duration` observations in the receiver. Starting OBI successfully does not prove that telemetry arrived. Initial acceptance can observe a late metrics-upload message after the exporter closes during shutdown; a successful exit does not establish lossless final flushing.

If data is absent, check the selected listening port, BTF availability, privileges, probe attachment logs, receiver reachability, and export errors. Add `OTEL_EBPF_LOG_LEVEL=debug` to the same command for diagnostics, then remove it afterward. Metadata and application details may appear in diagnostic logs.

## Upgrade and rollback

Verify each new archive, retain the previous executable and configuration, stop OBI with SIGTERM or Ctrl+C, and start one replacement with the same explicit settings. Check telemetry again. To roll back, stop the replacement and restart the retained executable. To remove instrumentation, stop OBI; application source changes are not required.

See the [versioned installation guide](https://github.com/beacon-observability/beacon-obi/blob/v0.1.0/beacon/INSTALLATION.md) for detailed scope and the [release record](https://github.com/beacon-observability/beacon-obi/releases/tag/v0.1.0) for artifact acceptance. The downloaded upstream-derived source may contain additional features whose presence does not establish Beacon support.
