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
    const scale = canvas.getScale();
    const blockSize = Math.max(1, Math.round(state.getToolOption('mosaic', 'size') * scale));
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
    const currentSize = state.getToolOption('mosaic', 'size');
    const sizeOptions = [
      { value: 1, dot: 4 },
      { value: 2, dot: 6 },
      { value: 5, dot: 10 },
      { value: 10, dot: 14 },
    ];
    const buttons = sizeOptions.map((opt) => {
      const active = opt.value === currentSize ? ' is-active' : '';
      return `<button class="c-property-bar__size-dot${active}" data-size="${opt.value}" title="${opt.value}">
        <span class="c-property-bar__size-dot__circle" style="width:${opt.dot}px;height:${opt.dot}px"></span>
      </button>`;
    }).join('');
    container.innerHTML = `
      <label class="c-property-bar__label">块大小</label>
      ${buttons}
    `;
    container.querySelectorAll('.c-property-bar__size-dot').forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.dataset.size, 10);
        state.setToolOption('mosaic', 'size', val);
        container.querySelectorAll('.c-property-bar__size-dot').forEach((b) => {
          b.classList.toggle('is-active', b === btn);
        });
      });
    });
  }
}

export default MosaicTool;
