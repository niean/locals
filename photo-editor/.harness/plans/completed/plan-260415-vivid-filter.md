# 鲜明滤镜 iPhone 风格调整 Implementation Plan

- 创建时间: 2026-04-15
- 状态: completed
- 关联 spec: .harness/specs/completed/spec-260415-vivid-filter.md

> **For agentic workers:** REQUIRED SUB-SKILL: Use .harness/framework/skills/superpowers/subagent-driven-development.md (recommended) or .harness/framework/skills/superpowers/executing-plans.md to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重写鲜明滤镜算法为 iPhone 风格（轻对比+增饱和+暖色调），更新预设按钮渐变色

**Architecture:** 仅修改 `js/utils/filter.js` 中的 `applyVivid` 函数和 `FILTER_PRESETS` 数组，纯像素级处理，不改变接口签名或影响其他模块。

**Tech Stack:** JavaScript (ES6 Modules), Canvas ImageData 像素处理

---

### T1: 重写 applyVivid 滤镜算法

**Files:**
- Modify: `js/utils/filter.js:11-28`

- [x] **S 1: 替换 applyVivid 函数实现**

将当前的 applyVivid 函数（对比度 1.3 + 饱和度 1.2）替换为 iPhone 风格算法：

```javascript
/**
 * 鲜明: iPhone 风格 -- 轻度对比 + 智能饱和度 + 暖色调
 */
export function applyVivid(imageData) {
  const data = imageData.data;
  const contrast = 1.1;
  const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
  const saturation = 1.35;

  for (let i = 0; i < data.length; i += 4) {
    // Step 1: 轻度对比度提升
    let r = factor * (data[i] - 128) + 128;
    let g = factor * (data[i + 1] - 128) + 128;
    let b = factor * (data[i + 2] - 128) + 128;

    // Step 2: 智能饱和度提升
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    r = clamp(gray + saturation * (r - gray));
    g = clamp(gray + saturation * (g - gray));
    b = clamp(gray + saturation * (b - gray));

    // Step 3: 轻微暖色偏移 (iPhone 鲜明偏暖)
    r = clamp(r + 3);
    b = clamp(b - 2);

    data[i] = clamp(r);
    data[i + 1] = clamp(g);
    data[i + 2] = clamp(b);
  }
}
```

- [x] **S 2: 验证语法**

Run: `node --check js/utils/filter.js`
Expected: PASS (no output)

### T2: 更新滤镜预设按钮渐变色

**Files:**
- Modify: `js/utils/filter.js:104-111` (FILTER_PRESETS 数组)

- [x] **S 1: 更新鲜明预设的渐变色**

将鲜明滤镜的渐变色从 `['#ff5555', '#ff9900']` 改为 `['#ff8866', '#ffbb44']`：

```javascript
export const FILTER_PRESETS = [
  { id: 'original', label: '原片', gradient: ['#888888', '#555555'] },
  { id: 'vivid', label: '鲜明', gradient: ['#ff8866', '#ffbb44'] },  // 更新
  { id: 'warm', label: '暖色', gradient: ['#ff9900', '#ff6600'] },
  { id: 'cool', label: '冷色', gradient: ['#00aaff', '#0066ff'] },
  { id: 'mono', label: '单色', gradient: ['#888888', '#333333'] },
  { id: 'dramatic', label: '戏剧', gradient: ['#444444', '#000000'] },
];
```

- [x] **S 2: 验证语法**

Run: `node --check js/utils/filter.js`
Expected: PASS (no output)

### T3: 整体验证

**Files:**
- Verify: 所有 JS 文件

- [x] **S 1: 运行全部文件语法检查**

Run: `for f in js/*.js js/tools/*.js js/utils/*.js; do node --check "$f"; done`
Expected: 全部通过，无输出

---

## 变更记录
| 时间 | 变更内容 |

## 发现的技术债
- 无
