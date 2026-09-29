---
sidebar_position: 3
title: Node.js Profile
description: 通过 HTTP 上传 Beacon Node.js wall 与 heap profile。
---

# Node.js Profile

`@beacon-observability/nodejs` 已包含 Profile 能力。保留 [Node.js 零代码指南](../zero-code/nodejs.md)中的预加载配置，并设置支持兼容 pprof multipart 格式的 HTTP 接收端：

```bash
export NODE_OPTIONS="--require @beacon-observability/nodejs/register"
export OTEL_SERVICE_NAME=my-node-service
export OTEL_PROFILING_ENABLED=true
export OTEL_PROFILING_PPROF_UPLOAD_URL=http://127.0.0.1:9529/profiling/v1/input
node app.js
```

默认启用 wall profile。如需增加 heap profile：

```bash
export OTEL_PROFILING_MEMORY_ENABLED=true
```

默认上传周期为 60 秒。`OTEL_PROFILING_EXPORT_INTERVAL` 可以按秒调整周期，`OTEL_PROFILING_PPROF_HEADERS` 用于设置以逗号分隔的 `名称:值` HTTP Header。

## 参数参考

环境变量名称区分大小写。

| 环境变量 | 类型 / 可选值 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `OTEL_PROFILING_ENABLED` | 布尔值；`true`、`1`、`yes`、`on` 表示启用 | `false` | 启用 pprof 采集。 |
| `OTEL_PROFILING_PPROF_UPLOAD_URL` | HTTP(S) URL | 未设置 | 启用 Profile 时必填，用于接收 multipart pprof 上传。 |
| `OTEL_PROFILING_EXPORT_INTERVAL` | 正数，秒 | `60` | Profile 采集和上传间隔。 |
| `OTEL_PROFILING_MEMORY_ENABLED` | 布尔值 | `false` | 在默认 wall-time Profile 之外增加 heap Profile。 |
| `OTEL_PROFILING_PPROF_HEADERS` | 逗号分隔的 `名称=值` 或 `名称:值` | 空 | 附加 HTTP 请求头。 |

导出器还会把 `OTEL_SERVICE_NAME`，以及 `OTEL_RESOURCE_ATTRIBUTES` 中的 `service.version`、`deployment.environment.name`（或 `deployment.environment`）和 `host.name` 作为 Profile 元数据。
