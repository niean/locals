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

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lineWidth;

    if (shapeType === 'rect') {
      ctx.strokeRect(
        Math.min(x1, x2),
        Math.min(y1, y2),
        Math.abs(x2 - x1),
        Math.abs(y2 - y1),
      );
    } else if (shapeType === 'arrow') {
      this._drawArrow(ctx, x1, y1, x2, y2, lineWidth);
    }
  }

  _drawArrow(ctx, x1, y1, x2, y2, lineWidth) {
    const headLen = Math.max(10, lineWidth * 4);
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

  renderPropertyBar(container) {
    const shapeType = state.getToolOption('shape', 'type');
    const color = state.getToolOption('shape', 'color');
    const lineWidth = state.getToolOption('shape', 'lineWidth');
    container.innerHTML = `
      <label class="c-property-bar__label">类型</label>
      <select id="shapeType">
        <option value="arrow" ${shapeType === 'arrow' ? 'selected' : ''}>箭头</option>
        <option value="rect" ${shapeType === 'rect' ? 'selected' : ''}>矩形</option>
      </select>
      <label class="c-property-bar__label">颜色</label>
      <input type="color" id="shapeColor" value="${color}">
      <label class="c-property-bar__label">线宽</label>
      <input type="number" id="shapeLineWidth" value="${lineWidth}" min="1" max="20">
    `;
    container.querySelector('#shapeType').addEventListener('change', (e) => {
      state.setToolOption('shape', 'type', e.target.value);
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
