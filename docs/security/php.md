---
sidebar_label: PHP
sidebar_position: 4
title: PHP Security
description: Enable experimental Security and runtime SBOM in the released Beacon PHP Agent.
---

# PHP Security

Beacon PHP 2.0.0 includes experimental Security in the normal Agent runtime. It is disabled by default and uses the same native extension and installation lifecycle as [PHP zero-code instrumentation](../zero-code/php.md).

## Enable Security

After downloading the 2.0.0 installer, enable Security during installation or an idempotent reinstall:

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

Use `--disable-security` with the installer to clear its enablement default, and remove or disable any application `BEACON_SECURITY_ENABLED` override. See the [versioned Security reference](https://github.com/beacon-observability/beacon-php/blob/v2.0.0/docs/security.md) for detailed coverage, diagnostic output and limits. Verify actual Logs receipt; successful startup or `doctor` does not confirm receiver delivery.

## SIEM migration and lifecycle limits

PHP 2.0.0 replaces historical v1 bodies with SIEM v1 envelopes containing complete
serialized v2 evidence in `message`. Update consumers before upgrading; no legacy
mode is available. Use top-level process identity and invocation `span_id` for
correlation, and parse `message` for evidence or complete inventory assembly.
Final escaped envelope bytes govern the 65536-byte record budget. Unknown/suspected
remain eligible for export; default no-evidence filtering consumes no delivery budget.
Actor/client-IP enrichment remains empty; configured Resource `tenant.id` is used
when present, otherwise `default`. Findings keep unknown outcome and informational
log severity, not assessed risk.

PHP has no independent in-process background scheduler here. First collection is
synchronous, refresh runs when selected native Hooks observe the deadline, and
shutdown collects once more before SDK flush. Idle processes do not publish on an
independent timer: this is an explicit gap against the standard lifecycle. Linux
procfs supplies process identity/timing; unavailable timing prevents inventory on
unsupported platforms. Long-running multi-request framework workers still lack a
request-reset adapter. Failed scans emit no replacement; successful empty lists
can clear inventory. Do not replace an inventory until every part of a round arrives.

Rollback reinstalls the verified 1.3.1 installer/runtime and the historical v1-body
consumer together. The native extension remains Beacon 1.1.0 / module 1.5.0.
