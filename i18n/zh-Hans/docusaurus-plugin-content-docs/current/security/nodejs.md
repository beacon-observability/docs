---
sidebar_position: 3
title: Node.js Security
description: 通过 Node.js ESM 预加载启用 Beacon Security。
---

# Node.js Security

Beacon Node.js 1.2.0 已在 `@beacon-observability/nodejs` 中包含 Security。应用通常只需
安装这个完整软件包。Security 使用同步模块 Hook 进行限定范围的源码转换，因此要求
Node.js 22.22.3+ 或 24.11.1+。

## 启用 Security

必须使用 ESM `--import` 预加载。CommonJS `--require` 预加载仍可启动常规遥测与
Profile，但不能启用 Security 源码转换。

```bash
npm install @beacon-observability/nodejs@1.2.0

export NODE_OPTIONS="--import @beacon-observability/nodejs/register"
export BEACON_SECURITY_ENABLED=true
export BEACON_SECURITY_NODE_INCLUDE=/srv/app
export OTEL_SERVICE_NAME=orders
export OTEL_RESOURCE_ATTRIBUTES=service.namespace=shop
export OTEL_LOGS_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4318
node /srv/app/server.mjs
```

`BEACON_SECURITY_NODE_INCLUDE` 用于选择应用源码根目录。依赖包、Node.js 内置模块和
显式排除的根目录不会被转换。

## 参数参考

| 环境变量 | 默认值 | 用途 |
| --- | --- | --- |
| `BEACON_SECURITY_ENABLED` | `false` | 启用 Security 生命周期和运行时 SBOM。 |
| `BEACON_SECURITY_NODE_INCLUDE` | 空 | 选择参与安全发现采集的应用源码根目录。 |
| `BEACON_SECURITY_NODE_EXCLUDE` | 空 | 排除源码根目录，优先级高于 include。 |
| `BEACON_SECURITY_SBOM_ENABLED` | `true` | 在 Security 启用时采集运行时 SBOM。 |
| `BEACON_SECURITY_LOCAL_OUTPUT_ENABLED` | `false` | 启用进程本地诊断文件。 |
| `BEACON_SECURITY_OUTPUT` | `./beacon-security-output/<instance-id>` | 设置诊断目录。 |

安全发现与 SBOM 记录使用 OpenTelemetry Logs 管道。本地输出是诊断证据，默认保持关闭。

## Kubernetes

在应用镜像中安装完整软件包，并参考
[固定版本的 Deployment 示例](https://github.com/beacon-observability/beacon-nodejs/blob/v1.2.0/packages/security-nodejs/examples/kubernetes/deployment.yaml)。
普通应用容器只需设置 ESM 预加载和环境变量，不需要 Security sidecar 或 init
container。

移除 `BEACON_SECURITY_ENABLED` 或将其设为 `false` 即可关闭 Security，同时保留常规
零代码遥测。
