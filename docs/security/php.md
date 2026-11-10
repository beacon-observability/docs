---
sidebar_label: PHP
sidebar_position: 4
title: PHP Security
description: Enable experimental Security and runtime SBOM in the released Beacon PHP Agent.
---

# PHP Security

Beacon PHP 1.3.1 includes experimental Security in the normal Agent runtime. It is disabled by default and uses the same native extension and installation lifecycle as [PHP zero-code instrumentation](../zero-code/php.md).

## Enable Security

After downloading the 1.3.1 installer, enable Security during installation or an idempotent reinstall:

```bash
php beacon-setup.php --php-bin=all --enable-security
```

Restart PHP-FPM or Apache after changing installation settings. Alternatively, set `BEACON_SECURITY_ENABLED=true` in the application environment; FPM pools must pass environment overrides to their workers.

Security uses OTLP Logs. Enable a Logs receiver pipeline at the destination. For a CLI application:

```bash
BEACON_SECURITY_ENABLED=true OTEL_LOGS_EXPORTER=otlp php public/index.php
```

The installed service name and endpoint defaults apply. Runtime SBOM is enabled within the Security lifecycle; local diagnostic output remains off.

## Configuration and coverage

| Environment variable | Default | Purpose |
| --- | --- | --- |
| `BEACON_SECURITY_ENABLED` | `false` | Enables Security. |
| `BEACON_SECURITY_SBOM_ENABLED` | `true` | Collects partial runtime SBOM while Security is enabled. |
| `BEACON_SECURITY_LOCAL_OUTPUT_ENABLED` | `false` | Enables local diagnostic snapshots. |
| `BEACON_SECURITY_OUTPUT` | System temporary directory + `/beacon-security` | Selects the diagnostic parent directory. |

Selected PDO, file, command and cURL sinks observe bounded value correlations with current query, form and cookie inputs. Findings are conservative candidate observations, not confirmed vulnerabilities or blocking decisions. Transformed values and framework request bodies are outside this model.

Conventional CLI and PHP request lifecycles are covered. Long-running multi-request workers do not have request-reset integration. Runtime SBOM is explicitly partial and includes loaded extensions and Composer packages observed through included files.

Use `--disable-security` with the installer to clear its enablement default, and remove or disable any application `BEACON_SECURITY_ENABLED` override. See the [versioned Security reference](https://github.com/beacon-observability/beacon-php/blob/v1.3.1/docs/security.md) for detailed coverage, diagnostic output and limits. Verify actual Logs receipt; successful startup or `doctor` does not confirm receiver delivery.
