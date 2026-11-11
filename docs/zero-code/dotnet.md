---
sidebar_position: 4
title: .NET
description: Launch an unchanged .NET application with beacon-dotnet.
---

# .NET zero-code instrumentation

Beacon .NET 1.1.2 provides native packages and a cross-platform `beacon-dotnet` command. The following example uses Debian or Ubuntu on x64; use the [release page](https://github.com/beacon-observability/beacon-dotnet/releases/tag/v1.1.2) for other systems and architectures.

This release adopts [OpenTelemetry .NET Automatic Instrumentation v1.19.1](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/releases/tag/v1.19.1). Beacon package versions follow their own release sequence.

## Install

Use a recent GitHub CLI with artifact-attestation support. Download and verify the asset before installing:

```bash
curl -fLO https://github.com/beacon-observability/beacon-dotnet/releases/download/v1.1.2/beacon-dotnet-1.1.2-linux-amd64.deb
gh attestation verify beacon-dotnet-1.1.2-linux-amd64.deb \
  --repo beacon-observability/beacon-dotnet \
  --signer-workflow beacon-observability/beacon-dotnet/.github/workflows/beacon-release.yml \
  --source-ref refs/tags/v1.1.2
sudo apt install ./beacon-dotnet-1.1.2-linux-amd64.deb
beacon-dotnet status
```

## Run

```bash
export OTEL_SERVICE_NAME=my-dotnet-service
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4317
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
beacon-dotnet run dotnet MyApp.dll
```

`run` instruments only the child process. Beacon .NET does not currently expose a supported user-level continuous-profiling setup, so no profile variables are required.

## Upgrade and verify

Download the 1.1.2 package for the same system and architecture from the release page and install it using the same package manager. Restart the instrumented application after upgrading, then check `beacon-dotnet version` and `beacon-dotnet status`.

The release includes Linux glibc/musl x64 and ARM64 archives, a Windows archive and x64 MSI, a macOS ARM64 archive (macOS 14 or later), Linux DEB/RPM packages, and NuGet packages. Native packages are not yet OS-signed; verify each downloaded asset as shown above before installing.

## Optional Security

Version 1.1.2 includes experimental, default-off [Security and runtime assembly inventory](../security/dotnet.md). Enable it separately and verify OTLP Logs receipt. Its validated runtime scope is narrower than the downloadable platform set.

## Debugging and diagnostics

Check the installation status, then choose a writable directory for instrumentation debug logs:

```bash
beacon-dotnet status
mkdir -p beacon-dotnet-logs
OTEL_LOG_LEVEL=debug OTEL_DOTNET_AUTO_LOGGER=file \
  OTEL_DOTNET_AUTO_LOG_DIRECTORY="$PWD/beacon-dotnet-logs" \
  beacon-dotnet run dotnet MyApp.dll
```

The application process identity must have write access to `OTEL_DOTNET_AUTO_LOG_DIRECTORY`. To view diagnostics in the console, change `OTEL_DOTNET_AUTO_LOGGER` to `console`.

Return to the normal launch command after troubleshooting. Remove any debug variables added to service configuration and restart the application.
