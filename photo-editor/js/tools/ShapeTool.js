import BaseTool from './BaseTool.js';
import * as canvas from '../canvas.js';
import * as state from '../state.js';
import * as history from '../history.js';

class ShapeTool extends BaseTool {
  constructor() {
    super('shape');
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.snapshotData = null;
  }

  onMouseDown(e) {
    this.isDragging = true;
    const p = this.getCanvasPoint(e);
    this.startX = p.x;
    this.startY = p.y;
    const mainC = canvas.getMainCanvas();
    const mainCtx = canvas.getMainCtx();
    this.snapshotData = mainCtx.getImageData(0, 0, mainC.width, mainC.height);
  }

  onMouseMove(e) {
    if (!this.isDragging) return;
    const p = this.getCanvasPoint(e);

    const mainCtx = canvas.getMainCtx();
    mainCtx.putImageData(this.snapshotData, 0, 0);

    this._drawShape(mainCtx, this.startX, this.startY, p.x, p.y);
  }

  onMouseUp(e) {
    if (!this.isDragging) return;
    this.isDragging = false;
    const p = this.getCanvasPoint(e);

    const mainCtx = canvas.getMainCtx();
    mainCtx.putImageData(this.snapshotData, 0, 0);
    this._drawShape(mainCtx, this.startX, this.startY, p.x, p.y);
    this.snapshotData = null;
    history.push();
  }

  _drawShape(ctx, x1, y1, x2, y2) {
    const shapeType = state.getToolOption('shape', 'type');
    const color = state.getToolOption('shape', 'color');
    const lineWidth = state.getToolOption('shape', 'lineWidth');
    const scale = canvas.getScale();

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lineWidth * scale;

    if (shapeType === 'rect') {
      ctx.strokeRect(
        Math.min(x1, x2),
        Math.min(y1, y2),
        Math.abs(x2 - x1),
        Math.abs(y2 - y1),
      );
    } else if (shapeType === 'arrow') {
      this._drawArrow(ctx, x1, y1, x2, y2, lineWidth * scale);
    } else if (shapeType === 'ellipse') {
      this._drawEllipse(ctx, x1, y1, x2, y2);
    }
  }

  _drawArrow(ctx, x1, y1, x2, y2, lineWidth) {
    const scale = canvas.getScale();
    const headLen = Math.max(10 * scale, lineWidth * 4);
    const angle = Math.atan2(y2 - y1, x2 - x1);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - headLen * Math.cos(angle - Math.PI / 6),
      y2 - headLen * Math.sin(angle - Math.PI / 6),
    );
    ctx.lineTo(
      x2 - headLen * Math.cos(angle + Math.PI / 6),
      y2 - headLen * Math.sin(angle + Math.PI / 6),
    );
    ctx.closePath();
    ctx.fill();
  }

  _drawEllipse(ctx, x1, y1, x2, y2) {
    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;
    const radiusX = Math.abs(x2 - x1) / 2;
    const radiusY = Math.abs(y2 - y1) / 2;

    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  renderPropertyBar(container) {
    const shapeType = state.getToolOption('shape', 'type');
    const color = state.getToolOption('shape', 'color');
    const lineWidth = state.getToolOption('shape', 'lineWidth');

    container.innerHTML = `
      <label class="c-property-bar__label">类型</label>
      <button class="c-property-bar__type-btn ${shapeType === 'arrow' ? 'is-active' : ''}" data-type="arrow">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14"/>
          <path d="M12 5l7 7-7 7"/>
        </svg>
        <span>箭头</span>
      </button>
      <button class="c-property-bar__type-btn ${shapeType === 'rect' ? 'is-active' : ''}" data-type="rect">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="4" y="4" width="16" height="16"/>
        </svg>
        <span>矩形</span>
      </button>
      <button class="c-property-bar__type-btn ${shapeType === 'ellipse' ? 'is-active' : ''}" data-type="ellipse">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <ellipse cx="12" cy="12" rx="9" ry="7"/>
        </svg>
        <span>圆形</span>
      </button>
      <div class="c-property-bar__divider"></div>
      <label class="c-property-bar__label">颜色</label>
      <input type="color" id="shapeColor" value="${color}">
      <label class="c-property-bar__label">线宽</label>
      <input type="number" id="shapeLineWidth" value="${lineWidth}" min="1" max="20">
    `;

    container.querySelectorAll('.c-property-bar__type-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.setToolOption('shape', 'type', btn.dataset.type);
        this.renderPropertyBar(container);
      });
    });

    container.querySelector('#shapeColor').addEventListener('input', (e) => {
      state.setToolOption('shape', 'color', e.target.value);
    });

    container.querySelector('#shapeLineWidth').addEventListener('change', (e) => {
      state.setToolOption('shape', 'lineWidth', parseInt(e.target.value, 10));
    });
  }
}

export default ShapeTool;
