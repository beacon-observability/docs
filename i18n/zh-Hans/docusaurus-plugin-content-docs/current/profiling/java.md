---
sidebar_label: Java
sidebar_position: 1
title: Java Profile
description: 通过 OTLP 或本地 JFR 文件导出实验性 Beacon Java Profile。
---

# Java Profiling

本指南对应 [Beacon Java v1.4.2](https://github.com/beacon-observability/beacon-java/releases/tag/v1.4.2)。Profiling 为实验性能力，默认关闭，需要 Java 11+ 且 JFR 可用。保留[零代码指南](../zero-code/java.md)中的 `-javaagent` 启动方式。

## 使用 OTLP 导出

接收端必须支持开发版 OTLP Profiles schema；仅支持 OTLP Traces 的地址不能接收 Profile。HTTP/protobuf 示例：

```bash
export OTEL_SERVICE_NAME=my-java-service
export OTEL_PROFILING_ENABLED=true
export OTEL_PROFILING_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_PROFILES_PROTOCOL=http/protobuf
export OTEL_EXPORTER_OTLP_PROFILES_ENDPOINT=http://127.0.0.1:4318/v1development/profiles
java -javaagent:./beacon-javaagent.jar -jar app.jar
```

使用 gRPC 时，将协议设为 `grpc`，地址设为 `http://127.0.0.1:4317`，不带路径、查询或片段。`https://` 启用 TLS。

未配置信号地址时，复用 `OTEL_EXPORTER_OTLP_ENDPOINT`：HTTP 会追加 `/v1development/profiles`，gRPC 保持地址不变。协议、超时和请求头也支持对应的共享 OTLP 设置。

OTLP 导出会将 JFR 执行、原生方法、分配和旧对象样本转换为 Profiles；本地文件导出保留原始 JFR 快照及未转换的事件。默认快照周期为一分钟。

## 写入本地 JFR 文件

```bash
mkdir -p profiles
export OTEL_PROFILING_ENABLED=true
export OTEL_PROFILING_EXPORTER=file
export OTEL_PROFILING_FILE_PATH="$PWD/profiles"
java -javaagent:./beacon-javaagent.jar -jar app.jar
```

确认目录中出现 `.jfr` 文件。`file` 导出器忽略 OTLP 地址、协议、请求头和超时配置。生产启用前应设置文件保留策略，并验证业务负载下的开销。

## 从 1.3.x 升级 {#upgrade-from-13x}

1.4.0 起移除了旧 multipart 导出器及 `OTEL_PROFILING_ENDPOINT`、`OTEL_PROFILING_DATAKIT_TIMEOUT` 配置。迁移到 `OTEL_PROFILING_EXPORTER=otlp` 和 `OTEL_EXPORTER_OTLP_PROFILES_*`，并确认接收端支持 OTLP Profiles。旧的 `OTEL_PROFILING_EXPERIMENTAL_FILE_EXPORT_PATH` 改为 `OTEL_PROFILING_FILE_PATH`。使用 `OTEL_PROFILING_ENABLED=false` 关闭采集，导出器不再接受 `none`。

从 1.3.5 起，`telemetry.distro.name` 为 `beacon-java-instrumentation`。检查依赖旧名称的查询或过滤条件。

## 配置参考

环境变量名称区分大小写。时长接受数值加 `ns`、`us`、`ms`、`s`、`m`、`h` 或 `d`。

| 环境变量 | 类型 / 可选值 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `OTEL_PROFILING_ENABLED` | 布尔值 | `false` | 启用 Profiling。 |
| `OTEL_PROFILING_INTERVAL` | 正时长 | `1m` | 快照周期。 |
| `OTEL_PROFILING_STARTUP_DELAY` | 非负时长 | `0s` | 开始采集前的延迟。 |
| `OTEL_PROFILING_MAX_AGE` | 正时长 | `5m` | JFR 保留窗口。 |
| `OTEL_PROFILING_MAX_SIZE` | 非负整数，字节 | `0` | 录制大小上限；0 使用 JFR 默认值。 |
| `OTEL_PROFILING_TEMP_DIR` | 目录 | `JVM 临时目录` | 临时保存分离后的最终快照；与 JFR repository 目录无关。 |
| `OTEL_PROFILING_MEMORY_ENABLED` | 布尔值 | `false` | 启用面向内存的 JFR 设置。 |
| `OTEL_PROFILING_MEMORY_ALLOCATION_SAMPLING` | 布尔值 | `未设置` | 显式配置时覆盖分配采样设置。 |
| `OTEL_PROFILING_MEMORY_OLD_OBJECT_SAMPLING` | 布尔值 | `未设置` | 显式配置时覆盖旧对象采样设置。 |
| `OTEL_PROFILING_EXPORTER` | otlp、file | `otlp` | 选择 OTLP Profiles 或本地 JFR 文件。 |
| `OTEL_EXPORTER_OTLP_PROFILES_PROTOCOL` | http/protobuf、grpc | `共享协议，未设置时为 http/protobuf` | OTLP 传输协议。 |
| `OTEL_EXPORTER_OTLP_PROFILES_ENDPOINT` | HTTP(S) URL | `取决于协议` | 完整的 Profiles 信号地址。 |
| `OTEL_EXPORTER_OTLP_PROFILES_TIMEOUT` | 正时长 | `共享超时，未设置时为 10s` | OTLP 导出超时。 |
| `OTEL_EXPORTER_OTLP_PROFILES_HEADERS` | 百分号编码的 key=value 对 | `共享请求头` | OTLP 请求头。 |
| `OTEL_PROFILING_FILE_PATH` | 目录 | `${java.io.tmpdir}/otel-profiles` | 本地文件导出目录。 |

JFR 栈深度和 repository 目录是 JVM 全局设置。需要调整时，在 JVM 启动参数中配置 `-XX:FlightRecorderOptions=stackdepth=128,repository=/path/to/jfr`，这会影响进程中的全部 JFR 录制。`OTEL_PROFILING_STACK_DEPTH` 不能设置单次录制的栈深度，显式设置只会输出警告。文件导出目录与 repository 目录分开配置。

关闭时会等待正在执行的导出并处理剩余区间，调用方最多等待 10 秒；JVM 退出不保证超过此期限的数据送达。空区间不产生文件或上传。
