---
sidebar_position: 1
title: Java
description: 使用 -javaagent 为 Java 应用挂载 Beacon。
---

# Java 零代码接入

Beacon Java 1.0.0 以单个 Agent JAR 发布。探针需要 JDK 支持的运行时；Profile 要求 JDK 11 或更高版本。

## 安装

```bash
curl -fL -o beacon-javaagent.jar \
  https://github.com/beacon-observability/beacon-java/releases/download/v1.0.0/beacon-javaagent-1.0.0.jar
```

## 启动

```bash
export OTEL_SERVICE_NAME=my-java-service
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4317
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
java -javaagent:./beacon-javaagent.jar -jar app.jar
```

必须将 `-javaagent` 放在 `-jar` 或应用主类之前，其他 JVM 与应用参数保持不变。

## Profile

Java 11 及以上可以采集实验性 JFR Profile，并写入本地文件或通过 HTTP 上传。参阅 [Java Profile 指南](../profiling/java.md)。
