import BaseTool from './BaseTool.js';
import * as canvas from '../canvas.js';
import * as state from '../state.js';
import * as history from '../history.js';
import { FILTERS, FILTER_PRESETS } from '../utils/filter.js';

class FilterTool extends BaseTool {
  constructor() {
    super('filter');
    this._originalImageData = null;
  }

  activate() {
    this._saveOriginal();
    super.activate();
  }

  deactivate() {
    if (state.get('image')) {
      history.push();
    }
    this._originalImageData = null;
    super.deactivate();
  }

  renderPropertyBar(container) {
    const currentPreset = state.getToolOption('filter', 'preset') || 'original';

    const buttonsHtml = FILTER_PRESETS.map((preset) => {
      const isActive = preset.id === currentPreset;
      return `
        <button class="c-property-bar__filter-btn ${isActive ? 'is-active' : ''}" data-preset="${preset.id}" title="${preset.label}" style="background: linear-gradient(135deg, ${preset.gradient[0]}, ${preset.gradient[1]});">
          <span class="c-property-bar__filter-btn__label">${preset.label}</span>
        </button>
      `;
    }).join('');

    container.innerHTML = `<div class="c-property-bar__filter-group">${buttonsHtml}</div>`;

    container.querySelectorAll('.c-property-bar__filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset;
        this.applyPreset(preset, container);
      });
    });
  }

  applyPreset(presetName, container) {
    const img = state.get('image');
    if (!img || !this._originalImageData) return;

    const mainCtx = canvas.getMainCtx();
    mainCtx.putImageData(this._originalImageData, 0, 0);

    const filterFn = FILTERS[presetName];
    if (filterFn) {
      const imageData = mainCtx.getImageData(0, 0, canvas.getMainCanvas().width, canvas.getMainCanvas().height);
      filterFn(imageData);
      mainCtx.putImageData(imageData, 0, 0);
    }

    state.setToolOption('filter', 'preset', presetName);
    this.renderPropertyBar(container);
  }

  _saveOriginal() {
    const mainCanvas = canvas.getMainCanvas();
    const mainCtx = canvas.getMainCtx();
    this._originalImageData = mainCtx.getImageData(0, 0, mainCanvas.width, mainCanvas.height);
  }
}

export default FilterTool;
