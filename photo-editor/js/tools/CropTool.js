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
    this.startX = 0;
    this.startY = 0;
    this.cropRect = null;
    this.actionButtons = null;
    this.isDraggingButtons = false;
    this.dragOffset = { x: 0, y: 0 };
    this._dragHandlers = null;
    this._boundOnDblClick = this._onDblClick.bind(this);
  }

  onActivate() {
    this.cropRect = null;
    canvas.getOverlayCanvas().addEventListener('dblclick', this._boundOnDblClick);
  }

  onDeactivate() {
    this.cropRect = null;
    this._removeActionButtons();
    canvas.getOverlayCanvas().removeEventListener('dblclick', this._boundOnDblClick);
    canvas.clearOverlay();
  }

  onMouseDown(e) {
    const p = this.getCanvasPoint(e);
    // 点击选区内不移除按钮（支持双击确认）
    if (this.cropRect) {
      const { x, y, w, h } = this.cropRect;
      if (p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h) {
        return;
      }
    }
    this._removeActionButtons();
    this.isDragging = true;
    this.startX = p.x;
    this.startY = p.y;
    this.cropRect = null;
  }

  onMouseMove(e) {
    if (!this.isDragging) return;
    const p = this.getCanvasPoint(e);
    this.cropRect = this._calcRect(this.startX, this.startY, p.x, p.y);
    this._drawCropOverlay();
  }

  onMouseUp() {
    if (!this.isDragging) return;
    this.isDragging = false;
    if (this.cropRect && this.cropRect.w > 5 && this.cropRect.h > 5) {
      this._drawCropOverlay();
      this._createActionButtons();
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

  _createActionButtons() {
    if (this.actionButtons) return;

    const container = document.createElement('div');
    container.className = 'c-crop-actions';

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'c-crop-actions__btn c-crop-actions__btn--confirm';
    confirmBtn.textContent = '确认';
    confirmBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._applyCrop();
      this._removeActionButtons();
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'c-crop-actions__btn c-crop-actions__btn--cancel';
    cancelBtn.textContent = '取消';
    cancelBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.cropRect = null;
      canvas.clearOverlay();
      this._removeActionButtons();
    });

    container.appendChild(confirmBtn);
    container.appendChild(cancelBtn);

    const canvasArea = canvas.getCanvasArea();
    canvasArea.appendChild(container);

    this.actionButtons = container;
    this._setupDragBehavior();
    this._positionActionButtons();
  }

  _positionActionButtons() {
    if (!this.actionButtons || !this.cropRect) return;

    const { x, y, w, h } = this.cropRect;
    const btnH = 32;
    const gap = 8;

    let btnX = x + w - 136;
    let btnY = y + h + gap;

    const canvasW = state.get('canvasWidth');
    const canvasH = state.get('canvasHeight');

    // 底部溢出 -> 上移
    if (btnY + btnH > canvasH) {
      btnY = y - btnH - gap;
    }

    // 顶部也溢出 -> 内嵌
    if (btnY < 0) {
      btnY = y + h - btnH - 4;
    }

    // 左边界溢出
    if (btnX < 0) {
      btnX = 0;
    }

    // 右边界溢出
    const btnW = 136;
    if (btnX + btnW > canvasW) {
      btnX = canvasW - btnW;
    }

    this.actionButtons.style.left = `${btnX}px`;
    this.actionButtons.style.top = `${btnY}px`;
  }

  _setupDragBehavior() {
    if (!this.actionButtons) return;

    const onMouseDown = (e) => {
      if (e.target.tagName === 'BUTTON') return;

      this.isDraggingButtons = true;
      this.actionButtons.classList.add('is-dragging');
      const rect = this.actionButtons.getBoundingClientRect();
      this.dragOffset = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      e.preventDefault();
    };

    const onMouseMove = (e) => {
      if (!this.isDraggingButtons) return;

      const canvasArea = canvas.getCanvasArea();
      const areaRect = canvasArea.getBoundingClientRect();
      const btnRect = this.actionButtons.getBoundingClientRect();

      let newX = e.clientX - areaRect.left - this.dragOffset.x;
      let newY = e.clientY - areaRect.top - this.dragOffset.y;

      // 边界限制
      newX = Math.max(0, Math.min(newX, areaRect.width - btnRect.width));
      newY = Math.max(0, Math.min(newY, areaRect.height - btnRect.height));

      this.actionButtons.style.left = `${newX}px`;
      this.actionButtons.style.top = `${newY}px`;
    };

    const onMouseUp = () => {
      if (this.isDraggingButtons) {
        this.isDraggingButtons = false;
        this.actionButtons.classList.remove('is-dragging');
      }
    };

    this.actionButtons.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    this._dragHandlers = { onMouseDown, onMouseMove, onMouseUp };
  }

  _removeActionButtons() {
    if (this._dragHandlers) {
      this.actionButtons.removeEventListener('mousedown', this._dragHandlers.onMouseDown);
      document.removeEventListener('mousemove', this._dragHandlers.onMouseMove);
      document.removeEventListener('mouseup', this._dragHandlers.onMouseUp);
      this._dragHandlers = null;
    }

    if (this.actionButtons) {
      this.actionButtons.remove();
      this.actionButtons = null;
    }

    this.isDraggingButtons = false;
  }

  _onDblClick(e) {
    if (!this.cropRect) return;
    const p = this.getCanvasPoint(e);
    const { x, y, w, h } = this.cropRect;
    if (p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h) {
      this._applyCrop();
      this._removeActionButtons();
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
