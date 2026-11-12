---
title: Ruby source integration
sidebar_label: Ruby
description: Install released Ruby instrumentation source and verify Net::HTTP traces over OTLP HTTP/protobuf.
---

# Ruby source integration

Beacon Ruby **[v1.2.0](https://github.com/beacon-observability/beacon-ruby/releases/tag/v1.2.0)** is a source release based on OpenTelemetry Ruby Contrib. Applications integrate the instrumentation gems and initialize the OpenTelemetry SDK explicitly. This release retains upstream instrumentation gem identities and distributes opt-in **beacon-security 0.1.0** and experimental **beacon-profiling 0.1.0** gems as GitHub Release assets. It does not publish to RubyGems or provide an executable agent or zero-code trace launcher.

## Requirements

- The example environment is **Ubuntu 24.04 x86_64, CRuby 3.3.12, and Bundler 2.5.22**. The source gem specifications require Ruby 3.3 or newer; Security and profiling CI also pass Linux CRuby 3.3, 3.4 and 4.0. The Collector example uses CRuby 3.3.12; other engines/platforms are outside the documented support scope.
- Download access to GitHub and RubyGems.
- Python 3 and Docker for the receiver check below.

## Download and verify

Run these commands in a new directory. They pin v1.2.0 and download its source, Security and profiling gems, provenance and checksums together:

```bash
ruby_release_tag=v1.2.0
ruby_release_version=${ruby_release_tag#v}
ruby_archive="beacon-ruby-${ruby_release_version}-source.tar.gz"
ruby_release_url="https://github.com/beacon-observability/beacon-ruby/releases/download/${ruby_release_tag}"

curl -fLO "${ruby_release_url}/${ruby_archive}"
curl -fLO "${ruby_release_url}/beacon-security-0.1.0.gem"
curl -fLO "${ruby_release_url}/beacon-profiling-0.1.0.gem"
curl -fLO "${ruby_release_url}/SOURCE.txt"
curl -fLO "${ruby_release_url}/SHA256SUMS"
sha256sum -c SHA256SUMS
tar -xzf "${ruby_archive}"
cd "beacon-ruby-${ruby_release_version}"
```

Continue only if checksum verification succeeds. `SOURCE.txt` records the source commit and upstream baseline. The archive includes source and licenses; the two gems are separate assets covered by the checksums. Dependencies are installed separately. The example environment and scope on this page describe v1.2.0; review the selected release's notes for changes.

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

Use the release's [Gemfile](https://github.com/beacon-observability/beacon-ruby/blob/v1.2.0/beacon/validation/Gemfile) and [Ruby example](https://github.com/beacon-observability/beacon-ruby/blob/v1.2.0/beacon/validation/http_smoke.rb) as references for the Net::HTTP integration. The Gemfile loads the base and Net::HTTP instrumentation from the released source and pins the Core SDK and OTLP exporter. Load the required libraries before initializing the SDK and enabling `OpenTelemetry::Instrumentation::Net::HTTP`.

This release provides the shared instrumentation base, Net::HTTP modes, and local Collector trace export. Security findings and runtime inventories also have a Logs export path; see [Ruby Security](security/ruby.md). Experimental profiling can upload pprof data to a local DataKit profiling input as described below. Rails-specific adapters, other trace integrations, metrics and general application logs are outside the documented support scope. See the [source installation guide](https://github.com/beacon-observability/beacon-ruby/blob/v1.2.0/beacon/INSTALLATION.md) and [release notes](https://github.com/beacon-observability/beacon-ruby/releases/tag/v1.2.0) before adapting the example.

## Enable Security

After verifying all assets, install the GitHub-distributed gem from the download directory:

```bash
gem install ./beacon-security-0.1.0.gem --no-document
```

Add that installed version to the application's Gemfile, or reference the extracted
`security` directory with a Bundler `path:` entry. Initialize the application's
OpenTelemetry Logs SDK/exporter, call `Beacon::Security.start`, and add its Rack
middleware. Set `BEACON_SECURITY_ENABLED=true`; local files remain disabled.
This requires application setup. See [Ruby Security](security/ruby.md) for the
complete startup, coverage, budgets and verification steps.

## Enable experimental profiling {#profiling}

Profiling is disabled by default. On Linux CRuby 3.3+, install the verified gem
with Ruby development headers and a C11 compiler available:

```bash
gem install ./beacon-profiling-0.1.0.gem --no-document
```

Add `gem 'beacon-profiling', '= 0.1.0'` to your application's Gemfile and run
`bundle install`. Alternatively reference the extracted `profiling` source directory.
After enabling the profiling input on local DataKit, start the application:

```bash
export OTEL_PROFILING_ENABLED=true
export OTEL_PROFILING_EXPORTER=datakit
export OTEL_PROFILING_PPROF_UPLOAD_URL=http://127.0.0.1:9529/profiling/v1/input
export OTEL_PROFILING_TYPES=wall,cpu
export OTEL_PROFILING_MEMORY_ENABLED=true
export OTEL_PROFILING_BACKEND=beacon
export OTEL_PROFILING_HEAP_ENABLED=true
export OTEL_PROFILING_GVL_ENABLED=true
export OTEL_SERVICE_NAME=my-ruby-service
bundle exec ruby -rbeacon/profiling/auto app.rb
```

The profiler combines CPU time, wall time, allocation counts, live heap objects,
live heap bytes and observed GVL waits into a 60-second pprof upload window.
Exceptions are optional with `OTEL_PROFILING_EXCEPTION_ENABLED=true`. CPU and
allocation sampling share native slices; wall, heap and GVL collection run alongside.
A short profile at shutdown is the remaining partial window, with its actual duration.
File export retains each slice's own start and duration. A trace OTLP endpoint
cannot receive these uploads.

Heap bytes estimate shallow sampled live object memory, not RSS or cumulative
allocation bytes. GVL events are bounded observed waits; timeline UI rendering,
production overhead and broader Ractor workloads remain unqualified. Linux
CRuby 3.3/3.4/4.0 compile/test/build CI passes; local receiver acceptance uses 3.3.12.
This preload enables profiling only and does not initialize trace SDKs.

Puma and Unicorn require explicit post-fork startup and shutdown hooks. See the
[released profiling guide](https://github.com/beacon-observability/beacon-ruby/blob/v1.2.0/profiling/README.md)
for lifecycle hooks, configuration, counters and limits. Set
`OTEL_PROFILING_ENABLED=false` and restart to disable profiling. If no data arrives,
check the DataKit profiling input, upload endpoint and `Beacon::Profiling.stats`
(`exported`, `failed`, `dropped`); an HTTP success does not independently prove UI indexing.

## Upgrade and rollback

Keep each source release in a separate directory. Retain the verified archive, checksums, `SOURCE.txt`, application Gemfile and lockfile, and SDK initialization. To roll back, restore the previous source reference, dependencies, and initialization, restart the application, and verify telemetry again.

- [Source repository](https://github.com/beacon-observability/beacon-ruby)
- [Releases and downloads](https://github.com/beacon-observability/beacon-ruby/releases)
- [Versioned technical reference](https://github.com/beacon-observability/beacon-ruby/blob/v1.2.0/beacon/validation/README.md)
