import BaseTool from './BaseTool.js';
import * as canvas from '../canvas.js';
import * as state from '../state.js';
import * as history from '../history.js';

class MosaicTool extends BaseTool {
  constructor() {
    super('mosaic');
    this.isDrawing = false;
  }

  onMouseDown(e) {
    this.isDrawing = true;
    const p = this.getCanvasPoint(e);
    this._applyMosaic(p.x, p.y);
  }

  onMouseMove(e) {
    if (!this.isDrawing) return;
    const p = this.getCanvasPoint(e);
    this._applyMosaic(p.x, p.y);
  }

  onMouseUp() {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    history.push();
  }

  _applyMosaic(cx, cy) {
    const blockSize = state.getToolOption('mosaic', 'size');
    const ctx = canvas.getMainCtx();
    const c = canvas.getMainCanvas();
    const radius = blockSize * 2;

    const startX = Math.max(0, Math.floor((cx - radius) / blockSize) * blockSize);
    const startY = Math.max(0, Math.floor((cy - radius) / blockSize) * blockSize);
    const endX = Math.min(c.width, cx + radius);
    const endY = Math.min(c.height, cy + radius);

    for (let x = startX; x < endX; x += blockSize) {
      for (let y = startY; y < endY; y += blockSize) {
        const w = Math.min(blockSize, c.width - x);
        const h = Math.min(blockSize, c.height - y);
        if (w <= 0 || h <= 0) continue;

        const data = ctx.getImageData(x, y, w, h);
        const pixels = data.data;

        let r = 0;
        let g = 0;
        let b = 0;
        const count = w * h;
        for (let i = 0; i < pixels.length; i += 4) {
          r += pixels[i];
          g += pixels[i + 1];
          b += pixels[i + 2];
        }
        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, y, w, h);
      }
    }
  }

  renderPropertyBar(container) {
    const size = state.getToolOption('mosaic', 'size');
    container.innerHTML = `
      <label class="c-property-bar__label">块大小</label>
      <input type="number" id="mosaicSize" value="${size}" min="3" max="50">
    `;
    container.querySelector('#mosaicSize').addEventListener('change', (e) => {
      state.setToolOption('mosaic', 'size', parseInt(e.target.value, 10));
    });
  }
}

export default MosaicTool;
