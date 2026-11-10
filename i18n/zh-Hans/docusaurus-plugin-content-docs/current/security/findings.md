---
sidebar_position: 5
title: 安全发现与证据
description: 解读请求发生记录、证据采样、攻击证据及不同版本的 Security 事件。
---

# 安全发现与证据

安全发现记录有边界的已建模来源到敏感调用的数据流观测或候选代码风险，并不确认漏洞、
恶意意图或利用成功。以下行为以已发布的 Java、Node.js、Python 版本为依据，不表示
PHP 或 .NET 具有相同的分析能力；.NET 已发布范围见 [.NET Security](dotnet.md)。

## 已发布版本与事件格式

| 语言 | 首次支持逐请求记录与攻击证据 | 首次使用 schema v2 | 本指南采用的版本 |
| --- | --- | --- | --- |
| Java | [1.3.0](https://github.com/beacon-observability/beacon-java/releases/tag/v1.3.0) | [1.3.3](https://github.com/beacon-observability/beacon-java/releases/tag/v1.3.3) | [1.3.4](https://github.com/beacon-observability/beacon-java/releases/tag/v1.3.4) |
| Node.js | [1.3.0](https://github.com/beacon-observability/beacon-nodejs/releases/tag/v1.3.0) | [2.0.0](https://github.com/beacon-observability/beacon-nodejs/releases/tag/v2.0.0) | [2.0.2](https://github.com/beacon-observability/beacon-nodejs/releases/tag/v2.0.2) |
| Python | [1.2.0](https://github.com/beacon-observability/beacon-python/releases/tag/v1.2.0) | [1.2.3](https://github.com/beacon-observability/beacon-python/releases/tag/v1.2.3) | [1.2.4](https://github.com/beacon-observability/beacon-python/releases/tag/v1.2.4) |

解读记录前先读取 `schema_version`。事件名称仍为 `beacon.security.finding`，指纹版本
仍为 `1`。共享 schema 不代表运行时覆盖范围相同。旧生产端可能缺少可选的请求记录、
采样或攻击证据字段；缺少字段不等于 `no_evidence`。

## 代码风险、请求证据与利用结果

在 schema v1 中，`assessment=observation` 或 `candidate_risk` 描述代码风险，
`validation=unvalidated` 表示尚未验证，可选的 `attack_evidence` 描述当前请求。
这三个维度应分别解读。

| `attack_evidence.status` | 含义 |
| --- | --- |
| `unknown` | 分析不可用、不支持、不精确、超出预算，或缺少所需边界策略。 |
| `no_evidence` | 支持的分析未发现攻击证据。这不代表安全，也不消除代码风险。 |
| `suspected` | 支持的分析发现可能的利用证据，不证明恶意意图或利用成功。 |

`attack_evidence.reason` 是有长度限制、可供程序读取的原因，不包含原始请求值。
v1 的 `attack_evidence.outcome=not_assessed`。schema v2 省略固定的 assessment、
validation 占位字段与固定的 outcome 字段；省略不表示已确认利用。仅观察到调用、
正常返回或某个 HTTP 状态，都不能证明利用成功。

在污点范围精确且启用了受支持的 ANSI SQL 分析时，下列情况有不同含义。
示例描述敏感调用的上下文，不是按关键词匹配攻击的规则：

| 场景 | 解读 |
| --- | --- |
| 普通输入拼接进动态 SQL 的引号值中 | 即使受支持的分析返回 `no_evidence`，候选代码风险仍可存在。 |
| 固定 SQL 模板与单独绑定的参数值 | 普通绑定值不会产生 SQL 模板注入发现；准备语句前先构建不可信模板是另一种情况。 |
| 不可信输入控制受支持的 SQL 结构运算符或注释分隔符 | 可能返回 `suspected`，但不证明数据库执行了利用。 |
| 未配置方言、语法不支持、污点不精确或分析预算耗尽 | 保持 `unknown`，不能据此宣称安全。 |

ANSI 开关与分析边界见各语言页面。上述版本没有实现网络允许列表或文件系统根目录策略，
依赖这些边界策略的攻击判断仍为 `unknown`。仅进行路径规范化不代表路径安全。

## 一个发现，多次请求

`finding_id` 表示稳定的代码风险指纹，`occurrence_id` 标识某次请求对该发现的检测。
在 Java 1.3.0 schema v1 中，它等于该请求的 `evidence_id`。同一请求内重复检测到同一
指纹只计一次；更强证据可以使用同一个 ID 更新该请求记录。

以下 Java 1.3.0 示例假设聚合可用，三次请求处于同一个完整证据采样间隔内。
表中 ID 是示意标签，不是字面事件载荷；各请求拥有当前请求自己的 Trace/Span 上下文。

| 请求 | `finding_id` | `evidence_id` = `occurrence_id` | Trace / Span | 保留详细证据 | `occurrences_total` |
| --- | --- | --- | --- | --- | --- |
| A | F | A1 | trace-A / span-A | 是，首次采样 | 1 |
| B | F | B1 | trace-B / span-B | 否，间隔采样 | 2 |
| C | F | C1 | trace-C / span-C | 否，间隔采样 | 3 |

详细证据采样独立于请求记录导出和 OpenTelemetry Trace 采样。B 的详细证据未被采样，
不表示没有检测到 B。缺少 Trace 或 Trace 未采样不会阻止安全发现；发现中的 Trace ID
也不保证对应链路已到达后端或仍被保留。

同一请求内证据优先级为 `suspected > unknown > no_evidence`。证据升级会移动该请求的
状态计数，但不增加发生次数，并可绕过普通证据采样间隔。不同请求独立分类：
普通 → 疑似 → 普通，不会让最后一次请求变成疑似。保留的最强代表证据可能来自中间请求，
而 `last_trace_id` 来自最新请求。v2 只有显式启用本地诊断输出，才保留完整代表证据与
累计本地计数。

v1 的 `attack_evidence_counts` 将聚合请求次数划分为三种状态。这是证据状态计数，绝非
已确认攻击次数。v2 在线载荷没有累计发生次数；消费端按 `instance_id + occurrence_id`
去重、按 `finding_id` 分组，并合并同一 occurrence 的升级，不能将每次更新计为新请求。

## 采样与迁移

| 项目 | Java 1.3.0–1.3.2 schema v1 | 上述 schema v2 版本 |
| --- | --- | --- |
| 请求记录标识 | `evidence_id` 及其别名 `occurrence_id` | `occurrence_id`；移除 `evidence_id` |
| 详细证据未采样 | `evidence_sampled=false`，必需的 `sources`、`propagation`、`ranges`、`stack` 数组为空 | `evidence_sampled=false`；省略空证据数组 |
| 采样原因 | `evidence_sample_reason`，省略详情时带 `truncated=true`、`truncation_reason=evidence_sampled_out` | `evidence_sample_reason`；仅采样不表示截断 |
| 采集限制 | 截断字段描述证据不完整 | `collection_complete` 描述观测质量；`truncated=true` 表示实际采集或编码截断 |
| 聚合 | `aggregation_status=tracked` 时有进程本地 `occurrences_total`；`capacity_exceeded` 时省略总数，仍继续有边界的请求记录导出 | 移除在线总数及独立的汇总、健康、丢失、截断记录事件；后端聚合已收到的请求记录 |

证据数组为空或被省略都不证明没有污点。v1 进程本地计数不是集群级或持久化总数。
不能用 v1 事件 schema 校验 v2 记录。参见已发布的
[Java v1 参考](https://github.com/beacon-observability/beacon-java/blob/v1.3.0/extensions/security/README.md)与
[Java v2 参考](https://github.com/beacon-observability/beacon-java/blob/v1.3.3/extensions/security/README.md)。

## 导出策略与投递限制

Java 1.3.4、Node.js 2.0.2 和 Python 1.2.4 默认不向 OpenTelemetry Logs 和证据 JSONL 导出
`no_evidence` 发现。设置 `BEACON_SECURITY_EXPORT_NO_EVIDENCE_ENABLED=true` 可恢复导出。
`unknown`、`suspected` 仍可导出，SBOM 不受影响。过滤发生在入队前，不占用队列或发送限额，也不算导出丢失。
内部检测、去重和同请求证据升级仍然执行。Java 1.3.3 尚无此开关，1.3.4 起提供。
上面的 A/B/C v1 示例早于此导出策略。

即使详细证据采样，重复发现仍可能增加日志量。队列、内存、单条字节数和速率预算均有
上限。v1 提供可观测的丢失计数；正常记录无法容纳时可能只发送最小截断信封，该信封
不一定保留 occurrence 或 Trace 字段。v2 移除了这些独立诊断事件，也不会产生重放事件
来补偿丢失的记录。缺少记录可能来自策略过滤、采集限制、队列丢失、传输失败或保留策略。
基于已收到记录的计数只代表已收到的观测，不是完整普查。请求记录或 OpenTelemetry API
调用都不保证持久化投递或后端确认。
