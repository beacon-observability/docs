---
sidebar_label: PHP
sidebar_position: 4
title: PHP Security
description: 在已发布的 Beacon PHP Agent 中启用实验性 Security 与运行时 SBOM。
---

# PHP Security

Beacon PHP 2.0.0 已在正常 Agent 运行时中包含实验性 Security。它默认关闭，与 [PHP 零代码接入](../zero-code/php.md) 共用原生扩展和安装生命周期。

## 开启 Security

下载 2.0.0 安装器后，在安装或幂等重装时开启 Security：

```bash
php beacon-setup.php --php-bin=all --enable-security
```

修改安装设置后重启 PHP-FPM 或 Apache。也可以在应用环境中设置 `BEACON_SECURITY_ENABLED=true`；FPM 池需要将环境覆盖变量传给 Worker。

Security 使用 OTLP Logs，接收端需要开启 Logs 管道。CLI 应用示例：

```bash
BEACON_SECURITY_ENABLED=true OTEL_LOGS_EXPORTER=otlp php public/index.php
```

服务名和上报地址沿用已安装的默认配置。运行时 SBOM 在 Security 生命周期中默认开启，本地诊断输出保持关闭。

## 配置与覆盖范围

| 环境变量 | 默认值 | 用途 |
| --- | --- | --- |
| `BEACON_SECURITY_ENABLED` | `false` | 开启 Security。 |
| `BEACON_SECURITY_SBOM_ENABLED` | `true` | Security 开启时采集部分运行时 SBOM。 |
| `BEACON_SECURITY_SBOM_REFRESH_SECONDS` | `300` | 正整数刷新间隔；在原生 Hook 边界检查，空闲期间不独立调度。 |
| `BEACON_SECURITY_EXPORT_NO_EVIDENCE_ENABLED` | `false` | 导出 `no_evidence` findings；unknown/suspected 不受影响。 |
| `BEACON_SECURITY_LOCAL_OUTPUT_ENABLED` | `false` | 开启本地诊断快照。 |
| `BEACON_SECURITY_OUTPUT` | 系统临时目录 + `/beacon-security` | 选择诊断父目录。 |

选定的 PDO、文件、命令和 cURL Sink 会观测与当前查询参数、表单和 Cookie 输入之间有边界的值相关性。发现属于保守的候选观测，不确认漏洞，也不执行阻断。变换后的输入值和框架请求体不在该模型覆盖范围内。

覆盖常规 CLI 与 PHP 请求生命周期；长驻多请求 Worker 暂无请求重置集成。运行时 SBOM 明确为部分清单，包含已加载扩展和通过已包含文件观测到的 Composer 包。

使用安装器的 `--disable-security` 清除安装级开启默认值，并移除或关闭应用中的 `BEACON_SECURITY_ENABLED` 覆盖设置。完整覆盖范围、诊断输出与限制见[对应版本的 Security 参考](https://github.com/beacon-observability/beacon-php/blob/v2.0.0/docs/security.md)。请核验接收端的实际 Logs 记录；启动成功或 `doctor` 通过不确认接收端投递。

## SIEM 迁移与生命周期限制

PHP 2.0.0 用 SIEM v1 信封替代旧 v1 Body，`message` 保留完整的序列化 v2 证据。
先升级消费者；没有旧格式开关。通过顶层进程标识和当前调用 `span_id` 关联 trace，
解析 `message` 读取详细证据或组装完整清单。65536 字节预算包含最终信封和转义开销。
unknown/suspected 仍可导出；默认过滤 no_evidence 不消耗投递预算。actor/客户端 IP
暂不可用，保留空字符串；Resource 的 `tenant.id` 缺失时使用 `default`。
finding outcome 为 unknown、severity 为 informational，不代表已评估的风险级别。

当前没有独立的进程内后台调度器：首次采集同步执行，刷新在选定原生 Hook 检查到到期时执行，
关闭前在 SDK flush 之前再采集一次。空闲期间不独立定时发布，这是与标准生命周期的明确差距。
Linux procfs 提供进程标识和计时；其他平台缺少可信计时时不发布清单。长驻多请求框架尚无
请求重置适配器。失败采集不发送替换列表；成功的空列表可清空清单。收到一轮全部分片后才能
整体替换旧清单。

回滚需同时恢复校验过的 1.3.1 安装器、运行时和旧 v1 Body 消费者。
原生扩展保持 Beacon 1.1.0 / module 1.5.0。
