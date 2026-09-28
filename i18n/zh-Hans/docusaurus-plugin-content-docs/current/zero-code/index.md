---
sidebar_position: 1
title: 零代码接入
description: 选择 Beacon 探针，在不修改应用代码的情况下接入可观测能力。
---

# 零代码接入

零代码接入通过运行时 Agent、预加载 Hook、包装命令或原生扩展加载 OpenTelemetry SDK 与组件探针。配置位于应用外部，通常使用环境变量。

请选择应用运行时：

- [Java](java.md)：通过 `-javaagent` 挂载一个 JAR。
- [Python](python.md)：在原有命令前添加 `beacon`。
- [Node.js](nodejs.md)：通过 `NODE_OPTIONS` 预加载一个模块。
- [.NET](dotnet.md)：使用 `beacon-dotnet run` 启动原有进程。
- [PHP](php.md)：启用原生 Hook 和 Composer 自动加载。

所有示例都将数据发送到由你指定的接收端。添加认证 Header 或更改协议前，请先阅读[公共配置](../configuration/index.md)。

