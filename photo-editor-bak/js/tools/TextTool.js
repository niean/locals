import BaseTool from './BaseTool.js';
import * as canvas from '../canvas.js';
import * as state from '../state.js';
import * as history from '../history.js';

class TextTool extends BaseTool {
  constructor() {
    super('text');
    this.inputEl = null;
  }

  onMouseDown(e) {
    if (this.inputEl) {
      this._commitText();
      return;
    }
    const p = this.getCanvasPoint(e);
    this._createInput(p.x, p.y);
  }

  onDeactivate() {
    if (this.inputEl) {
      this._commitText();
    }
  }

  _createInput(x, y) {
    const container = canvas.getOverlayCanvas().parentElement;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'c-canvas-area__text-input';
    input.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y - 14}px;
      font-size: ${state.getToolOption('text', 'fontSize')}px;
      font-family: ${state.getToolOption('text', 'fontFamily')};
      color: ${state.getToolOption('text', 'color')};
      background: transparent;
      border: 1px dashed rgba(255,255,255,0.5);
      outline: none;
      padding: 2px 4px;
      min-width: 100px;
      z-index: 100;
    `;

    input.dataset.canvasX = x;
    input.dataset.canvasY = y;

    container.appendChild(input);
    input.focus();

    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        this._commitText();
      } else if (ev.key === 'Escape') {
        this._removeInput();
      }
    });

    this.inputEl = input;
  }

  _commitText() {
    if (!this.inputEl) return;
    const text = this.inputEl.value.trim();
    if (text) {
      const x = parseFloat(this.inputEl.dataset.canvasX);
      const y = parseFloat(this.inputEl.dataset.canvasY);
      const ctx = canvas.getMainCtx();
      const fontSize = state.getToolOption('text', 'fontSize');
      const fontFamily = state.getToolOption('text', 'fontFamily');
      const color = state.getToolOption('text', 'color');

      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = color;
      ctx.textBaseline = 'top';
      ctx.fillText(text, x, y);
      history.push();
    }
    this._removeInput();
  }

  _removeInput() {
    if (this.inputEl) {
      this.inputEl.remove();
      this.inputEl = null;
    }
  }

  renderPropertyBar(container) {
    const fontSize = state.getToolOption('text', 'fontSize');
    const color = state.getToolOption('text', 'color');
    const fontFamily = state.getToolOption('text', 'fontFamily');
    container.innerHTML = `
      <label class="c-property-bar__label">字号</label>
      <input type="number" id="textFontSize" value="${fontSize}" min="8" max="200">
      <label class="c-property-bar__label">颜色</label>
      <input type="color" id="textColor" value="${color}">
      <label class="c-property-bar__label">字体</label>
      <select id="textFont">
        <option value="Arial" ${fontFamily === 'Arial' ? 'selected' : ''}>Arial</option>
        <option value="serif" ${fontFamily === 'serif' ? 'selected' : ''}>Serif</option>
        <option value="monospace" ${fontFamily === 'monospace' ? 'selected' : ''}>Monospace</option>
      </select>
    `;
    container.querySelector('#textFontSize').addEventListener('change', (e) => {
      state.setToolOption('text', 'fontSize', parseInt(e.target.value, 10));
    });
    container.querySelector('#textColor').addEventListener('input', (e) => {
      state.setToolOption('text', 'color', e.target.value);
    });
    container.querySelector('#textFont').addEventListener('change', (e) => {
      state.setToolOption('text', 'fontFamily', e.target.value);
    });
  }
}

export default TextTool;
