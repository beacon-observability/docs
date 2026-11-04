---
sidebar_position: 5
title: PHP
description: 通过统一安装脚本部署 Beacon PHP，并在应用代码运行前自动加载 Agent。
---

# PHP 零代码接入

[Beacon PHP 1.3.0](https://github.com/beacon-observability/beacon-php/releases/tag/v1.3.0) 支持 PHP 8.2、8.3 和 8.4。默认独立安装器会选择 Beacon 原生扩展 1.0.1，并安装隔离的 Agent 运行时，无需 Composer，保留应用原有依赖。Linux glibc x86_64 已通过独立安装验收；其他平台限制见[对应版本的部署说明](https://github.com/beacon-observability/beacon-php/blob/v1.3.0/docs/standalone.md)。

## 安装

```bash
curl --fail --location --output beacon-setup.php \
  https://github.com/beacon-observability/beacon-php/releases/download/v1.3.0/beacon-setup.php
php beacon-setup.php --php-bin=all \
  --service-name=my-php-service \
  --otlp-endpoint=http://127.0.0.1:4318
```

运行用户需要拥有 PHP 扩展目录、INI 目录和安装目录的写权限，Unix 默认安装到 `/opt/beacon/php`。使用 `--dry-run` 预览变更。Release 提供 `SHA256SUMS`，可独立校验安装器；安装器会校验下载的运行时和原生扩展制品。

运行时在应用代码前加载，包含选定的官方 PDO、cURL、Guzzle、Laravel 和 Symfony 探针，并保留已有 `auto_prepend_file` 的行为。应用手工埋点需要与 Agent 共用 SDK 和上下文时，可使用[高级 Composer 项目模式](https://github.com/beacon-observability/beacon-php/blob/v1.3.0/docs/standalone.md#advanced-composer-project-integration)。

## 启动与管理

安装后重启 PHP-FPM 或 Apache，再生成应用请求。CLI 应用沿用原启动命令：

```bash
php beacon-setup.php doctor --php-bin=all
php public/index.php
```

安装器会记录服务名和上报地址默认值，PHP-FPM 使用 `clear_env=yes` 时也能生效。应用的 `OTEL_*` 环境变量可覆盖默认值；PHP-FPM 需要通过池配置将这些覆盖变量传给 Worker。

升级前先下载目标 Release 的安装器。卸载会恢复原启动配置；升级或卸载后均需重启 PHP 服务：

```bash
php beacon-setup.php upgrade --php-bin=all
php beacon-setup.php uninstall --php-bin=all
```

[Security 与运行时 SBOM](../security/php.md) 为实验性能力，需要显式开启。Beacon PHP 当前不提供 Profile 组件。

## 调试与诊断

```bash
php beacon-setup.php doctor --php-bin=all > beacon-php-doctor.txt
OTEL_LOG_LEVEL=debug OTEL_PHP_LOG_DESTINATION=stderr \
  php public/index.php 2> beacon-php-debug.log
```

`doctor` 检查托管的启动配置、Beacon 扩展，并对 CLI 目标检查独立运行时实际加载情况；它不确认 OTLP 投递。每个 FPM 池都需要通过真实请求验证：CLI 与 FPM 可能使用不同的 INI、环境变量和池级覆盖配置。

使用 PHP-FPM 时，将调试变量传给实际 Worker，并通过 FPM 日志配置收集标准错误。排障后移除调试覆盖变量并重启 Worker。
