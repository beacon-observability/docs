---
sidebar_label: Java
sidebar_position: 1
title: Java Security
description: 在完整 Beacon Java Agent 中启用 Security。
---

# Java Security

本指南使用 Beacon Java 1.5.0；Security 自 1.1.0 起嵌入完整 Agent JAR。继续使用
[Java 零代码指南](../zero-code/java.md)中的同一个 `-javaagent` 配置；无需安装或维护
独立的 Security JAR。

## 启用 Security

启用前，先从 [1.5.0 Release](https://github.com/beacon-observability/beacon-java/releases/tag/v1.5.0)
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

## SIEM 输出与升级 {#siem-output-and-upgrade}

Java 1.5.0 将 OpenTelemetry LogRecord 的字符串 Body 和证据 JSONL 改为
`beacon-security-siem-v1`。从 1.4.x 或更早版本升级时，需要同步修改消费端；
没有切回旧格式的开关。以下 15 个基础字段均为必需的字符串：

| 字段 | 安全发现 | 运行时依赖清单 |
| --- | --- | --- |
| `time` | 原始 `observed_at` | 原始 `observed_at` |
| `event_id` | 原始 `occurrence_id` | 确定性生成的清单 ID |
| `event_class` | `security_finding` | `software_inventory_info` |
| `source` | `beacon_security` | `beacon_security_sbom` |
| `service` | Resource `service.name`，缺少时为空 | 同左 |
| `tenant_id` | Resource `tenant.id`，缺少时为 `default` | 同左 |
| `actor` | 空字符串 | 空字符串 |
| `ip` | 空字符串 | 空字符串 |
| `action` | 原始 `rule` | `inventory_snapshot` |
| `target` | 原始 `finding_id` | 进程 `instance_id` |
| `target_type` | `finding` | `process` |
| `outcome` | `unknown` | 本地采集成功时为 `success` |
| `status` | `info` | `info` |
| `severity` | `informational` | `informational` |
| `message` | 完整序列化的 v2 安全发现 | 完整序列化的 v2 清单分片 |

外层还必须包含 `instance_id`，并保留可用的 `trace_id`、`span_id` 和数值类型的
`trace_flags`（0–255，包括 0）。缺少的链路字段直接省略；依赖清单不继承请求上下文。
安全发现的 `message` 内，`current_span_id` 更名为 `span_id`，删除 `server_span_id`。
原生 LogRecord 关联观测到的调用点 Span；缺少调用点 Span 时不会用请求入口 Span 替代。

此次改动不增加操作人或客户端 IP 采集。需要应用提供租户时，在
`OTEL_RESOURCE_ATTRIBUTES` 中加入 `tenant.id=customer-a`；未配置时输出 `default`。
该字段不构成授权边界。`status=info` 和 `severity=informational` 表示日志级别，
不表示漏洞风险等级；`unknown`、`no_evidence`、`suspected` 仍需从 `message` 内的
`attack_evidence.status` 读取。

消费端迁移步骤：

1. 解析外层信封，再将 `message` 解析为 JSON，读取 `schema_version`、`event_name`、
   攻击证据及依赖清单分片元数据。
2. 原样保留收到的 `message`。它保留现有证据采样及显式截断之后、导出边界处完整序列化的
   v2 事件，无法恢复未采集或已丢弃的证据。JSONL 和 OTLP 使用相同信封；本地诊断快照格式不变。
3. 按内层 `instance_id + observed_at` 和 `part_index/part_count` 组装清单，
   仅在全部分片到齐后替换清单。
4. 在接收端 Pipeline 中将外层 `source` 绑定到目标数据源，将 `time` 绑定到事件时间，
   并保留 `message` 作为原始载荷。升级 Agent 不会自动部署接收端 Pipeline。

导出限额按最终信封字节计算，包括 JSON 转义开销。超限信封可能被丢弃并计入本地丢失计数，
不会为满足限额而静默缩短 `message`。默认 `no_evidence` 过滤和指纹 v1 不变。
参阅[固定版本的 SIEM 参考](https://github.com/beacon-observability/beacon-java/blob/v1.5.0/extensions/security/SIEM.md)
和[信封 schema](https://github.com/beacon-observability/beacon-java/blob/v1.5.0/extensions/security/schema-siem-v1.json)。

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
解析。Java 1.5.0 没有网络允许列表或文件系统根目录策略；依赖边界策略的 SSRF、可执行文件
选择及路径判断仍为 `unknown`，规范化不代表安全。参见
[已发布的分析参考](https://github.com/beacon-observability/beacon-java/blob/v1.5.0/extensions/security/README.md#analysis-support-and-limits)。

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

将正式发布的 1.5.0 Agent JAR 放入应用镜像或挂载卷，并通过 `JAVA_TOOL_OPTIONS=-javaagent:/path/to/beacon-javaagent.jar` 加载。容器镜像单独发布；按所选镜像实际包含的 JAR 版本和摘要部署。普通工作负载应保持本地输出关闭。

移除 `BEACON_SECURITY_ENABLED` 或将其设为 `false` 即可关闭 Security，同时保留常规
零代码遥测。
