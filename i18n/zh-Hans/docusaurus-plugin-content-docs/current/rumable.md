---
sidebar_position: 2
title: Rumable
description: 通过 Nginx 或 IIS 接入浏览器真实用户监测，无需修改应用源代码。
---

# Rumable

Rumable 是 Beacon 的浏览器真实用户监测（RUM）[零代码接入](zero-code/index.md)项目。它通过 Nginx 或 IIS 在 HTML 响应中注入随包提供的 Web SDK，无需修改应用源代码。浏览器直接向配置的 RUM 接收端发送数据，CLI 在部署完成后退出。

当前版本为 **[v0.1.9](https://github.com/beacon-observability/rumable/releases/tag/v0.1.9)**。Rumable 保留自己的名称、`rumable` 命令、TOML 配置和独立发布节奏。

## 前置条件

- **Linux / Nginx：** Bash、curl、sudo，以及启用了 `http_sub_module` 的 Nginx。
- **Windows / IIS：** 管理员权限、PowerShell 5.1 或更高版本、URL Rewrite、静态内容功能，以及已启动的独立应用池。一键 IIS 接入要求 64 位操作系统。
- 已创建浏览器 RUM 应用，接收端兼容随包提供的 SDK。准备应用 ID、上报地址，以及浏览器网关模式需要的浏览器 Client Token。

Linux 和 Windows 安装包均从 [GitHub Releases](https://github.com/beacon-observability/rumable/releases/latest) 下载。安装器会检测架构并选择匹配的包，在适用系统上选择兼容版。操作系统和服务器要求请参阅[兼容性指南](https://github.com/beacon-observability/rumable/blob/v0.1.9/docs/compatibility.md)。目标服务器无需安装 Go 或 Node.js。

## 接入网站

1. 打开[英文配置页](https://beacon-observability.github.io/rumable/latest/setup/index.html)。本次发布也提供[固定版本配置页](https://beacon-observability.github.io/rumable/0.1.9/setup/index.html)。
2. 填写应用 ID、上报方式、地址和所需的浏览器 Token，选择 Linux / Nginx 或 Windows / IIS，并确认采样与隐私设置。默认从网站同源地址提供随包 SDK；Session Replay 可按需开启。
3. 确认页面已加载匹配的版本清单，再复制生成的命令。配置在浏览器中生成。命令中的浏览器 Token 使用 Base64 编码，编码不等于加密；应使用浏览器 Client Token，不能使用管理 API Key。
4. 使用所需的管理员权限，在目标 Web 服务器执行命令。安装器从固定版本的 GitHub Release 下载包、校验 SHA256，并发现目标网站。只有一个候选站点时自动选择；存在多个候选时需要交互式终端。

接入会修改服务器配置，并保留恢复记录。Nginx 配置可能重新加载。IIS 生命周期操作会回收独立应用池，可能丢失内存会话；共享池会被拒绝。请确认所选网站，并记录输出中的站点 ID、可执行文件路径、状态目录和备份位置。

## 验证与维护

Linux 安装完成后，将 `REPLACE_SITE_ID` 替换为接入时输出的站点 ID：

```bash
rumable=/opt/rumable/0.1.9/rumable
sudo "$rumable" status --state-dir /var/lib/rumable --site REPLACE_SITE_ID
sudo "$rumable" probe --state-dir /var/lib/rumable --site REPLACE_SITE_ID
```

随后在浏览器打开网站，检查 SDK 初始化与请求，并确认接收端已收到事件。HTTP 探测通过只说明注入和脚本可访问，不代表浏览器执行与数据入库已经验证。

更新时保留原站点 ID 和状态。仅安装新版 CLI 不会升级已部署站点的 SDK，还需要对该站点重新执行 setup 或 enable。Windows 命令、手工指定目标、禁用和回滚请参阅[用户指南](https://github.com/beacon-observability/rumable/blob/v0.1.9/USER-GUIDE.md)。

## 浏览器与服务端数据

Rumable 浏览器上报使用 TOML 和随包 SDK 的接收端设置。[公共配置](configuration/index.md)中的 `OTEL_EXPORTER_OTLP_*` 环境变量用于服务端语言探针，不用于配置浏览器 RUM 接收端。

可选的服务端 OpenTelemetry 集成需要单独配置，详见 [Rumable OTel 指南](https://github.com/beacon-observability/rumable/blob/v0.1.9/docs/otel.md)。

- [源代码仓库](https://github.com/beacon-observability/rumable)
- [发布与下载指南](https://github.com/beacon-observability/rumable/blob/main/docs/github-release.md)
