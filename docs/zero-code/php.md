---
sidebar_position: 5
title: PHP
description: Enable PHP automatic instrumentation with a native hook and Composer packages.
---

# PHP zero-code instrumentation

Beacon PHP requires PHP 8.2 or later, Composer package 1.1.2 in the application, and Beacon native extension 1.0.1 matching the runtime.

## Install

1. Download and enable the extension build matching the PHP version, thread-safety mode, operating system, and architecture from the [1.0.1 extension release](https://github.com/beacon-observability/beacon-php-instrumentation/releases/tag/v1.0.1).
2. Add the released Composer artifact and install the framework integrations you use:

```bash
mkdir -p .beacon
curl -fL -o .beacon/beacon-php-1.1.2.zip \
  https://github.com/beacon-observability/beacon-php/releases/download/v1.1.2/beacon-php-1.1.2.zip
composer config repositories.beacon artifact "$PWD/.beacon"
composer require beacon-observability/beacon-php:1.1.2
vendor/bin/beacon-php install pdo guzzle
```

Use `vendor/bin/beacon-php components` to list other integration aliases.

## Run

```bash
export OTEL_PHP_AUTOLOAD_ENABLED=true
export OTEL_SERVICE_NAME=my-php-service
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4318
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
vendor/bin/beacon-php doctor
php public/index.php
```

For PHP-FPM, configure the same environment variables in the service environment and restart the workers. Beacon PHP does not currently ship a profiling component.

## Debugging and diagnostics

Capture a runtime diagnostic report, then enable SDK internal logging. Keep the autoload and OTLP settings above:

```bash
vendor/bin/beacon-php doctor --json > beacon-php-doctor.json
OTEL_LOG_LEVEL=debug OTEL_PHP_LOG_DESTINATION=stderr \
  php public/index.php > beacon-php-debug.log 2>&1
```

`doctor` checks PHP, the native extension, SDK, exporter, components, and zero-code configuration. It does not test an actual OTLP delivery. `OTEL_PHP_LOG_DESTINATION=stderr` sends SDK internal logs to standard error, which this command captures in a file.

For PHP-FPM, inject both variables into the actual worker environment, restart workers, and collect standard error using the FPM logging configuration. CLI and FPM can use different `php.ini` files, extensions, and environment variables; a CLI `doctor` report does not validate the FPM runtime.

Return to the normal launch command, or remove the debug variables from FPM/service configuration and restart after troubleshooting.
