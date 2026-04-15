// js/utils/filter.js

/**
 * 滤镜预设像素处理函数。每个函数接收 ImageData 并就地修改其 data 数组。
 * 所有函数都是纯函数（不依赖外部状态，不产生副作用）。
 */

/**
 * 鲜明: iPhone 风格 -- 高饱和度 + 轻度亮度提升 + 暖色倾向
 * 核心：以饱和度/鲜亮度为主轴，不对比度处理，保持通透感
 */
export function applyVivid(imageData) {
  const data = imageData.data;
  const saturation = 1.5;
  const brightnessBoost = 8;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Step 1: HSL 饱和度提升
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const chroma = max - min;

    if (chroma > 0) {
      // 饱和度乘法（基于色度）
      const satBoost = Math.min(255, chroma * saturation) / chroma;
      const mid = (max + min) / 2;
      r = clamp(mid + satBoost * (r - mid));
      g = clamp(mid + satBoost * (g - mid));
      b = clamp(mid + satBoost * (b - mid));
    }

    // Step 2: 轻度整体亮度提升
    r = clamp(r + brightnessBoost);
    g = clamp(g + brightnessBoost);
    b = clamp(b + brightnessBoost);

    // Step 3: 暖色偏移（iPhone 鲜明偏暖黄）
    r = clamp(r + 6);
    g = clamp(g + 3);
    b = clamp(b - 4);

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
}

/**
 * 暖色: 增加红/绿色通道，暖色调偏移
 */
export function applyWarm(imageData) {
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(data[i] + 15);
    data[i + 1] = clamp(data[i + 1] + 8);
    data[i + 2] = clamp(data[i + 2] - 10);
  }
}

/**
 * 冷色: 增加蓝色通道，冷色调偏移
 */
export function applyCool(imageData) {
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(data[i] - 10);
    data[i + 1] = clamp(data[i + 1] + 5);
    data[i + 2] = clamp(data[i + 2] + 15);
  }
}

/**
 * 单色: 转灰度（亮度加权平均）
 */
export function applyMono(imageData) {
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }
}

/**
 * 戏剧效果: 高对比度 + 暗化中间调
 */
export function applyDramatic(imageData) {
  const data = imageData.data;
  const contrast = 1.6;
  const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));

  for (let i = 0; i < data.length; i += 4) {
    let r = factor * (data[i] - 128) + 128;
    let g = factor * (data[i + 1] - 128) + 128;
    let b = factor * (data[i + 2] - 128) + 128;

    r = r * 0.85;
    g = g * 0.85;
    b = b * 0.85;

    data[i] = clamp(r);
    data[i + 1] = clamp(g);
    data[i + 2] = clamp(b);
  }
}

/** 滤镜预设映射 */
export const FILTERS = {
  original: null,
  vivid: applyVivid,
  warm: applyWarm,
  cool: applyCool,
  mono: applyMono,
  dramatic: applyDramatic,
};

/** 滤镜显示信息 */
export const FILTER_PRESETS = [
  { id: 'original', label: '原片', gradient: ['#888888', '#555555'] },
  { id: 'vivid', label: '鲜明', gradient: ['#ff8866', '#ffbb44'] },
  { id: 'warm', label: '暖色', gradient: ['#ff9900', '#ff6600'] },
  { id: 'cool', label: '冷色', gradient: ['#00aaff', '#0066ff'] },
  { id: 'mono', label: '单色', gradient: ['#888888', '#333333'] },
  { id: 'dramatic', label: '戏剧', gradient: ['#444444', '#000000'] },
];

function clamp(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}
