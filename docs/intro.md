---
slug: /
sidebar_position: 1
title: Beacon documentation
description: Set up Beacon server agents, the Fastrace Rust SDK, and Rumable browser RUM.
---

# Observe applications with Beacon

Beacon combines independently released OpenTelemetry-based server agents with browser RUM through [Rumable](rumable.md). For server telemetry, pick a language, configure a service name and an OTLP receiver, then start the existing application through the agent.

For Rust applications, use the **[Fastrace Rust SDK](fastrace.md)**, released as **[v0.1.0](https://github.com/beacon-observability/fastrace/releases/tag/v0.1.0)**. Add fixed-tag Cargo dependencies, instrument application code, and initialize a reporter to send traces to local DataKit over OTLP/gRPC. Its guide covers installation, a working example, trace context, verification, and rollback.

## Start here

1. Open [Zero-code instrumentation](zero-code/index.md) and choose a server runtime or browser RUM.
2. Install the released agent or package using its setup guide.
3. Configure the application identity and receiver described in that guide.
4. Enable the runtime agent, preload, or wrapper, or apply Rumable's generated Nginx/IIS setup command.

Server agents use OpenTelemetry settings such as `OTEL_SERVICE_NAME` and `OTEL_EXPORTER_OTLP_ENDPOINT`. Rumable uses browser application and reporting settings from its [configuration page](https://beacon-observability.github.io/rumable/latest/setup/index.html).

Zero-code setups require deployment configuration, while application source code stays unchanged. Automatic collection covers the supported frameworks, libraries, or website responses described in each guide.

## Current zero-code projects

| Project / runtime | Release(s) | Zero-code entry point | Profiling | Security |
| --- | --- | --- | --- | --- |
| Java | 1.1.0 | `-javaagent` | Experimental JFR, opt in | Optional, opt in |
| Python | 1.1.0 | `beacon` command | Optional, opt in | Optional on standard-GIL CPython 3.11–3.14 |
| Node.js | 1.2.0 | `NODE_OPTIONS` preload | Optional, opt in | Optional on Node.js 22.22.3+ or 24.11.1+ |
| .NET | 1.0.0 | `beacon-dotnet run` | No supported user setup | No released capability |
| PHP | Composer 1.1.2; native extension 1.0.1 | Native hook plus Composer autoload | No supported user setup | No released capability |
| [Rumable (browser RUM)](rumable.md) | [v0.1.9](https://github.com/beacon-observability/rumable/releases/tag/v0.1.9) | Web SDK injection through Nginx / IIS | Not provided | Not provided |

Each project is versioned and released independently. Use the version shown in its guide instead of assuming one shared Beacon version. Profiling and Security in this table refer to server-side agent features; Rumable provides browser RUM.

Security is disabled by default. See the [Security guides](security/index.md)
for the released Java, Python, and Node.js activation and runtime scope.
