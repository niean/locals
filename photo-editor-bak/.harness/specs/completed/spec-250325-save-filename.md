# 记住原文件名 设计 Spec

- 创建时间: 2026-03-25
- 状态: active
- 任务来源: 下载时记住原文件名，而非固定使用 photo-edit.{ext}

## Goal

文件上传时记住原文件名，下载时默认使用该文件名（根据导出格式拼接后缀），提升用户体验。

## Architecture

在 state 中新增 `imageFileName` 字段存储文件名（不含后缀），文件上传时提取并保存，下载时使用该文件名拼接导出格式对应的后缀。

## Components

### state.js
- 职责: 新增 `imageFileName` 状态字段
- 接口: `state.get('imageFileName')` / `state.set('imageFileName', name)`
- 依赖: 无新增

### file.js
- 职责: 新增 `extractFileName(file)` 函数，从 File 对象提取文件名（不含后缀）
- 接口: `extractFileName(file: File): string`
- 依赖: 无新增

### main.js
- 职责: 上传时调用 `extractFileName` 并存储到 state；下载时使用 `imageFileName` 作为文件名
- 接口: 修改 `handleFile` 和 `handleDownload` 函数
- 依赖: state.js, file.js

## Data Flow

```
用户上传文件 -> handleFile() -> extractFileName(file) -> state.set('imageFileName', name)
用户点击下载 -> handleDownload() -> state.get('imageFileName') -> downloadCanvas(canvas, filename, mimeType)
```

## Data Model

```javascript
// state.js 新增字段
{
  imageFileName: string | null,  // 原文件名（不含后缀），如 "photo"
}
```

## UI Design

无 UI 变更。下载行为变更：
- 上传 `photo.jpg`，选择 PNG 导出 -> 下载 `photo.png`
- 上传 `截图.png`，选择 JPG 导出 -> 下载 `截图.jpg`
- 未上传文件时下载按钮禁用，不影响

## Error Handling

- 文件名为空或异常时，fallback 为 `photo-edit`
- 文件名含特殊字符时，浏览器 download 属性会自动处理

## Constraints

- 仅支持通过按钮或拖拽上传的文件，无法处理直接粘贴的图片
- 文件名编码遵循浏览器默认行为

## Acceptance Criteria
- [ ] 上传文件后，state 中存储正确的 `imageFileName`
- [ ] 下载时使用原文件名 + 导出格式后缀
- [ ] 文件名不含后缀时仍能正常工作
- [ ] 语法验证通过（node --check）
