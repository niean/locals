# 启动脚本实现计划

- 创建时间: 2025-03-25
- 状态: completed
- 关联 spec: .harness/specs/active/spec-250325-startup-script.md

> **For agentic workers:** REQUIRED SUB-SKILL: Use .harness/skills/superpowers/subagent-driven-development.md (recommended) or .harness/skills/superpowers/executing-plans.md to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建 shell 启动脚本和 LaunchAgent 配置，实现 http.server 开机静默后台启动

**Architecture:** 标准 macOS LaunchAgent 方案：shell 脚本启动 python http.server，plist 定义开机启动行为

**Tech Stack:** Shell script, macOS launchd, python3 http.server

---

## File Structure

| 文件 | 类型 | 职责 |
|------|------|------|
| `../start-locals-http.sh` | 新建 | 启动脚本，启动 http.server 服务 |
| `~/Library/LaunchAgents/com.user.locals-http.plist` | 新建 | LaunchAgent 配置文件 |

---

### Task 1: 创建启动脚本

**Files:**
- Create: `../start-locals-http.sh`

- [ ] **Step 1: 创建日志目录**

```bash
mkdir -p ~/Library/Logs/locals-http
```

- [ ] **Step 2: 编写启动脚本**

```bash
#!/bin/bash
# start-locals-http.sh - 启动 locals http 服务

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="${SCRIPT_DIR}/photo-editor"
LOG_DIR="$HOME/Library/Logs/locals-http"
LOG_FILE="$LOG_DIR/server.log"
PID_FILE="$LOG_DIR/server.pid"
PORT=8888

# 创建日志目录
mkdir -p "$LOG_DIR"

# 检查端口是否被占用
if lsof -i :$PORT > /dev/null 2>&1; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Error: Port $PORT is already in use" >> "$LOG_FILE"
    exit 1
fi

# 检查 python3 是否存在
if ! command -v python3 &> /dev/null; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Error: python3 not found" >> "$LOG_FILE"
    exit 1
fi

# 启动服务
cd "$PROJECT_DIR"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting http.server on port $PORT" >> "$LOG_FILE"
python3 -m http.server $PORT >> "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Server started with PID $(cat $PID_FILE)" >> "$LOG_FILE"
```

- [ ] **Step 3: 设置执行权限**

```bash
chmod +x ../start-locals-http.sh
```

---

### Task 2: 创建 LaunchAgent plist

**Files:**
- Create: `~/Library/LaunchAgents/com.user.locals-http.plist`

- [ ] **Step 1: 编写 plist 文件**

```bash
# 动态生成 plist，使用实际路径
cat > ~/Library/LaunchAgents/com.user.locals-http.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.user.locals-http</string>
    <key>ProgramArguments</key>
    <array>
        <string>$HOME/install/locals/start-locals-http.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>$HOME/Library/Logs/locals-http/launchd.log</string>
    <key>StandardErrorPath</key>
    <string>$HOME/Library/Logs/locals-http/launchd-error.log</string>
    <key>WorkingDirectory</key>
    <string>$HOME/install/locals</string>
</dict>
</plist>
EOF
```

- [ ] **Step 2: 加载 LaunchAgent**

```bash
launchctl load ~/Library/LaunchAgents/com.user.locals-http.plist
```

- [ ] **Step 3: 验证服务启动**

```bash
# 检查服务状态
launchctl list | grep locals-http

# 检查端口是否在监听
lsof -i :8888

# 检查日志
cat ~/Library/Logs/locals-http/server.log
```

---

## 变更记录
| 时间 | 变更内容 |
|------|---------|
| 2025-03-25 | 脚本改为前台运行（使用 exec），使 launchd 能正确管理进程

## 发现的技术债
- 无
