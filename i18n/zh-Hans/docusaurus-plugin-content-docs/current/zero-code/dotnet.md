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

## 调试与诊断

先检查安装状态，再指定可写目录保存探针的调试日志：

```bash
beacon-dotnet status
mkdir -p beacon-dotnet-logs
OTEL_LOG_LEVEL=debug OTEL_DOTNET_AUTO_LOGGER=file \
  OTEL_DOTNET_AUTO_LOG_DIRECTORY="$PWD/beacon-dotnet-logs" \
  beacon-dotnet run dotnet MyApp.dll
```

`OTEL_DOTNET_AUTO_LOG_DIRECTORY` 必须对实际应用进程的运行身份可写。需要在终端查看诊断日志时，可将 `OTEL_DOTNET_AUTO_LOGGER` 改为 `console`。

排障后恢复原启动命令；若在服务配置中设置了这些调试变量，请移除并重启应用。
