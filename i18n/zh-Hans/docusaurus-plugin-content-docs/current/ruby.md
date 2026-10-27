---
title: Ruby 源码接入
sidebar_label: Ruby
description: 安装已发布的 Ruby 插桩源码，通过 OTLP HTTP/protobuf 验证 Net::HTTP 链路。
---

# Ruby 源码接入

Beacon Ruby **[v1.0.0](https://github.com/beacon-observability/beacon-ruby/releases/tag/v1.0.0)** 是基于 OpenTelemetry Ruby Contrib 的源码发行版。应用需要显式集成插桩 gem 并初始化 OpenTelemetry SDK。该版本保留上游 gem 标识，未发布 Beacon gem、可执行 Agent 或零代码预加载入口。

## 环境要求

- 已验证环境为 **Ubuntu 24.04 x86_64、CRuby 3.3.12 和 Bundler 2.5.22**。源码中的 gem 规格要求 Ruby 3.3 或更新版本；其他运行时与平台不在本次发布的已验证范围内。
- 能够从 GitHub 和 RubyGems 下载所需资源。
- 下方接收端验证需要 Python 3 和 Docker。

## 下载与校验

在新目录中执行以下命令，下载源码并校验文件：

```bash
curl -fLO https://github.com/beacon-observability/beacon-ruby/releases/download/v1.0.0/beacon-ruby-1.0.0-source.tar.gz
curl -fLO https://github.com/beacon-observability/beacon-ruby/releases/download/v1.0.0/SOURCE.txt
curl -fLO https://github.com/beacon-observability/beacon-ruby/releases/download/v1.0.0/SHA256SUMS
sha256sum -c SHA256SUMS
tar -xzf beacon-ruby-1.0.0-source.tar.gz
cd beacon-ruby-1.0.0
```

校验通过后再继续。`SOURCE.txt` 记录源码提交和上游基线。压缩包包含源码与许可证，依赖需要单独安装。

## 验证 Net::HTTP 链路

从解压后的源码目录进入验证目录，使用发布版本锁定的依赖和接收端验证脚本：

```bash
cd beacon/validation
BUNDLE_FROZEN=true bundle install
docker pull otel/opentelemetry-collector-contrib:0.135.0
BUNDLE_FROZEN=true python3 collector_smoke.py
```

脚本启动临时 HTTP 服务和本地 OpenTelemetry Collector，然后执行插桩后的 Ruby HTTP 请求。它使用 OTLP HTTP/protobuf，核对服务名 `beacon-ruby-import-smoke`、一个根 Span、一个 HTTP 客户端 Span、两者相同的 Trace ID 及父子关系。成功时输出：

```text
Collector received the service identity and correlated root/client spans.
```

脚本结束后会清理临时服务、容器和链路输出。此检查验证合成请求到达本地 Collector，不代表生产后端已经入库。

## 应用集成与能力范围

已验证的 Net::HTTP 路径可参考发布版本中的 [Gemfile](https://github.com/beacon-observability/beacon-ruby/blob/v1.0.0/beacon/validation/Gemfile) 和 [Ruby 示例](https://github.com/beacon-observability/beacon-ruby/blob/v1.0.0/beacon/validation/http_smoke.rb)。Gemfile 从已发布源码加载基础插桩库和 Net::HTTP 插桩库，并固定 Core SDK 与 OTLP exporter 的版本。先加载所需库，再初始化 SDK 并启用 `OpenTelemetry::Instrumentation::Net::HTTP`。

本次发布验收覆盖基础插桩库、Net::HTTP 语义模式以及本地 Collector 链路导出。Rails、其他集成、DataKit、指标、日志、Profile 和 Security 不在本次发布的已验证范围内。将示例用于应用前，请阅读[源码安装指南](https://github.com/beacon-observability/beacon-ruby/blob/v1.0.0/beacon/INSTALLATION.md)和[发布说明](https://github.com/beacon-observability/beacon-ruby/releases/tag/v1.0.0)。

## 升级与回滚

每个源码版本使用独立目录，保留已校验的压缩包、校验文件、`SOURCE.txt`、应用 Gemfile、锁文件和 SDK 初始化配置。回滚时恢复此前的源码引用、依赖及初始化配置，重启应用并重新验证遥测数据。

- [源码仓库](https://github.com/beacon-observability/beacon-ruby)
- [发布与下载](https://github.com/beacon-observability/beacon-ruby/releases)
- [固定版本验收记录](https://github.com/beacon-observability/beacon-ruby/blob/v1.0.0/beacon/validation/README.md)
