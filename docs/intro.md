---
slug: /
sidebar_position: 1
title: Beacon documentation
description: Explore Beacon language agents, source integrations, tracing SDKs, and browser RUM.
---

# Observe applications with Beacon

Beacon combines independently released OpenTelemetry-based server agents, source integrations, and tracing SDKs with browser RUM through [Rumable](rumable.md). For server-side agents, pick a language, configure a service name and an OTLP receiver, then start the existing application through the agent.

For Rust applications, use the **[Fastrace Rust SDK](fastrace.md)**. See [Releases](https://github.com/beacon-observability/fastrace/releases) for available versions and downloads. Add fixed-tag Cargo dependencies, instrument application code, and initialize a reporter to send traces to local DataKit over OTLP/gRPC. Its guide covers installation, a working example, trace context, verification, and rollback.

## Start here

1. Choose a language or project from [Language projects](#language-projects) and open its guide.
2. Install the released agent, package, or source distribution using its setup guide.
3. Configure the application identity and receiver described in that guide.
4. Follow the guide to load the agent, initialize the SDK, or apply Rumable's generated Nginx/IIS setup command.

Server agents use OpenTelemetry settings such as `OTEL_SERVICE_NAME` and `OTEL_EXPORTER_OTLP_ENDPOINT`. Rumable uses browser application and reporting settings from its [configuration page](https://beacon-observability.github.io/rumable/latest/setup/index.html).

Zero-code setups require deployment configuration, while application source code stays unchanged. Automatic collection covers the supported frameworks, libraries, or website responses described in each guide.

## Language projects

| Language / project | Integration type | Integration | Profiling | Security | Releases |
| --- | --- | --- | --- | --- | --- |
| [Java](zero-code/java.md) | Zero-code | Agent: `-javaagent` | [Experimental JFR](profiling/java.md), opt in | [Opt in](security/java.md) | [Releases](https://github.com/beacon-observability/beacon-java/releases) |
| [Python](zero-code/python.md) | Zero-code | Launcher: `beacon` | [Opt in](profiling/python.md) | [Opt in](security/python.md) | [Releases](https://github.com/beacon-observability/beacon-python/releases) |
| [Node.js](zero-code/nodejs.md) | Zero-code | Preload: `NODE_OPTIONS` | [Opt in](profiling/nodejs.md) | [Opt in](security/nodejs.md) | [Releases](https://github.com/beacon-observability/beacon-nodejs/releases) |
| [.NET](zero-code/dotnet.md) | Zero-code | Launcher: `beacon-dotnet run` | No supported setup | No released capability | [Releases](https://github.com/beacon-observability/beacon-dotnet/releases) |
| [PHP](zero-code/php.md) | Zero-code | Native hook + Composer autoload | No supported setup | No released capability | [Composer](https://github.com/beacon-observability/beacon-php/releases) · [Extension](https://github.com/beacon-observability/beacon-php-instrumentation/releases) |
| [Ruby](https://github.com/beacon-observability/beacon-ruby/blob/v1.0.0/beacon/INSTALLATION.md) | SDK (source integration) | Source integration: Net::HTTP tracing | Outside validated scope | Outside validated scope | [Releases](https://github.com/beacon-observability/beacon-ruby/releases) |
| [Rust / Fastrace](fastrace.md) | SDK | Tracing SDK: explicit instrumentation | Not provided | Not provided | [Releases](https://github.com/beacon-observability/fastrace/releases) |
| [Browser / Rumable](rumable.md) | Zero-code | Web SDK injection: Nginx / IIS | Not provided | Not provided | [Releases](https://github.com/beacon-observability/rumable/releases) |

Each project is versioned and released independently. Follow the release links for available versions and download assets, and the language guides for runtime requirements. Profiling and Security in this table refer to server-side agent features; Rumable provides browser RUM.

Ruby currently provides a source release with a validated Net::HTTP trace path. It does not publish a Beacon gem or a zero-code preload; see its source installation guide for the validated environment and limitations. Fastrace requires application code instrumentation and reporter initialization.

Security is disabled by default. See the [Security guides](security/index.md) for the released Java, Python, and Node.js activation and runtime scope.
