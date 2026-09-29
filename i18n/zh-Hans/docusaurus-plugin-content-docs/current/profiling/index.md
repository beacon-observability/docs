---
sidebar_position: 3
title: Profile
description: 为支持 Profile 的 Beacon 语言配置采集与导出。
---

# Profile

Profile 与 Trace、指标和日志分别配置。普通 OTLP 遥测地址并不一定能够接收 JFR 或 pprof 数据。

| 语言 | Profile 格式 | 导出方式 | 状态 |
| --- | --- | --- | --- |
| [Java](java.md) | JFR | 本地文件、HTTP multipart 上传 | 实验性 |
| [Python](python.md) | OTLP Profiles、pprof | OTLP/HTTP、pprof HTTP 上传、本地文件 | 可选 |
| [Node.js](nodejs.md) | pprof | HTTP 上传 | 可选 |

Beacon .NET 和 PHP 当前未提供受支持的用户级 Profile 配置。

