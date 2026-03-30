const listeners = {};

const state = {
  tool: 'crop',
  image: null,
  imageType: 'image/png',
  imageFileName: null,
  canvasWidth: 0,
  canvasHeight: 0,
  toolOptions: {
    crop: { ratio: 'original' },
    brush: { size: 5, color: '#ff0000' },
    text: { fontSize: 24, color: '#000000', fontFamily: 'Arial' },
    shape: { type: 'arrow', color: '#ff0000', lineWidth: 2 },
    mosaic: { size: 10 },
  },
};

function get(key) {
  return state[key];
}

function set(key, value) {
  const old = state[key];
  state[key] = value;
  emit(key, value, old);
}

function getToolOption(tool, key) {
  return state.toolOptions[tool]?.[key];
}

function setToolOption(tool, key, value) {
  if (state.toolOptions[tool]) {
    state.toolOptions[tool][key] = value;
    emit('toolOption', { tool, key, value });
  }
}

function on(event, fn) {
  if (!listeners[event]) {
    listeners[event] = [];
  }
  listeners[event].push(fn);
}

function off(event, fn) {
  if (!listeners[event]) return;
  listeners[event] = listeners[event].filter((f) => f !== fn);
}

function emit(event, ...args) {
  if (!listeners[event]) return;
  listeners[event].forEach((fn) => fn(...args));
}

export { get, set, getToolOption, setToolOption, on, off, emit };
