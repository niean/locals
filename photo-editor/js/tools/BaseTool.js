import * as canvas from '../canvas.js';

class BaseTool {
  constructor(name) {
    this.name = name;
    this.isActive = false;
    this._bindHandlers();
  }

  _bindHandlers() {
    this._onMouseDown = this.onMouseDown.bind(this);
    this._onMouseMove = this.onMouseMove.bind(this);
    this._onMouseUp = this.onMouseUp.bind(this);
  }

  activate() {
    this.isActive = true;
    const overlay = canvas.getOverlayCanvas();
    overlay.addEventListener('mousedown', this._onMouseDown);
    overlay.addEventListener('mousemove', this._onMouseMove);
    overlay.addEventListener('mouseup', this._onMouseUp);
    this.onActivate();
  }

  deactivate() {
    this.isActive = false;
    const overlay = canvas.getOverlayCanvas();
    overlay.removeEventListener('mousedown', this._onMouseDown);
    overlay.removeEventListener('mousemove', this._onMouseMove);
    overlay.removeEventListener('mouseup', this._onMouseUp);
    canvas.clearOverlay();
    this.onDeactivate();
  }

  getCanvasPoint(e) {
    const overlay = canvas.getOverlayCanvas();
    const rect = overlay.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (overlay.width / rect.width),
      y: (e.clientY - rect.top) * (overlay.height / rect.height),
    };
  }

  // 子类重写
  onActivate() {}
  onDeactivate() {}
  onMouseDown(e) {}
  onMouseMove(e) {}
  onMouseUp(e) {}
  renderPropertyBar(container) {}
}

export default BaseTool;
