---
sidebar_position: 3
title: Node.js
description: 无需修改应用源码，通过预加载方式接入 Beacon Node.js。
---

# Node.js 零代码接入

Beacon Node.js 1.1.0 支持该软件包已验证的 Node.js 维护版本，最低为 Node.js 18.19。

## 安装

```bash
npm install @beacon-observability/nodejs@1.1.0
```

## 启动

```bash
export OTEL_SERVICE_NAME=my-node-service
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4317
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
export NODE_OPTIONS="--require @beacon-observability/nodejs/register"
node app.js
```

保留应用原有的 `node` 命令。如果 `NODE_OPTIONS` 已有内容，请追加 `--require`，不要覆盖原参数。

## 开启 Profile

同一个预加载模块可以采集 wall profile，并上传到兼容 pprof 的 HTTP 接收端：

```bash
export OTEL_PROFILING_ENABLED=true
export OTEL_PROFILING_PPROF_UPLOAD_URL=http://127.0.0.1:8081/profiles
node app.js
```

设置 `OTEL_PROFILING_MEMORY_ENABLED=true` 可增加 heap profile。默认上传周期是 60 秒；调整 `OTEL_PROFILING_EXPORT_INTERVAL` 前请先验证接收端负载。

