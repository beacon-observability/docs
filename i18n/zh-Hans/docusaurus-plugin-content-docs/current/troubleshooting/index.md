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
5. 临时设置 `OTEL_LOG_LEVEL=debug` 并复现一次，随后移除该配置，避免持续产生大量调试日志。

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
