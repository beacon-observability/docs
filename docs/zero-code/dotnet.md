---
sidebar_position: 4
title: .NET
description: Launch an unchanged .NET application with beacon-dotnet.
---

# .NET zero-code instrumentation

Beacon .NET 1.0.0 provides native packages and a cross-platform `beacon-dotnet` command. The following example uses Debian or Ubuntu on x64; use the [release page](https://github.com/beacon-observability/beacon-dotnet/releases/tag/v1.0.0) for other systems and architectures.

## Install

```bash
curl -fLO https://github.com/beacon-observability/beacon-dotnet/releases/download/v1.0.0/beacon-dotnet-1.0.0-linux-amd64.deb
sudo apt install ./beacon-dotnet-1.0.0-linux-amd64.deb
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
