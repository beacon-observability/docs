---
slug: /
sidebar_position: 1
title: Beacon 文档
description: 无需修改源代码，为应用接入基于 OpenTelemetry 的可观测能力。
---

# 无需修改代码即可观测应用

Beacon 提供基于 OpenTelemetry、按语言独立发布的自动探针。选择语言，配置服务名和 OTLP 接收地址，再通过探针启动原有应用即可。

## 从这里开始

1. 打开[零代码接入](zero-code/index.md)，选择应用运行时。
2. 安装已发布的探针或软件包。
3. 设置 `OTEL_SERVICE_NAME`、`OTEL_EXPORTER_OTLP_ENDPOINT` 以及接收端支持的协议。
4. 使用文档中的包装命令、预加载模块或运行时 Agent 启动应用。

整个过程不需要修改应用源代码。自动探针可以观测受支持的框架和依赖库，但不会自动描述应用代码中的每一个业务操作。

## 当前语言版本

| 语言 | 发布版本 | 零代码入口 | Profile |
| --- | --- | --- | --- |
| Java | 1.0.0 | `-javaagent` | 实验性 JFR，需主动开启 |
| Python | 1.0.1 | `beacon` 命令 | 可选，需主动开启 |
| Node.js | 1.1.0 | `NODE_OPTIONS` 预加载 | 可选，需主动开启 |
| .NET | 1.0.0 | `beacon-dotnet run` | 暂无受支持的用户配置 |
| PHP | Composer 1.1.2；原生扩展 1.0.1 | 原生 Hook 加 Composer 自动加载 | 暂无受支持的用户配置 |

每种语言独立维护版本与发布节奏。请使用对应语言指南中注明的版本，不要假设 Beacon 存在统一版本。
