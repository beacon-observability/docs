---
title: Ruby 源码接入
sidebar_label: Ruby
description: 安装已发布的 Ruby 插桩源码，通过 OTLP HTTP/protobuf 验证 Net::HTTP 链路。
---

# Ruby 源码接入

Beacon Ruby **[v1.2.0](https://github.com/beacon-observability/beacon-ruby/releases/tag/v1.2.0)** 是基于 OpenTelemetry Ruby Contrib 的源码发行版。应用需要显式集成插桩 gem 并初始化 OpenTelemetry SDK。该版本保留上游插桩 gem 标识，并通过 GitHub Release 资产分发可选的 **beacon-security 0.1.0** 和实验性 **beacon-profiling 0.1.0** gem；未推送 RubyGems，也未提供可执行 Agent 或零代码链路追踪启动器。

## 环境要求

- 本文示例使用 **Ubuntu 24.04 x86_64、CRuby 3.3.12 和 Bundler 2.5.22**。源码中的 gem 规格要求 Ruby 3.3 或更新版本；Security 和 Profiling CI 还通过 Linux CRuby 3.3、3.4 和 4.0。Collector 接入示例使用 CRuby 3.3.12，其他引擎和平台不在本文支持范围内。
- 能够从 GitHub 和 RubyGems 下载所需资源。
- 下方接收端验证需要 Python 3 和 Docker。

## 下载与校验

在新目录中执行以下命令。命令固定 v1.2.0，同时下载对应源码、Security 和 Profiling gem、来源记录和校验文件：

```bash
ruby_release_tag=v1.2.0
ruby_release_version=${ruby_release_tag#v}
ruby_archive="beacon-ruby-${ruby_release_version}-source.tar.gz"
ruby_release_url="https://github.com/beacon-observability/beacon-ruby/releases/download/${ruby_release_tag}"

curl -fLO "${ruby_release_url}/${ruby_archive}"
curl -fLO "${ruby_release_url}/beacon-security-0.1.0.gem"
curl -fLO "${ruby_release_url}/beacon-profiling-0.1.0.gem"
curl -fLO "${ruby_release_url}/SOURCE.txt"
curl -fLO "${ruby_release_url}/SHA256SUMS"
sha256sum -c SHA256SUMS
tar -xzf "${ruby_archive}"
cd "beacon-ruby-${ruby_release_version}"
```

校验通过后再继续。`SOURCE.txt` 记录源码提交和上游基线。压缩包包含源码与许可证，两个 gem 是独立的受校验资产，依赖需要单独安装。本页的示例环境和能力范围对应 v1.2.0；使用其他版本时，请查阅所选版本的发布说明。

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

Net::HTTP 接入方式可参考发布版本中的 [Gemfile](https://github.com/beacon-observability/beacon-ruby/blob/v1.2.0/beacon/validation/Gemfile) 和 [Ruby 示例](https://github.com/beacon-observability/beacon-ruby/blob/v1.2.0/beacon/validation/http_smoke.rb)。Gemfile 从已发布源码加载基础插桩库和 Net::HTTP 插桩库，并固定 Core SDK 与 OTLP exporter 的版本。先加载所需库，再初始化 SDK 并启用 `OpenTelemetry::Instrumentation::Net::HTTP`。

本版本提供基础插桩库、Net::HTTP 语义模式以及本地 Collector 链路导出。Security 安全发现与运行时清单还具备Logs 导出能力，参见 [Ruby Security](security/ruby.md)。实验性 Profiling 可向本地 DataKit 的 profiling input 上传 pprof，配置见下文。Rails 专属适配、其他链路集成、指标和通用应用日志不在本文支持范围内。将示例用于应用前，请阅读[源码安装指南](https://github.com/beacon-observability/beacon-ruby/blob/v1.2.0/beacon/INSTALLATION.md)和[发布说明](https://github.com/beacon-observability/beacon-ruby/releases/tag/v1.2.0)。

## 启用 Security

校验全部资产后，从下载目录安装 GitHub 分发的 gem：

```bash
gem install ./beacon-security-0.1.0.gem --no-document
```

将已安装的版本加入应用 Gemfile，或通过 Bundler 的 `path:` 引用解压后的
`security` 目录。初始化应用的 OpenTelemetry Logs SDK/exporter，调用
`Beacon::Security.start` 并加入 Rack 中间件，设置 `BEACON_SECURITY_ENABLED=true`。
本地文件保持关闭，此接入方式需要应用配置。完整启动方式、覆盖、预算和验证步骤见
[Ruby Security](security/ruby.md)。

## 启用实验性 Profiling {#profiling}

Profiling 默认关闭。在 Linux CRuby 3.3+ 环境中，准备 Ruby 开发头文件和 C11
编译器后，安装已校验的 gem：

```bash
gem install ./beacon-profiling-0.1.0.gem --no-document
```

将 `gem 'beacon-profiling', '= 0.1.0'` 加入应用 Gemfile，执行 `bundle install`；
也可引用解压后的 `profiling` 源码目录。启用本地 DataKit 的 profiling input 后启动应用：

```bash
export OTEL_PROFILING_ENABLED=true
export OTEL_PROFILING_EXPORTER=datakit
export OTEL_PROFILING_PPROF_UPLOAD_URL=http://127.0.0.1:9529/profiling/v1/input
export OTEL_PROFILING_TYPES=wall,cpu
export OTEL_PROFILING_MEMORY_ENABLED=true
export OTEL_PROFILING_BACKEND=beacon
export OTEL_PROFILING_HEAP_ENABLED=true
export OTEL_PROFILING_GVL_ENABLED=true
export OTEL_SERVICE_NAME=my-ruby-service
bundle exec ruby -rbeacon/profiling/auto app.rb
```

采集的 CPU 时间、Wall Time、分配对象数、堆存活对象数、堆存活字节数和观测到的
GVL 等待时间，会合并到一个默认 60 秒的 pprof 上传窗口。
`OTEL_PROFILING_EXCEPTION_ENABLED=true` 可额外开启异常采样。CPU 和分配采样共享
原生采集切片，Wall、堆和 GVL 同步采集。退出时会刷新剩余尾段，持续时间保留实际值，
因此可能出现短于 60 秒的记录。文件导出保留每个切片自身的开始时间和持续时间。
普通 Trace OTLP 地址不能接收这种上传。

堆字节数是浅层存活对象内存的采样估算，不代表 RSS 或累计分配量。GVL 事件是有界的
等待采样；时间线 UI 展示、生产开销和更广泛的 Ractor 工作负载尚未验证。
Linux CRuby 3.3、3.4、4.0 的编译、测试和构建 CI 已通过，本地接收端验收使用 3.3.12。
此预加载入口仅启用 Profiling，不会初始化 Trace SDK。

Puma 和 Unicorn 需要显式配置 fork 后启动及 worker 退出钩子。完整生命周期、配置、
计数器与限制见[发布版 Profiling 指南](https://github.com/beacon-observability/beacon-ruby/blob/v1.2.0/profiling/README.md)。
设置 `OTEL_PROFILING_ENABLED=false` 并重启即可关闭。如无数据，检查 DataKit profiling
input、上传地址和 `Beacon::Profiling.stats` 的 `exported`、`failed`、`dropped`；
HTTP 成功不单独证明数据已在 UI 建立索引。

## 升级与回滚

每个源码版本使用独立目录，保留已校验的压缩包、校验文件、`SOURCE.txt`、应用 Gemfile、锁文件和 SDK 初始化配置。回滚时恢复此前的源码引用、依赖及初始化配置，重启应用并重新验证遥测数据。

- [源码仓库](https://github.com/beacon-observability/beacon-ruby)
- [发布与下载](https://github.com/beacon-observability/beacon-ruby/releases)
- [固定版本技术参考](https://github.com/beacon-observability/beacon-ruby/blob/v1.2.0/beacon/validation/README.md)
