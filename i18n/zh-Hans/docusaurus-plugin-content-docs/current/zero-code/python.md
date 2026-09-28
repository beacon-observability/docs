---
sidebar_position: 2
title: Python
description: 通过 beacon 命令启动 Python 应用。
---

# Python 零代码接入

Beacon Python 1.0.1 支持 Python 3.10 至 3.14。请将它安装在应用使用的同一个虚拟环境中。

## 安装

选择与应用框架匹配的 extra：

```bash
# FastAPI；使用 Flask 或 requests 时替换对应 extra
pip install 'beacon-otel[fastapi]==1.0.1'
```

## 启动

```bash
export OTEL_SERVICE_NAME=my-python-service
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4317
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
beacon uvicorn myapp:app
```

将 `uvicorn myapp:app` 替换为应用原有启动命令。可用 `beacon --version` 检查当前生效的版本。

## 开启 Profile

安装 profiling extra，并配置兼容 pprof 的 HTTP 接收端：

```bash
pip install 'beacon-otel[fastapi,profiling]==1.0.1'
export OTEL_PROFILING_ENABLED=true
export OTEL_PROFILING_PPROF_UPLOAD_URL=http://127.0.0.1:8081/profiles
beacon uvicorn myapp:app
```

调用栈采集会自动启动。如需额外采集器，可设置 `OTEL_PROFILING_MEMORY_ENABLED=true`、`OTEL_PROFILING_LOCK_ENABLED=true`；Python 3.12 及以上还可设置 `OTEL_PROFILING_EXCEPTION_ENABLED=true`。

