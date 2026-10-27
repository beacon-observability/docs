---
title: Ruby source integration
sidebar_label: Ruby
description: Install released Ruby instrumentation source and verify Net::HTTP traces over OTLP HTTP/protobuf.
---

# Ruby source integration

Beacon Ruby **[v1.0.0](https://github.com/beacon-observability/beacon-ruby/releases/tag/v1.0.0)** is a source release based on OpenTelemetry Ruby Contrib. Applications integrate the instrumentation gems and initialize the OpenTelemetry SDK explicitly. This release retains upstream gem identities; it does not publish a Beacon gem, executable agent, or zero-code preload.

## Requirements

- The validated environment is **Ubuntu 24.04 x86_64, CRuby 3.3.12, and Bundler 2.5.22**. The source gem specifications require Ruby 3.3 or newer; other runtimes and platforms are outside this release's validated scope.
- Download access to GitHub and RubyGems.
- Python 3 and Docker for the receiver check below.

## Download and verify

Run these commands in a new directory to download the source and verify its checksums:

```bash
curl -fLO https://github.com/beacon-observability/beacon-ruby/releases/download/v1.0.0/beacon-ruby-1.0.0-source.tar.gz
curl -fLO https://github.com/beacon-observability/beacon-ruby/releases/download/v1.0.0/SOURCE.txt
curl -fLO https://github.com/beacon-observability/beacon-ruby/releases/download/v1.0.0/SHA256SUMS
sha256sum -c SHA256SUMS
tar -xzf beacon-ruby-1.0.0-source.tar.gz
cd beacon-ruby-1.0.0
```

Continue only if checksum verification succeeds. `SOURCE.txt` records the source commit and upstream baseline. The archive includes source and licenses; dependencies are installed separately.

## Verify Net::HTTP traces

From the extracted source directory, use the release's locked dependencies and receiver check:

```bash
cd beacon/validation
BUNDLE_FROZEN=true bundle install
docker pull otel/opentelemetry-collector-contrib:0.135.0
BUNDLE_FROZEN=true python3 collector_smoke.py
```

The harness starts a temporary HTTP server and a local OpenTelemetry Collector, then runs the instrumented Ruby HTTP request. It uses OTLP HTTP/protobuf and verifies service `beacon-ruby-import-smoke`, one root span, one HTTP client span, their shared trace ID, and the parent span relationship. On success it prints:

```text
Collector received the service identity and correlated root/client spans.
```

The harness removes its temporary servers, container, and trace output afterward. This verifies the synthetic request at the local Collector; it does not establish production backend ingestion.

## Application integration and scope

Use the release's [Gemfile](https://github.com/beacon-observability/beacon-ruby/blob/v1.0.0/beacon/validation/Gemfile) and [Ruby example](https://github.com/beacon-observability/beacon-ruby/blob/v1.0.0/beacon/validation/http_smoke.rb) as references for the validated Net::HTTP path. The Gemfile loads the base and Net::HTTP instrumentation from the released source and pins the Core SDK and OTLP exporter. Load the required libraries before initializing the SDK and enabling `OpenTelemetry::Instrumentation::Net::HTTP`.

Release acceptance covers the shared instrumentation base, Net::HTTP modes, and local Collector trace export. Rails, other integrations, DataKit, metrics, logs, profiling, and Security are outside this release's validated scope. See the [source installation guide](https://github.com/beacon-observability/beacon-ruby/blob/v1.0.0/beacon/INSTALLATION.md) and [release notes](https://github.com/beacon-observability/beacon-ruby/releases/tag/v1.0.0) before adapting the example.

## Upgrade and rollback

Keep each source release in a separate directory. Retain the verified archive, checksums, `SOURCE.txt`, application Gemfile and lockfile, and SDK initialization. To roll back, restore the previous source reference, dependencies, and initialization, restart the application, and verify telemetry again.

- [Source repository](https://github.com/beacon-observability/beacon-ruby)
- [Releases and downloads](https://github.com/beacon-observability/beacon-ruby/releases)
- [Versioned acceptance record](https://github.com/beacon-observability/beacon-ruby/blob/v1.0.0/beacon/validation/README.md)
