---
sidebar_label: Java
sidebar_position: 1
title: Java Security
description: 在完整 Beacon Java Agent 中启用 Security。
---

# Java Security

本指南使用 Beacon Java 1.5.1；Security 自 1.1.0 起嵌入完整 Agent JAR。继续使用
[Java 零代码指南](../zero-code/java.md)中的同一个 `-javaagent` 配置；无需安装或维护
独立的 Security JAR。

## 启用 Security

启用前，先从 [1.5.1 Release](https://github.com/beacon-observability/beacon-java/releases/tag/v1.5.1)
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

## 原生日志输出与升级 {#native-log-output-and-migration}

[Java 1.5.1](https://github.com/beacon-observability/beacon-java/releases/tag/v1.5.1)
直接在 OTel LogRecord Body 中导出紧凑的单行 JSON 对象，不再有 SIEM 外层或
`message` 包装。`schema_version=2` 保留在 Body 顶层；指纹 v1、检测、采样和默认
`no_evidence` 过滤策略保持不变。

| 信息 | 1.5.1 的传输位置 |
| --- | --- |
| 事件时间，原逻辑字段 `observed_at` | 原生 `time_unix_nano`，Unix 纳秒；Body 不再重复携带 |
| 本次 finding 的 occurrence ID，原 `occurrence_id` | LogRecord `attributes.event_id`；Body 不再重复携带 |
| 稳定的 finding ID | Body `finding_id` |
| 清单事件 ID | LogRecord `attributes.event_id`，按采集轮次与分片确定性生成 |
| 来源 | 保持既有 Body `source` 和 LogRecord `attributes.source` |

Body 只需解析一次，即可读取其他原有字段，包括请求与 sink、攻击证据、依赖清单、
进程身份及可用的 Trace/Span。`event_id` 就是原逻辑 occurrence ID，不额外生成新 ID，
也不能用 Resource 或服务实例 ID 替代。事件时间保留来源可提供的精度，最高到纳秒，
排队导出时保持不变，不使用 flush 时间替代；无效或越界时间会显式导致导出失败。

消费端使用 Body `instance_id`、原生事件时间和 Body `part_index`/`part_count` 组装
清单；同一轮分片共享事件时间，不完整的轮次不能清空上一轮完整清单。保留上报的清单 ID，
不要根据重新格式化的时间字符串重算。`started_at` 和 `uptime_ms` 仍分别表示进程启动
时间与运行时长。

Body 字节限制和清单分片按最终紧凑 UTF-8 Body 计算，不再计入 SIEM 二次转义开销；
完整传输记录的限制仍需包含原生元数据。本地 evidence JSONL 每行独立保存十进制字符串
`time_unix_nano`、与线上完全相同的 `body` 字符串和 LogRecord `attributes`。
该文件外层不会作为 OTLP Body 发送；仅保存 Body 的归档无法恢复移出的时间和 occurrence ID。

### 历史 1.5.0 SIEM 输出 {#siem-output-and-upgrade}

升级时同步调整 Agent、接收端和本地文件解码器。Java 1.5.0 使用 `message` 内嵌证据的
SIEM 格式；更早的完整 v2 Body 包含 `observed_at` 和 `occurrence_id`。历史记录继续使用
原解码方式；回滚时同时恢复对应版本的 Agent 与解码器。旧格式详见
[1.5.0 SIEM 参考](https://github.com/beacon-observability/beacon-java/blob/v1.5.0/extensions/security/SIEM.md)。参见
[已发布的日志绑定](https://github.com/beacon-observability/beacon-java/blob/v1.5.1/extensions/security/LOG-OUTPUT.md)
和 [Body Schema](https://github.com/beacon-observability/beacon-java/blob/v1.5.1/extensions/security/schema-log-body-v1.json)。

## 安全发现与分析

[Java 1.3.0](https://github.com/beacon-observability/beacon-java/releases/tag/v1.3.0)
首次支持逐请求记录和请求级攻击证据。
[Java 1.3.3](https://github.com/beacon-observability/beacon-java/releases/tag/v1.3.3)
开始使用 schema v2：逻辑 occurrence 标识替代 `evidence_id`，移除在线累计计数，允许省略空证据数组。
1.5.1 将该 occurrence 值仅通过 LogRecord `attributes.event_id` 传输，见上文迁移说明。
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
解析。Java 1.5.1 没有网络允许列表或文件系统根目录策略；依赖边界策略的 SSRF、可执行文件
选择及路径判断仍为 `unknown`，规范化不代表安全。参见
[已发布的分析参考](https://github.com/beacon-observability/beacon-java/blob/v1.5.1/extensions/security/README.md#analysis-support-and-limits)。

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

将正式发布的 1.5.1 Agent JAR 放入应用镜像或挂载卷，并通过 `JAVA_TOOL_OPTIONS=-javaagent:/path/to/beacon-javaagent.jar` 加载。容器镜像单独发布；按所选镜像实际包含的 JAR 版本和摘要部署。普通工作负载应保持本地输出关闭。

移除 `BEACON_SECURITY_ENABLED` 或将其设为 `false` 即可关闭 Security，同时保留常规
零代码遥测。
