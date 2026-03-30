# Mac 开机启动 HTTP 服务 Design Spec

- 创建时间: 2026-03-30
- 状态: active
- 任务来源: 将 start-locals-http.sh 加入 Mac 启动项

## Goal

实现 Mac 用户登录时自动启动 locals HTTP 服务器（python3 http.server 8888）。

## Architecture

使用 macOS 原生 launchd 机制，创建 LaunchAgent plist 配置文件，实现用户登录时自动启动服务。

## Components

### LaunchAgent plist
- 职责: 定义服务启动配置
- 位置: `~/Library/LaunchAgents/com.user.locals-http.plist`
- 配置项:
  - Label: com.user.locals-http
  - ProgramArguments: /bin/bash /Users/niean/install/locals/start-locals-http.sh
  - RunAtLoad: true（登录时启动）
  - KeepAlive: false（退出后不重启，避免端口冲突循环）
  - StandardOutPath: /Users/niean/Library/Logs/locals-http/server.log
  - StandardErrorPath: /Users/niean/Library/Logs/locals-http/server.log

### start-locals-http.sh（已有）
- 职责: 启动 HTTP 服务器
- 路径: /Users/niean/install/locals/start-locals-http.sh
- 无需修改

## Data Flow

```
用户登录 -> launchd 加载 plist -> 执行 start-locals-http.sh -> 启动 python3 http.server 8888
```

## Error Handling

- 端口占用：脚本内置检测，exit 1 并记录日志
- python3 不存在：脚本内置检测，exit 1 并记录日志
- 服务异常退出：KeepAlive=false，不自动重启，避免循环

## Constraints

- 仅当前用户可用（LaunchAgent 用户级）
- 不依赖管理员权限
- 服务仅在本机可用（localhost:8888）

## Acceptance Criteria
- [ ] plist 文件创建到 ~/Library/LaunchAgents/
- [ ] 用户登录后服务自动启动
- [ ] 访问 http://localhost:8888/photo-editor/ 可正常加载页面
- [ ] 日志正常记录到 ~/Library/Logs/locals-http/server.log
