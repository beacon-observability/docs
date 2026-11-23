---
sidebar_label: Python
sidebar_position: 2
title: Python Profiling
description: 通过 multipart HTTP 上报或本地 pprof 文件使用 Beacon Python Profiling。
---

# Python Profiling

在应用虚拟环境中安装 `pip install 'beacon-otel[fastapi,profiling]==1.3.0'`，
并将 fastapi 替换为应用需要的框架插件。Profiling 仍为实验性功能。

## HTTP 上报

```bash
export OTEL_SERVICE_NAME=my-python-service
export OTEL_PROFILING_ENABLED=true
export OTEL_PROFILING_EXPORTER=http
export OTEL_PROFILING_ENDPOINT=http://127.0.0.1:9529/profiling/v1/input
beacon uvicorn myapp:app
```

接收端需支持 multipart pprof 上传。`OTEL_PROFILING_PPROF_UPLOAD_URL` 优先于
`OTEL_PROFILING_ENDPOINT`；`datakit`、`pprof_http` 名称仍是 `http` 的别名。
设置 `OTEL_PROFILING_ENABLED=false` 可关闭采集。

## 本地文件

```bash
export OTEL_PROFILING_ENABLED=true
export OTEL_PROFILING_EXPORTER=file
export OTEL_PROFILING_FILE_PATH="$PWD/profiles"
beacon uvicorn myapp:app
```

## 从 1.2.6 升级

将 `otlp` 改为 `http` 并配置上面的 multipart 接收地址。环境变量选择的上传器不再
使用 `OTEL_EXPORTER_OTLP_PROFILES_*`，`otlp` 名称保留给后续协议支持。
默认采样间隔为 0.01 秒，上报间隔为 60 秒，进程需持续运行以产生周期性上传。

## 采集器

按需设置 `OTEL_PROFILING_MEMORY_ENABLED=true`、`OTEL_PROFILING_LOCK_ENABLED=true`。
Python 3.12 及以上还可设置 `OTEL_PROFILING_EXCEPTION_ENABLED=true`。
使用 `OTEL_PROFILING_SAMPLE_INTERVAL`、`OTEL_PROFILING_EXPORT_INTERVAL` 调整秒数。
`OTEL_PROFILING_MAX_FRAMES` 默认为 64，`OTEL_PROFILING_INCLUDE_TRACE_CONTEXT` 默认为 true。
完整配置参考[固定版本源码说明](https://github.com/beacon-observability/beacon-python/blob/v1.3.0/sdk-extension/beacon-profiling/README.rst)。

## 参数参考

环境变量名称区分大小写。运行时参数表中的间隔均以秒为单位。

### 运行时与采集器

| 环境变量 | 类型 / 可选值 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `OTEL_PROFILING_ENABLED` | 布尔值 | `false` | 在自动插桩启动阶段启动 Profiler。 |
| `OTEL_PROFILING_EXPORTER` | `http`、`file` | `http` | 选择 multipart pprof HTTP 或本地文件导出。使用 `OTEL_PROFILING_ENABLED=false` 关闭 Profile。 |
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


### HTTP 导出

| 环境变量 | 用途 |
| --- | --- |
| `OTEL_PROFILING_ENDPOINT` | multipart pprof 接收地址；请显式配置。 |
| `OTEL_PROFILING_PPROF_UPLOAD_URL` | 显式上传地址，优先于 endpoint。 |
