---
sidebar_label: Node.js
sidebar_position: 3
title: Node.js Security
description: 通过 Node.js ESM 预加载启用 Beacon Security。
---

# Node.js Security

Beacon Node.js 2.0.1 已在 `@beacon-observability/nodejs` 中包含 Security。应用通常只需
安装这个完整软件包。Security 使用同步模块 Hook 进行限定范围的源码转换，因此要求
Node.js 22.22.3+ 或 24.11.1+。

## 启用 Security

必须使用 ESM `--import` 预加载。CommonJS `--require` 预加载仍可启动常规遥测与
Profile，但不能启用 Security 源码转换。

```bash
npm install @beacon-observability/nodejs@2.0.1

export NODE_OPTIONS="--import @beacon-observability/nodejs/register"
export BEACON_SECURITY_ENABLED=true
export BEACON_SECURITY_NODE_INCLUDE=/srv/app
export OTEL_SERVICE_NAME=orders
export OTEL_RESOURCE_ATTRIBUTES=service.namespace=shop
export OTEL_LOGS_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4318
node /srv/app/server.mjs
```

`BEACON_SECURITY_NODE_INCLUDE` 用于选择应用源码根目录。依赖包、Node.js 内置模块和
显式排除的根目录不会被转换。

## 安全发现与分析

逐请求记录与请求级攻击证据自 1.3.0 起提供，schema v2 自 2.0.0 起提供。
本页使用 2.0.1，以 `occurrence_id` 标识请求记录。详细证据采样独立于请求记录导出和
Trace 采样；空证据数组可以省略，采样本身不表示截断。在线载荷没有累计发生次数，
消费端应对已收到的 occurrence 去重后聚合。参见[安全发现与证据](findings.md)，了解
`unknown`、`no_evidence`、`suspected`、证据升级及投递限制；任何状态都不保证利用成功。

SQL 分析默认 `unknown`；仅为兼容 SQL 设置 `BEACON_SECURITY_ANALYSIS_SQL_DIALECT=ansi`，
启用带引号字符串及标识符、双写引号转义、数字、简单运算符和注释的有边界词法子集。
这不是完整解析器。其他方言、反斜杠或 dollar quoting、不支持的语法、不精确污点，以及
超过 8,192 个 UTF-16 代码单元或 64 个污点标记的输入仍为 `unknown`。
固定模板绑定值与准备语句前拼接不可信模板应分别处理。

Shell 分析支持简单 POSIX `sh`、`bash`、`dash`、`ksh`、`zsh` 命令、引号、转义及控制
分隔符；展开、重定向、复合语法和其他 Shell 保持 `unknown`。普通 argv 与固定目标的
路径/查询输入是独立的观测。未实现网络允许列表或文件系统根目录策略，相关边界判断
仍为 `unknown`；规范化不代表安全。字节串不按已知文本方言分析。
详见[固定版本的分析参考](https://github.com/beacon-observability/beacon-nodejs/blob/v2.0.1/packages/security-nodejs/README.md)。

### 无攻击证据发现的导出

2.0.1 默认不向 OpenTelemetry Logs 和证据 JSONL 导出 `no_evidence` 发现。
设置 `BEACON_SECURITY_EXPORT_NO_EVIDENCE_ENABLED=true` 可恢复导出。`unknown`、
`suspected` 仍可导出，SBOM 不受影响。过滤发生在入队前，不算导出丢失；内部检测、
同请求去重和证据升级仍会执行。本地发现快照和 Span 摘要可保留未导出的观测。
`no_evidence` 不表示安全，没有导出事件也不证明没有检测到风险。

## 参数参考

| 环境变量 | 默认值 | 用途 |
| --- | --- | --- |
| `BEACON_SECURITY_ENABLED` | `false` | 启用 Security 生命周期和运行时 SBOM。 |
| `BEACON_SECURITY_NODE_INCLUDE` | 空 | 选择参与安全发现采集的应用源码根目录。 |
| `BEACON_SECURITY_NODE_EXCLUDE` | 空 | 排除源码根目录，优先级高于 include。 |
| `BEACON_SECURITY_FINDINGS_SAMPLE_SECONDS` | `300` | 每个发现的完整证据采样间隔（秒）。 |
| `BEACON_SECURITY_ANALYSIS_SQL_DIALECT` | `unknown` | `ansi` 启用受支持的 SQL 词法子集。 |
| `BEACON_SECURITY_EXPORT_NO_EVIDENCE_ENABLED` | `false` | 同时导出 `no_evidence` 事件。 |
| `BEACON_SECURITY_SBOM_ENABLED` | `true` | 在 Security 启用时采集运行时 SBOM。 |
| `BEACON_SECURITY_LOCAL_OUTPUT_ENABLED` | `false` | 启用进程本地诊断文件。 |
| `BEACON_SECURITY_OUTPUT` | `./beacon-security-output/<instance-id>` | 设置诊断目录。 |

安全发现与 SBOM 记录使用 OpenTelemetry Logs 管道。本地输出是诊断证据，默认保持关闭。

## Kubernetes

在应用镜像中安装完整软件包，并参考
[固定版本的 Deployment 示例](https://github.com/beacon-observability/beacon-nodejs/blob/v2.0.1/packages/security-nodejs/examples/kubernetes/deployment.yaml)。
普通应用容器只需设置 ESM 预加载和环境变量，不需要 Security sidecar 或 init
container。

移除 `BEACON_SECURITY_ENABLED` 或将其设为 `false` 即可关闭 Security，同时保留常规
零代码遥测。
