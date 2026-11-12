---
sidebar_label: Ruby
sidebar_position: 5
title: Ruby Security
description: Enable the GitHub-distributed Beacon Ruby Security gem and verify findings and runtime inventories.
---

# Ruby Security

[Beacon Ruby v1.1.0](https://github.com/beacon-observability/beacon-ruby/releases/tag/v1.1.0)
distributes `beacon-security-0.1.0.gem` alongside its source archive. Security is
disabled by default and requires explicit Rack middleware and SDK setup.
Use the [Ruby download guide](../ruby.md) to verify the four Release assets first.
The gem is not published on RubyGems; its OTel runtime dependencies come from RubyGems.

## Application setup

After installing the downloaded gem, use these Gemfile entries:

```ruby
gem 'beacon-security', '= 0.1.0'
gem 'opentelemetry-sdk'
gem 'opentelemetry-logs-sdk'
gem 'opentelemetry-exporter-otlp-logs'
```

Load Rack and optional clients before starting Security. In a Rack application's
`config.ru`, after configuring the application's OpenTelemetry providers:

```ruby
require 'rack'
require 'net/http'
# require 'pg'
# require 'mysql2'
require 'opentelemetry/sdk'
require 'opentelemetry/sdk/logs'
require 'opentelemetry-exporter-otlp-logs'
require 'beacon/security'

OpenTelemetry::SDK.configure
security = Beacon::Security.start
use Beacon::Security::Middleware, runtime: security
run MyApplication
```

Place Security middleware inside the OTel Rack server-span middleware for trace
correlation. Configure the application service/resource identity and the Logs
receiver using its existing OpenTelemetry settings:

```bash
BEACON_SECURITY_ENABLED=true OTEL_LOGS_EXPORTER=otlp OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4318 bundle exec rackup
```

Start once per worker after fork. On shutdown call `security.force_flush`, then
`security.shutdown`, then flush/shut down the application's OTel providers.
Clients loaded later need an explicit `Beacon::Security::Hooks.install` call.

## Configuration and scope

| Variable | Default | Meaning |
| --- | --- | --- |
| `BEACON_SECURITY_ENABLED` | `false` | Enable the runtime. |
| `BEACON_SECURITY_SBOM_ENABLED` | `true` | Collect activated gems while Security is enabled. |
| `BEACON_SECURITY_SBOM_REFRESH_SECONDS` | `300` | Positive delay after collection; invalid/zero values use 300. |
| `BEACON_SECURITY_LOCAL_OUTPUT_ENABLED` | `false` | Enable process-local diagnostics. |
| `BEACON_SECURITY_OUTPUT` | `beacon-security-output` | Diagnostic directory. |
| `BEACON_SECURITY_EVIDENCE_FILE` | unset | Optional findings JSONL, only when local output is enabled. |

Rack flat query/header values are correlated with selected PG/mysql2 SQL template,
Kernel system/spawn, File and Net::HTTP calls. Bound SQL parameter values are
excluded from template matching. Authorization and cookie headers are excluded.
No request values, SQL or shell text are exported. An application route override
must be a static template, never a raw request path.

This is bounded substring correlation: unrelated equal strings can match and
transformed values can lose matches. Findings use schema v2, fingerprint v1,
`precision=approximate`, `collection_complete=false` and attack evidence `unknown`.
They are invocation observations, not confirmed vulnerabilities. Body capture,
async propagation, streaming bodies, sanitizer/attack analysis, Rails-specific
adapters and other client APIs are outside the model.

Each request retains at most 64 sources (4096 bytes each, 65,536 bytes total),
128 fingerprints and 1024 sink observations. Query/sink inputs over 65,536 bytes
are not analyzed. A 1024-record queue and 65,536-byte record limit bound delivery;
full queues drop records without replay. Runtime inventory observes at most
10,000 activated gems, publishes unchanged lists periodically and splits large
lists into parts that consumers must assemble before replacing inventory.
Linux procfs and boot-time clocks supply process timing; unsupported timing emits
no inventory. Collector receipt is best effort, not backend acknowledgement.

## Verify and disable

From the extracted source's `security` directory, install the locked development
bundle and run `python3 test/collector_smoke.py` with Docker and the cached
Collector 0.135.0 image. The development bundle includes native database clients;
MySQL needs client development headers/libraries. This checks real finding and
inventory Logs, scope/resource identity, event names and trace correlation.

Security CI passes Linux CRuby 3.3/3.4/4.0; the local Collector example uses CRuby
3.3.12. JRuby, other operating systems, DataKit and backend ingestion are outside this guide’s support scope. See the [versioned reference](https://github.com/beacon-observability/beacon-ruby/blob/v1.1.0/security/README.md)
and [technical reference](https://github.com/beacon-observability/beacon-ruby/blob/v1.1.0/beacon/validation/security-1.1.0.md).

If no records arrive, check opt-in settings, middleware placement, client load
order and the application's actual Logs exporter/receiver pipeline. Findings
require a modeled input match; absence is not a safety verdict. Set
`BEACON_SECURITY_ENABLED=false` and restart to disable Security. To roll back,
restore the previous source/gem and application lockfile; v1.0.0 has no Security.
