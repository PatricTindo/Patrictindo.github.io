const colors = [
  ['Strawberry', '#f2635d'], ['Sunshine', '#ffd45c'], ['Meadow', '#94d8be'],
  ['Sky', '#80c8e8'], ['Lavender', '#bca8e8'], ['Butter', '#f4b778'],
  ['Peach', '#f4a261'], ['Rose', '#e98bb3'], ['Ocean', '#468faf'],
  ['Leaf', '#5fa66e'], ['Plum', '#8b5fbf'], ['Ink', '#272229']
].map(([name, value]) => ({ name, value }));

const pageNames = ['Giraffe safari', 'Flower garden', 'Fresh greens', 'Vegetable friends'];
const pageSources = ['pages/giraffe.jpg', 'pages/flowergarden.jpg', 'pages/Greens.png', 'pages/Vegetables.jpg?v=2'];
const canvas = document.querySelector('#drawing-canvas');
const context = canvas.getContext('2d');
const palette = document.querySelector('#palette');
const pageButtons = document.querySelector('#page-buttons');
const upload = document.querySelector('#page-upload');
const selectedSwatch = document.querySelector('#selected-swatch');
const selectedName = document.querySelector('#selected-name');
const progressText = document.querySelector('#progress-text');
const progressBar = document.querySelector('#progress-bar');
const completionBadge = document.querySelector('#completion-badge');
const canvasTitle = document.querySelector('.canvas-heading h2');
const brushSize = document.querySelector('#brush-size');
const brushLabel = document.querySelector('#brush-size-label');
const brushDot = document.querySelector('#brush-preview-dot');
const toast = document.querySelector('#toast');
const storageKey = 'laerke-freehand-pages-v2';
let selectedColor = colors[0];
let currentPage = 0;
let drawing = false;
let hasArtwork = false;
const activePointers = new Set();
let usingGesture = false;
let strokeSnapshot = null;
let artworkBeforeStroke = false;
let toastTimer;

function savedPages() {
  try { return JSON.parse(sessionStorage.getItem(storageKey) || '{}'); } catch (error) { return {}; }
}

function saveCurrentPage() {
  const pages = savedPages();
  pages[currentPage] = { artwork: canvas.toDataURL('image/png'), hasArtwork };
  try { sessionStorage.setItem(storageKey, JSON.stringify(pages)); } catch (error) {}
}

function restoreCurrentPage() {
  const saved = savedPages()[currentPage];
  context.clearRect(0, 0, canvas.width, canvas.height);
  hasArtwork = Boolean(saved?.hasArtwork);
  if (saved?.artwork) {
    const image = new Image();
    image.onload = () => context.drawImage(image, 0, 0);
    image.src = saved.artwork;
  } else if (pageImages[currentPage]) {
    loadPageImage(pageImages[currentPage]);
  }
  progressText.textContent = hasArtwork ? 'in progress' : '0%';
  progressBar.style.width = hasArtwork ? '38%' : '0%';
  completionBadge.textContent = hasArtwork ? 'saved' : 'blank canvas';
}

function paintPalette() {
  colors.forEach((color, index) => {
    const button = document.createElement('button');
    button.className = `crayon${index === 0 ? ' selected' : ''}`;
    button.type = 'button';
    button.innerHTML = `<span class="crayon-dot" style="background:${color.value}"></span><span>${color.name}</span>`;
    button.addEventListener('click', () => {
      selectedColor = color;
      document.querySelectorAll('.crayon').forEach((item) => item.classList.remove('selected'));
      button.classList.add('selected');
      selectedSwatch.style.background = color.value;
      selectedName.textContent = color.name;
      brushDot.style.background = color.value;
      context.strokeStyle = color.value;
    });
    palette.append(button);
  });
  const customButton = document.createElement('button');
  customButton.className = 'crayon custom-crayon';
  customButton.type = 'button';
  customButton.innerHTML = '<span class="crayon-dot custom-dot"></span><span>Custom</span><input class="custom-color-input" type="color" value="#f2635d" aria-label="Choose a custom color">';
  const customInput = customButton.querySelector('.custom-color-input');
  const chooseCustom = () => {
    selectedColor = { name: 'Custom', value: customInput.value };
    document.querySelectorAll('.crayon').forEach((item) => item.classList.remove('selected'));
    customButton.classList.add('selected');
    customButton.querySelector('.custom-dot').style.background = customInput.value;
    selectedSwatch.style.background = customInput.value;
    selectedName.textContent = 'Custom';
    brushDot.style.background = customInput.value;
    context.strokeStyle = customInput.value;
  };
  customButton.addEventListener('click', chooseCustom);
  customInput.addEventListener('input', chooseCustom);
  palette.append(customButton);
}

function paintPageButtons() {
  pageNames.forEach((name, index) => {
    const button = document.createElement('button');
    button.className = `page-button${index === 0 ? ' selected' : ''}`;
    button.type = 'button';
    button.innerHTML = `<span class="page-number">0${index + 1}</span><span>${name}</span>`;
    button.addEventListener('click', () => selectPage(index, button));
    pageButtons.append(button);
  });
}

function selectPage(index, button) {
  saveCurrentPage();
  currentPage = index;
  document.querySelectorAll('.page-button').forEach((item) => item.classList.remove('selected'));
  button.classList.add('selected');
  canvasTitle.textContent = pageNames[index];
  restoreCurrentPage();
}

function canvasPoint(event) {
  const bounds = canvas.getBoundingClientRect();
  return { x: (event.clientX - bounds.left) * canvas.width / bounds.width, y: (event.clientY - bounds.top) * canvas.height / bounds.height };
}

function startDrawing(event) {
  activePointers.add(event.pointerId);
  if (activePointers.size > 1) {
    usingGesture = true;
    if (drawing) {
      drawing = false;
      context.closePath();
      if (strokeSnapshot) context.putImageData(strokeSnapshot, 0, 0);
      hasArtwork = artworkBeforeStroke;
      saveCurrentPage();
    }
    return;
  }
  if (usingGesture) return;
  strokeSnapshot = context.getImageData(0, 0, canvas.width, canvas.height);
  artworkBeforeStroke = hasArtwork;
  drawing = true;
  try { canvas.setPointerCapture(event.pointerId); } catch (error) {}
  const point = canvasPoint(event);
  context.beginPath();
  context.moveTo(point.x, point.y);
  context.lineTo(point.x + 0.1, point.y + 0.1);
  context.stroke();
  hasArtwork = true;
}

function draw(event) {
  if (!drawing || usingGesture) return;
  const point = canvasPoint(event);
  const previousLineWidth = context.lineWidth;
  context.lineWidth = previousLineWidth * 0.72;
  context.lineTo(point.x, point.y);
  context.stroke();
  context.lineWidth = previousLineWidth;
  saveCurrentPage();
}

function stopDrawing(event) {
  activePointers.delete(event.pointerId);
  if (activePointers.size > 0) return;
  usingGesture = false;
  if (!drawing) return;
  drawing = false;
  context.closePath();
  strokeSnapshot = null;
  if (event?.pointerId !== undefined && canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  saveCurrentPage();
  progressText.textContent = 'in progress';
  progressBar.style.width = '38%';
  completionBadge.textContent = 'saved';
}

function updateBrush() {
  const value = Number(brushSize.value);
  brushLabel.textContent = value < 10 ? 'fine' : value > 26 ? 'bold' : 'medium';
  brushDot.style.width = `${Math.min(value, 30)}px`;
  brushDot.style.height = `${Math.min(value, 30)}px`;
  context.lineWidth = value;
  context.globalAlpha = 0.72;
}

canvas.addEventListener('pointerdown', startDrawing);
canvas.addEventListener('pointermove', draw);
canvas.addEventListener('pointerup', stopDrawing);
canvas.addEventListener('pointerleave', stopDrawing);
canvas.addEventListener('pointercancel', stopDrawing);
brushSize.addEventListener('input', updateBrush);

document.querySelector('#reset-button').addEventListener('click', () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  hasArtwork = false;
  const pages = savedPages();
  delete pages[currentPage];
  try { sessionStorage.setItem(storageKey, JSON.stringify(pages)); } catch (error) {}
  restoreCurrentPage();
  showToast('Fresh page, fresh magic!');
});

document.querySelector('#download-button').addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = `laerke-${pageNames[currentPage].toLowerCase().replaceAll(' ', '-')}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
  showToast('Your artwork is ready to keep!');
});

const pageImages = {};
function findLocalPages() {
  pageSources.forEach((source, index) => {
    const image = new Image();
    image.onload = () => {
      pageImages[index] = source;
      const saved = savedPages()[currentPage];
      if (index === currentPage && !saved?.artwork) loadPageImage(source);
    };
    image.src = source;
  });
}

upload.addEventListener('change', () => {
  [...upload.files].slice(0, 4).forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = () => {
      pageImages[index] = reader.result;
      if (index === currentPage) loadPageImage(reader.result);
    };
    reader.readAsDataURL(file);
  });
  showToast('Your four coloring pages are loaded!');
});

function loadPageImage(source) {
  const image = new Image();
  image.onload = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    const scale = Math.min(canvas.width / image.width, canvas.height / image.height);
    const x = (canvas.width - image.width * scale) / 2;
    const y = (canvas.height - image.height * scale) / 2;
    context.drawImage(image, x, y, image.width * scale, image.height * scale);
    hasArtwork = true;
    saveCurrentPage();
  };
  image.src = source;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}

paintPalette();
paintPageButtons();
canvasTitle.textContent = pageNames[0];
context.lineCap = 'round';
context.lineJoin = 'round';
context.strokeStyle = selectedColor.value;
updateBrush();
findLocalPages();
restoreCurrentPage();
