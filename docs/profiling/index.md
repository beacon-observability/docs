---
sidebar_position: 3
title: Profiling
description: Configure profiling for Beacon languages that provide it.
---

# Profiling

Profiling is configured separately from traces, metrics, and logs. A normal OTLP telemetry endpoint does not automatically accept JFR or pprof uploads.

| Language | Profile formats | Export options | Status |
| --- | --- | --- | --- |
| [Java](java.md) | JFR | Local files, HTTP multipart upload | Experimental |
| [Python](python.md) | OTLP Profiles, pprof | OTLP/HTTP, pprof HTTP upload, local files | Optional |
| [Node.js](nodejs.md) | pprof | HTTP upload | Optional |

.NET and PHP do not currently expose a supported user-level profiling setup in Beacon.
