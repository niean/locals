function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export { clamp, distance };
