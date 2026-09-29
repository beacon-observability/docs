---
sidebar_position: 1
title: Java Profile
description: 将 Beacon Java JFR Profile 写入本地文件或发送到 HTTP 接收端。
---

# Java Profile

全部可用参数和默认值请参阅 [Profile 参数配置：Java](configuration.md#java)。

Beacon Java Profile 是实验能力，默认关闭，需要 Java 11 或更高版本且运行时支持 JFR。应用仍使用 [Java 零代码指南](../zero-code/java.md)中的同一个 `-javaagent` 命令。

## 通过 HTTP 上传

兼容性 HTTP exporter 使用 `multipart/form-data` 发送 JFR 快照和元数据：

```bash
export OTEL_SERVICE_NAME=my-java-service
export OTEL_PROFILING_ENABLED=true
export OTEL_PROFILING_EXPORTER=datakit
export OTEL_PROFILING_ENDPOINT=http://127.0.0.1:9529/profiling/v1/input
java -javaagent:./beacon-javaagent.jar -jar app.jar
```

`datakit` 是当前兼容性 exporter 的配置标识。接收端必须支持 `main.jfr` 和 `event.json` 两个 multipart 字段。默认快照周期为一分钟。

## 写入本地 JFR 文件

如需进行与接收端无关的验证，可使用 file exporter：

```bash
mkdir -p profiles
export OTEL_PROFILING_ENABLED=true
export OTEL_PROFILING_EXPORTER=file
export OTEL_PROFILING_EXPERIMENTAL_FILE_EXPORT_PATH="$PWD/profiles"
java -javaagent:./beacon-javaagent.jar -jar app.jar
```

确认 `profiles/` 中生成 `.jfr` 文件。生产环境启用前应规划磁盘保留策略，并在应用负载下验证性能开销。

## 可选内存事件

```bash
export OTEL_PROFILING_MEMORY_ENABLED=true
```

该配置会在标准 Profile 模板上叠加面向内存的 JFR 设置。
