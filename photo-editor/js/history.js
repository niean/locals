const MAX_SIZE = 50;
let stack = [];
let index = -1;
let canvas = null;
let ctx = null;
let onChangeCallback = null;

function init(canvasEl) {
  canvas = canvasEl;
  ctx = canvas.getContext('2d');
  stack = [];
  index = -1;
}

function push() {
  if (!canvas || canvas.width === 0 || canvas.height === 0) return;
  // 丢弃 index 之后的记录
  stack = stack.slice(0, index + 1);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  stack.push(data);
  if (stack.length > MAX_SIZE) {
    stack.shift();
  } else {
    index += 1;
  }
  if (index < 0) index = 0;
  if (onChangeCallback) onChangeCallback();
}

function undo() {
  if (!canUndo()) return null;
  index -= 1;
  if (onChangeCallback) onChangeCallback();
  return stack[index];
}

function redo() {
  if (!canRedo()) return null;
  index += 1;
  if (onChangeCallback) onChangeCallback();
  return stack[index];
}

function canUndo() {
  return index > 0;
}

function canRedo() {
  return index < stack.length - 1;
}

function clear() {
  stack = [];
  index = -1;
}

function onChange(fn) {
  onChangeCallback = fn;
}

export { init, push, undo, redo, canUndo, canRedo, clear, onChange };
