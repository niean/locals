function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('请上传图片文件（jpg/png/webp）'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

function downloadCanvas(canvas, filename, mimeType) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL(mimeType, 0.92);
  link.click();
}

function getMimeType(file) {
  const typeMap = {
    'image/jpeg': 'image/jpeg',
    'image/png': 'image/png',
    'image/webp': 'image/webp',
  };
  return typeMap[file.type] || 'image/png';
}

function getExtension(mimeType) {
  const extMap = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };
  return extMap[mimeType] || 'png';
}

function extractFileName(file) {
  const name = file.name || '';
  const dotIndex = name.lastIndexOf('.');
  const baseName = dotIndex > 0 ? name.substring(0, dotIndex) : name;
  const cleaned = baseName.replace(/[\s\u00A0\u200B-\u200D\uFEFF]/g, '');
  return cleaned || 'photo-edit';
}

export { loadImageFromFile, downloadCanvas, getMimeType, getExtension, extractFileName };
