---
title: Beacon C++ SDK
sidebar_label: C++
description: Build the Beacon C++ 0.1.0 source SDK and send explicitly instrumented traces over OTLP/HTTP.
---

# Beacon C++ SDK

Beacon C++ is an independent downstream of the complete official OpenTelemetry C++
API, SDK, and exporters. The initial Beacon source release is
**[v0.1.0](https://github.com/beacon-observability/beacon-cpp/releases/tag/v0.1.0)**,
based on upstream 1.30.0 with retained history, namespaces, CMake identities, and
Apache-2.0 licensing. The upstream version in SDK metadata is distinct from the
Beacon distribution version.

Applications explicitly initialize the SDK and instrument source code. This release
provides a verified source archive; it does not provide a zero-code agent,
prebuilt binaries, or a package-index distribution.

## Requirements

Release acceptance covers Linux x86_64, Debian 13, GCC 14.2.0, CMake 3.31.6,
C++17 standard-library mode, static SDK libraries, ABI v1, and OTLP/HTTP Protobuf
traces to OpenTelemetry Collector Contrib 0.135.0. Install `g++`, `cmake`, `make`,
`libprotobuf-dev`, `protobuf-compiler`, `libcurl4-openssl-dev`, and
`nlohmann-json3-dev`. Other toolchains and platforms are outside this acceptance.

Run a reachable OTLP/HTTP receiver before starting the application. The example
uses the trace-specific URL `http://127.0.0.1:4318/v1/traces`. In containers,
loopback refers to the application container.

## Install and run

Download `beacon-cpp-0.1.0-source.tar.gz`, `release-manifest.json`, and `SHA256SUMS`
from the release into one directory. Use the attached source asset: GitHub's
automatic source archives omit the protocol submodule bundled in this asset.

```bash
sha256sum --check SHA256SUMS
tar -xzf beacon-cpp-0.1.0-source.tar.gz
cd beacon-cpp-0.1.0
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release -DCMAKE_CXX_STANDARD=17 \
  -DOTELCPP_WITH_STL=CXX17 -DOTELCPP_BUILD_TESTING=OFF \
  -DOTELCPP_WITH_BENCHMARK=OFF -DOTELCPP_WITH_EXAMPLES=OFF \
  -DOTELCPP_WITH_FUNC_TESTS=OFF -DOTELCPP_WITH_OTLP_HTTP=ON \
  -DOTELCPP_WITH_HTTP_CLIENT_CURL=ON \
  -DOTELCPP_PROTO_PATH="$PWD/third_party/opentelemetry-proto"
cmake --build build --parallel 3
cmake --install build --prefix "$PWD/install"
cmake -S beacon/acceptance -B build/application -DCMAKE_PREFIX_PATH="$PWD/install"
cmake --build build/application --parallel 3
./build/application/beacon_cpp_otlp http://127.0.0.1:4318/v1/traces
```

The complete [CMake consumer](https://github.com/beacon-observability/beacon-cpp/blob/v0.1.0/beacon/acceptance/CMakeLists.txt)
and [application source](https://github.com/beacon-observability/beacon-cpp/blob/v0.1.0/beacon/acceptance/main.cc)
show `find_package(opentelemetry-cpp CONFIG REQUIRED)`, trace and OTLP/HTTP exporter
targets, explicit service identity, batch processing, span parenting, and shutdown.
The example creates service `beacon-cpp-acceptance`, a `request` root, `work` child,
and `exit-final` child; it prints the trace ID after provider shutdown.

## Verify reception

Follow the [versioned acceptance guide](https://github.com/beacon-observability/beacon-cpp/blob/v0.1.0/beacon/acceptance/README.md)
to start the pinned Collector and verify the exact trace ID in its file output.
The verifier checks all three spans, nonzero trace/span IDs, service identity,
parent relationships, and final delivery during shutdown. A separate check covers
a bounded exporter failure when a local endpoint refuses connections.

The validated path is **application → OTLP/HTTP Protobuf → Collector file exporter**.
Application exit status alone does not establish reception. Collector acceptance
does not establish DataKit compatibility or storage in a downstream backend.
Network context propagation requires explicit injection/extraction in application
code; server-agent environment settings do not replace SDK initialization.

## Upgrade, rollback, and scope

Build each version into a separate prefix, rebuild the application against it,
and verify traces before deployment. Retain the previous SDK prefix and application
artifact; restore both together to roll back. Do not mix headers, libraries,
or ABI modes from different builds. See the
[versioned installation guide](https://github.com/beacon-observability/beacon-cpp/blob/v0.1.0/beacon/INSTALL.md)
for dependency and rollback details.

Metrics, Logs, OTLP/gRPC, DataKit, TLS/authentication, Profiling, Security,
automatic instrumentation, and other platforms are outside first-release acceptance.
The source retains upstream components beyond the validated trace configuration;
their presence does not establish Beacon support.
