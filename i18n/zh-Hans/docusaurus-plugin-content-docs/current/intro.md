---
slug: /
sidebar_position: 1
title: Beacon 文档
description: 了解 Beacon 语言探针、源码集成、链路追踪 SDK 与浏览器 RUM。
---

# 使用 Beacon 观测应用

Beacon 提供独立发布的 OpenTelemetry 服务端探针、源码集成和链路追踪 SDK，以及通过 [Rumable](rumable.md) 接入的浏览器 RUM。使用服务端探针时，选择语言，配置服务名和 OTLP 接收地址，再通过探针启动原有应用即可。

Rust 应用请使用 **[Fastrace Rust SDK](fastrace.md)**，可用版本与下载资源请参阅 [Releases](https://github.com/beacon-observability/fastrace/releases)。该英文接入指南涵盖固定 Git 标签的 Cargo 依赖、显式代码埋点、通过 OTLP/gRPC 向本地 DataKit 上报链路、链路上下文、验证和回滚。

## 从这里开始

1. 从[语言项目](#语言项目)中选择语言或项目，打开对应指南。
2. 按对应接入指南安装已发布的探针、软件包或源码发行包。
3. 配置指南中要求的应用标识和接收端。
4. 按指南加载探针、初始化 SDK，或执行 Rumable 生成的 Nginx/IIS 接入命令。

服务端探针使用 `OTEL_SERVICE_NAME`、`OTEL_EXPORTER_OTLP_ENDPOINT` 等 OpenTelemetry 配置。Rumable 使用[配置页](https://beacon-observability.github.io/rumable/latest/setup/index.html)中的浏览器应用和上报设置。

零代码接入仍需调整部署配置，但无需修改应用源代码。自动采集范围以各指南中列明的框架、依赖库或网站响应为准。

## 语言项目

| 语言 / 项目 | 接入类型 | 接入方式 | Profile | Security | 发布地址 |
| --- | --- | --- | --- | --- | --- |
| [Java](zero-code/java.md) | 零代码 | Agent：`-javaagent` | [实验性 JFR](profiling/java.md)，需主动开启 | [需主动开启](security/java.md) | [Releases](https://github.com/beacon-observability/beacon-java/releases) |
| [Python](zero-code/python.md) | 零代码 | 启动器：`beacon` | [需主动开启](profiling/python.md) | [需主动开启](security/python.md) | [Releases](https://github.com/beacon-observability/beacon-python/releases) |
| [Node.js](zero-code/nodejs.md) | 零代码 | 预加载：`NODE_OPTIONS` | [需主动开启](profiling/nodejs.md) | [需主动开启](security/nodejs.md) | [Releases](https://github.com/beacon-observability/beacon-nodejs/releases) |
| [.NET](zero-code/dotnet.md) | 零代码 | 启动器：`beacon-dotnet run` | 暂无受支持的配置 | 暂无已发布能力 | [Releases](https://github.com/beacon-observability/beacon-dotnet/releases) |
| [PHP](zero-code/php.md) | 零代码 | 原生 Hook + Composer 自动加载 | 暂无受支持的配置 | 暂无已发布能力 | [Composer](https://github.com/beacon-observability/beacon-php/releases) · [原生扩展](https://github.com/beacon-observability/beacon-php-instrumentation/releases) |
| [Ruby](ruby.md) | SDK（源码集成） | 源码集成：Net::HTTP 链路追踪 | 不在已验证范围内 | 不在已验证范围内 | [Releases](https://github.com/beacon-observability/beacon-ruby/releases) |
| [Rust / Fastrace](fastrace.md) | SDK | 链路追踪 SDK：显式代码埋点 | 不提供 | 不提供 | [Releases](https://github.com/beacon-observability/fastrace/releases) |
| [浏览器 / Rumable](rumable.md) | 零代码 | Web SDK 注入：Nginx / IIS | 不提供 | 不提供 | [Releases](https://github.com/beacon-observability/rumable/releases) |

各项目独立维护版本与发布节奏。请通过发布链接查看可用版本与下载资源，通过对应语言指南查看运行时要求。表中的 Profile 和 Security 指服务端探针能力；Rumable 提供浏览器 RUM。

Ruby 当前提供源码发行包，已验证 Net::HTTP 链路路径；未发布 Beacon gem 或零代码预加载入口，验收环境与限制请参阅 [Ruby 指南](ruby.md)。Fastrace 需要在应用代码中显式埋点并初始化 reporter。

Security 默认关闭。已发布的 Java、Python 和 Node.js 启用方式及运行时范围请参阅 [Security 指南](security/index.md)。
