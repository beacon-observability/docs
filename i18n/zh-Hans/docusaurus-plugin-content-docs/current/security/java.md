---
sidebar_position: 1
title: Java Security
description: 在完整 Beacon Java Agent 中启用 Security。
---

# Java Security

Beacon Java 1.3.4 已将 Security 嵌入完整 Agent JAR。继续使用
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
| `BEACON_SECURITY_EXPORT_NO_EVIDENCE_ENABLED` | `false` | 设为 `true` 后导出 `attack_evidence.status=no_evidence` 的安全发现。 |
| `BEACON_SECURITY_SBOM_ENABLED` | `true` | 在 Security 启用时采集运行时 SBOM。 |
| `BEACON_SECURITY_LOCAL_OUTPUT_ENABLED` | `false` | 启用进程本地诊断快照。 |
| `BEACON_SECURITY_OUTPUT` | `./beacon-security-output/<instance-id>` | 设置诊断快照目录。 |
| `BEACON_SECURITY_EVIDENCE_FILE` | 未设置 | 设置可选的诊断 JSONL 文件。 |

常规 OpenTelemetry 变量负责资源身份、传输与认证。本地输出仅用于诊断，不是持久化或
集群级投递机制。

## 安全发现的导出策略

默认不导出 `attack_evidence.status=no_evidence` 的安全发现；`unknown`、`suspected` 和 SBOM 的导出资格不变。需要恢复旧行为时，设置 `BEACON_SECURITY_EXPORT_NO_EVIDENCE_ENABLED=true`。该开关影响 OpenTelemetry Logs 和证据 JSONL，不关闭内部检测、本地发现快照或 Span 摘要，也不阻止同一请求中的证据升级。参阅[统一导出策略](index.md#finding-export-policy)。

Java 也可通过 JVM 参数 `-Dbeacon.security.export.no-evidence.enabled=true` 启用；将参数放在 `-jar` 之前。

## Kubernetes

可以将正式发布的完整 Agent JAR 放入应用镜像，或参考[固定版本的 initContainer 示例](https://github.com/beacon-observability/beacon-java/blob/v1.3.4/extensions/security/examples/kubernetes/init-container.yaml)。使用公开镜像时，将示例中的镜像版本改为 `ghcr.io/beacon-observability/beacon-java:1.3.4`，并按生产要求固定镜像摘要。init container 将同一个 JAR 复制到 `emptyDir`，应用通过 `JAVA_TOOL_OPTIONS` 加载它。普通工作负载应保持本地输出关闭。

移除 `BEACON_SECURITY_ENABLED` 或将其设为 `false` 即可关闭 Security，同时保留常规
零代码遥测。
