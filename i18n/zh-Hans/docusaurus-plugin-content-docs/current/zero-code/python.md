---
sidebar_position: 2
title: Python
description: 通过 beacon 命令启动 Python 应用。
---

# Python 零代码接入

Beacon Python 1.1.0 的零代码流程支持 Python 3.10 至 3.14。请将它安装在应用使用的
同一个虚拟环境中。

## 安装

选择与应用框架匹配的 extra：

```bash
# FastAPI；使用 Flask 或 requests 时替换对应 extra
pip install 'beacon-otel[fastapi]==1.1.0'
```

## 启动

```bash
export OTEL_SERVICE_NAME=my-python-service
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4317
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
beacon uvicorn myapp:app
```

将 `uvicorn myapp:app` 替换为应用原有启动命令。可用 `beacon --version` 检查当前生效的版本。

## Profile

Python 可以通过 OTLP/HTTP 导出 Profile、通过 HTTP 上传 pprof，或在本地写入 pprof 文件。参阅 [Python Profile 指南](../profiling/python.md)。

## Security

同一个 `beacon-otel` wheel 已包含需主动启用的 Security，支持标准 GIL 的 CPython
3.11 至 3.14。参阅 [Python Security 指南](../security/python.md)。
