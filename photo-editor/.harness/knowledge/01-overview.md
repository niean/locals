# 项目概览

## 项目简介

PhotoEditor -- 本地化图片编辑器，纯 HTML+CSS+JS 实现。由于使用 ES6 Modules（script type=module），需通过本地 HTTP 服务器访问，不能直接用 file:// 协议打开。支持裁剪、画笔、文字标注、马赛克、形状（箭头/矩形）五种编辑工具，以及撤销/重做和图片导出。

## 技术栈

- HTML5 Canvas API
- ES6 Modules (script type=module) -- 需要 HTTP 服务器
- CSS Custom Properties + ITCSS 架构 + BEM 命名
- 零外部依赖，无构建系统

## 项目边界

- 纯客户端应用，无后端服务
- 需要本地 HTTP 服务器运行（ES6 Modules CORS 限制）
- 支持 JPG/PNG/WebP 格式
- 最大图片尺寸 4096x4096
- 最大撤销历史 50 步
- 推荐现代浏览器（Chrome/Firefox/Safari/Edge）

## 操作约束

操作约束见 AGENTS.md。
