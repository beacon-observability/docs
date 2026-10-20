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

## 调试与诊断

Beacon Python 1.1.0 的零代码入口没有统一的 SDK 调试日志开关，`OTEL_LOG_LEVEL=debug` 不会自动配置 Python 的 `logging` 级别。需要详细日志时，通过应用已有的日志配置将 `opentelemetry` Logger 设为 `DEBUG` 并配置输出 Handler。

无需修改应用源码的初步诊断，可以在保留 OTLP 导出的同时增加控制台 Span 输出：

```bash
beacon --version
OTEL_TRACES_EXPORTER=otlp,console \
  beacon uvicorn myapp:app > beacon-python-diagnostic.log 2>&1
```

沿用上文的服务名、OTLP 地址和协议，访问一个受支持框架的接口，再检查文件中的 Span。控制台副本可帮助区分“未生成 Span”和“向接收端导出失败”，不代表 OTLP 投递成功，也不是 SDK 调试日志。

排障后恢复原启动命令，移除额外的 `console` 导出器，并恢复应用日志级别。

## Profile

Python 可以通过 OTLP/HTTP 导出 Profile、通过 HTTP 上传 pprof，或在本地写入 pprof 文件。参阅 [Python Profile 指南](../profiling/python.md)。

## Security

同一个 `beacon-otel` wheel 已包含需主动启用的 Security，支持标准 GIL 的 CPython
3.11 至 3.14。参阅 [Python Security 指南](../security/python.md)。
