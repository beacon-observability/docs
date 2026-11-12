---
slug: /
sidebar_position: 1
title: Beacon documentation
description: Explore Beacon language agents, source integrations, tracing SDKs, and browser RUM.
---

# Observe applications with Beacon

Beacon combines independently released OpenTelemetry-based server agents, source integrations, and tracing SDKs with browser RUM through [Rumable](rumable.md). For server-side agents, pick a language, configure a service name and an OTLP receiver, then start the existing application through the agent.

For Rust applications, use the **[Fastrace Rust SDK](fastrace.md)**. See [Releases](https://github.com/beacon-observability/fastrace/releases) for available versions and downloads. Add fixed-tag Cargo dependencies, instrument application code, and initialize a reporter to send traces to local DataKit over OTLP/gRPC. Its guide covers installation, a working example, trace context, verification, and rollback.

For C++ applications, use the [Beacon C++ SDK](cpp.md) source release. Build the fixed-version source archive, initialize the SDK, and instrument application code explicitly; its guide covers OTLP/HTTP trace reception and rollback.

With [OBI (eBPF)](zero-code/obi.md), run a standalone process against a selected Linux application while preserving the application launch command. See the OBI guide for privileges and documented support scope.

## Start here

1. Choose a language or project from [Language projects](#language-projects) and open its guide.
2. Install the released agent, package, or source distribution using its setup guide.
3. Configure the application identity and receiver described in that guide.
4. Follow the guide to load the agent, initialize the SDK, or apply Rumable's generated Nginx/IIS setup command.

Server agents use OpenTelemetry settings such as `OTEL_SERVICE_NAME` and `OTEL_EXPORTER_OTLP_ENDPOINT`. Rumable uses browser application and reporting settings from its [configuration page](https://beacon-observability.github.io/rumable/latest/setup/index.html).

Zero-code setups require deployment configuration, while application source code stays unchanged. Automatic collection covers the supported frameworks, libraries, or website responses described in each guide.

## Supported language versions

These versions apply to the Beacon releases in the language guides. See those guides for additional profiling and Security requirements.

| Language | Version requirements |
| --- | --- |
| [Java](zero-code/java.md) | JDK 1.8 (Java 8), 11, 17, 21, 25, 26 |
| [Python](zero-code/python.md) | Python 3.10, 3.11, 3.12, 3.13, 3.14 |
| [Node.js](zero-code/nodejs.md) | Node.js 18.19+, 20.6+, 22, 24 |
| [.NET](zero-code/dotnet.md) | CoreCLR .NET 8, 9, 10; see the language guide for OS and architecture limits |
| [PHP](zero-code/php.md) | PHP 8.2, 8.3, 8.4 |
| [Ruby](ruby.md) | CRuby 3.3.12; source gems require Ruby 3.3+, see the language guide for other runtimes |
| [Rust / Fastrace](fastrace.md) | Rust 1.91.0+ and Cargo |
| [C++](cpp.md) | C++17; see the language guide for build requirements |

## Language projects

| Language / project | Integration type | Integration | Profiling | Security | Releases |
| --- | --- | --- | --- | --- | --- |
| [Java](zero-code/java.md) | Zero-code | Agent: `-javaagent` | [Experimental JFR](profiling/java.md), opt in | [Opt in](security/java.md) | [Releases](https://github.com/beacon-observability/beacon-java/releases) |
| [Python](zero-code/python.md) | Zero-code | Launcher: `beacon` | [Opt in](profiling/python.md) | [Opt in](security/python.md) | [Releases](https://github.com/beacon-observability/beacon-python/releases) |
| [Node.js](zero-code/nodejs.md) | Zero-code | Preload: `NODE_OPTIONS` | [Opt in](profiling/nodejs.md) | [Opt in](security/nodejs.md) | [Releases](https://github.com/beacon-observability/beacon-nodejs/releases) |
| [.NET](zero-code/dotnet.md) | Zero-code | Launcher: `beacon-dotnet run` | No supported setup | [Experimental, opt in](security/dotnet.md) | [Releases](https://github.com/beacon-observability/beacon-dotnet/releases) |
| [PHP](zero-code/php.md) | Zero-code | Installer: `beacon-setup.php` | No supported setup | [Experimental, opt in](security/php.md) | [Releases](https://github.com/beacon-observability/beacon-php/releases) |
| [Ruby](ruby.md) | SDK (source integration) | Source integration: Net::HTTP tracing | [Experimental profiling](ruby.md#profiling) | [Opt-in gem](security/ruby.md) | [Releases](https://github.com/beacon-observability/beacon-ruby/releases) |
| [Rust / Fastrace](fastrace.md) | SDK | Tracing SDK: explicit instrumentation | Not provided | Not provided | [Releases](https://github.com/beacon-observability/fastrace/releases) |
| [C++](cpp.md) | SDK | Source SDK: explicit instrumentation | Not provided | Not provided | [Releases](https://github.com/beacon-observability/beacon-cpp/releases) |
| [OBI (eBPF)](zero-code/obi.md) | Zero-code | Standalone eBPF process | Outside documented support scope | Outside documented support scope | [Releases](https://github.com/beacon-observability/beacon-obi/releases) |
| [Browser / Rumable](rumable.md) | Zero-code | Web SDK injection: Nginx / IIS | Not provided | Not provided | [Releases](https://github.com/beacon-observability/rumable/releases) |

Each project is versioned and released independently. Follow the release links for available versions and download assets, and the language guides for runtime requirements. Profiling and Security in this table refer to server-side agent features; Rumable provides browser RUM.

Ruby currently provides a source release with Net::HTTP tracing. Release v1.2.0 distributes opt-in Security and experimental profiling gems on GitHub. Tracing and Security require explicit SDK setup; profiling has a separate preload; see the [Ruby guide](ruby.md) for the example environment and limitations. Fastrace requires application code instrumentation and reporter initialization.

Security is disabled by default. See the [Security guides](security/index.md) for the released Java, Python, Node.js, .NET, PHP, and Ruby activation and runtime scope.

Java 1.3.4, Python 1.2.4, and Node.js 2.0.2 suppress findings without exploitation evidence by default and provide a switch to include them. See the [Security export policy](security/index.md#finding-export-policy).
