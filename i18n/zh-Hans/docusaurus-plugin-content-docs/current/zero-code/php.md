---
sidebar_position: 5
title: PHP
description: 通过原生 Hook 和 Composer 软件包启用 PHP 自动探针。
---

# PHP 零代码接入

Beacon PHP 要求 PHP 8.2 或更高版本、安装在应用中的 Composer 包 1.1.2，以及匹配运行环境的 Beacon 原生扩展 1.0.1。

## 安装

1. 在[原生扩展 1.0.1 发布页面](https://github.com/beacon-observability/beacon-php-instrumentation/releases/tag/v1.0.1)下载与 PHP 版本、线程安全模式、操作系统和架构匹配的构建，并启用该扩展。
2. 添加已发布的 Composer 制品，并安装应用实际使用的框架探针：

```bash
mkdir -p .beacon
curl -fL -o .beacon/beacon-php-1.1.2.zip \
  https://github.com/beacon-observability/beacon-php/releases/download/v1.1.2/beacon-php-1.1.2.zip
composer config repositories.beacon artifact "$PWD/.beacon"
composer require beacon-observability/beacon-php:1.1.2
vendor/bin/beacon-php install pdo guzzle
```

运行 `vendor/bin/beacon-php components` 可查看其他组件别名。

## 启动

```bash
export OTEL_PHP_AUTOLOAD_ENABLED=true
export OTEL_SERVICE_NAME=my-php-service
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4318
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
vendor/bin/beacon-php doctor
php public/index.php
```

使用 PHP-FPM 时，请在服务环境中配置相同变量并重启 Worker。Beacon PHP 当前不提供 Profile 组件。
