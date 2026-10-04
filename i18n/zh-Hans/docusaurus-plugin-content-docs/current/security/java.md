---
sidebar_position: 1
title: Java Security
description: 在完整 Beacon Java Agent 中启用 Security。
---

# Java Security

Beacon Java 1.1.0 已将 Security 嵌入完整 Agent JAR。继续使用
[Java 零代码指南](../zero-code/java.md)中的同一个 `-javaagent` 配置；无需安装或维护
独立的 Security JAR。

## 启用 Security

```bash
export BEACON_SECURITY_ENABLED=true
export OTEL_SERVICE_NAME=orders
export OTEL_RESOURCE_ATTRIBUTES=service.namespace=shop
export OTEL_LOGS_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4318
java -javaagent:./beacon-javaagent.jar -jar orders.jar
```

Agent 通过 OpenTelemetry Logs 导出安全发现和运行时 CycloneDX SBOM。Security 默认关闭。
安全发现表示已建模的运行时观测或候选风险，并非已经确认的漏洞。

## 参数参考

| 环境变量 | 默认值 | 用途 |
| --- | --- | --- |
| `BEACON_SECURITY_ENABLED` | `false` | 启用 Security 生命周期和运行时观测。 |
| `BEACON_SECURITY_SBOM_ENABLED` | `true` | 在 Security 启用时采集运行时 SBOM。 |
| `BEACON_SECURITY_LOCAL_OUTPUT_ENABLED` | `false` | 启用进程本地诊断快照。 |
| `BEACON_SECURITY_OUTPUT` | `./beacon-security-output/<instance-id>` | 设置诊断快照目录。 |
| `BEACON_SECURITY_EVIDENCE_FILE` | 未设置 | 设置可选的诊断 JSONL 文件。 |

常规 OpenTelemetry 变量负责资源身份、传输与认证。本地输出仅用于诊断，不是持久化或
集群级投递机制。

## Kubernetes

1.1.0 版本未发布 Beacon 自有容器镜像。可以将已发布的 Agent JAR 放入应用镜像，或
构建私有 init 镜像并使用
[固定版本的 initContainer 示例](https://github.com/beacon-observability/beacon-java/blob/cc55c77be6247d4f0e3835639002415b683a220b/extensions/security/examples/kubernetes/init-container.yaml)。
init container 将同一个完整 Agent JAR 复制到 `emptyDir`，应用通过
`JAVA_TOOL_OPTIONS` 启用它。普通工作负载应保持本地输出关闭。

移除 `BEACON_SECURITY_ENABLED` 或将其设为 `false` 即可关闭 Security，同时保留常规
零代码遥测。
