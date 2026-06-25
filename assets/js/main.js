const MAX_DIMENSION = 2048;

const metricsContainer = document.getElementById('metrics');
const originalCanvas = document.getElementById('original-canvas');
const improvedCanvas = document.getElementById('improved-canvas');
const originalMeta = document.getElementById('original-meta');
const improvedMeta = document.getElementById('improved-meta');
const downloadButton = document.getElementById('download-button');
const toggleGrid = document.getElementById('toggle-grid');
const toggleComposition = document.getElementById('toggle-composition');
const compModeButtons = document.querySelectorAll('.comp-mode button');
const resetButton = document.getElementById('reset-button');
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const uploadButton = document.getElementById('upload-button');
const loadingIndicator = document.getElementById('loading-indicator');
const metricTemplate = document.getElementById('metric-template');
const langToggleButtons = document.querySelectorAll('.lang-toggle button');
const analysisSummary = document.getElementById('analysis-summary');
const engineStatus = document.getElementById('engine-status');
const errorToast = document.getElementById('error-toast');

const fallbackDictionaries = {
  'en-US': {
    "app_title": "Photo Assistant",
    "app_tagline": "Private, instant photo fixes in your browser.",
    "analysis_heading": "Straighten & brighten instantly",
    "analysis_subheading": "Upload a photo, then toggle the fixes you want. Everything runs on-device.",
    "drop_instructions": "Drop an image here or click to choose a file.",
    "drop_hint": "JPG, PNG, HEIC up to 12 MP. Processed privately on-device.",
    "select_button": "Select Photo",
    "reset_button": "Reset",
    "original_title": "Original",
    "improved_title": "Result",
    "download_button": "Download Result",
    "toggle_grid": "Show guides",
    "feature_composition_title": "Composition",
    "feature_composition_desc": "Straighten the tilt — level the whole scene, or snap a single object upright.",
    "comp_mode_landscape": "Landscape",
    "comp_mode_object": "Object",
    "feature_shadow_title": "Shadow",
    "feature_shadow_desc": "Lift dark areas and recover crushed shadow detail.",
    "feature_color_title": "White balance",
    "feature_color_desc": "Neutralize a warm or cool cast for a natural white tone.",
    "feature_detail_title": "Detail",
    "feature_detail_desc": "Add a touch of contrast, light sharpening, and a hint of grain.",
    "footer_note": "All processing happens locally in your browser. No uploads. No tracking.",
    "loading": "Processing photo…",
    "engine_loading": "Loading vision engine…",
    "engine_ready": "Vision engine ready",
    "engine_error": "Vision engine unavailable",
    "metric_horizon": "Tilt angle",
    "metric_rule_of_thirds": "Rule-of-thirds alignment",
    "metric_main_subject": "Subject position",
    "metric_exposure": "Brightness",
    "metric_shadow_clipping": "Shadow clipping",
    "metric_download_name": "fixed-photo",
    "analysis_summary_default": "Upload a photo to see what can be straightened or brightened.",
    "summary_all_off": "Both fixes are off — showing the original. Toggle Composition or Shadow to start.",
    "summary_subject_missing": "<strong>Subject:</strong> No dominant subject detected — framing left as captured.",
    "summary_subject_centered": "<strong>Subject:</strong> Nicely balanced near the thirds intersections.",
    "summary_subject_off_center": "<strong>Subject:</strong> Off-centre — nudged toward a thirds line where it fit.",
    "summary_horizon_level": "<strong>Tilt:</strong> Already level — no rotation needed.",
    "summary_horizon_tilted": "<strong>Tilt:</strong> Leveled a {{angle}} tilt and cropped the corners clean.",
    "summary_shadow_lifted": "<strong>Shadow:</strong> Dark areas lifted to recover detail.",
    "summary_shadow_ok": "<strong>Shadow:</strong> Shadows already open — only a gentle lift applied.",
    "tip_tilt_title": "Kill the Dutch angle",
    "tip_tilt_text": "We detect the dominant lines, rotate the scene level, and crop the corners so there are no gaps.",
    "tip_thirds_title": "Reframe safely",
    "tip_thirds_text": "Within the leveling crop we nudge the subject toward a thirds line — only when nothing important gets cut.",
    "tip_shadow_title": "Open the shadows",
    "tip_shadow_text": "Crushed and underexposed areas are brightened automatically while highlights stay protected.",
    "meta_dimensions": "{{width}}×{{height}} px",
    "error_processing": "Unable to process this file. Please try another image.",
    "error_dictionary": "Using built-in language defaults. Some translations may be missing."
  },
  'zh-TW': {
    "app_title": "影像助手",
    "app_tagline": "完全在瀏覽器內即時修正照片，隱私零外洩。",
    "analysis_heading": "立即校正與提亮",
    "analysis_subheading": "上傳照片後，自由切換想要的修正功能，所有處理皆在本機完成。",
    "drop_instructions": "拖曳影像到此或點擊選擇檔案。",
    "drop_hint": "支援 JPG、PNG、HEIC，最多 1200 萬像素。所有處理皆在本機完成。",
    "select_button": "選擇照片",
    "reset_button": "重設",
    "original_title": "原始影像",
    "improved_title": "處理結果",
    "download_button": "下載結果",
    "toggle_grid": "顯示輔助線",
    "feature_composition_title": "構圖",
    "feature_composition_desc": "校正傾斜——可校平整個場景，或將單一物件轉正。",
    "comp_mode_landscape": "場景",
    "comp_mode_object": "物件",
    "feature_shadow_title": "陰影",
    "feature_shadow_desc": "提亮暗部，找回被壓死的陰影細節。",
    "feature_color_title": "白平衡",
    "feature_color_desc": "校正偏暖或偏冷色調，呈現自然白。",
    "feature_detail_title": "細節",
    "feature_detail_desc": "增加些微對比、適度銳化與少許顆粒，呈現清晰自然的質感。",
    "footer_note": "所有處理都在您的瀏覽器內進行，不需上傳、不會追蹤。",
    "loading": "影像分析中…",
    "engine_loading": "視覺引擎載入中…",
    "engine_ready": "視覺引擎就緒",
    "engine_error": "視覺引擎無法使用",
    "metric_horizon": "傾斜角度",
    "metric_rule_of_thirds": "三分構圖對齊",
    "metric_main_subject": "主體位置",
    "metric_exposure": "亮度",
    "metric_shadow_clipping": "陰影裁切",
    "metric_download_name": "fixed-photo",
    "analysis_summary_default": "上傳照片即可看到可校正或提亮的項目。",
    "summary_all_off": "兩項修正都已關閉，顯示原始影像。請切換「構圖」或「陰影」開始。",
    "summary_subject_missing": "<strong>主體：</strong> 未偵測到明顯主體，維持原始構圖。",
    "summary_subject_centered": "<strong>主體：</strong> 已落在三分線附近，構圖平衡。",
    "summary_subject_off_center": "<strong>主體：</strong> 稍微偏離三分線，已在可行範圍內靠向三分線。",
    "summary_horizon_level": "<strong>傾斜：</strong> 已經水平，無需旋轉。",
    "summary_horizon_tilted": "<strong>傾斜：</strong> 已校正 {{angle}} 的傾斜並裁切邊角。",
    "summary_shadow_lifted": "<strong>陰影：</strong> 已提亮暗部找回細節。",
    "summary_shadow_ok": "<strong>陰影：</strong> 暗部原本就清楚，僅做輕微提亮。",
    "tip_tilt_title": "消除傾斜",
    "tip_tilt_text": "偵測主要線條，將畫面轉正並裁切邊角，避免留下空白。",
    "tip_thirds_title": "安全重構圖",
    "tip_thirds_text": "在校正裁切範圍內，將主體輕微靠向三分線——僅在不裁切重要元素時進行。",
    "tip_shadow_title": "打開陰影",
    "tip_shadow_text": "自動提亮被壓死與曝光不足的區域，同時保護高光。",
    "meta_dimensions": "{{width}}×{{height}} px",
    "error_processing": "此檔案無法處理，請改用其他影像。",
    "error_dictionary": "使用內建語系字串，部分翻譯可能缺少。"
  }
};

let dictionaries = cloneFallback();
let currentLang = 'en-US';
let currentMetrics = null;
let currentDownloadUrl = null;
let lastOriginalCanvas = null;
let lastImprovedCanvas = null;
let featureComposition = true;
// Shadow, white balance, and detail are always-on enhancements with no UI
// toggle. Each remains a self-contained function (applyShadowLift /
// applyWhiteBalance / applyDetail) so it can still be tuned independently.
const featureShadow = true;
const featureColor = true;
const featureDetail = true;
let compMode = 'landscape';
let engineStatusState = 'loading';
let errorTimeoutId = null;
let dictionaryWarningShown = false;

const formatters = {
  percent: value => `${Math.round(value * 100)}%`,
  degrees: value => `${value.toFixed(1)}°`,
  score: value => value.toFixed(2)
};

function clamp(value, min = 0, max = 255) {
  return Math.min(max, Math.max(min, value));
}

function clampRange(value, lo, hi) {
  if (lo > hi) return (lo + hi) / 2;
  return Math.min(hi, Math.max(lo, value));
}

function cloneFallback() {
  return JSON.parse(JSON.stringify(fallbackDictionaries));
}

function cloneCanvas(source) {
  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height;
  canvas.getContext('2d').drawImage(source, 0, 0);
  return canvas;
}

function updateStatusBadge() {
  if (!engineStatus) return;
  const dict = dictionaries[currentLang] || {};
  engineStatus.classList.remove('ready', 'error');
  let key = 'engine_loading';
  if (engineStatusState === 'ready') {
    key = 'engine_ready';
    engineStatus.classList.add('ready');
  } else if (engineStatusState === 'error') {
    key = 'engine_error';
    engineStatus.classList.add('error');
  }
  engineStatus.textContent = dict[key] || engineStatus.textContent;
}

function setLoading(isLoading) {
  loadingIndicator.hidden = !isLoading;
  dropZone.setAttribute('aria-busy', String(isLoading));
  dropZone.classList.toggle('processing', isLoading);
}

function setCanvasMeta(element, source) {
  if (!element) return;
  if (!source) {
    element.textContent = '';
    return;
  }
  const dict = dictionaries[currentLang] || {};
  const template = dict['meta_dimensions'] || '{{width}}×{{height}} px';
  element.textContent = template
    .replace('{{width}}', source.width)
    .replace('{{height}}', source.height);
}

function drawGuides(canvas, metrics, options = {}) {
  const { showGuides = true, includeAnnotations = true } = options;
  if (!showGuides) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.save();
  const scale = Math.min(w, h);
  const guideWidth = Math.max(2, scale * 0.005);
  ctx.lineWidth = guideWidth;
  ctx.strokeStyle = 'rgba(91, 192, 255, 0.85)';
  ctx.shadowColor = 'rgba(15, 23, 42, 0.85)';
  ctx.shadowBlur = guideWidth * 1.6;
  ctx.setLineDash([guideWidth * 3, guideWidth * 1.5]);
  for (let i = 1; i <= 2; i++) {
    const x = (w * i) / 3;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
    const y = (h * i) / 3;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
    const markerRadius = Math.max(4, scale * 0.03);
    ctx.beginPath();
    ctx.fillStyle = 'rgba(14, 165, 233, 0.18)';
    ctx.strokeStyle = 'rgba(191, 219, 254, 0.9)';
    ctx.lineWidth = guideWidth * 0.9;
    ctx.arc(x, y, markerRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = 'rgba(91, 192, 255, 0.85)';
    ctx.lineWidth = guideWidth;
  }
  ctx.setLineDash([]);
  ctx.shadowBlur = guideWidth;
  if (includeAnnotations && metrics && metrics.subjectRect) {
    const scaleX = w / metrics.imageSize.width;
    const scaleY = h / metrics.imageSize.height;
    ctx.strokeStyle = 'rgba(244, 114, 182, 0.75)';
    ctx.lineWidth = Math.max(1.5, guideWidth * 0.9);
    ctx.shadowBlur = guideWidth * 1.2;
    ctx.strokeRect(
      metrics.subjectRect.x * scaleX,
      metrics.subjectRect.y * scaleY,
      metrics.subjectRect.width * scaleX,
      metrics.subjectRect.height * scaleY
    );
  }
  if (includeAnnotations && metrics && metrics.horizonLine) {
    const scaleX = w / metrics.imageSize.width;
    const scaleY = h / metrics.imageSize.height;
    ctx.strokeStyle = 'rgba(45, 212, 191, 0.9)';
    ctx.lineWidth = Math.max(2, guideWidth * 1.1);
    ctx.shadowBlur = guideWidth * 1.8;
    ctx.beginPath();
    ctx.moveTo(metrics.horizonLine[0].x * scaleX, metrics.horizonLine[0].y * scaleY);
    ctx.lineTo(metrics.horizonLine[1].x * scaleX, metrics.horizonLine[1].y * scaleY);
    ctx.stroke();
  }
  ctx.restore();
}

function showError(messageKey, fallback) {
  if (!errorToast) return;
  const dict = dictionaries[currentLang] || {};
  errorToast.textContent = dict[messageKey] || fallback || 'Something went wrong.';
  errorToast.hidden = false;
  clearTimeout(errorTimeoutId);
  errorTimeoutId = setTimeout(() => {
    errorToast.hidden = true;
  }, 4000);
}

function cleanupCanvases() {
  lastOriginalCanvas = null;
  lastImprovedCanvas = null;
}

function resetInterface() {
  cleanupCanvases();
  currentMetrics = null;
  metricsContainer.innerHTML = '';
  const dict = dictionaries[currentLang] || {};
  analysisSummary.innerHTML = dict['analysis_summary_default'] || '';
  const originalCtx = originalCanvas.getContext('2d');
  originalCtx.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
  const improvedCtx = improvedCanvas.getContext('2d');
  improvedCtx.clearRect(0, 0, improvedCanvas.width, improvedCanvas.height);
  setCanvasMeta(originalMeta, null);
  setCanvasMeta(improvedMeta, null);
  downloadButton.disabled = true;
  revokeDownloadUrl();
  document.body.classList.remove('has-image');
}

function revokeDownloadUrl() {
  if (currentDownloadUrl) {
    URL.revokeObjectURL(currentDownloadUrl);
    currentDownloadUrl = null;
  }
}

async function prepareDownload(sourceCanvas) {
  revokeDownloadUrl();
  await new Promise(resolve => {
    sourceCanvas.toBlob(blob => {
      const dict = dictionaries[currentLang] || {};
      const name = dict['metric_download_name'] || 'fixed-photo';
      if (blob) {
        currentDownloadUrl = URL.createObjectURL(blob);
        downloadButton.disabled = false;
        downloadButton.dataset.filename = `${name}.png`;
      } else {
        downloadButton.disabled = true;
      }
      resolve();
    }, 'image/png');
  });
}

function renderToCanvas(targetCanvas, sourceCanvas, options = {}) {
  targetCanvas.width = sourceCanvas.width;
  targetCanvas.height = sourceCanvas.height;
  const ctx = targetCanvas.getContext('2d');
  ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
  ctx.drawImage(sourceCanvas, 0, 0);
  drawGuides(targetCanvas, options.metrics, {
    showGuides: options.showGuides,
    includeAnnotations: options.includeAnnotations
  });
}

function refreshCanvases() {
  if (!currentMetrics) return;
  if (lastOriginalCanvas) {
    renderToCanvas(originalCanvas, lastOriginalCanvas, {
      showGuides: toggleGrid.checked,
      metrics: currentMetrics,
      includeAnnotations: true
    });
    setCanvasMeta(originalMeta, lastOriginalCanvas);
  }
  if (lastImprovedCanvas) {
    renderToCanvas(improvedCanvas, lastImprovedCanvas, {
      showGuides: toggleGrid.checked,
      metrics: currentMetrics,
      includeAnnotations: false
    });
    setCanvasMeta(improvedMeta, lastImprovedCanvas);
  }
}

async function rebuildImproved() {
  if (!currentMetrics || !lastOriginalCanvas) return;
  lastImprovedCanvas = buildImproved(lastOriginalCanvas, currentMetrics);
  renderToCanvas(improvedCanvas, lastImprovedCanvas, {
    showGuides: toggleGrid.checked,
    metrics: currentMetrics,
    includeAnnotations: false
  });
  setCanvasMeta(improvedMeta, lastImprovedCanvas);
  updateAnalysisSummary(currentMetrics);
  await prepareDownload(lastImprovedCanvas);
}

function translatePage() {
  const dict = dictionaries[currentLang] || {};
  document.documentElement.lang = currentLang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });
  langToggleButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
  if (!currentMetrics) {
    analysisSummary.innerHTML = dict['analysis_summary_default'] || '';
  } else {
    renderMetrics(currentMetrics);
    updateAnalysisSummary(currentMetrics);
    setCanvasMeta(originalMeta, lastOriginalCanvas);
    setCanvasMeta(improvedMeta, lastImprovedCanvas);
  }
  updateStatusBadge();
}

function renderMetrics(metrics) {
  const dict = dictionaries[currentLang] || {};
  metricsContainer.innerHTML = '';

  let subjectValue = '—';
  if (metrics.subjectRect) {
    subjectValue = `${formatters.percent(metrics.subjectCenter.x / metrics.imageSize.width)} / ${formatters.percent(metrics.subjectCenter.y / metrics.imageSize.height)}`;
  }

  const entries = [
    ['metric_horizon', formatters.degrees(metrics.horizonAngle)],
    ['metric_rule_of_thirds', formatters.score(metrics.ruleOfThirdsScore)],
    ['metric_main_subject', subjectValue],
    ['metric_exposure', Math.round(metrics.exposure).toString()],
    ['metric_shadow_clipping', formatters.percent(metrics.shadowClipping)]
  ];

  for (const [labelKey, value] of entries) {
    const fragment = metricTemplate.content.cloneNode(true);
    fragment.querySelector('.metric-label').textContent = dict[labelKey] || labelKey;
    fragment.querySelector('.metric-value').textContent = value;
    metricsContainer.appendChild(fragment);
  }
}

function appendSummarySegment(fragment, segment) {
  if (!segment) return;
  const wrapper = document.createElement('div');
  wrapper.className = 'summary-item';
  const temp = document.createElement('div');
  temp.innerHTML = segment;
  const strong = temp.querySelector('strong');
  if (strong) {
    const label = document.createElement('span');
    label.className = 'summary-label';
    label.textContent = strong.textContent.trim();
    const text = document.createElement('span');
    text.className = 'summary-text';
    strong.remove();
    text.textContent = temp.textContent.trim();
    wrapper.append(label, text);
  } else {
    wrapper.classList.add('summary-item--single');
    const text = document.createElement('span');
    text.className = 'summary-text';
    text.textContent = temp.textContent.trim();
    wrapper.append(text);
  }
  fragment.appendChild(wrapper);
}

function updateAnalysisSummary(metrics) {
  const dict = dictionaries[currentLang] || {};
  if (!analysisSummary) return;
  analysisSummary.innerHTML = '';
  if (!metrics) {
    analysisSummary.textContent = dict['analysis_summary_default'] || '';
    return;
  }

  if (!featureComposition && !featureShadow) {
    analysisSummary.textContent = dict['summary_all_off'] || '';
    return;
  }

  const segments = [];

  if (featureComposition) {
    if (Math.abs(metrics.horizonAngle) <= 0.3) {
      segments.push(dict['summary_horizon_level']);
    } else {
      const template = dict['summary_horizon_tilted'] || '';
      segments.push(template.replace('{{angle}}', formatters.degrees(Math.abs(metrics.horizonAngle))));
    }

    if (!metrics.subjectRect) {
      segments.push(dict['summary_subject_missing']);
    } else {
      const offset = Math.max(Math.abs(metrics.subjectOffset.x), Math.abs(metrics.subjectOffset.y));
      segments.push(offset < 0.12 ? dict['summary_subject_centered'] : dict['summary_subject_off_center']);
    }
  }

  if (featureShadow) {
    const needsLift = metrics.shadowClipping > 0.02 || metrics.exposure < 120;
    segments.push(needsLift ? dict['summary_shadow_lifted'] : dict['summary_shadow_ok']);
  }

  const items = segments.filter(Boolean);
  if (!items.length) {
    analysisSummary.textContent = dict['analysis_summary_default'] || '';
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const segment of items) {
    appendSummarySegment(fragment, segment);
  }
  analysisSummary.appendChild(fragment);
}

function scaleDimensions(width, height, maxSize) {
  if (Math.max(width, height) <= maxSize) {
    return { width, height };
  }
  const ratio = width / height;
  if (ratio > 1) {
    return { width: maxSize, height: Math.round(maxSize / ratio) };
  }
  return { width: Math.round(maxSize * ratio), height: maxSize };
}

function readFileAsArrayBuffer(file, length = 128 * 1024) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file.slice(0, length));
  });
}

async function getExifOrientation(file) {
  try {
    const buffer = await readFileAsArrayBuffer(file);
    const view = new DataView(buffer);
    if (view.getUint16(0, false) !== 0xffd8) {
      return 1;
    }
    let offset = 2;
    const length = view.byteLength;
    while (offset < length) {
      const marker = view.getUint16(offset, false);
      offset += 2;
      if (marker === 0xffe1) {
        const blockLength = view.getUint16(offset, false);
        offset += 2;
        if (view.getUint32(offset, false) !== 0x45786966) {
          break;
        }
        offset += 6;
        const little = view.getUint16(offset, false) === 0x4949;
        offset += view.getUint32(offset + 4, little);
        const tags = view.getUint16(offset, little);
        offset += 2;
        for (let i = 0; i < tags; i++) {
          const tagOffset = offset + i * 12;
          if (view.getUint16(tagOffset, little) === 0x0112) {
            return view.getUint16(tagOffset + 8, little);
          }
        }
      } else if ((marker & 0xff00) !== 0xff00) {
        break;
      } else {
        offset += view.getUint16(offset, false);
      }
    }
  } catch (error) {
    console.warn('Failed to read EXIF orientation', error);
  }
  return 1;
}

// Apply an EXIF orientation transform in the *source* coordinate space. The
// caller pre-scales the context, so this works at any output resolution.
function applyOrientationTransform(ctx, orientation, width, height) {
  switch (orientation) {
    case 2:
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      break;
    case 3:
      ctx.translate(width, height);
      ctx.rotate(Math.PI);
      break;
    case 4:
      ctx.translate(0, height);
      ctx.scale(1, -1);
      break;
    case 5:
      ctx.rotate(0.5 * Math.PI);
      ctx.scale(1, -1);
      break;
    case 6:
      ctx.rotate(0.5 * Math.PI);
      ctx.translate(0, -height);
      break;
    case 7:
      ctx.rotate(0.5 * Math.PI);
      ctx.translate(width, -height);
      ctx.scale(-1, 1);
      break;
    case 8:
      ctx.rotate(-0.5 * Math.PI);
      ctx.translate(-width, 0);
      break;
    default:
      break;
  }
}

function loadImageElement(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function readImageFile(file) {
  const orientation = await getExifOrientation(file);
  let source = null;
  let orientationHandled = false;

  if ('createImageBitmap' in window) {
    try {
      source = await createImageBitmap(file, { imageOrientation: 'from-image' });
      orientationHandled = true;
    } catch (error) {
      console.warn('createImageBitmap failed, falling back to <img>', error);
    }
  }

  if (!source) {
    source = await loadImageElement(file);
  }

  const srcWidth = source.width || source.naturalWidth;
  const srcHeight = source.height || source.naturalHeight;
  // Orientations 5–8 rotate by 90°, swapping the displayed dimensions. When the
  // browser already baked in the orientation (createImageBitmap) we don't swap.
  const swap = !orientationHandled && orientation >= 5 && orientation <= 8;
  const orientedWidth = swap ? srcHeight : srcWidth;
  const orientedHeight = swap ? srcWidth : srcHeight;
  const targetSize = scaleDimensions(orientedWidth, orientedHeight, MAX_DIMENSION);

  // Decode straight into the downscaled target canvas — never allocate a
  // full-resolution canvas, which can exceed mobile Safari's ~16 MP limit on
  // high-megapixel iPhone photos.
  const canvas = document.createElement('canvas');
  canvas.width = targetSize.width;
  canvas.height = targetSize.height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';

  if (orientationHandled) {
    ctx.drawImage(source, 0, 0, targetSize.width, targetSize.height);
  } else {
    const scale = targetSize.width / orientedWidth; // uniform (aspect preserved)
    ctx.scale(scale, scale);
    applyOrientationTransform(ctx, orientation, srcWidth, srcHeight);
    ctx.drawImage(source, 0, 0);
  }

  if (typeof source.close === 'function') {
    source.close();
  }

  const imageData = ctx.getImageData(0, 0, targetSize.width, targetSize.height);
  return { canvas, imageData };
}

function computeStatistics(values) {
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
  }
  const mean = sum / values.length;
  let varianceSum = 0;
  for (let i = 0; i < values.length; i++) {
    const diff = values[i] - mean;
    varianceSum += diff * diff;
  }
  return { mean, std: Math.sqrt(varianceSum / values.length) };
}

function samplePercentile(values, percentile) {
  const step = Math.max(1, Math.floor(values.length / 10000));
  const sample = [];
  for (let i = 0; i < values.length; i += step) {
    sample.push(values[i]);
  }
  sample.sort((a, b) => a - b);
  const index = Math.min(sample.length - 1, Math.max(0, Math.floor(percentile * (sample.length - 1))));
  return sample[index] || 0;
}

function computeMetrics(imageData) {
  const { width, height, data } = imageData;
  const pixelCount = width * height;
  const grayscale = new Float32Array(pixelCount);
  const gradX = new Float32Array(pixelCount);
  const gradY = new Float32Array(pixelCount);
  const gradient = new Float32Array(pixelCount);

  let shadowClipped = 0;
  let midtoneSum = 0;
  let midtoneCount = 0;

  for (let i = 0; i < pixelCount; i++) {
    const idx = i * 4;
    const luminance = 0.2126 * data[idx] + 0.7152 * data[idx + 1] + 0.0722 * data[idx + 2];
    grayscale[i] = luminance;
    if (luminance < 12) shadowClipped++;
    if (luminance > 64 && luminance < 200) {
      midtoneSum += luminance;
      midtoneCount++;
    }
  }

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const gx =
        -grayscale[idx - width - 1] - 2 * grayscale[idx - 1] - grayscale[idx + width - 1] +
        grayscale[idx - width + 1] + 2 * grayscale[idx + 1] + grayscale[idx + width + 1];
      const gy =
        -grayscale[idx - width - 1] - 2 * grayscale[idx - width] - grayscale[idx - width + 1] +
        grayscale[idx + width - 1] + 2 * grayscale[idx + width] + grayscale[idx + width + 1];
      gradX[idx] = gx;
      gradY[idx] = gy;
      gradient[idx] = Math.hypot(gx, gy);
    }
  }

  const stats = computeStatistics(grayscale);
  const gradientThreshold = samplePercentile(gradient, 0.9);
  const horizonThreshold = samplePercentile(gradient, 0.95);

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let sumX = 0;
  let sumY = 0;
  let strongCount = 0;

  let tiltSumSin = 0;
  let tiltSumCos = 0;
  let tiltWeight = 0;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const magnitude = gradient[idx];
      if (magnitude > gradientThreshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        sumX += x;
        sumY += y;
        strongCount++;
      }
      if (magnitude > horizonThreshold) {
        // Quadrupled-angle accumulation: finds the dominant edge orientation
        // modulo 90°, so the tilt is detected from horizontal *or* vertical
        // structures (e.g. a tilted bottle or pen, not just a horizon).
        const theta = Math.atan2(gradY[idx], gradX[idx]);
        tiltSumSin += Math.sin(4 * theta) * magnitude;
        tiltSumCos += Math.cos(4 * theta) * magnitude;
        tiltWeight += magnitude;
      }
    }
  }

  // Dominant orientation mod 90°, mapped to [-45°, 45°]. Only trust it when the
  // edges are coherent enough to indicate a real tilt (avoids rotating noise).
  let detectedTilt = 0;
  if (tiltWeight > 0) {
    const coherence = Math.hypot(tiltSumSin, tiltSumCos) / tiltWeight;
    // Only straighten when the strong edges are highly coherent (architectural
    // lines). Low-coherence scenes — e.g. a subject behind reflective glass —
    // can't be measured reliably, so they're left untouched rather than rotated
    // by a wrong angle. Threshold calibrated against registered before/after pairs.
    if (coherence > 0.4) {
      const angle = (Math.atan2(tiltSumSin, tiltSumCos) / 4) * (180 / Math.PI);
      // Dead-zone: ignore sub-1.5° tilts — imperceptible, and avoids nudging
      // already-level photos from estimation noise.
      if (Math.abs(angle) >= 1.5) {
        detectedTilt = angle;
      }
    }
  }

  const metrics = {
    imageSize: { width, height },
    subjectRect: null,
    subjectCenter: { x: width / 2, y: height / 2 },
    subjectOffset: { x: 0, y: 0 },
    horizonAngle: detectedTilt,
    horizonLine: null,
    ruleOfThirdsScore: 0,
    exposure: stats.mean,
    shadowClipping: shadowClipped / pixelCount,
    midtoneBalance: midtoneCount ? midtoneSum / (midtoneCount * 255) : stats.mean / 255
  };

  if (strongCount > 50) {
    const widthRect = maxX - minX;
    const heightRect = maxY - minY;
    metrics.subjectRect = {
      x: Math.max(0, minX - 4),
      y: Math.max(0, minY - 4),
      width: Math.min(width, widthRect + 8),
      height: Math.min(height, heightRect + 8)
    };
    metrics.subjectCenter = { x: sumX / strongCount, y: sumY / strongCount };
    metrics.subjectOffset = {
      x: metrics.subjectCenter.x / width - 0.5,
      y: metrics.subjectCenter.y / height - 0.5
    };
  }

  const thirdsX = [width / 3, (2 * width) / 3];
  const thirdsY = [height / 3, (2 * height) / 3];
  const nearestX = Math.min(...thirdsX.map(x => Math.abs(metrics.subjectCenter.x - x)));
  const nearestY = Math.min(...thirdsY.map(y => Math.abs(metrics.subjectCenter.y - y)));
  metrics.ruleOfThirdsScore = 1 - (nearestX / width + nearestY / height);

  const center = { x: width / 2, y: height / 2 };
  const angleRad = (metrics.horizonAngle * Math.PI) / 180;
  const lengthLine = Math.max(width, height);
  const dx = Math.cos(angleRad) * lengthLine;
  const dy = Math.sin(angleRad) * lengthLine;
  metrics.horizonLine = [
    { x: center.x - dx / 2, y: center.y - dy / 2 },
    { x: center.x + dx / 2, y: center.y + dy / 2 }
  ];

  metrics.subjectAngle = detectSubjectAxis(grayscale, width, height);

  return metrics;
}

// For Object mode: find the dominant contrasting object and return the rotation
// (deviation from the nearest axis, in degrees) that snaps its long axis to
// horizontal or vertical. Returns 0 when there is no clearly elongated subject
// (round or low-contrast scenes), so Object mode is a no-op rather than a wrong
// rotation. Validated against before/after pairs (pen fires; apples/scenes skip).
function detectSubjectAxis(grayscale, width, height) {
  const n = width * height;
  const step = Math.max(1, Math.floor(n / 20000));
  const sample = [];
  for (let i = 0; i < n; i += step) sample.push(grayscale[i]);
  sample.sort((a, b) => a - b);
  const q = p => sample[Math.min(sample.length - 1, Math.max(0, Math.floor(p * (sample.length - 1))))];
  const p2 = q(0.02);
  const p50 = q(0.5);
  const p98 = q(0.98);
  const dark = p50 - p2 >= p98 - p50;
  const threshold = dark ? (p50 + p2) / 2 : (p50 + p98) / 2;
  const inside = dark ? v => v < threshold : v => v > threshold;

  // Largest connected component of the foreground mask, accumulating the second
  // moments needed for its orientation as we go.
  const visited = new Uint8Array(n);
  const stack = new Int32Array(n);
  let best = null;
  for (let s = 0; s < n; s++) {
    if (visited[s]) continue;
    visited[s] = 1;
    if (!inside(grayscale[s])) continue;
    let top = 0;
    stack[top++] = s;
    let count = 0;
    let sx = 0;
    let sy = 0;
    let sxx = 0;
    let syy = 0;
    let sxy = 0;
    while (top > 0) {
      const idx = stack[--top];
      const x = idx % width;
      const y = (idx - x) / width;
      count++;
      sx += x;
      sy += y;
      sxx += x * x;
      syy += y * y;
      sxy += x * y;
      if (x > 0) { const v = idx - 1; if (!visited[v]) { visited[v] = 1; if (inside(grayscale[v])) stack[top++] = v; } }
      if (x < width - 1) { const v = idx + 1; if (!visited[v]) { visited[v] = 1; if (inside(grayscale[v])) stack[top++] = v; } }
      if (y > 0) { const v = idx - width; if (!visited[v]) { visited[v] = 1; if (inside(grayscale[v])) stack[top++] = v; } }
      if (y < height - 1) { const v = idx + width; if (!visited[v]) { visited[v] = 1; if (inside(grayscale[v])) stack[top++] = v; } }
    }
    if (!best || count > best.count) best = { count, sx, sy, sxx, syy, sxy };
  }

  if (!best) return 0;
  const frac = best.count / n;
  if (frac < 0.005 || frac > 0.6) return 0;
  const mx = best.sx / best.count;
  const my = best.sy / best.count;
  const mu20 = best.sxx / best.count - mx * mx;
  const mu02 = best.syy / best.count - my * my;
  const mu11 = best.sxy / best.count - mx * my;
  const angle = 0.5 * Math.atan2(2 * mu11, mu20 - mu02) * (180 / Math.PI); // (-90, 90]
  const trace = mu20 + mu02;
  const disc = Math.sqrt(Math.max(0, (trace * trace) / 4 - (mu20 * mu02 - mu11 * mu11)));
  const l1 = trace / 2 + disc;
  const l2 = trace / 2 - disc;
  const ecc = l1 > 0 ? Math.sqrt(Math.max(0, 1 - l2 / l1)) : 0;
  if (ecc < 0.7) return 0; // not elongated enough to be a clear linear object
  let dev;
  if (Math.abs(angle) <= 45) dev = angle;
  else dev = angle > 0 ? angle - 90 : angle + 90;
  return Math.abs(dev) >= 1.5 ? dev : 0;
}

function buildImproved(baseCanvas, metrics) {
  let canvas = cloneCanvas(baseCanvas);
  if (featureComposition) {
    if (compMode === 'object') {
      // Snap the main object upright; larger angles allowed, no thirds reframe.
      canvas = applyStraighten(canvas, metrics, metrics.subjectAngle, 45, false);
    } else {
      // Level the scene, with the safe rule-of-thirds nudge.
      canvas = applyStraighten(canvas, metrics, metrics.horizonAngle, 30, true);
    }
  }
  if (featureShadow) {
    applyShadowLift(canvas, metrics);
  }
  if (featureDetail) {
    applyDetail(canvas);
  }
  if (featureColor) {
    // Applied last so the whites end up neutral regardless of the other stages.
    applyWhiteBalance(canvas);
  }
  return canvas;
}

function rotateCanvas(sourceCanvas, rotation) {
  if (Math.abs(rotation) < 0.002) {
    return cloneCanvas(sourceCanvas);
  }
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const rotatedWidth = Math.round(Math.abs(cos) * width + Math.abs(sin) * height);
  const rotatedHeight = Math.round(Math.abs(sin) * width + Math.abs(cos) * height);
  const rotatedCanvas = document.createElement('canvas');
  rotatedCanvas.width = rotatedWidth;
  rotatedCanvas.height = rotatedHeight;
  const ctx = rotatedCanvas.getContext('2d');
  ctx.translate(rotatedWidth / 2, rotatedHeight / 2);
  ctx.rotate(rotation);
  ctx.drawImage(sourceCanvas, -width / 2, -height / 2);
  return rotatedCanvas;
}

// Largest axis-aligned rectangle (same aspect ratio as w×h) that fits inside a
// w×h rectangle rotated by `angle` radians, leaving no empty corners.
function largestRotatedRect(w, h, angle) {
  if (w <= 0 || h <= 0) return { w: 0, h: 0 };
  const a = Math.abs(angle);
  const sinA = Math.abs(Math.sin(a));
  const cosA = Math.abs(Math.cos(a));
  const widthIsLonger = w >= h;
  const sideLong = widthIsLonger ? w : h;
  const sideShort = widthIsLonger ? h : w;

  let wr;
  let hr;
  if (sideShort <= 2 * sinA * cosA * sideLong || Math.abs(sinA - cosA) < 1e-10) {
    const x = 0.5 * sideShort;
    if (widthIsLonger) {
      wr = sinA > 0 ? x / sinA : w;
      hr = cosA > 0 ? x / cosA : h;
    } else {
      wr = cosA > 0 ? x / cosA : w;
      hr = sinA > 0 ? x / sinA : h;
    }
  } else {
    const cos2a = cosA * cosA - sinA * sinA;
    wr = (w * cosA - h * sinA) / cos2a;
    hr = (h * cosA - w * sinA) / cos2a;
  }
  return { w: Math.max(1, wr), h: Math.max(1, hr) };
}

function rotatePoint(px, py, w, h, rw, rh, rotation) {
  const dx = px - w / 2;
  const dy = py - h / 2;
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  return {
    x: rw / 2 + cos * dx - sin * dy,
    y: rh / 2 + sin * dx + cos * dy
  };
}

// Shift the leveling crop toward a thirds line — but only along an axis where
// the whole subject stays inside the crop, so nothing important gets cut.
function nudgeToThirds(params) {
  const { rotation, w, h, rw, rh, cropX, cropY, cropW, cropH, metrics } = params;
  const center = rotatePoint(metrics.subjectCenter.x, metrics.subjectCenter.y, w, h, rw, rh, rotation);
  const r = metrics.subjectRect;
  const corners = [
    [r.x, r.y],
    [r.x + r.width, r.y],
    [r.x, r.y + r.height],
    [r.x + r.width, r.y + r.height]
  ].map(([x, y]) => rotatePoint(x, y, w, h, rw, rh, rotation));
  const minSx = Math.min(...corners.map(p => p.x));
  const maxSx = Math.max(...corners.map(p => p.x));
  const minSy = Math.min(...corners.map(p => p.y));
  const maxSy = Math.max(...corners.map(p => p.y));

  const strength = 0.6;
  const thirdsX = [cropW / 3, (2 * cropW) / 3];
  const thirdsY = [cropH / 3, (2 * cropH) / 3];

  const relX = center.x - cropX;
  const relY = center.y - cropY;
  const targetX = thirdsX.reduce((a, b) => (Math.abs(b - relX) < Math.abs(a - relX) ? b : a));
  const targetY = thirdsY.reduce((a, b) => (Math.abs(b - relY) < Math.abs(a - relY) ? b : a));

  let candidateX = cropX + ((center.x - targetX) - cropX) * strength;
  let candidateY = cropY + ((center.y - targetY) - cropY) * strength;
  candidateX = clampRange(candidateX, 0, rw - cropW);
  candidateY = clampRange(candidateY, 0, rh - cropH);

  let outX = cropX;
  let outY = cropY;
  if (minSx >= candidateX && maxSx <= candidateX + cropW) outX = candidateX;
  if (minSy >= candidateY && maxSy <= candidateY + cropH) outY = candidateY;
  return { x: outX, y: outY };
}

// Rotate by `rawAngle` (clamped to ±maxAngle), then crop the largest inscribed
// rectangle so the rotation leaves no blank corners. doThirds adds the safe
// rule-of-thirds reframe (Landscape mode only).
function applyStraighten(sourceCanvas, metrics, rawAngle, maxAngle, doThirds) {
  const w = sourceCanvas.width;
  const h = sourceCanvas.height;
  const angleDeg = clamp(rawAngle, -maxAngle, maxAngle);
  if (Math.abs(angleDeg) < 0.05) {
    return sourceCanvas;
  }
  const rotation = (-angleDeg * Math.PI) / 180;

  const rotated = rotateCanvas(sourceCanvas, rotation);
  const rw = rotated.width;
  const rh = rotated.height;

  const inscribed = largestRotatedRect(w, h, rotation);
  const cropW = Math.max(1, Math.min(rw, Math.floor(inscribed.w)));
  const cropH = Math.max(1, Math.min(rh, Math.floor(inscribed.h)));

  let cropX = (rw - cropW) / 2;
  let cropY = (rh - cropH) / 2;

  if (doThirds && metrics.subjectRect) {
    const nudged = nudgeToThirds({ rotation, w, h, rw, rh, cropX, cropY, cropW, cropH, metrics });
    cropX = nudged.x;
    cropY = nudged.y;
  }

  const out = document.createElement('canvas');
  out.width = cropW;
  out.height = cropH;
  out.getContext('2d').drawImage(rotated, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
  return out;
}

// Shadow lever: a smooth global gamma lift (candidate "A"). It brightens
// shadows/midtones, never blows highlights, and keeps the natural look — no
// added sharpening, clarity, or denoise.
// A Gaussian-blurred copy of a canvas, returned as raw pixel data.
function blurredData(sourceCanvas, px) {
  const c = document.createElement('canvas');
  c.width = sourceCanvas.width;
  c.height = sourceCanvas.height;
  const ctx = c.getContext('2d');
  ctx.filter = `blur(${px}px)`;
  ctx.drawImage(sourceCanvas, 0, 0);
  ctx.filter = 'none';
  return ctx.getImageData(0, 0, c.width, c.height).data;
}

// Detail lever: a gentle "punch" — deepen blacks a touch and ease the
// highlights for crisper-looking edges, plus a very light luminance-only
// sharpen and a touch of grain so it stays natural (not plasticky).
// Calibrated against a user before/after pair.
function applyDetail(canvas) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const { data } = imageData;

  // 1) Gentle tone: deepen blacks (black point) + ease highlights (anchored at
  //    white). Per-channel via a shared LUT.
  const bp = 0.02; // black point
  const hl = 0.14; // highlight ease
  const lut = new Uint8ClampedArray(256);
  for (let v = 0; v < 256; v++) {
    let y = Math.min(1, Math.max(0, (v / 255 - bp) / (1 - bp)));
    const t = Math.min(1, Math.max(0, (y - 0.5) / 0.5));
    y = y - hl * t * (1 - y);
    lut[v] = Math.round(Math.min(1, Math.max(0, y)) * 255);
  }
  for (let i = 0; i < data.length; i += 4) {
    data[i] = lut[data[i]];
    data[i + 1] = lut[data[i + 1]];
    data[i + 2] = lut[data[i + 2]];
  }
  ctx.putImageData(imageData, 0, 0); // write toned so the blur samples it

  // 2) Light luminance-only sharpen (no colour shift) + 3) a touch of grain.
  const blur = blurredData(canvas, 1);
  const sharp = 0.03;
  const grain = 1.2;
  for (let i = 0; i < data.length; i += 4) {
    const l = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    const lb = 0.2126 * blur[i] + 0.7152 * blur[i + 1] + 0.0722 * blur[i + 2];
    const add = sharp * (l - lb) + (Math.random() - 0.5) * grain;
    data[i] = clamp(data[i] + add);
    data[i + 1] = clamp(data[i + 1] + add);
    data[i + 2] = clamp(data[i + 2] + add);
  }
  ctx.putImageData(imageData, 0, 0);
}

function applyShadowLift(canvas, metrics) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const { data } = imageData;

  const exposure = metrics.exposure;
  const dark = Math.max(0, (170 - exposure) / 170); // darker image -> more lift
  const clipBoost = Math.min(0.15, metrics.shadowClipping * 1.5);
  const bright = Math.max(0, (exposure - 205) / 50); // ease off already-bright shots
  const gamma = Math.min(0.95, Math.max(0.55, 0.7 - dark * 0.16 - clipBoost + bright * 0.2));

  if (gamma >= 0.999) {
    return;
  }

  const lut = new Uint8ClampedArray(256);
  for (let v = 0; v < 256; v++) {
    lut[v] = Math.round(255 * Math.pow(v / 255, gamma));
  }
  for (let i = 0; i < data.length; i += 4) {
    data[i] = lut[data[i]];
    data[i + 1] = lut[data[i + 1]];
    data[i + 2] = lut[data[i + 2]];
  }

  ctx.putImageData(imageData, 0, 0);
}

// Colour lever: auto white balance. Anchor the near-white areas to neutral so
// the photo reads as natural white light instead of a warm/cool cast.
function applyWhiteBalance(canvas) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  const n = width * height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const hist = new Float32Array(256);
  for (let i = 0; i < n; i++) {
    const idx = i * 4;
    const l = 0.2126 * data[idx] + 0.7152 * data[idx + 1] + 0.0722 * data[idx + 2];
    hist[l < 0 ? 0 : l > 255 ? 255 : l | 0]++;
  }
  let acc = 0;
  let thr = 255;
  const target = n * 0.1; // brightest ~10% = the "white" reference
  for (let v = 255; v >= 0; v--) { acc += hist[v]; if (acc >= target) { thr = v; break; } }

  let sr = 0;
  let sg = 0;
  let sb = 0;
  let count = 0;
  for (let i = 0; i < data.length; i += 4) {
    const l = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    if (l >= thr) { sr += data[i]; sg += data[i + 1]; sb += data[i + 2]; count++; }
  }
  if (count === 0) return;
  const ar = sr / count;
  const ag = sg / count;
  const ab = sb / count;
  const gray = (ar + ag + ab) / 3;
  const gr = clampRange(gray / ar, 0.8, 1.25);
  const gg = clampRange(gray / ag, 0.8, 1.25);
  const gb = clampRange(gray / ab, 0.8, 1.25);
  if (Math.abs(gr - 1) < 0.01 && Math.abs(gg - 1) < 0.01 && Math.abs(gb - 1) < 0.01) return;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(data[i] * gr);
    data[i + 1] = clamp(data[i + 1] * gg);
    data[i + 2] = clamp(data[i + 2] * gb);
  }
  ctx.putImageData(imageData, 0, 0);
}

async function processFile(file) {
  setLoading(true);
  downloadButton.disabled = true;
  try {
    const { canvas, imageData } = await readImageFile(file);
    lastOriginalCanvas = canvas;
    currentMetrics = computeMetrics(imageData);
    renderMetrics(currentMetrics);
    updateAnalysisSummary(currentMetrics);

    renderToCanvas(originalCanvas, lastOriginalCanvas, {
      showGuides: toggleGrid.checked,
      metrics: currentMetrics,
      includeAnnotations: true
    });
    setCanvasMeta(originalMeta, lastOriginalCanvas);

    lastImprovedCanvas = buildImproved(lastOriginalCanvas, currentMetrics);
    renderToCanvas(improvedCanvas, lastImprovedCanvas, {
      showGuides: toggleGrid.checked,
      metrics: currentMetrics,
      includeAnnotations: false
    });
    setCanvasMeta(improvedMeta, lastImprovedCanvas);

    await prepareDownload(lastImprovedCanvas);
    document.body.classList.add('has-image');
  } catch (error) {
    console.error(error);
    showError('error_processing', 'Unable to process this file. Please try another image.');
  } finally {
    setLoading(false);
  }
}

function handleFileInput(event) {
  const input = event.target;
  if (!input || !input.files || input.files.length === 0) {
    return;
  }
  const file = input.files[0];
  // Clear the value so selecting the same file again still fires a change event.
  input.value = '';
  if (file) {
    processFile(file);
  }
}

function handleDrop(event) {
  event.preventDefault();
  dropZone.classList.remove('dragover');
  const transfer = event.dataTransfer;
  if (!transfer || !transfer.files || transfer.files.length === 0) {
    return;
  }
  const file = transfer.files[0];
  if (file) {
    processFile(file);
  }
}

function handleDrag(event) {
  event.preventDefault();
  if (event.type === 'dragover') {
    dropZone.classList.add('dragover');
  } else {
    dropZone.classList.remove('dragover');
  }
}

function initEventListeners() {
  uploadButton.addEventListener('click', event => {
    // The button sits inside the drop-zone; stop the click from bubbling so the
    // drop-zone handler doesn't open a second file picker (which corrupts the
    // picker state and blocks subsequent uploads).
    event.stopPropagation();
    fileInput.click();
  });
  fileInput.addEventListener('change', handleFileInput);
  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      fileInput.click();
    }
  });
  dropZone.addEventListener('dragover', handleDrag);
  dropZone.addEventListener('dragleave', handleDrag);
  dropZone.addEventListener('drop', handleDrop);
  toggleGrid.addEventListener('change', refreshCanvases);
  toggleComposition.addEventListener('change', () => {
    featureComposition = toggleComposition.checked;
    rebuildImproved();
  });
  compModeButtons.forEach(btn => {
    btn.addEventListener('click', event => {
      event.preventDefault();
      const mode = btn.dataset.mode;
      if (mode === compMode) return;
      compMode = mode;
      compModeButtons.forEach(b => b.classList.toggle('active', b.dataset.mode === compMode));
      rebuildImproved();
    });
  });
  resetButton.addEventListener('click', resetInterface);
  downloadButton.addEventListener('click', () => {
    if (!currentDownloadUrl) return;
    const a = document.createElement('a');
    a.href = currentDownloadUrl;
    a.download = downloadButton.dataset.filename || 'fixed-photo.png';
    a.click();
  });
  langToggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.lang !== currentLang) {
        currentLang = btn.dataset.lang;
        translatePage();
        refreshCanvases();
      }
    });
  });
}

async function loadDictionaries() {
  const langs = Object.keys(fallbackDictionaries);
  await Promise.all(
    langs.map(async lang => {
      try {
        const response = await fetch(`translations/${lang}.json`, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Failed to load dictionary for ${lang}`);
        }
        const data = await response.json();
        dictionaries[lang] = { ...dictionaries[lang], ...data };
      } catch (error) {
        console.warn('Dictionary load failed', error);
        if (!dictionaryWarningShown) {
          showError('error_dictionary', 'Using built-in language defaults. Some translations may be missing.');
          dictionaryWarningShown = true;
        }
      }
    })
  );
  translatePage();
}

async function init() {
  dictionaries = cloneFallback();
  featureComposition = toggleComposition ? toggleComposition.checked : true;
  downloadButton.disabled = true;
  translatePage();
  initEventListeners();
  try {
    await loadDictionaries();
  } catch (error) {
    console.warn('Unable to refresh dictionaries', error);
  }
  engineStatusState = 'ready';
  updateStatusBadge();
}

init();

window.addEventListener('beforeunload', () => {
  cleanupCanvases();
  revokeDownloadUrl();
});
