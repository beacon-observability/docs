---
sidebar_position: 2
title: Python Profile
description: 通过 OTLP/HTTP 或 pprof 导出 Beacon Python Profile。
---

# Python Profile

在应用使用的虚拟环境中安装 profiling extra：

```bash
pip install 'beacon-otel[fastapi,profiling]==1.1.0'
```

请将 `fastapi` 替换为应用实际使用的组件。

## 使用 OTLP/HTTP 导出

```bash
export OTEL_SERVICE_NAME=my-python-service
export OTEL_PROFILING_ENABLED=true
export OTEL_PROFILING_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_PROFILES_PROTOCOL=http/protobuf
export OTEL_EXPORTER_OTLP_PROFILES_ENDPOINT=http://127.0.0.1:4318/v1development/profiles
beacon uvicorn myapp:app
```

接收端必须实现 OpenTelemetry 开发阶段的 Profiles 接口。

## 通过 HTTP 上传 pprof

```bash
export OTEL_SERVICE_NAME=my-python-service
export OTEL_PROFILING_ENABLED=true
export OTEL_PROFILING_EXPORTER=pprof_http
export OTEL_PROFILING_PPROF_UPLOAD_URL=http://127.0.0.1:9529/profiling/v1/input
beacon uvicorn myapp:app
```

如需认证，可使用 `OTEL_PROFILING_PPROF_HEADERS` 设置以逗号分隔的 `名称:值` HTTP Header。

## 写入本地 pprof 文件

```bash
export OTEL_PROFILING_ENABLED=true
export OTEL_PROFILING_EXPORTER=pprof
export OTEL_PROFILING_PPROF_PATH="$PWD/profiles"
beacon uvicorn myapp:app
```

请先创建目标目录，并将其纳入部署环境的文件保留策略。

## 额外采集器

开启 Profile 后默认采集调用栈。请按需增加其他采集器：

```bash
export OTEL_PROFILING_MEMORY_ENABLED=true
export OTEL_PROFILING_LOCK_ENABLED=true
# 仅限 Python 3.12 及以上
export OTEL_PROFILING_EXCEPTION_ENABLED=true
```

默认导出周期为 60 秒，进程必须存活超过该周期才能进行周期性上传。

## 参数参考

环境变量名称区分大小写。运行时参数表中的间隔均以秒为单位。

### 运行时与采集器

| 环境变量 | 类型 / 可选值 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `OTEL_PROFILING_ENABLED` | 布尔值 | `false` | 在自动插桩启动阶段启动 Profiler。 |
| `OTEL_PROFILING_EXPORTER` | `none`、`pprof`、`pprof_http`、`otlp` | 自动选择 | 选择导出器。未设置时，如配置了 pprof 上传 URL，则选择 `pprof_http`，否则选择 `otlp`。 |
| `OTEL_PROFILING_SAMPLE_INTERVAL` | 正数 | `0.01` | 调用栈采样间隔。 |
| `OTEL_PROFILING_EXPORT_INTERVAL` | 正数 | `60` | Profile 刷新和导出间隔。 |
| `OTEL_PROFILING_MAX_FRAMES` | 正整数 | `64` | 单次采样捕获的最大栈帧数。 |
| `OTEL_PROFILING_INCLUDE_TRACE_CONTEXT` | 布尔值 | `true` | 在可用时加入当前 Trace 和 Span 上下文。 |
| `OTEL_PROFILING_EXCEPTION_ENABLED` | 布尔值 | `false` | 启用异常 Profile。 |
| `OTEL_PROFILING_EXCEPTION_SAMPLING_INTERVAL` | 正整数 | `100` | 异常采样步长。 |
| `OTEL_PROFILING_EXCEPTION_COLLECT_MESSAGE` | 布尔值 | `false` | 采集异常消息；启用前需评估敏感数据风险。 |
| `OTEL_PROFILING_LOCK_ENABLED` | 布尔值 | `false` | 启用 threading 和 asyncio 锁采集器。 |
| `OTEL_PROFILING_MEMORY_ENABLED` | 布尔值 | `false` | 启用内存 Profile。 |
| `OTEL_PROFILING_MEMORY_INTERVAL` | 正数 | 导出间隔 | 内存采集间隔。 |
| `OTEL_PROFILING_MEMORY_TOP_STATS` | 正整数 | `200` | 每次内存采集保留的最大统计项数量。 |
| `OTEL_PROFILING_MEMORY_IGNORE_PROFILER` | 布尔值 | `true` | 排除 Profiler 自身产生的内存分配。 |

### pprof 导出

| 环境变量 | 类型 / 可选值 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `OTEL_PROFILING_PPROF_PATH` | 文件路径前缀 | `otel-profiles` | 生成 `.pprof` 文件的路径前缀；两种 pprof 导出器都会保留本地副本。 |
| `OTEL_PROFILING_PPROF_UPLOAD_URL` | HTTP(S) URL | `http://localhost:8126/profiling/v1/input` | `pprof_http` 使用的上传地址。导出器未设置时，配置此变量也会选择 `pprof_http`。 |
| `OTEL_PROFILING_PPROF_HEADERS` | 逗号分隔的 `名称:值` | 空 | 附加 HTTP 请求头。 |

### OTLP Profiles 导出

Profile 专用变量的优先级高于对应的通用 `OTEL_EXPORTER_OTLP_*` 变量。

| 环境变量 | 类型 / 可选值 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `OTEL_EXPORTER_OTLP_PROFILES_PROTOCOL` | `grpc`、`http/protobuf` | 通用 OTLP 协议，其次为 `grpc` | 选择传输协议。 |
| `OTEL_EXPORTER_OTLP_PROFILES_ENDPOINT` | URL | 取决于协议 | HTTP 默认为 `http://localhost:4318/v1development/profiles`；gRPC 回退到通用 OTLP 地址和导出器默认值。 |
| `OTEL_EXPORTER_OTLP_PROFILES_INSECURE` | 布尔值 | 未设置 | 为 gRPC 启用非安全连接；HTTP 不使用该参数。 |
| `OTEL_EXPORTER_OTLP_PROFILES_HEADERS` | 逗号分隔的键值对 | 通用 OTLP 请求头，其次为空 | 请求元数据或 HTTP 请求头。 |
| `OTEL_EXPORTER_OTLP_PROFILES_TIMEOUT` | 正数，秒 | 通用 OTLP 超时，其次为 `10` | 导出超时时间。 |
| `OTEL_EXPORTER_OTLP_PROFILES_COMPRESSION` | HTTP 支持 `none`、`gzip`、`deflate`；gRPC 支持其导出器认可的压缩方式 | 通用 OTLP 压缩配置，其次不压缩 | 数据压缩方式；`deflate` 仅适用于 HTTP。 |
| `OTEL_EXPORTER_OTLP_PROFILES_CERTIFICATE` | 文件路径 | 通用 OTLP CA 证书，其次为系统信任库 | 服务端 CA 证书。 |
| `OTEL_EXPORTER_OTLP_PROFILES_CLIENT_KEY` | 文件路径 | 通用 OTLP 客户端私钥，其次未设置 | 双向 TLS 客户端私钥。 |
| `OTEL_EXPORTER_OTLP_PROFILES_CLIENT_CERTIFICATE` | 文件路径 | 通用 OTLP 客户端证书，其次未设置 | 双向 TLS 客户端证书。 |
