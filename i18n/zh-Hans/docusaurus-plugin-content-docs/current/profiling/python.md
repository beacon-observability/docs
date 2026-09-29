---
sidebar_position: 2
title: Python Profile
description: 通过 OTLP/HTTP 或 pprof 导出 Beacon Python Profile。
---

# Python Profile

在应用使用的虚拟环境中安装 profiling extra：

```bash
pip install 'beacon-otel[fastapi,profiling]==1.0.1'
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
export OTEL_PROFILING_EXPORTER=pprof
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
