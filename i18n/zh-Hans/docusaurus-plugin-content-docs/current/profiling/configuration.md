---
sidebar_position: 1
title: Profile 参数配置
description: Beacon Java、Python 和 Node.js Profile 环境变量参考。
---

# Profile 参数配置

Profile 环境变量名称区分大小写。时间参数按表格标注的单位填写。“未设置”表示 Beacon 不主动提供值，但运行时、导出器或 OpenTelemetry 通用配置仍可能提供默认值。

## Java {#java}

Java 时长参数由数字和 `ns`、`us`、`ms`、`s`、`m`、`h` 或 `d` 单位组成。

| 环境变量 | 类型 / 可选值 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `OTEL_PROFILING_ENABLED` | 布尔值 | `false` | 启用 JFR Profiler。 |
| `OTEL_PROFILING_INTERVAL` | 正时长 | `1m` | JFR 快照生成间隔。 |
| `OTEL_PROFILING_STARTUP_DELAY` | 非负时长 | `0s` | 启动 Profile 采集前的等待时间。 |
| `OTEL_PROFILING_MAX_AGE` | 正时长 | `5m` | 活跃 JFR 录制中数据的最长保留时间。 |
| `OTEL_PROFILING_STACK_DEPTH` | 正整数 | `64` | 最大调用栈深度。 |
| `OTEL_PROFILING_MAX_SIZE` | 非负整数，字节 | `0` | 活跃 JFR 录制的最大大小；`0` 表示沿用 JFR 默认行为。 |
| `OTEL_PROFILING_TEMP_DIR` | 目录路径 | 未设置 | JFR 临时数据目录；未设置时沿用运行时临时目录行为。 |
| `OTEL_PROFILING_MEMORY_ENABLED` | 布尔值 | `false` | 启用偏向内存分析的 JFR 配置。 |
| `OTEL_PROFILING_MEMORY_ALLOCATION_SAMPLING` | 布尔值 | 未设置 | 设置后覆盖 JFR 内存分配采样开关。 |
| `OTEL_PROFILING_MEMORY_OLD_OBJECT_SAMPLING` | 布尔值 | 未设置 | 设置后覆盖 JFR 老对象采样开关。 |
| `OTEL_PROFILING_EXPORTER` | `none`、`file`、`datakit` | `none` | 分别表示不导出、写入本地 JFR 文件、使用兼容 HTTP multipart 导出器。 |
| `OTEL_PROFILING_ENDPOINT` | HTTP(S) URL | `http://localhost:9529/profiling/v1/input` | `datakit` 导出器使用的上传地址。 |
| `OTEL_PROFILING_DATAKIT_TIMEOUT` | 正时长 | `10s` | 兼容导出器的 HTTP 上传超时时间。 |
| `OTEL_PROFILING_EXPERIMENTAL_FILE_EXPORT_PATH` | 目录路径 | `${java.io.tmpdir}/otel-profiles` | `file` 导出器的输出目录。 |

`datakit` 取值和对应的超时变量是当前 Java Agent 要求保留的兼容标识。

## Python {#python}

### 运行时与采集器

本节中的 Python 间隔参数均以秒为单位。

| 环境变量 | 类型 / 可选值 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `OTEL_PROFILING_ENABLED` | 布尔值 | `false` | 在自动插桩启动阶段启动 Profiler。 |
| `OTEL_PROFILING_EXPORTER` | `none`、`pprof`、`pprof_http`、`otlp` | 自动选择 | 选择导出器。未设置时，如配置了 pprof 上传 URL，则选择 `pprof_http`，否则选择 `otlp`。 |
| `OTEL_PROFILING_SAMPLE_INTERVAL` | 正数，秒 | `0.01` | 调用栈采样间隔。 |
| `OTEL_PROFILING_EXPORT_INTERVAL` | 正数，秒 | `60` | Profile 刷新和导出间隔。 |
| `OTEL_PROFILING_MAX_FRAMES` | 正整数 | `64` | 单次采样捕获的最大栈帧数。 |
| `OTEL_PROFILING_INCLUDE_TRACE_CONTEXT` | 布尔值 | `true` | 在可用时把当前 Trace 和 Span 上下文加入样本。 |
| `OTEL_PROFILING_EXCEPTION_ENABLED` | 布尔值 | `false` | 启用异常 Profile。 |
| `OTEL_PROFILING_EXCEPTION_SAMPLING_INTERVAL` | 正整数 | `100` | 异常采样步长。 |
| `OTEL_PROFILING_EXCEPTION_COLLECT_MESSAGE` | 布尔值 | `false` | 采集异常消息；启用前需评估敏感数据风险。 |
| `OTEL_PROFILING_LOCK_ENABLED` | 布尔值 | `false` | 启用 threading 和 asyncio 锁采集器。 |
| `OTEL_PROFILING_MEMORY_ENABLED` | 布尔值 | `false` | 启用内存 Profile。 |
| `OTEL_PROFILING_MEMORY_INTERVAL` | 正数，秒 | 导出间隔 | 内存采集间隔；默认与 `OTEL_PROFILING_EXPORT_INTERVAL` 相同。 |
| `OTEL_PROFILING_MEMORY_TOP_STATS` | 正整数 | `200` | 每次内存采集保留的最大统计项数量。 |
| `OTEL_PROFILING_MEMORY_IGNORE_PROFILER` | 布尔值 | `true` | 排除 Profiler 自身产生的内存分配。 |

### pprof 导出

| 环境变量 | 类型 / 可选值 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `OTEL_PROFILING_PPROF_PATH` | 文件路径前缀 | `otel-profiles` | 生成 `.pprof` 文件的路径前缀；两种 pprof 导出器都会保留本地副本。 |
| `OTEL_PROFILING_PPROF_UPLOAD_URL` | HTTP(S) URL | `http://localhost:8126/profiling/v1/input` | `pprof_http` 使用的上传地址。导出器未设置时，配置此变量也会选择 `pprof_http`。 |
| `OTEL_PROFILING_PPROF_HEADERS` | 逗号分隔的 `名称:值` | 空 | 附加 HTTP 请求头。 |

### OTLP Profiles 导出

Profile 专用 OTLP 变量的优先级高于对应的通用 `OTEL_EXPORTER_OTLP_*` 变量。

| 环境变量 | 类型 / 可选值 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `OTEL_EXPORTER_OTLP_PROFILES_PROTOCOL` | `grpc`、`http/protobuf` | 通用 OTLP 协议，其次为 `grpc` | 选择 OTLP Profiles 传输协议。 |
| `OTEL_EXPORTER_OTLP_PROFILES_ENDPOINT` | URL | 取决于协议 | Profiles 地址。HTTP 默认为 `http://localhost:4318/v1development/profiles`；gRPC 回退到通用 OTLP 地址和导出器默认值。 |
| `OTEL_EXPORTER_OTLP_PROFILES_INSECURE` | 布尔值 | 未设置 | 为 gRPC 启用非安全连接；HTTP 导出器不使用该参数。 |
| `OTEL_EXPORTER_OTLP_PROFILES_HEADERS` | 逗号分隔的键值对 | 通用 OTLP 请求头，其次为空 | 请求元数据或 HTTP 请求头。 |
| `OTEL_EXPORTER_OTLP_PROFILES_TIMEOUT` | 正数，秒 | 通用 OTLP 超时，其次为 `10` | 导出超时时间。 |
| `OTEL_EXPORTER_OTLP_PROFILES_COMPRESSION` | HTTP 支持 `none`、`gzip`、`deflate`；gRPC 支持其导出器认可的压缩方式 | 通用 OTLP 压缩配置，其次不压缩 | 数据压缩方式；`deflate` 仅适用于 HTTP。 |
| `OTEL_EXPORTER_OTLP_PROFILES_CERTIFICATE` | 文件路径 | 通用 OTLP CA 证书，其次为系统信任库 | 服务端 CA 证书。 |
| `OTEL_EXPORTER_OTLP_PROFILES_CLIENT_KEY` | 文件路径 | 通用 OTLP 客户端私钥，其次未设置 | 双向 TLS 客户端私钥。 |
| `OTEL_EXPORTER_OTLP_PROFILES_CLIENT_CERTIFICATE` | 文件路径 | 通用 OTLP 客户端证书，其次未设置 | 双向 TLS 客户端证书。 |

## Node.js {#nodejs}

| 环境变量 | 类型 / 可选值 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `OTEL_PROFILING_ENABLED` | 布尔值；`true`、`1`、`yes`、`on` 表示启用 | `false` | 启用 pprof 采集。 |
| `OTEL_PROFILING_PPROF_UPLOAD_URL` | HTTP(S) URL | 未设置 | 启用 Profile 时必填，用于接收 multipart pprof 上传。 |
| `OTEL_PROFILING_EXPORT_INTERVAL` | 正数，秒 | `60` | Profile 采集和上传间隔。 |
| `OTEL_PROFILING_MEMORY_ENABLED` | 布尔值 | `false` | 在默认 wall-time Profile 之外增加 heap Profile。 |
| `OTEL_PROFILING_PPROF_HEADERS` | 逗号分隔的 `名称=值` 或 `名称:值` | 空 | 附加 HTTP 请求头。 |

### Profile 元数据

Node.js 还会读取 OpenTelemetry 标准资源配置，为上传的 Profile 添加标签。

| 环境变量 | 默认值 | Profile 字段 |
| --- | --- | --- |
| `OTEL_SERVICE_NAME` | 未设置 | 服务名称。 |
| `OTEL_RESOURCE_ATTRIBUTES` | 未设置 | `service.version`、`deployment.environment.name`（或 `deployment.environment`）和 `host.name`。 |
