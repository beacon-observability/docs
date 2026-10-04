---
slug: /
sidebar_position: 1
title: Beacon documentation
description: Add OpenTelemetry-based observability to applications without changing source code.
---

# Observe applications without changing their code

Beacon provides independently released automatic-instrumentation agents built on OpenTelemetry. Pick a language, configure a service name and an OTLP receiver, then start the existing application through the agent.

## Start here

1. Open [Zero-code instrumentation](zero-code/index.md) and select your runtime.
2. Install the released agent or package.
3. Set `OTEL_SERVICE_NAME`, `OTEL_EXPORTER_OTLP_ENDPOINT`, and the protocol accepted by your receiver.
4. Launch the application with the documented wrapper, preload, or runtime agent.

No application source changes are required. Automatic instrumentation observes supported frameworks and libraries; it does not automatically describe every business operation inside application code.

## Current language releases

| Language | Release(s) | Zero-code entry point | Profiling | Security |
| --- | --- | --- | --- | --- |
| Java | 1.1.0 | `-javaagent` | Experimental JFR, opt in | Optional, opt in |
| Python | 1.1.0 | `beacon` command | Optional, opt in | Optional on standard-GIL CPython 3.11–3.14 |
| Node.js | 1.2.0 | `NODE_OPTIONS` preload | Optional, opt in | Optional on Node.js 22.22.3+ or 24.11.1+ |
| .NET | 1.0.0 | `beacon-dotnet run` | No supported user setup | No released capability |
| PHP | Composer 1.1.2; native extension 1.0.1 | Native hook plus Composer autoload | No supported user setup | No released capability |

Each language is versioned and released independently. Use the version shown in its guide instead of assuming one shared Beacon version.

Security is disabled by default. See the [Security guides](security/index.md)
for the released Java, Python, and Node.js activation and runtime scope.
