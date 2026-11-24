---
sidebar_label: Ruby
sidebar_position: 5
title: Ruby Security
description: 启用通过 GitHub 分发的 Beacon Ruby Security gem，验证安全发现和运行时清单。
---

# Ruby Security

[Beacon Ruby v1.3.0](https://github.com/beacon-observability/beacon-ruby/releases/tag/v1.3.0)
在源码包之外分发 `beacon-security-0.2.0.gem`。Security 默认关闭，需要显式配置
Rack 中间件和 SDK。先按 [Ruby 下载指南](../ruby.md)校验五个 Release 资产。
gem 未推送 RubyGems，运行时依赖的 OTel gem 仍来自 RubyGems。

## 应用配置

安装已下载的 gem 后，在应用 Gemfile 中加入：

```ruby
gem 'beacon-security', '= 0.2.0'
gem 'opentelemetry-sdk'
gem 'opentelemetry-logs-sdk'
gem 'opentelemetry-exporter-otlp-logs'
```

启动 Security 前加载 Rack 和可选客户端。在 Rack 应用的 `config.ru` 中配置应用的
OpenTelemetry provider 后接入：

```ruby
require 'rack'
require 'net/http'
# require 'pg'
# require 'mysql2'
require 'opentelemetry/sdk'
require 'opentelemetry/sdk/logs'
require 'opentelemetry-exporter-otlp-logs'
require 'beacon/security'

OpenTelemetry::SDK.configure
security = Beacon::Security.start
use Beacon::Security::Middleware, runtime: security
run MyApplication
```

将 Security 中间件置于 OTel Rack 服务端 Span 中间件内部，以关联链路上下文。
使用应用已有的 OpenTelemetry 设置配置服务/资源身份和 Logs 接收端：

```bash
BEACON_SECURITY_ENABLED=true OTEL_LOGS_EXPORTER=otlp OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4318 bundle exec rackup
```

每个 worker 在 fork 后启动一次。退出时先执行 `security.force_flush`、
`security.shutdown`，再刷新和关闭应用 OTel provider。晚加载客户端需显式调用
`Beacon::Security::Hooks.install`。

## 配置与范围

| 变量 | 默认值 | 含义 |
| --- | --- | --- |
| `BEACON_SECURITY_ENABLED` | `false` | 启用运行时。 |
| `BEACON_SECURITY_EXPORT_NO_EVIDENCE_ENABLED` | `false` | 导出 `no_evidence` findings；unknown/suspected 不受此开关影响。 |
| `BEACON_SECURITY_SBOM_ENABLED` | `true` | Security 启用时收集已激活的 gem。 |
| `BEACON_SECURITY_SBOM_REFRESH_SECONDS` | `300` | 每轮完成后的正整数间隔；非法或零值回退到 300。 |
| `BEACON_SECURITY_LOCAL_OUTPUT_ENABLED` | `false` | 启用进程本地诊断。 |
| `BEACON_SECURITY_OUTPUT` | `beacon-security-output` | 诊断目录。 |
| `BEACON_SECURITY_EVIDENCE_FILE` | 未设置 | 可选 findings JSONL，仅本地输出开启时生效。 |

将 Rack 扁平查询参数和请求头值与部分 PG/mysql2 SQL 模板、Kernel system/spawn、
File 和 Net::HTTP 调用进行关联。SQL 绑定参数值不参与模板匹配，授权与 Cookie 头被
排除。不会导出原始请求值、SQL 或 Shell 文本。应用提供的路由元数据必须是静态模板，
不能使用原始请求路径。

这是有预算限制的子串关联：不相关的相同字符串可能匹配，转换后的值可能无法关联。
安全发现采用 schema v2、fingerprint v1、`precision=approximate`、
`collection_complete=false` 和 `unknown` 攻击证据。它表示调用观测，不确认漏洞。
请求体、异步传播、流式响应体、净化器/攻击分析、Rails 专属适配及其他客户端 API 不在
模型范围内。

每个请求最多保留 64 个输入源，每个 4096 字节、总计 65,536 字节，以及 128 个指纹和
1024 次敏感调用观测。超过 65,536 字节的查询或调用输入不参与分析。交付受 1024 条队列
和每条 65,536 字节限制，队列满时丢弃且不重放。运行时清单最多观测 10,000 个已激活
gem，周期重发未变化列表；大列表分片后，消费者必须收齐分片才能替换清单。
Linux procfs 和启动时钟提供进程时间；不支持的时间源不发送清单。Collector 交付为
尽力而为，不代表后端确认。

## 验证与关闭

在解压源码的 `security` 目录安装锁定的开发依赖，再使用 Docker 和已缓存的
Collector 0.135.0 镜像运行 `python3 test/collector_smoke.py`。开发依赖包含原生数据库
客户端，MySQL 需要客户端开发头文件和库。此检查验证真实 findings/inventory Logs、
scope、资源身份、事件名及 Trace 关联。

Security CI 通过 Linux CRuby 3.3/3.4/4.0，本地 Collector 接入示例使用 CRuby 3.3.12。
JRuby、其他操作系统、DataKit 和后端入库未验证。详见[固定版本参考](https://github.com/beacon-observability/beacon-ruby/blob/v1.3.0/security/README.md)
和[技术参考](https://github.com/beacon-observability/beacon-ruby/blob/v1.3.0/beacon/validation/security-1.1.0.md)。

未收到记录时，检查启用配置、中间件位置、客户端加载顺序，以及应用实际的 Logs
exporter 和接收管道。finding 需要匹配模型中的输入，没有事件不代表安全。设置
`BEACON_SECURITY_ENABLED=false` 并重启即可关闭；回滚时恢复此前源码/gem 和应用锁文件，
v1.0.0 不包含 Security。

## SIEM 输出与升级

Ruby 1.3.0 / Security 0.2.0 的输出协议具有破坏性变更：OTel Logs 和可选诊断 JSONL
统一使用 SIEM v1 信封，`message` 完整保留原始序列化 v2 证据。`span_id` 是检测时的
当前 span，包括 server span；不再输出旧 span 别名，也不回退到其他入口 span。
Fingerprint v1 不变。消费者需解析 `message`，收齐清单的全部分片后再替换依赖列表；
字节预算包含最终信封与 JSON 转义开销。

Resource 的 `service.name` 提供服务名，配置的 `tenant.id` 提供租户，否则为 `default`。
已验证 actor 与客户端 IP 暂不可用，保留空字符串；finding outcome 为 unknown，
severity 为 informational，仅表示日志级别，不是风险等级。没有旧输出格式开关。
先升级消费者；回滚时同时恢复校验过的 v1.2.1 源码、Security 0.1.0 与旧 v2 Body 消费者。
