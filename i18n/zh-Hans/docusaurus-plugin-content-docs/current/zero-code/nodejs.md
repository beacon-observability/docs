---
sidebar_position: 3
title: Node.js
description: 无需修改应用源码，通过预加载方式接入 Beacon Node.js。
---

# Node.js 零代码接入

Beacon Node.js 1.2.0 支持该软件包已验证的 Node.js 维护版本，最低为 Node.js 18.19。
Security 的运行时要求更严格，详见下文。

## 安装

```bash
npm install @beacon-observability/nodejs@1.2.0
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

## Profile

同一个预加载模块可以采集 wall 与 heap profile，并通过 HTTP 上传。参阅 [Node.js Profile 指南](../profiling/nodejs.md)。

## Security

Security 已包含在软件包中，支持 Node.js 22.22.3+ 或 24.11.1+，需使用 ESM
`--import` 预加载而不是 `--require`。参阅
[Node.js Security 指南](../security/nodejs.md)。
