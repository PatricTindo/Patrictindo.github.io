const colors = [
  { name: 'Strawberry', value: '#f2635d' },
  { name: 'Sunshine', value: '#ffd45c' },
  { name: 'Meadow', value: '#94d8be' },
  { name: 'Sky', value: '#80c8e8' },
  { name: 'Lavender', value: '#bca8e8' },
  { name: 'Butter', value: '#f4b778' }
];

const palette = document.querySelector('#palette');
const pageButtons = document.querySelector('#page-buttons');
const svg = document.querySelector('#coloring-svg');
const selectedSwatch = document.querySelector('#selected-swatch');
const selectedName = document.querySelector('#selected-name');
const progressText = document.querySelector('#progress-text');
const progressBar = document.querySelector('#progress-bar');
const completionBadge = document.querySelector('#completion-badge');
const canvasTitle = document.querySelector('.canvas-heading h2');
const toast = document.querySelector('#toast');
let selectedColor = colors[0];
let coloredCount = 0;
let toastTimer;

function shape(tag, attributes, label) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  element.classList.add('color-shape');
  element.setAttribute('aria-label', label);
  element.setAttribute('tabindex', '0');
  element.addEventListener('click', () => colorShape(element));
  element.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') colorShape(element);
  });
  svg.append(element);
}

function line(d, label) {
  shape('path', { d, fill: 'none', stroke: '#332b31', 'stroke-width': 7 }, label);
}

function drawGarden() {
  shape('path', { d: 'M86 365 C54 300 100 233 151 267 C176 209 248 228 250 291 C299 285 321 338 283 373 C230 422 125 423 86 365 Z' }, 'left leafy bush');
  shape('path', { d: 'M446 369 C414 311 454 252 506 276 C524 218 603 235 602 299 C651 292 678 343 645 376 C596 426 480 422 446 369 Z' }, 'right leafy bush');
  shape('path', { d: 'M320 422 C299 370 328 318 364 330 C373 275 433 282 435 331 C476 321 493 369 464 400 C433 433 349 448 320 422 Z' }, 'middle flower bush');
  line('M338 333 C333 270 337 200 359 126', 'middle flower stem');
  shape('circle', { cx: 361, cy: 104, r: 33 }, 'middle flower center');
  shape('path', { d: 'M361 69 C314 68 303 18 340 13 C365 10 376 37 370 64 C405 26 451 43 430 76 C414 101 384 101 361 93 C370 131 338 157 315 128 C298 106 320 82 350 76 Z' }, 'big flower petals');
  line('M196 266 C194 222 202 167 224 126', 'left flower stem');
  shape('circle', { cx: 230, cy: 108, r: 25 }, 'left flower center');
  shape('path', { d: 'M231 81 C196 74 195 37 220 33 C241 30 250 51 244 73 C269 48 300 64 285 87 C273 105 251 101 237 94 C238 125 215 144 198 125 C184 109 200 89 219 84 Z' }, 'left flower petals');
  line('M515 281 C510 232 514 178 531 139', 'right flower stem');
  shape('circle', { cx: 534, cy: 120, r: 26 }, 'right flower center');
  shape('path', { d: 'M534 92 C500 85 497 50 522 45 C543 42 552 62 547 84 C574 58 603 74 589 98 C577 116 556 113 541 105 C543 135 519 154 503 135 C489 119 505 99 523 94 Z' }, 'right flower petals');
  line('M101 439 C196 418 289 452 361 435 C444 415 533 443 625 429', 'garden ground');
}

function drawCloudDay() {
  shape('path', { d: 'M87 373 C52 349 69 300 113 300 C109 248 171 232 196 271 C222 223 297 242 295 298 C342 287 369 336 337 371 C291 421 137 421 87 373 Z' }, 'left cloud');
  shape('path', { d: 'M390 361 C365 322 391 281 430 282 C432 228 497 218 520 261 C552 218 616 241 609 291 C658 284 681 329 652 363 C616 406 430 413 390 361 Z' }, 'right cloud');
  shape('circle', { cx: 161, cy: 130, r: 43 }, 'sun');
  line('M161 66 V35 M161 195 V225 M97 130 H65 M225 130 H257', 'sun rays');
  shape('path', { d: 'M260 185 C286 157 315 157 338 184 C362 157 393 169 395 201 C415 201 429 215 429 233 H244 C239 210 245 193 260 185 Z' }, 'little cloud');
  line('M307 406 C316 352 318 318 326 288', 'rainbow stem');
  shape('path', { d: 'M283 403 C304 367 352 367 373 403', fill: 'none', stroke: '#332b31', 'stroke-width': 6 }, 'rainbow');
  shape('path', { d: 'M274 422 C310 368 367 369 382 422', fill: 'none', stroke: '#332b31', 'stroke-width': 6 }, 'rainbow base');
  shape('path', { d: 'M70 449 C197 432 310 457 425 441 C520 428 590 450 660 435', fill: 'none', stroke: '#332b31', 'stroke-width': 6 }, 'ground');
}

function drawCottage() {
  shape('path', { d: 'M180 245 L350 111 L520 245 V425 H180 Z' }, 'cottage');
  shape('path', { d: 'M145 249 L350 83 L555 249 L523 279 L350 139 L177 279 Z' }, 'cottage roof');
  shape('rect', { x: 311, y: 318, width: 78, height: 107, rx: 5 }, 'cottage door');
  shape('rect', { x: 218, y: 278, width: 66, height: 64, rx: 4 }, 'left window');
  shape('rect', { x: 416, y: 278, width: 66, height: 64, rx: 4 }, 'right window');
  line('M251 278 V342 M218 310 H284 M449 278 V342 M416 310 H482', 'window panes');
  shape('circle', { cx: 372, cy: 370, r: 6 }, 'door knob');
  shape('path', { d: 'M104 424 C91 381 116 348 146 360 C152 316 207 317 217 359 C251 345 277 379 257 414 C235 451 125 458 104 424 Z' }, 'left garden bush');
  shape('path', { d: 'M455 425 C438 381 468 348 501 362 C510 319 564 325 570 366 C605 350 635 383 615 417 C593 451 480 456 455 425 Z' }, 'right garden bush');
  line('M141 360 C140 322 147 286 165 253', 'left flower stem');
  shape('circle', { cx: 170, cy: 237, r: 22 }, 'left flower center');
  shape('path', { d: 'M170 216 C140 207 145 176 166 178 C182 179 188 193 184 208 C207 190 229 208 216 225 C207 237 191 232 181 227 C188 252 166 267 153 250 C143 237 153 220 166 217 Z' }, 'left flower petals');
  line('M548 362 C548 325 553 286 570 253', 'right flower stem');
  shape('circle', { cx: 575, cy: 237, r: 22 }, 'right flower center');
  shape('path', { d: 'M575 216 C545 207 550 176 571 178 C587 179 593 193 589 208 C612 190 634 208 621 225 C612 237 596 232 586 227 C593 252 571 267 558 250 C548 237 558 220 571 217 Z' }, 'right flower petals');
  line('M78 448 C201 432 314 455 423 440 C511 428 592 449 660 435', 'garden ground');
}

const pages = [
  { name: 'Happy garden', draw: drawGarden },
  { name: 'Cloud day', draw: drawCloudDay },
  { name: 'Sweet cottage', draw: drawCottage }
];

function createPalette() {
  colors.forEach((color, index) => {
    const button = document.createElement('button');
    button.className = `crayon${index === 0 ? ' selected' : ''}`;
    button.type = 'button';
    button.innerHTML = `<span class="crayon-dot" style="background:${color.value}"></span><span>${color.name}</span>`;
    button.addEventListener('click', () => selectColor(color, button));
    palette.append(button);
  });
}

function createPageButtons() {
  pages.forEach((page, index) => {
    const button = document.createElement('button');
    button.className = `page-button${index === 0 ? ' selected' : ''}`;
    button.type = 'button';
    button.innerHTML = `<span class="page-number">0${index + 1}</span><span>${page.name}</span>`;
    button.addEventListener('click', () => selectPage(index, button));
    pageButtons.append(button);
  });
}

function selectColor(color, button) {
  selectedColor = color;
  document.querySelectorAll('.crayon').forEach((crayon) => crayon.classList.remove('selected'));
  button.classList.add('selected');
  selectedSwatch.style.background = color.value;
  selectedName.textContent = color.name;
}

function selectPage(index, button) {
  document.querySelectorAll('.page-button').forEach((pageButton) => pageButton.classList.remove('selected'));
  button.classList.add('selected');
  canvasTitle.textContent = pages[index].name;
  svg.setAttribute('aria-label', `${pages[index].name} coloring page`);
  svg.replaceChildren();
  pages[index].draw();
  coloredCount = 0;
  completionBadge.textContent = 'blank canvas';
  updateProgress();
  showToast(`${pages[index].name} is ready to color!`);
}

function colorShape(element) {
  if (element.classList.contains('colored')) return;
  element.style.fill = selectedColor.value;
  element.classList.add('colored');
  element.removeAttribute('tabindex');
  coloredCount += 1;
  updateProgress();
  showToast(coloredCount === document.querySelectorAll('.color-shape').length ? 'Page complete! Lærke magic ✦' : `${selectedColor.name} looks lovely!`);
}

function updateProgress() {
  const total = document.querySelectorAll('.color-shape').length;
  const percent = total ? Math.round((coloredCount / total) * 100) : 0;
  progressText.textContent = `${percent}%`;
  progressBar.style.width = `${percent}%`;
  if (percent === 100) completionBadge.textContent = 'complete ✦';
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}

document.querySelector('#reset-button').addEventListener('click', () => {
  document.querySelectorAll('.color-shape').forEach((element) => {
    element.style.fill = '';
    element.classList.remove('colored');
    element.setAttribute('tabindex', '0');
  });
  coloredCount = 0;
  completionBadge.textContent = 'blank canvas';
  updateProgress();
  showToast('Fresh page, fresh magic!');
});

createPalette();
createPageButtons();
pages[0].draw();
svg.setAttribute('aria-label', `${pages[0].name} coloring page`);
completionBadge.textContent = 'blank canvas';
updateProgress();
