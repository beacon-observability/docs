---
sidebar_position: 4
title: .NET Security
description: 在 Beacon .NET 中启用实验性 Security 与运行时程序集清单。
---

# .NET Security

[Beacon .NET 1.1.1](https://github.com/beacon-observability/beacon-dotnet/releases/tag/v1.1.1) 在现有零代码软件包中包含实验性 Security。它默认关闭，沿用常规的 [`beacon-dotnet run` 启动器](../zero-code/dotnet.md)。

## 启用与验证

接收端需配置 OTLP Logs 管道，再启动应用：

```bash
export OTEL_SERVICE_NAME=my-dotnet-service
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4317
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
export OTEL_LOGS_EXPORTER=otlp
export BEACON_SECURITY_ENABLED=true
beacon-dotnet run dotnet MyApp.dll
```

在接收端检查 instrumentation scope 为 `io.beacon.security` 的 `beacon.security.sbom.inventory` 和 `beacon.security.finding` 记录，使用 schema 2 和 fingerprint version 1。初次清单在后台异步采集；后续采集使用配置的刷新延迟。安全发现需要实际请求经过已建模的来源和敏感调用。成功启动、安装状态及本地文件均不能确认接收端已收到数据。

Security 复用标准 [OpenTelemetry 传输和资源配置](../configuration/index.md)。必须保持自动 SDK 初始化开启。关闭自动 Logs 会停止 Security 的 OTLP 导出，但单独启用的本地输出仍可接收记录；关闭自动 SDK 初始化则会阻止 Security 后台任务和本地写入器启动。

## 配置

| 环境变量 | 默认值 | 用途 |
| --- | --- | --- |
| `BEACON_SECURITY_ENABLED` | `false` | 开启 Security 生命周期。 |
| `BEACON_SECURITY_SBOM_ENABLED` | `true` | 在 Security 开启时采集已加载程序集清单。 |
| `BEACON_SECURITY_SBOM_REFRESH_SECONDS` | `300` | 每轮采集完成后的正整数延迟秒数；无效值或零使用 300。 |
| `BEACON_SECURITY_LOCAL_OUTPUT_ENABLED` | `false` | 单独开启本地诊断输出。 |
| `BEACON_SECURITY_OUTPUT` | 系统临时目录 + `/beacon-security` | 快照父目录；每个进程使用其实例 UUID 子目录。 |
| `BEACON_SECURITY_EVIDENCE_FILE` | 未设置 | 可选的安全发现 JSONL 路径；需同时开启 Security 和本地输出。 |

这些参数通过环境变量绑定。仅设置输出路径不会启用本地文件。停用 Security 时，删除启用变量或将其设为 `false`，然后重启应用。

## 覆盖范围与兼容性

Security 数据流和导出测试覆盖 Linux glibc x64、Windows x64、macOS ARM64 上的 CoreCLR .NET 8、9 和 10。.NET Framework 运行时行为、跨 AppDomain 标识、其他 Security 架构和生产性能仍不在已验证范围内。提供其他平台的可下载归档不代表已完成这些平台的 Security 验收。

模型按字符串对象标识跟踪 ASP.NET Core 查询参数值，并支持经过双字符串、三字符串和四字符串 `String.Concat` 重载的传播。受支持的敏感调用包括 `File.ReadAllText(string)` 文件读取、ADO.NET 文本命令模板、异步 HTTP 目标和 `Process.Start` 调用。绑定的 SQL 参数值不会污染常量命令模板。

这些是有边界的候选风险观测，不是已确认漏洞或阻断决策。请求头、Cookie、请求体、表单和拼接模型之外的变换不在覆盖范围内；模型不判断文件路径是否越界，也不解析 SQL 方言攻击语法。安全发现字段不导出原始查询参数值、SQL、命令行或脚本。

运行时清单描述观测到的已加载 CLR 程序集名称和程序集版本，不是完整 NuGet 依赖图、软件包版本映射、产物哈希清单或可达性分析。每轮最多采集 4,096 个唯一的非动态程序集标识；失败或不完整的扫描不会替换已接受的快照。单条传输记录上限为 65,536 个 UTF-8 字节，清单可分片发送；交付仍为尽力而为。

## 可选本地诊断

需要本地快照时，单独设置 `BEACON_SECURITY_LOCAL_OUTPUT_ENABLED=true`。进程目录内的 `inventory.jsonl` 保存最新一轮完整清单，`finding.json` 保存最新安全发现。可选的 `BEACON_SECURITY_EVIDENCE_FILE` 保存安全发现 JSONL，当前文件上限为 8 MiB，并保留一个 `.1` 轮转文件；每个进程应使用独立路径。

本地写入异步执行且有容量限制。过载或文件系统错误可能丢失诊断数据，OTLP 导出仍独立继续。这些文件不提供持久历史或多进程聚合，旧进程目录也不会自动删除。诊断结束后将本地输出恢复为 `false`，并单独管理保留的文件。

已建模调用、请求预算和合约来源请参阅[版本化 Security 参考](https://github.com/beacon-observability/beacon-dotnet/tree/v1.1.1/beacon/security)，发布验收与限制请参阅[发布说明](https://github.com/beacon-observability/beacon-dotnet/releases/tag/v1.1.1)。
