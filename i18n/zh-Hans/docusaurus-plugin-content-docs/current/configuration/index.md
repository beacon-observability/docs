---
sidebar_position: 3
title: 公共配置
description: 配置服务标识、OTLP 传输、资源属性与认证信息。
---

# 公共配置

Beacon 探针使用标准 OpenTelemetry 环境变量导出遥测数据。

| 环境变量 | 作用 | 示例 |
| --- | --- | --- |
| `OTEL_SERVICE_NAME` | 稳定的逻辑服务名 | `checkout-api` |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OTLP 接收端基础地址 | `http://collector:4317` |
| `OTEL_EXPORTER_OTLP_PROTOCOL` | 接收端支持的传输协议 | `grpc` 或 `http/protobuf` |
| `OTEL_EXPORTER_OTLP_HEADERS` | 逗号分隔的请求 Header | `authorization=Bearer%20token` |
| `OTEL_RESOURCE_ATTRIBUTES` | 补充资源标识 | `service.version=1.4.0,deployment.environment.name=prod` |

除非接收端另有配置，OTLP/gRPC 使用 `4317` 端口，OTLP/HTTP 使用 `4318` 端口。`OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` 等信号专属变量会覆盖公共地址。

## 最小配置

```bash
export OTEL_SERVICE_NAME=checkout-api
export OTEL_EXPORTER_OTLP_ENDPOINT=http://collector:4317
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
```

不要把凭证直接写入进程参数或提交到代码库。应通过部署平台的 Secret 管理能力注入 Header。

