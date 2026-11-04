---
sidebar_label: Java
sidebar_position: 1
title: Java Security
description: 在完整 Beacon Java Agent 中启用 Security。
---

# Java Security

本指南使用 Beacon Java 1.3.4；Security 自 1.1.0 起嵌入完整 Agent JAR。继续使用
[Java 零代码指南](../zero-code/java.md)中的同一个 `-javaagent` 配置；无需安装或维护
独立的 Security JAR。

## 启用 Security

启用前，先从 [1.3.4 Release](https://github.com/beacon-observability/beacon-java/releases/tag/v1.3.4)
下载完整 Agent JAR，并将其命名为 `beacon-javaagent.jar`。

```bash
export BEACON_SECURITY_ENABLED=true
export OTEL_SERVICE_NAME=orders
export OTEL_RESOURCE_ATTRIBUTES=service.namespace=shop
export OTEL_LOGS_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4318
java -javaagent:./beacon-javaagent.jar -jar orders.jar
```

Agent 通过 OpenTelemetry Logs 导出安全发现和运行时依赖清单；本地 CycloneDX 文件需显式
启用诊断输出。Security 默认关闭。
安全发现表示已建模的运行时观测或候选风险，并非已经确认的漏洞。

## 安全发现与分析

[Java 1.3.0](https://github.com/beacon-observability/beacon-java/releases/tag/v1.3.0)
首次支持逐请求记录和请求级攻击证据。
[Java 1.3.3](https://github.com/beacon-observability/beacon-java/releases/tag/v1.3.3)
使用 schema v2：`occurrence_id` 替代 `evidence_id`，移除在线累计计数，允许省略空证据数组。
参见[安全发现与证据](findings.md)，了解 Java 1.3.0 A/B/C 示例、v1 字段、v2 迁移、状态
含义及投递限制。请求记录导出、详细证据采样与 OpenTelemetry Trace 采样互相独立。

SQL 分析需要显式开启。仅对兼容 SQL 设置 `BEACON_SECURITY_ANALYSIS_SQL_DIALECT=ansi`，
默认值为 `unknown`。有边界的词法子集支持单引号字符串、双写引号转义、带引号的标识符、
十进制数、运算符、括号和注释。它不是完整 SQL 解析器，也不是关键词检测器。
反斜杠转义、dollar quoting、反引号、方括号引号、未闭合引号和仅受污点影响的标识符均
保持 `unknown`。固定模板单独绑定参数值，与准备语句前拼接不可信 SQL 不同；普通绑定值
不会产生 SQL 模板注入发现。

Shell 分析支持作为独立参数传给 `sh`、`bash`、`dash`、`ksh`、`zsh` 的简单 POSIX 脚本，
包括引号、转义和控制分隔符。展开、替换、重定向、复合语法、Windows Shell 以及通过
`Runtime.exec(String)` 重建的脚本仍为 `unknown`。普通 argv 输入不会被分类为 Shell
注入，但仍可能存在应用特定的参数风险。

分析最多处理 8,192 个 UTF-16 代码单元和 64 个精确污点范围。不支持的输入、不精确范围及
预算耗尽都保留不确定性。分析不会进行利用重放、网络探测、JDBC 元数据查询或文件系统
解析。Java 1.3.4 没有网络允许列表或文件系统根目录策略；依赖边界策略的 SSRF、可执行文件
选择及路径判断仍为 `unknown`，规范化不代表安全。参见
[已发布的分析参考](https://github.com/beacon-observability/beacon-java/blob/v1.3.4/extensions/security/README.md#analysis-support-and-limits)。

## 参数参考

| 环境变量 | 默认值 | 用途 |
| --- | --- | --- |
| `BEACON_SECURITY_ENABLED` | `false` | 启用 Security 生命周期和运行时观测。 |
| `BEACON_SECURITY_EXPORT_NO_EVIDENCE_ENABLED` | `false` | 设为 `true` 后导出 `attack_evidence.status=no_evidence` 的安全发现。 |
| `BEACON_SECURITY_SBOM_ENABLED` | `true` | 在 Security 启用时采集运行时 SBOM。 |
| `BEACON_SECURITY_LOCAL_OUTPUT_ENABLED` | `false` | 启用进程本地诊断快照。 |
| `BEACON_SECURITY_OUTPUT` | `./beacon-security-output/<instance-id>` | 设置诊断快照目录。 |
| `BEACON_SECURITY_FINDINGS_SAMPLE_SECONDS` | `300` | 每个发现的完整证据采样间隔（秒），不控制请求记录或 Trace 采样。 |
| `BEACON_SECURITY_ANALYSIS_SQL_DIALECT` | `unknown` | 设置为 `ansi` 以开启受支持的 SQL 词法子集。 |
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
