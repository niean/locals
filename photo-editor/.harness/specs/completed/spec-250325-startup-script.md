# 启动脚本设计 Spec

- 创建时间: 2025-03-25
- 状态: completed
- 任务来源: 创建 http.server 启动脚本并配置开机启动

## Goal

创建 shell 启动脚本和 macOS LaunchAgent 配置，实现 PhotoEditor 本地服务开机静默后台启动。

## Architecture

采用标准 macOS LaunchAgent 方案：shell 脚本负责启动 http.server 服务，LaunchAgent plist 负责定义开机启动行为和日志管理。脚本放在项目上级目录，plist 放在用户 LaunchAgents 目录。

## Components

### start-locals-http.sh
- 职责: 启动 python http.server 服务
- 接口: `./start-locals-http.sh` 无参数直接执行
- 依赖: python3 可用，端口 8888 未被占用

### com.user.locals-http.plist
- 职责: 定义 LaunchAgent 配置（开机启动、日志路径、工作目录）
- 接口: 被 launchd 加载
- 依赖: start-locals-http.sh 存在且可执行

## Data Flow

1. 系统启动 -> launchd 加载 plist
2. plist 调用 start-locals-http.sh
3. 脚本启动 python3 -m http.server 8888
4. 服务在后台运行，日志输出到指定文件

## Error Handling

- 端口占用：脚本检测端口是否可用，已占用时退出并记录错误日志
- python3 不存在：日志记录错误信息
- 服务异常退出：LaunchAgent 自动重启（配置 KeepAlive）

## Constraints

- 仅支持 macOS（使用 LaunchAgent）
- 脚本路径：`../start-locals-http.sh`（相对于项目根目录）
- 日志路径：`~/Library/Logs/locals-http/`
- 服务端口：8888
- 不自动打开浏览器

## Acceptance Criteria

- [x] start-locals-http.sh 脚本创建在项目上级目录
- [x] 脚本可独立运行，成功启动 http.server 8888
- [x] LaunchAgent plist 文件创建在 ~/Library/LaunchAgents/
- [x] 执行 launchctl load 后服务自动启动
- [x] 日志正确输出到 ~/Library/Logs/locals-http/
- [x] 开机后服务自动启动（RunAtLoad=true，需重启验证）
