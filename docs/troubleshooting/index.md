---
sidebar_position: 4
title: Troubleshooting
description: Diagnose missing telemetry after zero-code setup.
---

# Troubleshooting

Work through these checks in order:

1. Confirm the agent version: inspect the Java JAR name, or run `beacon --version`, `npm ls @beacon-observability/nodejs`, `beacon-dotnet version`, or `vendor/bin/beacon-php --version`.
2. Confirm `OTEL_SERVICE_NAME`, endpoint, and protocol in the same process environment that starts the application.
3. Test network access from the application host to the receiver port.
4. Generate traffic through a supported framework or library; startup alone may not create a span.
5. Temporarily set `OTEL_LOG_LEVEL=debug`, reproduce once, then remove it because debug output is verbose.

## Profiles are missing

- Java: check that the runtime is JDK 11 or later and that the profile directory is writable.
- Python and Node.js: verify `OTEL_PROFILING_ENABLED=true`, the upload URL, and that the process lives longer than the export interval.
- Do not send a profile payload to an OTLP traces endpoint; the configured receiver must accept the documented pprof upload format.

If the application fails only when the agent is active, disable the agent first to restore service, preserve the agent debug log, runtime version, command line with secrets removed, and the smallest reproducible request.

