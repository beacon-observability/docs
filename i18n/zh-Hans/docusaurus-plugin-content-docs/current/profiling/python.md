---
sidebar_label: Python
sidebar_position: 2
title: Python Profile
description: 通过 HTTP 上传 Beacon Python pprof Profile，或写入本地文件。
---

# Python Profile

在应用使用的虚拟环境中安装 profiling extra：

```bash
pip install 'beacon-otel[fastapi,profiling]==1.2.7'
```

请将 `fastapi` 替换为应用实际使用的组件。

## 使用 HTTP 上传

```bash
export OTEL_SERVICE_NAME=my-python-service
export OTEL_PROFILING_ENABLED=true
export OTEL_PROFILING_EXPORTER=http
export OTEL_PROFILING_ENDPOINT=http://127.0.0.1:9529/profiling/v1/input
beacon uvicorn myapp:app
```

启动应用前先启用 DataKit 的 profiling input。导出器发送 multipart gzip pprof 和事件元数据，不使用 OTLP Profiles。跨主机或容器部署时，将 `127.0.0.1` 换为应用可访问的地址。

## 写入本地 pprof 文件

```bash
export OTEL_PROFILING_ENABLED=true
export OTEL_PROFILING_EXPORTER=file
export OTEL_PROFILING_FILE_PATH="$PWD/profiles"
beacon uvicorn myapp:app
```

Beacon 会创建目标目录并写入 gzip 压缩的 pprof 文件。请将其纳入部署环境的文件保留策略。文件模式不上传 Profile。

## 升级到 1.2.7

从 1.2.6 升级时，将 exporter 改为 `http`，并设置上面的 `OTEL_PROFILING_ENDPOINT`。环境变量配置不再选择 OTLP Profiles 导出；`otlp` 名称保留供后续协议支持。旧的 `datakit`、`pprof_http` 名称仍兼容，显式 `OTEL_PROFILING_PPROF_UPLOAD_URL` 优先于通用 profiling 地址。`file` 导出配置保持可用。使用 `OTEL_PROFILING_ENABLED=false` 关闭 Profile。

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
| `OTEL_PROFILING_EXPORTER` | `http`、`file` | `http` | 选择 multipart HTTP 或本地文件导出；仍兼容 `datakit` 和 `pprof_http` 别名。 |
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

### 文件导出

| 环境变量 | 类型 / 可选值 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `OTEL_PROFILING_FILE_PATH` | 目录路径 | `otel-profiles` | `file` 导出器写入 gzip pprof 文件的目录，自动创建。 |

### HTTP 上传

| 环境变量 | 类型 / 可选值 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `OTEL_PROFILING_ENDPOINT` | HTTP(S) URL | `http://127.0.0.1:9529/profiling/v1/input` | 接收 multipart pprof 的地址。 |
| `OTEL_PROFILING_PPROF_UPLOAD_URL` | HTTP(S) URL | 未设置 | 兼容原配置，优先于 `OTEL_PROFILING_ENDPOINT`。 |
| `OTEL_PROFILING_PPROF_HEADERS` | 逗号分隔的 `name:value` | 空 | 额外 HTTP 请求头。 |

HTTP 请求成功仅表示接收端接受了请求；还需按服务名检查后端 Profile 数据。
