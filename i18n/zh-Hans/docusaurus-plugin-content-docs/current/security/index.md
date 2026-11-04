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
| [Java](java.md) | 1.1.0 | 完整 Java Agent | 单个 Agent JAR |
| [Python](python.md) | 1.1.0 | 标准 GIL 的 CPython 3.11–3.14 | 现有 `beacon` 命令 |
| [Node.js](nodejs.md) | 1.2.0 | Node.js 22.22.3+ 或 24.11.1+ | 现有软件包加 ESM 预加载 |
| [.NET](dotnet.md) | 1.1.1，实验性 | CoreCLR .NET 8–10：Linux glibc x64、Windows x64、macOS ARM64 | 现有 `beacon-dotnet run` 命令 |
| [PHP](php.md) | 1.3.0，实验性 | PHP 8.2–8.4，已验证 Linux glibc x86_64 | 现有安装器与 Agent 运行时 |

启用后，Security 通过应用现有的 OpenTelemetry Logs 管道发送安全发现和运行时软件
清单。运行时 SBOM 在 Security 生命周期中默认开启；进程本地诊断文件仍保持关闭，
除非显式启用。

安全发现表示有边界的已建模数据流观测或候选风险，并不确认应用存在漏洞。请先选择
应用运行时对应的指南，并在扩大配置范围前验证已导出的 Logs 记录。
