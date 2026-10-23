---
sidebar_position: 1
title: 零代码接入
description: 无需修改应用源代码，选择服务端探针或浏览器 RUM 接入。
---

# 零代码接入

零代码接入无需修改应用源代码，但仍需调整部署配置。服务端探针通过运行时 Agent、预加载 Hook、包装命令或原生扩展加载 OpenTelemetry；Rumable 通过 Nginx 或 IIS 注入随包提供的浏览器 Web SDK。

## 选择接入项目

| 项目 / 运行时 | 接入对象 | 零代码入口 |
| --- | --- | --- |
| [Java](java.md) | JVM 应用 | 通过 `-javaagent` 挂载一个 JAR |
| [Python](python.md) | Python 应用 | 在原有命令前添加 `beacon` |
| [Node.js](nodejs.md) | Node.js 应用 | 通过 `NODE_OPTIONS` 预加载一个模块 |
| [.NET](dotnet.md) | .NET 应用 | 使用 `beacon-dotnet run` 启动原有进程 |
| [PHP](php.md) | PHP 应用 | 启用原生 Hook 和 Composer 自动加载 |
| [Rumable（浏览器 RUM）](../rumable.md) | 通过 Nginx 或 IIS 提供的网站 | 生成并执行服务器接入命令，注入 Web SDK |

## 配置与验证

按照所选项目的指南安装已发布的软件包、配置接收端、应用部署变更并验证采集结果。

- **服务端探针：** 服务标识、OTLP 导出和认证设置请参阅[公共配置](../configuration/index.md)。
- **浏览器 RUM：** 使用 [Rumable 配置页](https://beacon-observability.github.io/rumable/latest/setup/index.html)设置浏览器应用、上报地址、采样和隐私参数，从 [GitHub Releases](https://github.com/beacon-observability/rumable/releases/latest) 下载软件包。

浏览器 RUM 上报与服务端 OTLP 导出使用独立配置。部署后，请在对应的接收端确认采集数据。
