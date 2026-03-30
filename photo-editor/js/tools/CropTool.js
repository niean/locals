import BaseTool from './BaseTool.js';
import * as canvas from '../canvas.js';
import * as state from '../state.js';
import * as history from '../history.js';

const RATIOS = {
  free: null,
  original: 'original',
  '1:1': 1,
  '4:3': 4 / 3,
  '3:4': 3 / 4,
  '16:9': 16 / 9,
  '9:16': 9 / 16,
};

class CropTool extends BaseTool {
  constructor() {
    super('crop');
    this.isDragging = false;
    this.isMoving = false;
    this.startX = 0;
    this.startY = 0;
    this.moveOffsetX = 0;
    this.moveOffsetY = 0;
    this.cropRect = null;
    this._boundOnDblClick = this._onDblClick.bind(this);
    this._boundOnKeyDown = this._onKeyDown.bind(this);
  }

  onActivate() {
    this.cropRect = null;
    canvas.getOverlayCanvas().addEventListener('dblclick', this._boundOnDblClick);
    document.addEventListener('keydown', this._boundOnKeyDown);
  }

  onDeactivate() {
    this.cropRect = null;
    canvas.getOverlayCanvas().removeEventListener('dblclick', this._boundOnDblClick);
    document.removeEventListener('keydown', this._boundOnKeyDown);
    canvas.clearOverlay();
  }

  onMouseDown(e) {
    const p = this.getCanvasPoint(e);
    // 选区内点击启动移动
    if (this.cropRect) {
      const { x, y, w, h } = this.cropRect;
      if (p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h) {
        this.isMoving = true;
        this.moveOffsetX = p.x - x;
        this.moveOffsetY = p.y - y;
        return;
      }
    }
    this.isDragging = true;
    this.startX = p.x;
    this.startY = p.y;
    this.cropRect = null;
  }

  onMouseMove(e) {
    const p = this.getCanvasPoint(e);
    if (this.isMoving && this.cropRect) {
      const { w, h } = this.cropRect;
      const cw = state.get('canvasWidth');
      const ch = state.get('canvasHeight');
      this.cropRect.x = Math.round(Math.max(0, Math.min(p.x - this.moveOffsetX, cw - w)));
      this.cropRect.y = Math.round(Math.max(0, Math.min(p.y - this.moveOffsetY, ch - h)));
      this._drawCropOverlay();
      return;
    }
    if (!this.isDragging) return;
    this.cropRect = this._calcRect(this.startX, this.startY, p.x, p.y);
    this._drawCropOverlay();
  }

  onMouseUp() {
    if (this.isMoving) {
      this.isMoving = false;
      return;
    }
    if (!this.isDragging) return;
    this.isDragging = false;
    if (this.cropRect && this.cropRect.w > 5 && this.cropRect.h > 5) {
      this._drawCropOverlay();
    }
  }

  _calcRect(x1, y1, x2, y2) {
    let x = Math.min(x1, x2);
    let y = Math.min(y1, y2);
    let w = Math.abs(x2 - x1);
    let h = Math.abs(y2 - y1);

    const ratioKey = state.getToolOption('crop', 'ratio') || 'original';
    const ratioVal = RATIOS[ratioKey];

    if (ratioVal === 'original') {
      const cw = state.get('canvasWidth');
      const ch = state.get('canvasHeight');
      if (cw && ch) {
        const r = cw / ch;
        if (w / h > r) {
          w = h * r;
        } else {
          h = w / r;
        }
      }
    } else if (typeof ratioVal === 'number') {
      if (w / h > ratioVal) {
        w = h * ratioVal;
      } else {
        h = w / ratioVal;
      }
    }

    // 限制在画布内
    const cw = state.get('canvasWidth');
    const ch = state.get('canvasHeight');
    x = Math.max(0, Math.min(x, cw - w));
    y = Math.max(0, Math.min(y, ch - h));

    return { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) };
  }

  _drawCropOverlay() {
    const ctx = canvas.getOverlayCtx();
    const oc = canvas.getOverlayCanvas();
    ctx.clearRect(0, 0, oc.width, oc.height);
    if (!this.cropRect) return;

    const { x, y, w, h } = this.cropRect;

    // 暗色遮罩
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, oc.width, oc.height);

    // 清除选区
    ctx.clearRect(x, y, w, h);

    // 选区边框
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    ctx.setLineDash([]);

    // 三等分线
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 0.5;
    const thirdW = w / 3;
    const thirdH = h / 3;
    for (let i = 1; i <= 2; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x + thirdW * i, y);
      ctx.lineTo(x + thirdW * i, y + h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y + thirdH * i);
      ctx.lineTo(x + w, y + thirdH * i);
      ctx.stroke();
    }
  }

  _onKeyDown(e) {
    if (e.key === 'Escape' && this.cropRect) {
      this.cropRect = null;
      this.isMoving = false;
      canvas.clearOverlay();
    }
  }

  _onDblClick(e) {
    if (!this.cropRect) return;
    const p = this.getCanvasPoint(e);
    const { x, y, w, h } = this.cropRect;
    if (p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h) {
      this._applyCrop();
    }
  }

  _applyCrop() {
    if (!this.cropRect) return;
    const { x, y, w, h } = this.cropRect;
    const mainCtx = canvas.getMainCtx();
    const imageData = mainCtx.getImageData(x, y, w, h);

    const mainC = canvas.getMainCanvas();
    const overlayC = canvas.getOverlayCanvas();
    mainC.width = w;
    mainC.height = h;
    overlayC.width = w;
    overlayC.height = h;
    mainCtx.putImageData(imageData, 0, 0);
    canvas.clearOverlay();

    state.set('canvasWidth', w);
    state.set('canvasHeight', h);
    history.push();
    this.cropRect = null;
  }

  renderPropertyBar(container) {
    const currentRatio = state.getToolOption('crop', 'ratio') || 'original';
    container.innerHTML = `
      <label class="c-property-bar__label">比例</label>
      <select id="cropRatio">
        ${Object.keys(RATIOS).map((key) => `<option value="${key}" ${key === currentRatio ? 'selected' : ''}>${key}</option>`).join('')}
      </select>
    `;
    container.querySelector('#cropRatio').addEventListener('change', (e) => {
      state.setToolOption('crop', 'ratio', e.target.value);
    });
  }
}

export default CropTool;
