---
sidebar_label: PHP
sidebar_position: 4
title: PHP Security
description: Enable experimental Security and runtime SBOM in the released Beacon PHP Agent.
---

# PHP Security

Beacon PHP 3.0.0 includes experimental Security in the normal Agent runtime. It is disabled by default and uses the same native extension and installation lifecycle as [PHP zero-code instrumentation](../zero-code/php.md).

## Enable Security

After downloading the 3.0.0 installer, enable Security during installation or an idempotent reinstall:

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
| `BEACON_SECURITY_SBOM_REFRESH_SECONDS` | `300` | Positive refresh delay, checked at native Hook boundaries; no independent idle scheduling. |
| `BEACON_SECURITY_EXPORT_NO_EVIDENCE_ENABLED` | `false` | Include `no_evidence` findings; unknown/suspected remain eligible. |
| `BEACON_SECURITY_LOCAL_OUTPUT_ENABLED` | `false` | Enables local diagnostic snapshots. |
| `BEACON_SECURITY_OUTPUT` | System temporary directory + `/beacon-security` | Selects the diagnostic parent directory. |

Selected PDO, file, command and cURL sinks observe bounded value correlations with current query, form and cookie inputs. Findings are conservative candidate observations, not confirmed vulnerabilities or blocking decisions. Transformed values and framework request bodies are outside this model.

Conventional CLI and PHP request lifecycles are covered. Long-running multi-request workers do not have request-reset integration. Runtime SBOM is explicitly partial and includes loaded extensions and Composer packages observed through included files.

Use `--disable-security` with the installer to clear its enablement default, and remove or disable any application `BEACON_SECURITY_ENABLED` override. See the [versioned Security reference](https://github.com/beacon-observability/beacon-php/releases/tag/v3.0.0) for detailed coverage, diagnostic output and limits. Verify actual Logs receipt; successful startup or `doctor` does not confirm receiver delivery.

## Native log output and migration

This release uses output profile `beacon-security-log-body-v1`, pinned to
Security specification `d9d76e5a41d974d294bb596e06918bb954319bf6`.
Read event time from native OTel `time_unix_nano` and occurrence identity from
LogRecord `attributes.event_id`. The Body is compact single-line schema-v2 JSON;
parse it once. It omits only `observed_at` and `occurrence_id`, preserving every
other field path, value and nesting. `source` remains in Body and attributes.
There is no SIEM envelope or `message` wrapper. Fingerprint v1 and inventory IDs
are unchanged. Record budgets and inventory splitting use final compact UTF-8
Body bytes; queued retries retain native event time and identity. PHP diagnostic JSONL uses a local wrapper with `time_unix_nano`, `attributes`
and the compact `body` string; that wrapper is not transmitted as OTLP Body.

Upgrade consumers before the producer. Assemble every inventory part before
replacing the previous complete list. Rollback requires the previous verified
producer and its matching SIEM consumer together.

## Lifecycle limits

PHP has no independent in-process background scheduler here. First collection is
synchronous, refresh runs when selected native Hooks observe the deadline, and
shutdown collects once more before SDK flush. Idle processes do not publish on an
independent timer: this is an explicit gap against the standard lifecycle. Linux
procfs supplies process identity/timing; unavailable timing prevents inventory on
unsupported platforms. Long-running multi-request framework workers still lack a
request-reset adapter. Failed scans emit no replacement; successful empty lists
can clear inventory. Do not replace an inventory until every part of a round arrives.

Rollback reinstalls the verified 2.0.0 installer/runtime and the matching SIEM
consumer together. The native extension remains Beacon 1.1.0 / module 1.5.0.
