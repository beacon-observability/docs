---
sidebar_position: 3
title: Node.js
description: 无需修改应用源码，通过预加载方式接入 Beacon Node.js。
---

# Node.js 零代码接入

Beacon Node.js 3.0.0 支持 Node.js 18.19+、20.6+、22 和 24。
Security 的运行时要求更严格，详见下文。

## 安装

```bash
npm install @beacon-observability/nodejs@3.0.0
```

## 升级

安装上面的固定版本 3.0.0，保留现有预加载配置并重启应用。
[3.0.0 发布说明](https://github.com/beacon-observability/beacon-nodejs/releases/tag/v3.0.0)
包含 Security 输出的不兼容变更：日志正文改为 SIEM 信封，详细 v2 证据保存在
`message` 字符串中。升级前请同步调整消费端，解析 `message` 并使用检测时的
`span_id` 关联调用。参阅 [Security 迁移说明](../security/nodejs.md#siem-输出与迁移)。

常规链路和 Profile 预加载方式不变；客户软件包继续采用 auto-instrumentation
0.80.x 和 OpenTelemetry Core 2.x。Profile 继续使用 multipart/pprof HTTP 上传；
`OTEL_PROFILING_EXPORTER=otlp` 尚不支持。

## 启动

```bash
export OTEL_SERVICE_NAME=my-node-service
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4317
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
export NODE_OPTIONS="--require @beacon-observability/nodejs/register"
node app.js
```

保留应用原有的 `node` 命令。如果 `NODE_OPTIONS` 已有内容，请追加 `--require`，不要覆盖原参数。

## 调试与诊断

保留上文的 `NODE_OPTIONS` 预加载配置，临时开启 OpenTelemetry 诊断日志：

```bash
OTEL_LOG_LEVEL=debug node app.js > beacon-nodejs-debug.log 2>&1
```

日志写入终端，上述命令将标准输出和标准错误一起保存。启用 Security 时，继续使用其要求的 ESM `--import` 预加载方式。

排障后恢复原启动命令；若在部署环境中设置了 `OTEL_LOG_LEVEL=debug`，请移除该设置并重启应用。

## Profile

同一个预加载模块可以采集 wall 与 heap profile，并通过 HTTP 上传。参阅 [Node.js Profile 指南](../profiling/nodejs.md)。

## Security

Security 已包含在软件包中，支持 Node.js 22.22.3+ 或 24.11.1+，需使用 ESM
`--import` 预加载而不是 `--require`。参阅
[Node.js Security 指南](../security/nodejs.md)。
