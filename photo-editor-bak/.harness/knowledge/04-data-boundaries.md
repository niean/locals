# 数据边界

## 数据模型

### 应用状态 (state.js)

```javascript
{
  tool: 'crop',              // 当前工具: crop | brush | text | mosaic | shape
  image: Image | null,       // 原始图片对象
  imageType: 'image/png',    // 输入图片 MIME 类型
  imageFileName: string | null, // 原文件名（不含后缀）
  canvasWidth: number,
  canvasHeight: number,
  toolOptions: {
    crop: { ratio: 'free' | 'original' | '1:1' | '4:3' | ... },
    brush: { size: number, color: string },
    text: { fontSize: number, color: string, fontFamily: string },
    shape: { type: 'arrow' | 'rect', color: string, lineWidth: number },
    mosaic: { size: number },
  },
}
```

### 历史记录 (history.js)

```javascript
{
  stack: ImageData[],  // 画布快照数组
  index: number,       // 当前位置（-1 表示空）
  MAX_SIZE: 50,        // 最大记录数
}
```

## 存储格式

- 无持久化存储，所有数据在内存中
- 图片通过 FileReader + data URL 加载
- 导出通过 canvas.toDataURL() 生成

## 数据流

```
用户操作 -> Tool.onMouseEvent() -> canvas 绘制 -> history.push() -> 快照保存
撤销: history.undo() -> ImageData -> canvas.restoreFromImageData()
导出: canvas.toDataURL(mimeType) -> <a> download
```
