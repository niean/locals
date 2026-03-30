import * as state from './state.js';
import * as history from './history.js';

const MAX_DIM = 4096;

let mainCanvas = null;
let mainCtx = null;
let overlayCanvas = null;
let overlayCtx = null;
let wrapperEl = null;

function init(main, overlay, wrapper) {
  mainCanvas = main;
  mainCtx = main.getContext('2d');
  overlayCanvas = overlay;
  overlayCtx = overlay.getContext('2d');
  wrapperEl = wrapper;
  history.init(mainCanvas);
}

function loadImage(img) {
  let { width, height } = img;

  // 限制最大尺寸
  if (width > MAX_DIM || height > MAX_DIM) {
    const scale = Math.min(MAX_DIM / width, MAX_DIM / height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  // 适应容器
  const wrapRect = wrapperEl.getBoundingClientRect();
  const padding = 40;
  const maxW = wrapRect.width - padding * 2;
  const maxH = wrapRect.height - padding * 2;
  let displayW = width;
  let displayH = height;

  if (displayW > maxW || displayH > maxH) {
    const scale = Math.min(maxW / displayW, maxH / displayH);
    displayW = Math.round(displayW * scale);
    displayH = Math.round(displayH * scale);
  }

  mainCanvas.width = displayW;
  mainCanvas.height = displayH;
  overlayCanvas.width = displayW;
  overlayCanvas.height = displayH;

  state.set('canvasWidth', displayW);
  state.set('canvasHeight', displayH);

  mainCtx.drawImage(img, 0, 0, displayW, displayH);
  history.clear();
  history.push();
}

function getMainCanvas() {
  return mainCanvas;
}

function getMainCtx() {
  return mainCtx;
}

function getOverlayCanvas() {
  return overlayCanvas;
}

function getOverlayCtx() {
  return overlayCtx;
}

function getCanvasArea() {
  return mainCanvas ? mainCanvas.parentElement : null;
}

function clearOverlay() {
  overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
}

function restoreFromImageData(imageData) {
  mainCanvas.width = imageData.width;
  mainCanvas.height = imageData.height;
  overlayCanvas.width = imageData.width;
  overlayCanvas.height = imageData.height;
  mainCtx.putImageData(imageData, 0, 0);
}

function rotateImage() {
  if (!mainCanvas) return;

  const w = mainCanvas.width;
  const h = mainCanvas.height;
  const imageData = mainCtx.getImageData(0, 0, w, h);

  // 创建临时画布存储原图
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = w;
  tempCanvas.height = h;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.putImageData(imageData, 0, 0);

  // 旋转后宽高互换
  mainCanvas.width = h;
  mainCanvas.height = w;
  overlayCanvas.width = h;
  overlayCanvas.height = w;

  state.set('canvasWidth', h);
  state.set('canvasHeight', w);

  // 逆时针旋转 90 度
  mainCtx.save();
  mainCtx.translate(0, w);
  mainCtx.rotate(-Math.PI / 2);
  mainCtx.drawImage(tempCanvas, 0, 0);
  mainCtx.restore();

  history.push();
}

export {
  init,
  loadImage,
  getMainCanvas,
  getMainCtx,
  getOverlayCanvas,
  getOverlayCtx,
  clearOverlay,
  restoreFromImageData,
  getCanvasArea,
  rotateImage,
};
