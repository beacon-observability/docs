---
sidebar_position: 2
title: Rumable browser RUM
description: Add browser real user monitoring through Nginx or IIS without changing application source code.
---

# Rumable browser RUM

Rumable is Beacon's browser real user monitoring (RUM) project. It injects the bundled Web SDK into HTML responses through Nginx or IIS, without changing application source code. Browsers send telemetry directly to the configured RUM receiver; the CLI exits after deployment.

The current release is **[v0.1.9](https://github.com/beacon-observability/rumable/releases/tag/v0.1.9)**. Rumable keeps its own name, `rumable` command, TOML configuration, and independent release schedule.

## Requirements

- **Linux / Nginx:** Bash, curl, sudo, and Nginx with `http_sub_module` enabled.
- **Windows / IIS:** administrator access, PowerShell 5.1 or later, URL Rewrite, Static Content, and a started, dedicated application pool. One-command IIS setup requires a 64-bit OS.
- A browser RUM application and a receiver compatible with the bundled SDK. Prepare its application ID, reporting endpoint, and browser Client Token when using a browser gateway.

Linux and Windows archives are available from [GitHub Releases](https://github.com/beacon-observability/rumable/releases/latest). The installer detects architecture and selects a matching package, including legacy builds where applicable. Check the [compatibility guide](https://github.com/beacon-observability/rumable/blob/v0.1.9/docs/compatibility.md) for supported systems and server requirements. Go and Node.js are not required on the target server.

## Set up a website

1. Open the [English configuration page](https://beacon-observability.github.io/rumable/latest/setup/index.html). For this release, the [versioned page](https://beacon-observability.github.io/rumable/0.1.9/setup/index.html) is also available.
2. Enter the application ID, reporting method, endpoint, and browser token if required. Choose Linux / Nginx or Windows / IIS, then review sampling and privacy settings. The default SDK source serves bundled assets from your website's origin; Session Replay is optional.
3. Confirm that the page has loaded the matching release manifest, then copy the generated command. Configuration is generated in the browser. The command contains the browser token encoded as Base64, which is not encryption; use a browser Client Token rather than a management API key.
4. Run the command on the target Web server with the required administrator privileges. It downloads a version-pinned GitHub Release package, verifies its SHA256, and discovers the target website. A unique site is selected automatically; multiple candidates require an interactive terminal.

Setup changes the server configuration and keeps recovery records. Nginx configuration may be reloaded. IIS lifecycle changes recycle the dedicated pool and can lose in-memory sessions; shared pools are refused. Review the selected website and preserve the printed site ID, executable path, state directory, and backup location.

## Verify and maintain

For a Linux installation, replace `REPLACE_SITE_ID` with the ID printed by setup:

```bash
rumable=/opt/rumable/0.1.9/rumable
sudo "$rumable" status --state-dir /var/lib/rumable --site REPLACE_SITE_ID
sudo "$rumable" probe --state-dir /var/lib/rumable --site REPLACE_SITE_ID
```

Then open the website in a browser, verify SDK initialization and requests, and confirm that events reach the receiving application. A passing HTTP probe verifies injection and script availability; it does not prove browser execution or ingestion.

Keep the original site ID and state when updating. Installing a newer CLI alone does not upgrade a deployed site's SDK; reapply setup or enable for that site. See the [user guide](https://github.com/beacon-observability/rumable/blob/v0.1.9/USER-GUIDE.md) for Windows commands, manual targeting, disabling, and rollback.

## Browser and server telemetry

Rumable browser reporting uses TOML and the bundled SDK's receiver settings. The `OTEL_EXPORTER_OTLP_*` variables in [common configuration](configuration/index.md) configure the server-side language agents; they do not configure the browser RUM receiver.

Optional server-side OpenTelemetry integration is configured separately in the [Rumable OTel guide](https://github.com/beacon-observability/rumable/blob/v0.1.9/docs/otel.md).

- [Source repository](https://github.com/beacon-observability/rumable)
- [Release and download guide](https://github.com/beacon-observability/rumable/blob/main/docs/github-release.md)
