---
sidebar_label: PHP
sidebar_position: 4
title: PHP Security
description: 在已发布的 Beacon PHP Agent 中启用实验性 Security 与运行时 SBOM。
---

# PHP Security

Beacon PHP 3.0.0 已在正常 Agent 运行时中包含实验性 Security。它默认关闭，与 [PHP 零代码接入](../zero-code/php.md) 共用原生扩展和安装生命周期。

## 开启 Security

下载 3.0.0 安装器后，在安装或幂等重装时开启 Security：

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

使用安装器的 `--disable-security` 清除安装级开启默认值，并移除或关闭应用中的 `BEACON_SECURITY_ENABLED` 覆盖设置。完整覆盖范围、诊断输出与限制见[对应版本的 Security 参考](https://github.com/beacon-observability/beacon-php/releases/tag/v3.0.0)。请核验接收端的实际 Logs 记录；启动成功或 `doctor` 通过不确认接收端投递。

## 原生日志输出与迁移

本版本使用 `beacon-security-log-body-v1` 输出协议，固定 Security 规范提交
`d9d76e5a41d974d294bb596e06918bb954319bf6`。
事件时间读取 OTel 原生 `time_unix_nano`，请求记录标识读取 LogRecord
`attributes.event_id`。Body 是紧凑单行 schema v2 JSON，只需解析一次；仅移除
`observed_at` 和 `occurrence_id`，其他字段路径、值和嵌套保持不变。
`source` 同时保留在 Body 和 attributes 中，不再有 SIEM 信封或 `message` 包装。
Fingerprint v1 和清单 ID 算法不变。记录预算及清单拆分按最终紧凑 UTF-8 Body
字节数计算，队列重试保留原生时间与标识。PHP 诊断 JSONL 保留本地包装，包含
`time_unix_nano`、`attributes` 和紧凑 `body` 字符串；该包装不作为 OTLP Body 传输。

先升级消费者，再升级生产端；收齐清单一轮的全部分片后才能替换此前完整列表。
回滚时必须同时恢复此前校验过的生产端及匹配的 SIEM 消费者。

## 生命周期限制

当前没有独立的进程内后台调度器：首次采集同步执行，刷新在选定原生 Hook 检查到到期时执行，
关闭前在 SDK flush 之前再采集一次。空闲期间不独立定时发布，这是与标准生命周期的明确差距。
Linux procfs 提供进程标识和计时；其他平台缺少可信计时时不发布清单。长驻多请求框架尚无
请求重置适配器。失败采集不发送替换列表；成功的空列表可清空清单。收到一轮全部分片后才能
整体替换旧清单。

回滚需同时恢复校验过的 2.0.0 安装器、运行时和匹配的 SIEM 消费者。
原生扩展保持 Beacon 1.1.0 / module 1.5.0。
