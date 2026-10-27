---
sidebar_position: 4
title: 故障排查
description: 排查零代码接入后没有遥测数据的问题。
---

# 故障排查

请按顺序检查：

1. 确认探针版本：检查 Java JAR 文件名，或运行 `beacon --version`、`npm ls @beacon-observability/nodejs`、`beacon-dotnet version`、`vendor/bin/beacon-php --version`。
2. 确认启动应用的同一进程环境中存在 `OTEL_SERVICE_NAME`、接收地址和协议配置。
3. 从应用主机测试到接收端口的网络连通性。
4. 通过受支持的框架或依赖库产生实际请求；只启动应用不一定会生成 Span。
5. 按下表开启对应语言的诊断，复现问题后保存日志并恢复原配置。

## 按语言开启调试与诊断

各语言的调试入口不同。以下配置适用于本指南中的已发布版本，具体命令、日志位置和关闭方式见对应语言页面。

| 语言 | 调试或诊断方式 | 结果 |
| --- | --- | --- |
| [Java](../zero-code/java.md#调试与诊断) | `OTEL_JAVAAGENT_DEBUG=true` 或 `-Dotel.javaagent.debug=true` | Agent 调试日志 |
| [Python](../zero-code/python.md#调试与诊断) | 通过应用日志配置调节 `opentelemetry` Logger；可用 `OTEL_TRACES_EXPORTER=otlp,console` 初步诊断 | SDK 日志取决于 Python logging 配置；控制台 Span 用于验证是否生成遥测 |
| [Node.js](../zero-code/nodejs.md#调试与诊断) | `OTEL_LOG_LEVEL=debug`，保留原预加载配置 | 终端诊断日志 |
| [.NET](../zero-code/dotnet.md#调试与诊断) | `OTEL_LOG_LEVEL=debug`，配合 `OTEL_DOTNET_AUTO_LOG_DIRECTORY` | 指定目录下的探针日志；`beacon-dotnet status` 检查安装状态 |
| [PHP](../zero-code/php.md#调试与诊断) | `OTEL_LOG_LEVEL=debug`、`OTEL_PHP_LOG_DESTINATION=stderr`；`vendor/bin/beacon-php doctor --json` | SDK 内部日志和运行环境诊断报告 |

这些日志用于排查探针自身的问题，与 `OTEL_LOGS_EXPORTER` 控制的遥测日志导出分别配置。先保留原服务名、OTLP 地址和加载方式，再临时开启诊断，复现一次后恢复原启动配置。分享日志前移除认证信息及请求中的敏感内容。

## 没有 Profile 数据

- Java：确认使用 JDK 11 或更高版本，并检查 Profile 目录是否可写。
- Python 和 Node.js：确认已设置 `OTEL_PROFILING_ENABLED=true`、上传地址正确，且进程存活时间超过导出周期。
- 不要把 Profile 数据发送到 OTLP Trace 地址；接收端必须支持文档所述的 pprof 上传格式。

## 没有 Security 数据

- 确认应用进程环境中设置了 `BEACON_SECURITY_ENABLED=true` 和 OTLP Logs 导出器。
- Python 需要通过 `BEACON_SECURITY_PYTHON_INCLUDE` 设置应用模块前缀。Node.js
  需要通过 `BEACON_SECURITY_NODE_INCLUDE` 设置应用源码根目录，并使用 ESM
  `--import` 预加载。
- 运行时 SBOM 可能先于安全发现产生。请生成一条经过已建模 source 和 sink 的实际请求；
  仅启动应用不会产生安全发现。
- 除非设置 `BEACON_SECURITY_LOCAL_OUTPUT_ENABLED=true`，否则本地诊断文件始终关闭。
  没有本地文件并不代表 OTLP Logs 导出失败。

如果应用只在探针启用时失败，应先停用探针恢复服务，并保留探针调试日志、运行时版本、移除敏感信息后的命令行，以及最小可复现请求。

## 参数依据

- [Java 1.1.0](https://github.com/beacon-observability/beacon-java/blob/1a276cb60f86c8e8d669b2297663d87b340441f7/javaagent-tooling/src/main/java/io/opentelemetry/javaagent/tooling/config/EarlyInitAgentConfig.java)
- [Python 1.1.0](https://github.com/beacon-observability/beacon-python/blob/v1.1.0/beacon-otel/src/beacon_otel/cli.py)
- [Node.js 1.2.0](https://github.com/beacon-observability/beacon-nodejs/blob/v1.2.0/packages/auto-instrumentations-node/README.md)
- [.NET 1.0.0](https://github.com/beacon-observability/beacon-dotnet/blob/v1.0.0/docs/config.md#internal-logs)
- [PHP OpenTelemetry API 1.10.0](https://github.com/opentelemetry-php/api/blob/7c029c4a6fd457094a20569bf98f93d95e9a7559/Behavior/Internal/LogWriterFactory.php)
