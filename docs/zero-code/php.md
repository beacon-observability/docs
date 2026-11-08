---
sidebar_position: 5
title: PHP
description: Install Beacon PHP with one setup script and automatically load the Agent.
---

# PHP zero-code instrumentation

[Beacon PHP 1.3.0](https://github.com/beacon-observability/beacon-php/releases/tag/v1.3.0) supports PHP 8.2, 8.3 and 8.4. The default standalone installer selects Beacon native extension 1.0.1 and installs an isolated Agent runtime. It requires no Composer and preserves application dependencies. Linux glibc x86_64 has passed standalone acceptance; see the [release-specific deployment guide](https://github.com/beacon-observability/beacon-php/blob/v1.3.0/docs/standalone.md) for platform constraints.

## Install

```bash
curl --fail --location --output beacon-setup.php \
  https://github.com/beacon-observability/beacon-php/releases/download/v1.3.0/beacon-setup.php
php beacon-setup.php --php-bin=all \
  --service-name=my-php-service \
  --otlp-endpoint=http://127.0.0.1:4318
```

Run with permission to write PHP's extension/INI directories and the installation directory, which defaults to `/opt/beacon/php` on Unix. `--dry-run` previews changes. The release includes `SHA256SUMS` for independent installer verification; the installer verifies its downloaded runtime and native archives.

The runtime loads before application code and includes selected official PDO, cURL, Guzzle, Laravel and Symfony instrumentation. Existing `auto_prepend_file` behavior is preserved. Applications that need manual spans to share the Agent's SDK/context can use the [advanced Composer project mode](https://github.com/beacon-observability/beacon-php/blob/v1.3.0/docs/standalone.md#advanced-composer-project-integration).

## Run and manage

Restart PHP-FPM or Apache after installation, then generate application traffic. CLI applications keep their normal launch command:

```bash
php beacon-setup.php doctor --php-bin=all
php public/index.php
```

Service and endpoint defaults are recorded by the installer and work with PHP-FPM `clear_env=yes`. Application `OTEL_*` environment settings override defaults; PHP-FPM must pass those overrides to its workers through pool configuration.

Download the installer from the target release before upgrading. Removal restores the previous startup configuration; restart PHP services after either operation:

```bash
php beacon-setup.php upgrade --php-bin=all
php beacon-setup.php uninstall --php-bin=all
```

[Security and runtime SBOM](../security/php.md) are experimental and opt-in. Beacon PHP does not currently ship a profiling component.

## Native extension 1.1.0

[Beacon PHP Instrumentation 1.1.0](https://github.com/beacon-observability/beacon-php-instrumentation/releases/tag/v1.1.0)
is a separate native extension release based on OpenTelemetry extension 1.5.0.
Its asset/product version is 1.1.0; `phpversion("opentelemetry")` reports 1.5.0.
The PHP Agent 1.3.0 installer above still selects native extension 1.0.1.
Running its upgrade command does not select native extension 1.1.0.

For an explicitly managed native installation, use the matching archive and
`SHA256SUMS` from that release. Match PHP 8.2/8.3/8.4, operating system,
architecture, NTS/TS and Windows compiler ABI exactly; Windows PHP 8.2/8.3
use VS16, and PHP 8.4 uses VS17. See the
[versioned native installation guide](https://github.com/beacon-observability/beacon-php-instrumentation/blob/v1.1.0/beacon/README.md).
The Linux x86_64/PHP 8.3 artifact passed real PDO trace receipt with the
published Agent 1.3.0 runtime. The release CI matrix is not an application or
framework compatibility guarantee.

## Debugging and diagnostics

```bash
php beacon-setup.php doctor --php-bin=all > beacon-php-doctor.txt
OTEL_LOG_LEVEL=debug OTEL_PHP_LOG_DESTINATION=stderr \
  php public/index.php 2> beacon-php-debug.log
```

`doctor` checks managed startup configuration, the Beacon extension and actual standalone bootstrap for CLI targets. It does not acknowledge OTLP delivery. Verify an actual request for each FPM pool: CLI and FPM may use different INI files, environment variables and pool overrides.

For PHP-FPM, pass the debug variables to actual workers and collect standard error through FPM logging. Remove debug overrides and restart workers after troubleshooting.
