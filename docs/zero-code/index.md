---
sidebar_position: 1
title: Zero-code instrumentation
description: Choose zero-code server instrumentation or browser RUM without changing application source code.
---

# Zero-code instrumentation

Zero-code instrumentation adds telemetry without modifying application source code. Setup still changes deployment configuration: server agents load OpenTelemetry through a runtime agent, preload hook, wrapper, or native extension; Rumable injects the bundled browser Web SDK through Nginx or IIS.

## Choose a project

| Project / runtime | Target | Zero-code entry point |
| --- | --- | --- |
| [Java](java.md) | JVM applications | Attach one JAR with `-javaagent` |
| [Python](python.md) | Python applications | Prefix the existing command with `beacon` |
| [Node.js](nodejs.md) | Node.js applications | Preload one module with `NODE_OPTIONS` |
| [.NET](dotnet.md) | .NET applications | Launch the existing process with `beacon-dotnet run` |
| [PHP](php.md) | PHP applications | Enable the native hook and Composer autoloading |
| [Rumable (browser RUM)](../rumable.md) | Websites served through Nginx or IIS | Generate and run a server setup command to inject the Web SDK |

## Configure and verify

Follow the selected project's guide to install the released package, configure the receiver, apply the deployment changes, and verify collection.

- **Server-side agents:** use [common configuration](../configuration/index.md) for service identity, OTLP export, and authentication settings.
- **Browser RUM:** use [Rumable's configuration page](https://beacon-observability.github.io/rumable/latest/setup/index.html) for the browser application, reporting endpoint, sampling, and privacy settings. Downloads come from [GitHub Releases](https://github.com/beacon-observability/rumable/releases/latest).

Browser RUM reporting and server-side OTLP export have separate configurations. Confirm the collected data in the intended receiver after deployment.
