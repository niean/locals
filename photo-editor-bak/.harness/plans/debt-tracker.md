# 技术债追踪

| ID | 描述 | 优先级 | 来源计划 | 发现时间 | 状态 |
|----|------|--------|---------|---------|------|
| DEBT-001 | JS 文件中存在若干 magic number（裁剪最小尺寸、按钮尺寸、Toast 时长、箭头头部长度等），应提取为命名常量 | low | plan-250325-photo-editor | 2026-03-25 | open |
| DEBT-002 | TextTool 通过 canvas.getOverlayCanvas().parentElement 访问 DOM，已在 canvas.js 中暴露 getCanvasArea() 方法 | low | plan-250325-photo-editor | 2026-03-25 | resolved |
| DEBT-003 | renderPropertyBar 中 innerHTML 拼接虽然当前安全（输入值受约束），但模式脆弱，建议改用 DOM API 创建元素 | low | plan-250325-photo-editor | 2026-03-25 | open |
| DEBT-004 | renderPropertyBar 中的事件监听器未存储引用，工具切换时无法移除，可能导致内存泄漏 | low | plan-250325-crop-buttons | 2026-03-25 | open |

---

## 维护规则

1. 技术债来源：功能迭代、代码扫描、设计评审等渠道发现的问题
2. 代码扫描问题处理：代码扫描发现的问题，如非本次变更新引入，应记录到本文件而非要求立即修复
3. 优先级定义：high-影响核心功能或用户体验，需尽快修复；medium-有替代方案，可排期修复；low-优化项，有空闲时处理
4. 状态流转：open -> in_progress -> resolved，resolved 状态保留 1 个月后归档
