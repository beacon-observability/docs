---
sidebar_position: 6
title: OBI（eBPF）
description: 使用独立的 Beacon OBI 可执行文件采集 Linux HTTP 服务端链路和指标。
---

# OBI eBPF 自动采集

Beacon OBI **0.1.0** 提供 Linux amd64 独立可执行文件，基于上游 OpenTelemetry eBPF Instrumentation 1.0.0，通过 eBPF 探针采集选定应用，无需接入应用 SDK。Beacon 版本与上游版本独立维护。

已示例环境为 Ubuntu 24.04、内核 6.11、CPython 3.14.3、HTTP/1 服务端请求和本地 OTLP HTTP/protobuf 接收端。其他平台、协议、运行时、生产接收端、Kubernetes、Profiling 和 Security 不在本版本本文支持范围内。

## 下载并校验

从 [0.1.0 Release](https://github.com/beacon-observability/beacon-obi/releases/tag/v0.1.0) 下载归档与校验清单：

```bash
curl -fLO https://github.com/beacon-observability/beacon-obi/releases/download/v0.1.0/beacon-obi-0.1.0-linux-amd64.tar.gz
curl -fLO https://github.com/beacon-observability/beacon-obi/releases/download/v0.1.0/SHA256SUMS
sha256sum --check --ignore-missing SHA256SUMS
mkdir beacon-obi-0.1.0
tar -xzf beacon-obi-0.1.0-linux-amd64.tar.gz -C beacon-obi-0.1.0
cd beacon-obi-0.1.0
./obi --version
```

命令名保留为 `obi`。确认输出包含 `Beacon OBI 0.1.0` 和发布源码提交。发布产物包含许可证、第三方声明、组件清单、本地构建来源和技术参考。本次发布不声明 Beacon 产物签名或 GitHub 构建证明；校验和用于检查文件完整性。

## 运行

主机需要通过 `/sys/kernel/btf/vmlinux` 提供内核 BTF，并具备 root 权限或探针所需的等效能力。保持应用运行，选择其监听端口并配置接收端：

```bash
sudo env \
  OTEL_EBPF_OPEN_PORT=8080 \
  OTEL_SERVICE_NAME=my-service \
  OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4318 \
  OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
  OTEL_EBPF_ENFORCE_SYS_CAPS=true \
  OTEL_EBPF_JAVAAGENT_ENABLED=false \
  ./obi
```

按实际环境替换端口、服务名和接收端地址。此命令使用上游保留的旧版环境变量配置入口。0.1.0 示例配置保持 Java 注入关闭。只选择目标应用；与其他探针同时采集同一目标前，应先检查重复数据。

## 验证与排障

向应用发送请求，在接收端核对服务名、非零 Trace ID 和 Span ID、具有预期响应状态的 HTTP 服务端 Span，以及 `http.server.request.duration` 指标观测值。进程启动成功本身不能证明数据已到达。关闭应用时，关闭导出器后可能出现迟到的指标上传日志；正常退出不代表退出时的数据刷新无损。

没有数据时，检查应用监听端口、BTF、权限、探针挂载日志、接收端连通性和导出错误。排障时可在同一命令中增加 `OTEL_EBPF_LOG_LEVEL=debug`，结束后移除此设置。诊断日志可能包含应用元数据及应用详情。

## 升级与回退

校验新归档，保留旧可执行文件和配置，通过 SIGTERM 或 Ctrl+C 停止 OBI，再使用相同的明确配置启动一个新实例，并重新核对数据。回退时停止新实例，重新启动保留的旧可执行文件。停止 OBI 即可移除采集，无需修改应用源码。

完整范围见[版本化安装指南](https://github.com/beacon-observability/beacon-obi/blob/v0.1.0/beacon/INSTALLATION.md)，版本详情见 [Release 记录](https://github.com/beacon-observability/beacon-obi/releases/tag/v0.1.0)。继承的上游源码中存在其他能力，并不代表这些能力已获得 Beacon 支持。
