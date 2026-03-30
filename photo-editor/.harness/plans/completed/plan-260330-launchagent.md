# Mac 开机启动 HTTP 服务 Implementation Plan

- 创建时间: 2026-03-30
- 状态: active
- 关联 spec: .harness/specs/active/spec-260330-launchagent.md

> **For agentic workers:** REQUIRED SUB-SKILL: Use .harness/skills/superpowers/executing-plans.md to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建 LaunchAgent plist 配置文件，实现用户登录时自动启动 HTTP 服务。

**Architecture:** 使用 macOS launchd 机制，通过 plist 文件定义服务启动配置。

**Tech Stack:** macOS LaunchAgent (plist XML)

---

## File Structure

```
~/Library/LaunchAgents/com.user.locals-http.plist  -- 新建
```

---

### Task 1: 创建 LaunchAgent plist 文件

**Files:**
- Create: `~/Library/LaunchAgents/com.user.locals-http.plist`

- [ ] **Step 1: 创建 plist 文件**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.user.locals-http</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>/Users/niean/install/locals/start-locals-http.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <false/>
    <key>StandardOutPath</key>
    <string>/Users/niean/Library/Logs/locals-http/server.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/niean/Library/Logs/locals-http/server.log</string>
</dict>
</plist>
```

- [ ] **Step 2: 验证 plist 语法**

Run: `plutil -lint ~/Library/LaunchAgents/com.user.locals-http.plist`
Expected: `OK`

- [ ] **Step 3: 加载服务（立即生效）**

Run: `launchctl load ~/Library/LaunchAgents/com.user.locals-http.plist`
Expected: 无输出（成功）

- [ ] **Step 4: 验证服务运行**

Run: `launchctl list | grep locals-http`
Expected: 显示 `com.user.locals-http` 条目

Run: `curl -s -o /dev/null -w "%{http_code}" http://localhost:8888/photo-editor/`
Expected: `200`

---

## 变更记录
| 时间 | 变更内容 |
|------|---------|

## 发现的技术债
- 无
