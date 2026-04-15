# Spec: 浏览器Tab栏设置图标

<!-- SUMMARY: 为PhotoEditor添加favicon图标，使用抽象圆角方形+对勾的轮廓线SVG图标，静态标题 -->

## 目标

为 PhotoEditor 浏览器 Tab 添加 favicon 图标，提升品牌识别度和用户体验。

## 范围

- 新增 1 个文件：`favicon.svg`
- 修改 1 个文件：`index.html`（添加 link 标签）

## 方案

### 图标设计
- **造型**：圆角方形外框 + 内部对勾标记
- **风格**：轮廓线风格（stroke 描边，无填充）
- **颜色**：自适应（浏览器会根据系统主题处理 SVG 描边颜色）
- **尺寸**：SVG viewBox `0 0 32 32`

### 实现方式
1. 创建 `favicon.svg` 在项目根目录
2. 在 `index.html` 的 `<head>` 中添加 `<link rel="icon" href="favicon.svg" type="image/svg+xml">`
3. 保持 `<title>PhotoEditor</title>` 静态不变

## 验收标准

1. [ ] `favicon.svg` 文件存在于项目根目录
2. [ ] `index.html` head 中包含 `<link rel="icon">` 标签
3. [ ] 浏览器打开页面时 Tab 显示 favicon 图标
4. [ ] 图标为圆角方形+对勾的轮廓线风格
5. [ ] 标题保持静态 "PhotoEditor" 不变
