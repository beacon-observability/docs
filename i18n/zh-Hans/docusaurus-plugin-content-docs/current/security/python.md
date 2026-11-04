---
sidebar_label: Python
sidebar_position: 2
title: Python Security
description: 通过现有 beacon 命令启用 Beacon Security。
---

# Python Security

Beacon Python 1.2.4 已在 `beacon-otel` wheel 中包含 Security。它支持标准 GIL 的
CPython 3.11 至 3.14，并继续使用现有 `beacon` 命令，无需独立 Security 发行包。

## 启用 Security

先在应用现有虚拟环境内升级到 1.2.4；同时保留应用使用的框架 extras，
若已安装可选的 `beacon-profiling`，也将其升级到 1.2.4：

```bash
pip install 'beacon-otel==1.2.4'
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

## 安全发现与分析

逐请求记录与请求级攻击证据自 1.2.0 起提供，schema v2 自 1.2.3 起提供。
本页使用 1.2.4，以 `occurrence_id` 标识请求记录。详细证据采样独立于请求记录导出和
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
详见[固定版本的分析参考](https://github.com/beacon-observability/beacon-python/blob/v1.2.4/beacon-otel/README.md)。

### 无攻击证据发现的导出

1.2.4 默认不向 OpenTelemetry Logs 和证据 JSONL 导出 `no_evidence` 发现。
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

在应用镜像中安装 `beacon-otel==1.2.4`，并参考
[固定版本的 Deployment 示例](https://github.com/beacon-observability/beacon-python/blob/v1.2.4/beacon-otel/examples/kubernetes/deployment.yaml)。
不需要 Security sidecar 或 init container。

Gunicorn 必须在每个 Worker fork 后初始化遥测。请使用该版本提供的
`beacon_security.gunicorn` 配置，不要在此命令前添加 `beacon`，也不要启用
`preload_app`。

移除 `BEACON_SECURITY_ENABLED` 或将其设为 `false` 即可关闭 Security，同时保留常规
零代码遥测。
