import BaseTool from './BaseTool.js';
import * as canvas from '../canvas.js';
import * as state from '../state.js';
import * as history from '../history.js';

class BrushTool extends BaseTool {
  constructor() {
    super('brush');
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;
  }

  onMouseDown(e) {
    this.isDrawing = true;
    const p = this.getCanvasPoint(e);
    this.lastX = p.x;
    this.lastY = p.y;

    const ctx = canvas.getMainCtx();
    ctx.beginPath();
    ctx.arc(p.x, p.y, state.getToolOption('brush', 'size') / 2, 0, Math.PI * 2);
    ctx.fillStyle = state.getToolOption('brush', 'color');
    ctx.fill();
  }

  onMouseMove(e) {
    if (!this.isDrawing) return;
    const p = this.getCanvasPoint(e);
    const ctx = canvas.getMainCtx();

    ctx.beginPath();
    ctx.moveTo(this.lastX, this.lastY);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = state.getToolOption('brush', 'color');
    ctx.lineWidth = state.getToolOption('brush', 'size');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    this.lastX = p.x;
    this.lastY = p.y;
  }

  onMouseUp() {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    history.push();
  }

  renderPropertyBar(container) {
    const size = state.getToolOption('brush', 'size');
    const color = state.getToolOption('brush', 'color');
    container.innerHTML = `
      <label class="c-property-bar__label">大小</label>
      <input type="number" id="brushSize" value="${size}" min="1" max="100">
      <label class="c-property-bar__label">颜色</label>
      <input type="color" id="brushColor" value="${color}">
    `;
    container.querySelector('#brushSize').addEventListener('change', (e) => {
      state.setToolOption('brush', 'size', parseInt(e.target.value, 10));
    });
    container.querySelector('#brushColor').addEventListener('input', (e) => {
      state.setToolOption('brush', 'color', e.target.value);
    });
  }
}

export default BrushTool;
