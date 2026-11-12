---
title: Beacon C++ SDK
sidebar_label: C++
description: 构建 Beacon C++ 0.1.0 源码 SDK，通过显式埋点和 OTLP/HTTP 上报链路。
---

# Beacon C++ SDK

Beacon C++ 是官方 OpenTelemetry C++ API、SDK 和导出器的独立完整源码下游。
首个 Beacon 源码发行版为 **[v0.1.0](https://github.com/beacon-observability/beacon-cpp/releases/tag/v0.1.0)**，
基于上游 1.30.0，保留上游历史、命名空间、CMake 身份和 Apache-2.0 许可证。
SDK 元数据中的上游版本与 Beacon 发行版本分别管理。

应用需要显式初始化 SDK 并修改源码埋点。本版提供经过验证的源码归档，不提供零代码探针、预编译二进制或软件包索引发行。

## 环境要求

本文构建示例使用 Linux x86_64、Debian 13、GCC 14.2.0、CMake 3.31.6、C++17 标准库模式、
静态 SDK 库、ABI v1，以及通过 OTLP/HTTP Protobuf 向 OpenTelemetry Collector Contrib 0.135.0 上报 traces。
安装 `g++`、`cmake`、`make`、`libprotobuf-dev`、`protobuf-compiler`、
`libcurl4-openssl-dev` 和 `nlohmann-json3-dev`。其他工具链与平台不在本文构建范围内。

运行应用前先启动可访问的 OTLP/HTTP 接收端。示例使用包含信号路径的地址
`http://127.0.0.1:4318/v1/traces`。在容器中，回环地址指应用容器自身。

## 安装与运行

从 Release 下载 `beacon-cpp-0.1.0-source.tar.gz`、`release-manifest.json` 和 `SHA256SUMS` 到同一目录。
请使用手动附加的源码资产；GitHub 自动生成的源码归档不包含此资产打包的协议子模块。

```bash
sha256sum --check SHA256SUMS
tar -xzf beacon-cpp-0.1.0-source.tar.gz
cd beacon-cpp-0.1.0
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release -DCMAKE_CXX_STANDARD=17 \
  -DOTELCPP_WITH_STL=CXX17 -DOTELCPP_BUILD_TESTING=OFF \
  -DOTELCPP_WITH_BENCHMARK=OFF -DOTELCPP_WITH_EXAMPLES=OFF \
  -DOTELCPP_WITH_FUNC_TESTS=OFF -DOTELCPP_WITH_OTLP_HTTP=ON \
  -DOTELCPP_WITH_HTTP_CLIENT_CURL=ON \
  -DOTELCPP_PROTO_PATH="$PWD/third_party/opentelemetry-proto"
cmake --build build --parallel 3
cmake --install build --prefix "$PWD/install"
cmake -S beacon/acceptance -B build/application -DCMAKE_PREFIX_PATH="$PWD/install"
cmake --build build/application --parallel 3
./build/application/beacon_cpp_otlp http://127.0.0.1:4318/v1/traces
```

完整的 [CMake 消费项目](https://github.com/beacon-observability/beacon-cpp/blob/v0.1.0/beacon/acceptance/CMakeLists.txt)
和[应用源码](https://github.com/beacon-observability/beacon-cpp/blob/v0.1.0/beacon/acceptance/main.cc)
展示了 `find_package(opentelemetry-cpp CONFIG REQUIRED)`、trace 和 OTLP/HTTP 导出器目标、
显式服务标识、批处理、父子关系及关闭流程。
示例创建服务 `beacon-cpp-acceptance`、根 span `request`、子 span `work` 和 `exit-final`，
在 provider 关闭后输出 trace ID。

## 验证接收

按照[版本化接入指南](https://github.com/beacon-observability/beacon-cpp/blob/v0.1.0/beacon/acceptance/README.md)
启动固定版本 Collector，并在文件输出中校验本次应用生成的精确 trace ID。
校验程序检查三个 span、非零 trace/span ID、服务标识、父子关系以及关闭时最后一个 span 的到达情况。
另有独立检查验证本地端点拒绝连接时，导出器在有限时间内返回失败。

数据导出路径为 **应用 → OTLP/HTTP Protobuf → Collector 文件导出器**。
应用退出成功不等于接收成功；Collector 接收结果不代表 DataKit 兼容性或下游后端已经存储数据。
跨网络上下文传播需要应用显式注入与提取；服务端探针的环境变量配置不能替代 SDK 初始化。

## 升级、回滚与范围

各版本使用独立安装前缀，重新链接应用，并在部署前验证链路。
保留上一版本 SDK 安装目录和应用产物，回滚时一并恢复。
不要混用不同构建的头文件、库和 ABI 模式。依赖与回滚细节见
[版本化安装指南](https://github.com/beacon-observability/beacon-cpp/blob/v0.1.0/beacon/INSTALL.md)。

Metrics、Logs、OTLP/gRPC、DataKit、TLS/认证、Profiling、Security、自动埋点及其他平台
均不在首版支持范围内。源码保留了超出本文介绍的 trace 配置的上游组件，但源码中存在组件不等于 Beacon 已支持。
