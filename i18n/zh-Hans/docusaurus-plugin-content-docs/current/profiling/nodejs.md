---
sidebar_position: 3
title: Node.js Profile
description: 通过 HTTP 上传 Beacon Node.js wall 与 heap profile。
---

# Node.js Profile

全部可用参数和默认值请参阅 [Profile 参数配置：Node.js](configuration.md#nodejs)。

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
