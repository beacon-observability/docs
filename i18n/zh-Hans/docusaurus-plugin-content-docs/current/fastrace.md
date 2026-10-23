---
title: Fastrace Rust SDK
description: Install Fastrace v0.1.0 and report Rust application traces to local DataKit over OTLP/gRPC.
---

# Fastrace Rust SDK

Fastrace is the Rust tracing SDK in Beacon, **based on [fast/fastrace](https://github.com/fast/fastrace)**. The current Beacon source release is **[v0.1.0](https://github.com/beacon-observability/fastrace/releases/tag/v0.1.0)**. It retains the upstream crate names, APIs, copyright notices, and Apache-2.0 license, and is maintained from a pinned source baseline without a GitHub fork relationship.

Applications add the SDK, instrument their code, and initialize a reporter explicitly. The release distributes source through a fixed Git tag and a verified archive. Beacon's `v0.1.0` distribution version is separate from the retained upstream crate versions; crates.io dependencies such as `fastrace = "0.7"` select the upstream distribution.

## Requirements

- Rust **1.91.0 or newer** and Cargo, with access to GitHub and dependency sources.
- A running local DataKit with its OpenTelemetry gRPC receiver enabled at **`http://127.0.0.1:4317`**. Release ingestion acceptance used **DataKit 1.94.2 on Linux**.

## Install and instrument

Add the following dependencies to your application's `Cargo.toml`:

```toml
[dependencies]
fastrace = { git = "https://github.com/beacon-observability/fastrace.git", tag = "v0.1.0", features = ["enable"] }
fastrace-opentelemetry = { git = "https://github.com/beacon-observability/fastrace.git", tag = "v0.1.0" }
opentelemetry = { version = "0.33.1", default-features = false, features = ["trace"] }
opentelemetry-otlp = { version = "0.33.1", default-features = false, features = ["trace", "grpc-tonic"] }
opentelemetry_sdk = { version = "0.33.1", default-features = false, features = ["trace"] }
tokio = { version = "1.52.3", features = ["rt-multi-thread", "macros"] }
```

Applications need the `enable` feature to collect spans. Libraries should leave collection to the application. Use the same Git tag for all Fastrace crates, including `fastrace-futures` if needed. Commit the application lockfile and use `cargo build --locked` for subsequent builds. Check `cargo tree` for duplicate Git and registry Fastrace sources; their span types have different Cargo identities.

Initialize the exporter inside the Tokio runtime and configure the service name and local receiver in code. This example writes two spans before exiting:

```rust
use std::borrow::Cow;
use std::error::Error;
use std::time::Duration;

use fastrace::collector::Config;
use fastrace::prelude::*;
use opentelemetry_otlp::WithExportConfig;

#[tokio::main(flavor = "multi_thread")]
async fn main() -> Result<(), Box<dyn Error>> {
    let exporter = opentelemetry_otlp::SpanExporter::builder()
        .with_tonic()
        .with_endpoint("http://127.0.0.1:4317")
        .with_timeout(Duration::from_secs(5))
        .build()?;
    let reporter = fastrace_opentelemetry::OpenTelemetryReporter::new(
        exporter,
        Cow::Owned(
            opentelemetry_sdk::Resource::builder()
                .with_service_name("fastrace-demo")
                .build(),
        ),
        opentelemetry::InstrumentationScope::builder("fastrace-example").build(),
    );
    fastrace::set_reporter(reporter, Config::default());

    {
        let root = Span::root("request", SpanContext::random());
        let _guard = root.set_local_parent();
        handle_request();
    }

    fastrace::flush();
    Ok(())
}

#[fastrace::trace]
fn handle_request() {
    std::thread::sleep(Duration::from_millis(10));
}
```

Save this as `src/main.rs`, run `cargo run`, then confirm that service `fastrace-demo`, its `request` root span, and the instrumented `handle_request` function span arrive in the backend. The macro uses the full function path as the default span name. Close root spans before calling `fastrace::flush()` so the final trace is available for export. Process exit alone does not establish backend ingestion.

The reporting path is **application → Fastrace OpenTelemetry reporter → OTLP/gRPC with Protobuf → local DataKit → configured backend**. This example sets the endpoint and service name explicitly; the [server-agent environment-variable setup](configuration/index.md) does not replace SDK initialization. In containers, `127.0.0.1` refers to the container itself; ensure the configured DataKit receiver is reachable from the application.

## Trace context and verification

Trace IDs are **128-bit values**, represented as 32 hexadecimal characters; span IDs are **64-bit values**, represented as 16 hexadecimal characters. For cross-service HTTP propagation, explicitly inject and extract W3C `traceparent` and `tracestate` using `W3CTraceContext`. The SDK does not automatically instrument HTTP boundaries or retain arbitrary `tracestate` through internal spans.

The [versioned acceptance guide](https://github.com/beacon-observability/fastrace/blob/v0.1.0/docs/validation.md) provides a runnable two-process HTTP example and backend verifier. From the release source, run:

```bash
python3 beacon/validation/otlp/run.py --output /tmp/fastrace-datakit-acceptance
```

The runner requires Python 3.9 or newer on Linux, the gRPC receiver above, and DataKit's status API at `http://127.0.0.1:9529/v1/ping`. Its initial evidence deliberately has `backend_verified: false`. Follow the guide to query the exact trace ID and verify all five stored spans, services, parent relationships, propagated headers, and final pre-exit delivery. The [release notes](https://github.com/beacon-observability/fastrace/releases/tag/v0.1.0) record the tested source assets, receiver, toolchain, absolute query windows, and results.

## Artifacts and maintenance

GitHub Releases provides `fastrace-0.1.0-source.tar.gz`, `release-manifest.json`, and `SHA256SUMS`. Download all three assets into one directory and run `sha256sum --check SHA256SUMS` before extraction. The [versioned installation guide](https://github.com/beacon-observability/fastrace/blob/v0.1.0/docs/installation.md) covers archive builds, dependency provenance, upgrades, and rollback.

Release ingestion acceptance covers **traces through local DataKit OTLP/gRPC on Linux**. Metrics, logs, other receiver/protocol combinations, and automatic instrumentation are outside that acceptance. The source release does not publish a Beacon-owned crates.io package or prebuilt agent executable. A possible future `beacon-rust` project based on OpenTelemetry Rust remains separate.

- [Source repository](https://github.com/beacon-observability/fastrace)
- [Versioned SDK documentation](https://github.com/beacon-observability/fastrace/blob/v0.1.0/docs/README.md)
- [Upstream baseline and synchronization](https://github.com/beacon-observability/fastrace/blob/v0.1.0/beacon/UPSTREAM.md)
