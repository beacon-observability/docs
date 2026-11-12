---
sidebar_position: 4
title: .NET
description: 使用 beacon-dotnet 启动未修改的 .NET 应用。
---

# .NET 零代码接入

Beacon .NET 1.1.2 提供原生安装包和跨平台 `beacon-dotnet` 命令。以下示例适用于 x64 Debian 或 Ubuntu；其他系统与架构请在[发布页面](https://github.com/beacon-observability/beacon-dotnet/releases/tag/v1.1.2)选择对应安装包。

该版本采用 [OpenTelemetry .NET Automatic Instrumentation v1.19.1](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/releases/tag/v1.19.1)。Beacon 安装包使用独立的发布版本号。

## 支持版本

| 运行时 | 版本 |
| --- | --- |
| CoreCLR | .NET 8、9、10 |

Security 的系统与架构要求见 [Security 指南](../security/dotnet.md)。

## 安装

下载并安装 Beacon .NET：

```bash
curl -fL -o beacon-dotnet.deb \
  https://github.com/beacon-observability/beacon-dotnet/releases/download/v1.1.2/beacon-dotnet-1.1.2-linux-amd64.deb
sudo apt install ./beacon-dotnet.deb
beacon-dotnet status
```

<details>
<summary>产物来源验证（可选）</summary>

使用支持产物证明的新版本 GitHub CLI，在安装前执行：

```bash
gh attestation verify beacon-dotnet.deb \
  --repo beacon-observability/beacon-dotnet \
  --signer-workflow beacon-observability/beacon-dotnet/.github/workflows/beacon-release.yml \
  --source-ref refs/tags/v1.1.2
```

</details>

## 启动

```bash
export OTEL_SERVICE_NAME=my-dotnet-service
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4317
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
beacon-dotnet run dotnet MyApp.dll
```

`run` 只对其子进程启用探针。Beacon .NET 当前未提供受支持的用户级持续 Profile 配置，因此无需设置 Profile 环境变量。

## 升级与验证

从发布页下载相同系统和架构的 1.1.2 软件包，使用原包管理器安装。升级后重启已接入的应用，再检查 `beacon-dotnet version` 和 `beacon-dotnet status`。

发布资源包含 Linux glibc/musl x64 和 ARM64 归档、Windows 归档与 x64 MSI、macOS ARM64 归档（macOS 14 或更高版本）、Linux DEB/RPM 软件包和 NuGet 软件包。原生软件包尚未配置操作系统签名；需要核对产物来源时，可使用上面的验证命令。

## 可选 Security

1.1.2 包含默认关闭的实验性 [Security 和运行时程序集清单](../security/dotnet.md)。请单独启用并验证 OTLP Logs 接收结果；其运行时支持范围小于可下载平台集合。

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
