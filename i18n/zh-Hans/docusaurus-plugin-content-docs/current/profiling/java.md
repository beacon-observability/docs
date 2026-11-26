---
sidebar_label: Java
sidebar_position: 1
title: Java Profile
description: 将 Beacon Java JFR Profile 写入本地文件或发送到 HTTP 接收端。
---

# Java Profile

本指南使用 [Beacon Java v1.5.1](https://github.com/beacon-observability/beacon-java/releases/tag/v1.5.1)。Java Profile 是实验能力，默认关闭，需要 Java 11 或更高版本且运行时支持 JFR。应用仍使用 [Java 零代码指南](../zero-code/java.md)中的同一个 `-javaagent` 命令。

## 通过 HTTP 上传

兼容性 HTTP exporter 使用 `multipart/form-data` 发送 JFR 快照和元数据：

```bash
export OTEL_SERVICE_NAME=my-java-service
export OTEL_PROFILING_ENABLED=true
export OTEL_PROFILING_EXPORTER=http
export OTEL_PROFILING_ENDPOINT=http://127.0.0.1:9529/profiling/v1/input
java -javaagent:./beacon-javaagent.jar -jar app.jar
```

推荐使用 `http`，`datakit` 继续作为兼容别名。接收端必须支持 `main.jfr` 和 `event.json` 两个 multipart 字段。默认快照周期为一分钟。

## 写入本地 JFR 文件

如需进行与接收端无关的验证，可使用 file exporter：

```bash
mkdir -p profiles
export OTEL_PROFILING_ENABLED=true
export OTEL_PROFILING_EXPORTER=file
export OTEL_PROFILING_FILE_PATH="$PWD/profiles"
java -javaagent:./beacon-javaagent.jar -jar app.jar
```

确认 `profiles/` 中生成 `.jfr` 文件。生产环境启用前应规划磁盘保留策略，并在应用负载下验证性能开销。

## 可选内存事件

```bash
export OTEL_PROFILING_MEMORY_ENABLED=true
```

该配置会在标准 Profile 模板上叠加面向内存的 JFR 设置。

## 参数参考

环境变量名称区分大小写。时长参数由数字和 `ns`、`us`、`ms`、`s`、`m`、`h` 或 `d` 单位组成。

| 环境变量 | 类型 / 可选值 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `OTEL_PROFILING_ENABLED` | 布尔值 | `false` | 启用 JFR Profiler。 |
| `OTEL_PROFILING_INTERVAL` | 正时长 | `1m` | JFR 快照生成间隔。 |
| `OTEL_PROFILING_STARTUP_DELAY` | 非负时长 | `0s` | 启动 Profile 采集前的等待时间。 |
| `OTEL_PROFILING_MAX_AGE` | 正时长 | `5m` | 活跃 JFR 录制中数据的最长保留时间。 |
| `OTEL_PROFILING_STACK_DEPTH` | 整数（仅兼容） | `64` | 不设置单次录制深度；请使用 JVM JFR 参数。 |
| `OTEL_PROFILING_MAX_SIZE` | 非负整数，字节 | `0` | 活跃 JFR 录制的最大大小；`0` 表示沿用 JFR 默认行为。 |
| `OTEL_PROFILING_TEMP_DIR` | 目录路径 | 未设置 | JFR 临时数据目录；未设置时沿用运行时临时目录行为。 |
| `OTEL_PROFILING_MEMORY_ENABLED` | 布尔值 | `false` | 启用偏向内存分析的 JFR 配置。 |
| `OTEL_PROFILING_MEMORY_ALLOCATION_SAMPLING` | 布尔值 | 未设置 | 设置后覆盖 JFR 内存分配采样开关。 |
| `OTEL_PROFILING_MEMORY_OLD_OBJECT_SAMPLING` | 布尔值 | 未设置 | 设置后覆盖 JFR 老对象采样开关。 |
| `OTEL_PROFILING_EXPORTER` | `http`、`file`、`none`、`datakit` | `http` | 选择 HTTP multipart 上传、本地 JFR 文件或不导出；`datakit` 是 `http` 的别名。 |
| `OTEL_PROFILING_ENDPOINT` | HTTP(S) URL | `http://localhost:9529/profiling/v1/input` | `http` 导出器使用的上传地址。 |
| `OTEL_PROFILING_DATAKIT_TIMEOUT` | 至少 1ms | `10s` | 兼容导出器的 HTTP 上传超时时间。 |
| `OTEL_PROFILING_FILE_PATH` | 目录路径 | `${java.io.tmpdir}/otel-profiles` | `file` 导出器的输出目录。 |

超时变量 `OTEL_PROFILING_DATAKIT_TIMEOUT` 继续用于兼容配置。

## 升级到 1.4.2 {#upgrade-from-13x}

本指南对应 [Beacon Java v1.4.2](https://github.com/beacon-observability/beacon-java/releases/tag/v1.4.2)。从 1.4.0/1.4.1 升级时，将 `OTEL_PROFILING_EXPORTER=otlp` 改为 `http`，并将 `OTEL_PROFILING_ENDPOINT` 指向接收 JFR multipart 的地址。`otlp` 留待未来支持，1.4.2 不接受该值；`OTEL_EXPORTER_OTLP_PROFILES_*` 不配置这个上传器。Trace、Metric 和 Log 的 OTLP 导出不受影响。

1.3.x 的 `datakit`、上传地址及超时设置继续兼容，推荐使用 `http`。本地文件推荐使用 `OTEL_PROFILING_FILE_PATH`，旧的 `OTEL_PROFILING_EXPERIMENTAL_FILE_EXPORT_PATH` 仍作为回退。设置 `OTEL_PROFILING_ENABLED=false` 关闭采集，或选择 `none` 关闭导出。

JFR 栈深度是 JVM 全局设置，需要调整时在 JVM 启动参数中使用 `-XX:FlightRecorderOptions=stackdepth=128`；`OTEL_PROFILING_STACK_DEPTH` 仅输出兼容性警告。请在业务负载下验证开销。
