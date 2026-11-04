---
sidebar_position: 4
title: Security
description: 启用已发布的 Beacon Security 运行时并导出安全发现与运行时 SBOM。
---

# Security

Beacon Security 是各语言现有零代码软件包中的可选能力。它默认关闭，不会引入第二个
Agent、包装命令或独立版本生命周期。

| 语言 | 已发布版本 | 运行时范围 | 部署方式 |
| --- | --- | --- | --- |
| [Java](java.md) | [1.3.4](https://github.com/beacon-observability/beacon-java/releases/tag/v1.3.4) | 完整 Java Agent | 单个 Agent JAR |
| [Python](python.md) | [1.2.4](https://github.com/beacon-observability/beacon-python/releases/tag/v1.2.4) | 标准 GIL 的 CPython 3.11–3.14 | 现有 `beacon` 命令 |
| [Node.js](nodejs.md) | [2.0.1](https://github.com/beacon-observability/beacon-nodejs/releases/tag/v2.0.1) | Node.js 22.22.3+ 或 24.11.1+ | 现有软件包加 ESM 预加载 |

启用后，Security 通过应用现有的 OpenTelemetry Logs 管道发送安全发现和运行时软件
清单。运行时 SBOM 在 Security 生命周期中默认开启；进程本地诊断文件仍保持关闭，
除非显式启用。

安全发现表示有边界的已建模数据流观测或候选风险，并不确认应用存在漏洞。请先选择
应用运行时对应的指南，并在扩大配置范围前验证已导出的 Logs 记录。

## 安全发现的导出策略 {#finding-export-policy}

Java 1.3.4、Python 1.2.4 和 Node.js 2.0.1 默认不向 OpenTelemetry Logs 或证据 JSONL 导出 `attack_evidence.status=no_evidence` 的安全发现。需要排查普通数据流或恢复旧导出行为时，启用：

```bash
export BEACON_SECURITY_EXPORT_NO_EVIDENCE_ENABLED=true
```

默认值为 `false`。`no_evidence` 表示受支持的分析未发现利用证据，不代表应用安全，也不表示不存在已建模的数据流。`unknown` 保留分析不确定性，`suspected` 表示受支持的语法控制证据；两者仍可导出，均不能单独确认攻击成功。

过滤发生在进入发送队列之前，不占用队列或发送限额，也不计为导出丢失。内部检测、请求去重、同请求证据升级、本地发现快照和 Span 摘要继续保留；SBOM 清单不受影响。不同语言仍有各自的分析覆盖范围，统一导出策略不代表检测能力完全相同。

.NET 和 PHP 当前没有已发布的 Beacon Security 能力。
