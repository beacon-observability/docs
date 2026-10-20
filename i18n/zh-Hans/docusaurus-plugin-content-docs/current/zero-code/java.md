---
sidebar_position: 1
title: Java
description: 使用 -javaagent 为 Java 应用挂载 Beacon。
---

# Java 零代码接入

Beacon Java 1.1.0 以单个 Agent JAR 发布。探针需要 JDK 支持的运行时；Profile
要求 JDK 11 或更高版本。同一个 JAR 已包含可选的 Security 能力。

## 安装

```bash
curl -fL -o beacon-javaagent.jar \
  https://github.com/beacon-observability/beacon-java/releases/download/v1.1.0/beacon-javaagent-1.1.0.jar
```

## 启动

```bash
export OTEL_SERVICE_NAME=my-java-service
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4317
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
java -javaagent:./beacon-javaagent.jar -jar app.jar
```

必须将 `-javaagent` 放在 `-jar` 或应用主类之前，其他 JVM 与应用参数保持不变。

## 调试与诊断

沿用上文的服务名和 OTLP 配置，临时开启 Agent 调试日志并保存输出：

```bash
OTEL_JAVAAGENT_DEBUG=true \
  java -javaagent:./beacon-javaagent.jar -jar app.jar \
  > beacon-java-debug.log 2>&1
```

也可以在 `-jar` 之前添加 JVM 参数 `-Dotel.javaagent.debug=true`；JVM 系统属性优先于同名环境变量。日志用于检查 Agent 加载、插桩匹配和导出错误。

排障后恢复原启动命令；若在服务配置中设置了该变量或 JVM 参数，请移除并重启应用。

## Profile

Java 11 及以上可以采集实验性 JFR Profile，并写入本地文件或通过 HTTP 上传。参阅 [Java Profile 指南](../profiling/java.md)。

## Security

同一个 Agent 可以通过 OpenTelemetry Logs 导出需主动启用的安全发现和运行时 SBOM。
参阅 [Java Security 指南](../security/java.md)。
