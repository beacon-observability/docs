---
slug: /
sidebar_position: 1
title: Beacon 文档
description: 无需修改应用源代码，接入服务端探针与浏览器 RUM。
---

# 无需修改代码即可观测应用

Beacon 提供独立发布的 OpenTelemetry 服务端探针，以及通过 [Rumable](rumable.md) 接入的浏览器 RUM。接入服务端数据时，选择语言，配置服务名和 OTLP 接收地址，再通过探针启动原有应用即可。

## 从这里开始

For Rust applications, use the **[Fastrace Rust SDK](fastrace.md)**, released as **[v0.1.0](https://github.com/beacon-observability/fastrace/releases/tag/v0.1.0)**. This English guide covers fixed-tag Cargo dependencies, explicit code instrumentation, local DataKit OTLP/gRPC export, trace context, verification, and rollback.

1. 打开[零代码接入](zero-code/index.md)，选择服务端运行时或浏览器 RUM。
2. 按对应接入指南安装已发布的探针或软件包。
3. 配置指南中要求的应用标识和接收端。
4. 启用运行时 Agent、预加载模块或包装命令，或执行 Rumable 生成的 Nginx/IIS 接入命令。

服务端探针使用 `OTEL_SERVICE_NAME`、`OTEL_EXPORTER_OTLP_ENDPOINT` 等 OpenTelemetry 配置。Rumable 使用[配置页](https://beacon-observability.github.io/rumable/latest/setup/index.html)中的浏览器应用和上报设置。

零代码接入仍需调整部署配置，但无需修改应用源代码。自动采集范围以各指南中列明的框架、依赖库或网站响应为准。

## 当前零代码接入项目

| 项目 / 运行时 | 发布版本 | 零代码入口 | Profile | Security |
| --- | --- | --- | --- | --- |
| Java | 1.1.0 | `-javaagent` | 实验性 JFR，需主动开启 | 可选，需主动开启 |
| Python | 1.1.0 | `beacon` 命令 | 可选，需主动开启 | 可选，支持标准 GIL 的 CPython 3.11–3.14 |
| Node.js | 1.2.0 | `NODE_OPTIONS` 预加载 | 可选，需主动开启 | 可选，支持 Node.js 22.22.3+ 或 24.11.1+ |
| .NET | 1.0.0 | `beacon-dotnet run` | 暂无受支持的用户配置 | 暂无已发布能力 |
| PHP | Composer 1.1.2；原生扩展 1.0.1 | 原生 Hook 加 Composer 自动加载 | 暂无受支持的用户配置 | 暂无已发布能力 |
| [Rumable（浏览器 RUM）](rumable.md) | [v0.1.9](https://github.com/beacon-observability/rumable/releases/tag/v0.1.9) | 通过 Nginx / IIS 注入 Web SDK | 不提供 | 不提供 |

各项目独立维护版本与发布节奏。请使用对应指南中注明的版本，不要假设 Beacon 存在统一版本。表中的 Profile 和 Security 指服务端探针能力；Rumable 提供浏览器 RUM。

Security 默认关闭。已发布的 Java、Python 和 Node.js 启用方式及运行时范围请参阅
[Security 指南](security/index.md)。
