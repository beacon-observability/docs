---
sidebar_label: Python
sidebar_position: 2
title: Python Security
description: 通过现有 beacon 命令启用 Beacon Security。
---

# Python Security

Beacon Python 1.4.0 已在 `beacon-otel` wheel 中包含 Security。它支持标准 GIL 的
CPython 3.11 至 3.14，并继续使用现有 `beacon` 命令，无需独立 Security 发行包。

## 启用 Security

先在应用现有虚拟环境内升级到 1.4.0；同时保留应用使用的框架 extras，
若已安装可选的 `beacon-profiling`，也将其升级到 1.4.0：

```bash
pip install 'beacon-otel==1.4.0'
beacon --version
```

```bash
export BEACON_SECURITY_ENABLED=true
export BEACON_SECURITY_PYTHON_INCLUDE=orders
export OTEL_SERVICE_NAME=orders
export OTEL_RESOURCE_ATTRIBUTES=service.namespace=shop
export OTEL_LOGS_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4317
beacon uvicorn orders.asgi:application --host 0.0.0.0 --port 8000
```

`BEACON_SECURITY_PYTHON_INCLUDE` 填写 Python 模块前缀，而不是文件系统路径。未设置时，
已启用的生命周期仍可导出运行时 SBOM，但不会转换应用模块或产生已建模数据流发现。

## 原生日志输出与升级

[1.4.0 版本](https://github.com/beacon-observability/beacon-python/releases/tag/v1.4.0)
直接在 OTel Logs Body 中导出单行、紧凑的 v2 JSON 对象，不再使用 SIEM 信封或
`message` 包装。`schema_version` 保留在顶层，指纹 v1 不变。证据、请求与 sink
上下文、依赖、`source`、`instance_id`、`trace_id` 和检测时的 `span_id` 保留原有
Body 路径；缺失的 Trace 上下文不伪造。

生产端与接收端需同步升级：

| 数据 | 1.4.0 的传输位置 |
| --- | --- |
| 事件时间，原逻辑字段 `observed_at` | OTel 原生 `time_unix_nano`，Body 中省略 |
| 请求发现标识，原 `occurrence_id` | LogRecord `attributes.event_id`，Body 中省略 |
| 稳定发现标识 | Body `finding_id` |
| 库存事件标识 | LogRecord `attributes.event_id`，按采集轮次与分片确定性生成 |

Body 解析一次即可读取其余 v2 字段。库存组装使用 Body `instance_id`、原生事件时间
以及 Body `part_index`/`part_count`；不完整轮次不能清空此前完整库存。事件时间保留
已有精度，最多九位小数，不会随队列刷新而改变；无效或无法表示的时间会明确导致导出失败。

Body 字节限制与库存分片按最终紧凑 UTF-8 Body 字节计算；导出速率预算也预留原生元数据
和日志属性开销。原有证据采样与声明截断继续生效。诊断证据 JSONL 现将原生时间以十进制
字符串存入 `time_unix_nano`，将精确 Body 字符串存入 `body`，并在 Body 外保留
LogRecord `attributes`。该文件包装不会作为 OTLP Body 发送。

1.3.0 使用 SIEM 信封，证据位于 `message`。历史记录继续使用原解码器，没有输出格式
切换开关。回滚时同时安装匹配的 1.3.0 包，并恢复其接收端和文件解码器。本地 OTLP
测试不代表生产后端兼容性已完成验收。

## 安全发现与分析

逐请求记录与请求级攻击证据自 1.2.0 起提供，schema v2 自 1.2.3 起提供。
本页使用 1.4.0，以 LogRecord `attributes.event_id` 标识请求记录。详细证据采样独立于请求记录导出和
Trace 采样；空证据数组可以省略，采样本身不表示截断。在线载荷没有累计发生次数，
消费端应对已收到的 occurrence 去重后聚合。参见[安全发现与证据](findings.md)，了解
`unknown`、`no_evidence`、`suspected`、证据升级及投递限制；任何状态都不保证利用成功。

SQL 分析默认 `unknown`；仅为兼容 SQL 设置 `BEACON_SECURITY_ANALYSIS_SQL_DIALECT=ansi`，
启用带引号字符串及标识符、双写引号转义、数字、简单运算符和注释的有边界词法子集。
这不是完整解析器。其他方言、反斜杠或 dollar quoting、不支持的语法、不精确污点，以及
超过 8,192 个 Unicode 码点或 64 个污点标记的输入仍为 `unknown`。
固定模板绑定值与准备语句前拼接不可信模板应分别处理。

Shell 分析支持简单 POSIX `sh`、`bash`、`dash`、`ksh`、`zsh` 命令、引号、转义及控制
分隔符；展开、重定向、复合语法和其他 Shell 保持 `unknown`。普通 argv 与固定目标的
路径/查询输入是独立的观测。未实现网络允许列表或文件系统根目录策略，相关边界判断
仍为 `unknown`；规范化不代表安全。字节串不按已知文本方言分析。
详见[固定版本的分析参考](https://github.com/beacon-observability/beacon-python/blob/v1.4.0/beacon-otel/README.md)。

### 无攻击证据发现的导出

1.4.0 默认不向 OpenTelemetry Logs 和证据 JSONL 导出 `no_evidence` 发现。
设置 `BEACON_SECURITY_EXPORT_NO_EVIDENCE_ENABLED=true` 可恢复导出。`unknown`、
`suspected` 仍可导出，SBOM 不受影响。过滤发生在入队前，不算导出丢失；内部检测、
同请求去重和证据升级仍会执行。本地发现快照和 Span 摘要可保留未导出的观测。
`no_evidence` 不表示安全，没有导出事件也不证明没有检测到风险。

## 参数参考

| 环境变量 | 默认值 | 用途 |
| --- | --- | --- |
| `BEACON_SECURITY_ENABLED` | `false` | 启用 Security 生命周期和运行时 SBOM。 |
| `BEACON_SECURITY_PYTHON_INCLUDE` | 空 | 选择参与安全发现采集的应用模块前缀。 |
| `BEACON_SECURITY_PYTHON_EXCLUDE` | 空 | 排除模块前缀，优先级高于 include。 |
| `BEACON_SECURITY_FINDINGS_SAMPLE_SECONDS` | `300` | 每个发现的完整证据采样间隔（秒）。 |
| `BEACON_SECURITY_ANALYSIS_SQL_DIALECT` | `unknown` | `ansi` 启用受支持的 SQL 词法子集。 |
| `BEACON_SECURITY_EXPORT_NO_EVIDENCE_ENABLED` | `false` | 同时导出 `no_evidence` 事件。 |
| `BEACON_SECURITY_SBOM_ENABLED` | `true` | 在 Security 启用时采集运行时 SBOM。 |
| `BEACON_SECURITY_LOCAL_OUTPUT_ENABLED` | `false` | 启用进程本地诊断文件。 |
| `BEACON_SECURITY_OUTPUT` | `./beacon-security-output/<instance-id>` | 设置诊断目录。 |
| `BEACON_SECURITY_EVIDENCE_FILE` | 未设置 | 设置可选的诊断 JSONL 文件。 |

安全发现与 SBOM 记录使用 OpenTelemetry Logs 管道。本地输出是诊断证据，默认保持关闭。

## Kubernetes 与 Gunicorn

在应用镜像中安装 `beacon-otel==1.4.0`，并参考
[固定版本的 Deployment 示例](https://github.com/beacon-observability/beacon-python/blob/v1.4.0/beacon-otel/examples/kubernetes/deployment.yaml)。
不需要 Security sidecar 或 init container。

Gunicorn 必须在每个 Worker fork 后初始化遥测。请使用该版本提供的
`beacon_security.gunicorn` 配置，不要在此命令前添加 `beacon`，也不要启用
`preload_app`。

移除 `BEACON_SECURITY_ENABLED` 或将其设为 `false` 即可关闭 Security，同时保留常规
零代码遥测。
