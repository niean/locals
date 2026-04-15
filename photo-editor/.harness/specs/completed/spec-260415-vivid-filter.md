# 鲜明滤镜 iPhone 风格调整 Spec

- 创建时间: 2026-04-15
- 状态: completed
- 任务来源: 用户需求 -- 鲜明滤镜参考 iPhone 样式，与戏剧滤镜区分

## Goal

重写"鲜明"(vivid)滤镜算法，使其接近 iPhone 照片编辑中的"鲜明"风格：色彩饱和但通透、对比度温和、整体明亮自然。同时与"戏剧"滤镜形成明显区分（戏剧=高对比+压暗，鲜明=轻对比+增饱和+暖色调）。

## Architecture

仅修改 `js/utils/filter.js` 中的 `applyVivid` 函数，其余文件（FilterTool.js、CSS、HTML）不变。纯像素级处理，无外部依赖。

## Components

### js/utils/filter.js - applyVivid 函数

- 职责: 对 ImageData 进行 iPhone 风格的鲜明效果处理
- 算法步骤:
  1. **轻度对比度提升** (contrast = 1.1): 温和增强明暗对比，避免画面变暗
  2. **智能饱和度提升** (saturation = 1.35): 基于灰度值按比例增强 RGB 通道，接近 HSL 色彩空间的饱和度调整
  3. **轻微暖色偏移**: R 通道 +3, B 通道 -2，模拟 iPhone 鲜明滤镜的暖色调倾向
- 接口: `export function applyVivid(imageData)` -- 就地修改 ImageData.data
- 依赖: clamp 工具函数（已有）

### js/utils/filter.js - FILTER_PRESETS 显示信息

- 职责: 更新鲜明滤镜的渐变预览色，更贴近实际效果（橙红渐变 -> 更明亮的暖色渐变）

## Data Flow

```
用户点击"鲜明"预设按钮
  -> FilterTool.applyPreset('vivid')
  -> 恢复原始图片
  -> FILTERS.vivid(imageData) 即 applyVivid(imageData)
  -> 像素处理循环:
     1. 对比度调整 (factor based on contrast=1.1)
     2. 饱和度提升 (gray + 1.35 * (channel - gray))
     3. 暖色偏移 (R+=3, B-=2)
  -> 写回 Canvas
```

## UI Design

### 滤镜预设按钮渐变更新

当前鲜明渐变: `['#ff5555', '#ff9900']`（偏红橙，较暗）
更新为: `['#ff8866', '#ffbb44']`（更明亮通透的暖色渐变）

## Error Handling

- clamp 函数确保所有像素值在 0-255 范围内，防止溢出
- 无其他异常场景（纯像素处理，不依赖外部状态）

## Constraints

- 纯客户端像素处理，性能要求与现有滤镜一致
- 保持与其他滤镜相同的处理模式（单循环遍历像素）

## Acceptance Criteria

- [ ] 鲜明滤镜效果与戏剧效果有明显区别（鲜明明亮通透，戏剧高对比暗调）
- [ ] 鲜明滤镜接近 iPhone 鲜明风格：色彩饱和但不溢出、整体明亮、轻微暖色调
- [ ] 滤镜预设按钮渐变色更新为更明亮的暖色
- [ ] 语法检查通过 (node --check)
- [ ] 仅修改 filter.js 文件，不影响其他模块
