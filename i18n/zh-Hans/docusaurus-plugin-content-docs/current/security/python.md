---
sidebar_position: 2
title: Python Security
description: 通过现有 beacon 命令启用 Beacon Security。
---

# Python Security

Beacon Python 1.1.0 已在 `beacon-otel` wheel 中包含 Security。它支持标准 GIL 的
CPython 3.11 至 3.14，并继续使用现有 `beacon` 命令，无需独立 Security 发行包。

## 启用 Security

```bash
export BEACON_SECURITY_ENABLED=true
export BEACON_SECURITY_PYTHON_INCLUDE=orders
export OTEL_SERVICE_NAME=orders
export OTEL_RESOURCE_ATTRIBUTES=service.namespace=shop
export OTEL_LOGS_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4317
beacon uvicorn orders.asgi:application --host 0.0.0.0 --port 8000
```

`BEACON_SECURITY_PYTHON_INCLUDE` 填写 Python 模块前缀，而不是文件系统路径。未设置时，
已启用的生命周期仍可导出运行时 SBOM，但不会转换应用模块或产生已建模数据流发现。

## 参数参考

| 环境变量 | 默认值 | 用途 |
| --- | --- | --- |
| `BEACON_SECURITY_ENABLED` | `false` | 启用 Security 生命周期和运行时 SBOM。 |
| `BEACON_SECURITY_PYTHON_INCLUDE` | 空 | 选择参与安全发现采集的应用模块前缀。 |
| `BEACON_SECURITY_PYTHON_EXCLUDE` | 空 | 排除模块前缀，优先级高于 include。 |
| `BEACON_SECURITY_SBOM_ENABLED` | `true` | 在 Security 启用时采集运行时 SBOM。 |
| `BEACON_SECURITY_LOCAL_OUTPUT_ENABLED` | `false` | 启用进程本地诊断文件。 |
| `BEACON_SECURITY_OUTPUT` | `./beacon-security-output/<instance-id>` | 设置诊断目录。 |
| `BEACON_SECURITY_EVIDENCE_FILE` | 未设置 | 设置可选的诊断 JSONL 文件。 |

安全发现与 SBOM 记录使用 OpenTelemetry Logs 管道。本地输出是诊断证据，默认保持关闭。

## Kubernetes 与 Gunicorn

在应用镜像中安装 `beacon-otel==1.1.0`，并参考
[固定版本的 Deployment 示例](https://github.com/beacon-observability/beacon-python/blob/v1.1.0/beacon-otel/examples/kubernetes/deployment.yaml)。
不需要 Security sidecar 或 init container。

Gunicorn 必须在每个 Worker fork 后初始化遥测。请使用该版本提供的
`beacon_security.gunicorn` 配置，不要在此命令前添加 `beacon`，也不要启用
`preload_app`。

移除 `BEACON_SECURITY_ENABLED` 或将其设为 `false` 即可关闭 Security，同时保留常规
零代码遥测。
