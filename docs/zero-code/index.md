---
sidebar_position: 1
title: Zero-code instrumentation
description: Choose a Beacon agent and instrument an unchanged application.
---

# Zero-code instrumentation

Zero-code instrumentation loads the OpenTelemetry SDK and library instrumentations through a runtime agent, preload hook, wrapper command, or native extension. You configure it outside the application, usually with environment variables.

Choose your runtime:

- [Java](java.md): attach one JAR with `-javaagent`.
- [Python](python.md): prefix the existing command with `beacon`.
- [Node.js](nodejs.md): preload one module with `NODE_OPTIONS`.
- [.NET](dotnet.md): launch the existing process with `beacon-dotnet run`.
- [PHP](php.md): enable the native hook and Composer autoloading.

All examples export to a receiver you control. See [common configuration](../configuration/index.md) before adding authentication headers or changing protocols.

