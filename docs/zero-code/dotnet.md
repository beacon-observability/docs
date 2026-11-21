---
sidebar_position: 4
title: .NET
description: Launch an unchanged .NET application with beacon-dotnet.
---

# .NET zero-code instrumentation

Beacon .NET 1.1.3 provides native packages and a cross-platform `beacon-dotnet` command. The following example uses Debian or Ubuntu on x64; use the [release page](https://github.com/beacon-observability/beacon-dotnet/releases/tag/v1.1.3) for other systems and architectures.

This release adopts [OpenTelemetry .NET Automatic Instrumentation v1.20.0](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/releases/tag/v1.20.0). Beacon package versions follow their own release sequence.

## Supported versions

| Runtime | Versions |
| --- | --- |
| CoreCLR | .NET 10, 11 |

Beacon .NET 1.1.3 moves modern CoreCLR support to .NET 10 and 11. Applications using .NET 8 or .NET 9 should keep [Beacon .NET 1.1.2](https://github.com/beacon-observability/beacon-dotnet/releases/tag/v1.1.2) until their runtime has been upgraded.

See the [Security guide](../security/dotnet.md) for Security OS and architecture requirements.

## Install

Download and install Beacon .NET:

```bash
curl -fL -o beacon-dotnet.deb \
  https://github.com/beacon-observability/beacon-dotnet/releases/download/v1.1.3/beacon-dotnet-1.1.3-linux-amd64.deb
sudo apt install ./beacon-dotnet.deb
beacon-dotnet status
```

<details>
<summary>Verify artifact provenance (optional)</summary>

With a recent GitHub CLI that supports artifact attestations, run before installing:

```bash
gh attestation verify beacon-dotnet.deb \
  --repo beacon-observability/beacon-dotnet \
  --signer-workflow beacon-observability/beacon-dotnet/.github/workflows/beacon-release.yml \
  --source-ref refs/tags/v1.1.3
```

</details>

## Run

```bash
export OTEL_SERVICE_NAME=my-dotnet-service
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4317
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
beacon-dotnet run dotnet MyApp.dll
```

`run` instruments only the child process. Beacon .NET does not currently expose a supported user-level continuous-profiling setup, so no profile variables are required.

## Upgrade and verify

Download the 1.1.3 package for the same system and architecture from the release page and install it using the same package manager. Restart the instrumented application after upgrading, then check `beacon-dotnet version` and `beacon-dotnet status`.

The release includes Linux glibc/musl x64 and ARM64 archives, a Windows archive and x64 MSI, a macOS ARM64 archive (macOS 14 or later), Linux DEB/RPM packages, and NuGet packages. Native packages are not yet OS-signed; use the optional command above to check artifact provenance.

## Optional Security

Version 1.1.3 includes experimental, default-off [Security and runtime assembly inventory](../security/dotnet.md). Enable it separately and verify OTLP Logs receipt. Its runtime support scope is narrower than the downloadable platform set.

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
