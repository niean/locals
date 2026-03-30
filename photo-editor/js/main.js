import * as state from './state.js';
import * as canvas from './canvas.js';
import * as history from './history.js';
import { loadImageFromFile, downloadCanvas, getMimeType, getExtension, extractFileName } from './utils/file.js';
import CropTool from './tools/CropTool.js';
import BrushTool from './tools/BrushTool.js';
import TextTool from './tools/TextTool.js';
import MosaicTool from './tools/MosaicTool.js';
import ShapeTool from './tools/ShapeTool.js';

const tools = {
  crop: new CropTool(),
  brush: new BrushTool(),
  text: new TextTool(),
  mosaic: new MosaicTool(),
  shape: new ShapeTool(),
};

let activeTool = null;

function init() {
  const mainCanvas = document.getElementById('mainCanvas');
  const overlayCanvas = document.getElementById('overlayCanvas');
  const wrapper = document.getElementById('canvasWrapper');

  canvas.init(mainCanvas, overlayCanvas, wrapper);

  setupToolbar();
  setupFileHandling();
  setupKeyboard();
  setupUndoRedoButtons();
  setupRotateButton();

  // 默认激活裁剪工具
  switchTool('crop');
}

function switchTool(toolName) {
  if (activeTool) {
    activeTool.deactivate();
  }

  // 更新工具栏高亮
  document.querySelectorAll('.c-toolbar__btn').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.tool === toolName);
  });

  state.set('tool', toolName);
  activeTool = tools[toolName];

  if (state.get('image')) {
    activeTool.activate();
  }

  updatePropertyBar();
}

function setupToolbar() {
  document.getElementById('toolbar').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tool]');
    if (!btn) return;
    switchTool(btn.dataset.tool);
  });
}

function updatePropertyBar() {
  const container = document.getElementById('toolOptions');
  container.innerHTML = '';
  if (activeTool && state.get('image')) {
    activeTool.renderPropertyBar(container);
  }
}

function setupFileHandling() {
  const fileInput = document.getElementById('fileInput');
  const btnOpen = document.getElementById('btnOpen');
  const wrapper = document.getElementById('canvasWrapper');
  const placeholder = document.getElementById('placeholder');

  btnOpen.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
    fileInput.value = '';
  });

  // 拖拽
  wrapper.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  });

  wrapper.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  });

  // 下载
  document.getElementById('btnDownload').addEventListener('click', handleDownload);

  async function handleFile(file) {
    try {
      const img = await loadImageFromFile(file);
      state.set('image', img);
      state.set('imageType', getMimeType(file));
      state.set('imageFileName', extractFileName(file));
      canvas.loadImage(img);
      placeholder.classList.add('u-hidden');

      // 重新激活当前工具
      if (activeTool) {
        activeTool.deactivate();
        activeTool.activate();
      }
      updatePropertyBar();
      updateUndoRedoButtons();
      document.getElementById('btnDownload').disabled = false;
      document.getElementById('downloadFormat').disabled = false;
      document.getElementById('btnRotate').disabled = false;
    } catch (err) {
      showToast(err.message);
    }
  }

  function handleDownload() {
    const mainC = canvas.getMainCanvas();
    const formatSelect = document.getElementById('downloadFormat');
    const selectedFormat = formatSelect.value;
    const mimeType = selectedFormat || state.get('imageType') || 'image/png';
    const ext = getExtension(mimeType);
    const fileName = state.get('imageFileName') || 'photo-edit';
    downloadCanvas(mainC, `${fileName}.${ext}`, mimeType);
  }
}

function setupKeyboard() {
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 's') {
        e.preventDefault();
        document.getElementById('btnDownload').click();
      }
    }
  });
}

function handleUndo() {
  const data = history.undo();
  if (data) {
    canvas.restoreFromImageData(data);
    updateUndoRedoButtons();
  }
}

function handleRedo() {
  const data = history.redo();
  if (data) {
    canvas.restoreFromImageData(data);
    updateUndoRedoButtons();
  }
}

function setupUndoRedoButtons() {
  document.getElementById('btnUndo').addEventListener('click', handleUndo);
  document.getElementById('btnRedo').addEventListener('click', handleRedo);
  history.onChange(updateUndoRedoButtons);
}

function setupRotateButton() {
  document.getElementById('btnRotate').addEventListener('click', () => {
    canvas.rotateImage();
    updateUndoRedoButtons();
  });
}

function updateUndoRedoButtons() {
  document.getElementById('btnUndo').disabled = !history.canUndo();
  document.getElementById('btnRedo').disabled = !history.canRedo();
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('is-visible');
  setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 2500);
}

document.addEventListener('DOMContentLoaded', init);
