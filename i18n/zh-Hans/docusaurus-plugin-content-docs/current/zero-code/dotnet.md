---
sidebar_position: 4
title: .NET
description: 使用 beacon-dotnet 启动未修改的 .NET 应用。
---

# .NET 零代码接入

Beacon .NET 1.0.0 提供原生安装包和跨平台 `beacon-dotnet` 命令。以下示例适用于 x64 Debian 或 Ubuntu；其他系统与架构请在[发布页面](https://github.com/beacon-observability/beacon-dotnet/releases/tag/v1.0.0)选择对应安装包。

## 安装

```bash
curl -fLO https://github.com/beacon-observability/beacon-dotnet/releases/download/v1.0.0/beacon-dotnet-1.0.0-linux-amd64.deb
sudo apt install ./beacon-dotnet-1.0.0-linux-amd64.deb
beacon-dotnet status
```

## 启动

```bash
export OTEL_SERVICE_NAME=my-dotnet-service
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4317
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
beacon-dotnet run dotnet MyApp.dll
```

`run` 只对其子进程启用探针。Beacon .NET 当前未提供受支持的用户级持续 Profile 配置，因此无需设置 Profile 环境变量。

