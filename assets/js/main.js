+const MAX_DIMENSION = 2048;
+
+const metricsContainer = document.getElementById('metrics');
+const originalCanvas = document.getElementById('original-canvas');
+const improvedCanvas = document.getElementById('improved-canvas');
+const originalMeta = document.getElementById('original-meta');
+const improvedMeta = document.getElementById('improved-meta');
+const downloadButton = document.getElementById('download-button');
+const toggleGrid = document.getElementById('toggle-grid');
+const resetButton = document.getElementById('reset-button');
+const dropZone = document.getElementById('drop-zone');
+const fileInput = document.getElementById('file-input');
+const uploadButton = document.getElementById('upload-button');
+const loadingIndicator = document.getElementById('loading-indicator');
+const metricTemplate = document.getElementById('metric-template');
+const langToggleButtons = document.querySelectorAll('.lang-toggle button');
+const analysisSummary = document.getElementById('analysis-summary');
+const engineStatus = document.getElementById('engine-status');
+const errorToast = document.getElementById('error-toast');
+
+const fallbackDictionaries = {
+  'en-US': {
+    "app_title": "Photo Aesthetic Assistant",
+    "app_tagline": "Private, instant composition feedback in your browser.",
+    "analysis_heading": "Analyse & enhance instantly",
+    "analysis_subheading": "Upload a single photo to receive automatic composition guidance and a refined suggestion.",
+    "drop_instructions": "Drop an image here or click to choose a file.",
+    "drop_hint": "JPG, PNG, HEIC up to 12 MP. Processed privately on-device.",
+    "select_button": "Select Photo",
+    "reset_button": "Reset",
+    "original_title": "Original",
+    "improved_title": "Improved Suggestion",
+    "download_button": "Download Improved Image",
+    "toggle_grid": "Show guides",
+    "footer_note": "All processing happens locally in your browser. No uploads. No tracking.",
+    "loading": "Processing photo…",
+    "engine_loading": "Loading vision engine…",
+    "engine_ready": "Vision engine ready",
+    "engine_error": "Vision engine unavailable",
+    "metric_main_subject": "Main subject position",
+    "metric_horizon": "Horizon angle",
+    "metric_rule_of_thirds": "Rule-of-thirds alignment",
+    "metric_sharpness": "Sharpness variance",
+    "metric_exposure": "Exposure",
+    "metric_contrast": "Contrast",
+    "metric_saturation": "Saturation",
+    "metric_color_balance": "Color balance",
+    "metric_foreground_background": "Foreground vs. background",
+    "metric_subject_size": "Subject size",
+    "metric_download_name": "improved-photo",
+    "metric_feedback": "Suggestions",
+    "analysis_summary_default": "Upload a photo to see composition notes tailored to your scene.",
+    "summary_subject_missing": "<strong>Subject:</strong> No dominant subject detected — choose a clearer focal point.",
+    "summary_subject_centered": "<strong>Subject:</strong> Nicely balanced near the thirds intersections.",
+    "summary_subject_off_center": "<strong>Subject:</strong> Off-centre — cropping will guide the eye to a stronger point.",
+    "summary_horizon_level": "<strong>Horizon:</strong> Already level and steady.",
+    "summary_horizon_tilted": "<strong>Horizon:</strong> Tilted by {{angle}} — auto rotation applied.",
+    "summary_exposure_dark": "<strong>Light:</strong> Slightly underexposed; midtones lifted in the suggestion.",
+    "summary_exposure_bright": "<strong>Light:</strong> Highlights are bright; toned down for balance.",
+    "summary_exposure_balanced": "<strong>Light:</strong> Balanced exposure with healthy midtones.",
+    "summary_balance_foreground": "<strong>Depth:</strong> Foreground dominates; background softened for separation.",
+    "summary_balance_background": "<strong>Depth:</strong> Background detail is strong; foreground contrast improved.",
+    "summary_balance_even": "<strong>Depth:</strong> Foreground and background feel evenly weighted.",
+    "summary_sharpness_soft": "<strong>Texture:</strong> Edges read soft — stabilise capture for extra crispness.",
+    "tip_subject_title": "Find the subject",
+    "tip_subject_text": "The assistant highlights the strongest contour to estimate your main subject position.",
+    "tip_horizon_title": "Balance the horizon",
+    "tip_horizon_text": "We detect dominant lines to level the scene and keep skies straight.",
+    "tip_color_title": "Polish the tones",
+    "tip_color_text": "Subtle exposure, contrast, and color tweaks keep the improved version natural.",
+    "meta_dimensions": "{{width}}×{{height}} px",
+    "error_processing": "Unable to process this file. Please try another image.",
+    "error_dictionary": "Using built-in language defaults. Some translations may be missing.",
+    "feedback_rotation": "Slightly rotate the horizon to level the scene.",
+    "feedback_crop": "Consider cropping so the subject sits on a thirds intersection.",
+    "feedback_exposure": "Brighten the midtones for better balance.",
+    "feedback_contrast": "Increase contrast to emphasize depth.",
+    "feedback_saturation": "Boost saturation slightly for richer color.",
+    "feedback_sharpness": "Try increasing focus or reducing camera shake.",
+    "feedback_balance": "Balance foreground and background elements for clarity.",
+    "feedback_good": "Great balance! Only minor refinements suggested."
+  },
+  'zh-TW': {
+    "app_title": "影像美感助手",
+    "app_tagline": "完全在瀏覽器內即時提供構圖建議，隱私零外洩。",
+    "analysis_heading": "立即分析並優化",
+    "analysis_subheading": "上傳單張照片，即可獲得自動構圖建議與優化版本。",
+    "drop_instructions": "拖曳影像到此或點擊選擇檔案。",
+    "drop_hint": "支援 JPG、PNG、HEIC，最多 1200 萬像素。所有處理皆在本機完成。",
+    "select_button": "選擇照片",
+    "reset_button": "重設",
+    "original_title": "原始影像",
+    "improved_title": "優化建議",
+    "download_button": "下載優化影像",
+    "toggle_grid": "顯示輔助線",
+    "footer_note": "所有處理都在您的瀏覽器內進行，不需上傳、不會追蹤。",
+    "loading": "影像分析中…",
+    "engine_loading": "視覺引擎載入中…",
+    "engine_ready": "視覺引擎就緒",
+    "engine_error": "視覺引擎無法使用",
+    "metric_main_subject": "主體位置",
+    "metric_horizon": "地平線角度",
+    "metric_rule_of_thirds": "三分構圖對齊",
+    "metric_sharpness": "銳利度變異",
+    "metric_exposure": "曝光",
+    "metric_contrast": "對比",
+    "metric_saturation": "飽和度",
+    "metric_color_balance": "色彩平衡",
+    "metric_foreground_background": "前景 / 背景比例",
+    "metric_subject_size": "主體比例",
+    "metric_download_name": "improved-photo",
+    "metric_feedback": "建議",
+    "analysis_summary_default": "上傳照片即可看到針對場景量身打造的構圖重點。",
+    "summary_subject_missing": "<strong>主體：</strong> 未偵測到明顯主體，請選擇更清楚的焦點。",
+    "summary_subject_centered": "<strong>主體：</strong> 已落在三分線附近，構圖平衡。",
+    "summary_subject_off_center": "<strong>主體：</strong> 稍微偏離三分線，裁切後可更聚焦。",
+    "summary_horizon_level": "<strong>地平線：</strong> 已經水平穩定。",
+    "summary_horizon_tilted": "<strong>地平線：</strong> 傾斜 {{angle}}，已自動校正。",
+    "summary_exposure_dark": "<strong>光線：</strong> 稍微偏暗，優化版本提升了中間調。",
+    "summary_exposure_bright": "<strong>光線：</strong> 高光較亮，已適度壓低。",
+    "summary_exposure_balanced": "<strong>光線：</strong> 曝光均衡，中間調健康。",
+    "summary_balance_foreground": "<strong>景深：</strong> 前景佔比高，已讓背景更柔和。",
+    "summary_balance_background": "<strong>景深：</strong> 背景細節強烈，已提升前景對比。",
+    "summary_balance_even": "<strong>景深：</strong> 前景與背景比例平衡。",
+    "summary_sharpness_soft": "<strong>細節：</strong> 邊緣略軟，可嘗試穩定拍攝以提高銳利度。",
+    "tip_subject_title": "鎖定主體",
+    "tip_subject_text": "透過強烈輪廓估計最有力的主體位置。",
+    "tip_horizon_title": "維持水平",
+    "tip_horizon_text": "偵測主要線條自動校正地平線。",
+    "tip_color_title": "調整色調",
+    "tip_color_text": "細緻的曝光與色彩調整讓畫面自然不失真。",
+    "meta_dimensions": "{{width}}×{{height}} px",
+    "error_processing": "此檔案無法處理，請改用其他影像。",
+    "error_dictionary": "使用內建語系字串，部分翻譯可能缺少。",
+    "feedback_rotation": "稍微旋轉地平線以保持水平。",
+    "feedback_crop": "調整裁切讓主體落在三分線上。",
+    "feedback_exposure": "提升中間調亮度讓畫面更平衡。",
+    "feedback_contrast": "增加對比以強化景深層次。",
+    "feedback_saturation": "些微提升飽和度讓色彩更鮮明。",
+    "feedback_sharpness": "拍攝時保持穩定以獲得更銳利的影像。",
+    "feedback_balance": "調整前景與背景比例讓構圖更清晰。",
+    "feedback_good": "整體表現優異，只需細部微調。"
+  }
+};
+
+let dictionaries = cloneFallback();
+let currentLang = 'en-US';
+let currentMetrics = null;
+let currentDownloadUrl = null;
+let lastOriginalCanvas = null;
+let lastImprovedCanvas = null;
+let engineStatusState = 'loading';
+let errorTimeoutId = null;
+let dictionaryWarningShown = false;
+
+const formatters = {
+  percent: value => `${Math.round(value * 100)}%`,
+  degrees: value => `${value.toFixed(1)}°`,
+  score: value => value.toFixed(2),
+  numeric: value => value.toFixed(1)
+};
+
+function cloneFallback() {
+  return JSON.parse(JSON.stringify(fallbackDictionaries));
+}
+
+function updateStatusBadge() {
+  if (!engineStatus) return;
+  const dict = dictionaries[currentLang] || {};
+  engineStatus.classList.remove('ready', 'error');
+  let key = 'engine_loading';
+  if (engineStatusState === 'ready') {
+    key = 'engine_ready';
+    engineStatus.classList.add('ready');
+  } else if (engineStatusState === 'error') {
+    key = 'engine_error';
+    engineStatus.classList.add('error');
+  }
+  engineStatus.textContent = dict[key] || engineStatus.textContent;
+}
+
+function setLoading(isLoading) {
+  loadingIndicator.hidden = !isLoading;
+  dropZone.setAttribute('aria-busy', String(isLoading));
+  dropZone.classList.toggle('processing', isLoading);
+}
+
+function setCanvasMeta(element, source) {
+  if (!element) return;
+  if (!source) {
+    element.textContent = '';
+    return;
+  }
+  const dict = dictionaries[currentLang] || {};
+  const template = dict['meta_dimensions'] || '{{width}}×{{height}} px';
+  element.textContent = template
+    .replace('{{width}}', source.width)
+    .replace('{{height}}', source.height);
+}
+
+function drawGuides(canvas, metrics, options = {}) {
+  const { showGuides = true, includeAnnotations = true } = options;
+  if (!showGuides) return;
+  const ctx = canvas.getContext('2d');
+  const w = canvas.width;
+  const h = canvas.height;
+  ctx.save();
+  ctx.lineWidth = 1.1;
+  ctx.strokeStyle = 'rgba(91, 192, 255, 0.5)';
+  ctx.setLineDash([6, 6]);
+  for (let i = 1; i <= 2; i++) {
+    const x = (w * i) / 3;
+    ctx.beginPath();
+    ctx.moveTo(x, 0);
+    ctx.lineTo(x, h);
+    ctx.stroke();
+    const y = (h * i) / 3;
+    ctx.beginPath();
+    ctx.moveTo(0, y);
+    ctx.lineTo(w, y);
+    ctx.stroke();
+  }
+  ctx.setLineDash([]);
+  if (includeAnnotations && metrics && metrics.subjectRect) {
+    const scaleX = w / metrics.imageSize.width;
+    const scaleY = h / metrics.imageSize.height;
+    ctx.strokeStyle = 'rgba(244, 114, 182, 0.75)';
+    ctx.lineWidth = 1.4;
+    ctx.strokeRect(
+      metrics.subjectRect.x * scaleX,
+      metrics.subjectRect.y * scaleY,
+      metrics.subjectRect.width * scaleX,
+      metrics.subjectRect.height * scaleY
+    );
+  }
+  if (includeAnnotations && metrics && metrics.horizonLine) {
+    const scaleX = w / metrics.imageSize.width;
+    const scaleY = h / metrics.imageSize.height;
+    ctx.strokeStyle = 'rgba(94, 234, 212, 0.75)';
+    ctx.lineWidth = 1.2;
+    ctx.beginPath();
+    ctx.moveTo(metrics.horizonLine[0].x * scaleX, metrics.horizonLine[0].y * scaleY);
+    ctx.lineTo(metrics.horizonLine[1].x * scaleX, metrics.horizonLine[1].y * scaleY);
+    ctx.stroke();
+  }
+  ctx.restore();
+}
+
+function showError(messageKey, fallback) {
+  if (!errorToast) return;
+  const dict = dictionaries[currentLang] || {};
+  errorToast.textContent = dict[messageKey] || fallback || 'Something went wrong.';
+  errorToast.hidden = false;
+  clearTimeout(errorTimeoutId);
+  errorTimeoutId = setTimeout(() => {
+    errorToast.hidden = true;
+  }, 4000);
+}
+
+function cleanupCanvases() {
+  lastOriginalCanvas = null;
+  lastImprovedCanvas = null;
+}
+
+function resetInterface() {
+  cleanupCanvases();
+  currentMetrics = null;
+  metricsContainer.innerHTML = '';
+  const dict = dictionaries[currentLang] || {};
+  analysisSummary.innerHTML = dict['analysis_summary_default'] || '';
+  const originalCtx = originalCanvas.getContext('2d');
+  originalCtx.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
+  const improvedCtx = improvedCanvas.getContext('2d');
+  improvedCtx.clearRect(0, 0, improvedCanvas.width, improvedCanvas.height);
+  setCanvasMeta(originalMeta, null);
+  setCanvasMeta(improvedMeta, null);
+  downloadButton.disabled = true;
+  revokeDownloadUrl();
+}
+
+function revokeDownloadUrl() {
+  if (currentDownloadUrl) {
+    URL.revokeObjectURL(currentDownloadUrl);
+    currentDownloadUrl = null;
+  }
+}
+
+async function prepareDownload(sourceCanvas) {
+  revokeDownloadUrl();
+  await new Promise(resolve => {
+    sourceCanvas.toBlob(blob => {
+      const dict = dictionaries[currentLang] || {};
+      const name = dict['metric_download_name'] || 'improved-photo';
+      if (blob) {
+        currentDownloadUrl = URL.createObjectURL(blob);
+        downloadButton.disabled = false;
+        downloadButton.dataset.filename = `${name}.png`;
+      } else {
+        downloadButton.disabled = true;
+      }
+      resolve();
+    }, 'image/png');
+  });
+}
+
+function renderToCanvas(targetCanvas, sourceCanvas, options = {}) {
+  targetCanvas.width = sourceCanvas.width;
+  targetCanvas.height = sourceCanvas.height;
+  const ctx = targetCanvas.getContext('2d');
+  ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
+  ctx.drawImage(sourceCanvas, 0, 0);
+  drawGuides(targetCanvas, options.metrics, {
+    showGuides: options.showGuides,
+    includeAnnotations: options.includeAnnotations
+  });
+}
+
+function refreshCanvases() {
+  if (!currentMetrics) return;
+  if (lastOriginalCanvas) {
+    renderToCanvas(originalCanvas, lastOriginalCanvas, {
+      showGuides: toggleGrid.checked,
+      metrics: currentMetrics,
+      includeAnnotations: true
+    });
+    setCanvasMeta(originalMeta, lastOriginalCanvas);
+  }
+  if (lastImprovedCanvas) {
+    renderToCanvas(improvedCanvas, lastImprovedCanvas, {
+      showGuides: toggleGrid.checked,
+      metrics: currentMetrics,
+      includeAnnotations: false
+    });
+    setCanvasMeta(improvedMeta, lastImprovedCanvas);
+  }
+}
+
+function translatePage() {
+  const dict = dictionaries[currentLang] || {};
+  document.documentElement.lang = currentLang;
+  document.querySelectorAll('[data-i18n]').forEach(el => {
+    const key = el.getAttribute('data-i18n');
+    if (dict[key]) {
+      el.textContent = dict[key];
+    }
+  });
+  langToggleButtons.forEach(btn => {
+    btn.classList.toggle('active', btn.dataset.lang === currentLang);
+  });
+  if (!currentMetrics) {
+    analysisSummary.innerHTML = dict['analysis_summary_default'] || '';
+  } else {
+    renderMetrics(currentMetrics);
+    updateAnalysisSummary(currentMetrics);
+    setCanvasMeta(originalMeta, lastOriginalCanvas);
+    setCanvasMeta(improvedMeta, lastImprovedCanvas);
+  }
+  updateStatusBadge();
+}
+
+function renderMetrics(metrics) {
+  const dict = dictionaries[currentLang] || {};
+  metricsContainer.innerHTML = '';
+  const entries = [
+    ['metric_main_subject', `${formatters.percent(Math.max(0, 0.5 - Math.abs(metrics.subjectOffset.x)))} / ${formatters.percent(Math.max(0, 0.5 - Math.abs(metrics.subjectOffset.y)))}`],
+    ['metric_horizon', formatters.degrees(metrics.horizonAngle)],
+    ['metric_rule_of_thirds', formatters.score(metrics.ruleOfThirdsScore)],
+    ['metric_sharpness', formatters.numeric(metrics.sharpnessVariance)],
+    ['metric_exposure', formatters.numeric(metrics.exposure)],
+    ['metric_contrast', formatters.numeric(metrics.contrast)],
+    ['metric_saturation', formatters.numeric(metrics.saturation)],
+    ['metric_color_balance', `${metrics.colorBalance.r.toFixed(0)} / ${metrics.colorBalance.g.toFixed(0)} / ${metrics.colorBalance.b.toFixed(0)}`],
+    ['metric_foreground_background', formatters.score(metrics.foregroundBackground)],
+    ['metric_subject_size', formatters.percent(metrics.subjectSize)]
+  ];
+
+  for (const [labelKey, value] of entries) {
+    const fragment = metricTemplate.content.cloneNode(true);
+    fragment.querySelector('.metric-label').textContent = dict[labelKey] || labelKey;
+    fragment.querySelector('.metric-value').textContent = value;
+    metricsContainer.appendChild(fragment);
+  }
+
+  const feedbackWrap = document.createElement('div');
+  feedbackWrap.className = 'metric';
+  const label = document.createElement('span');
+  label.className = 'metric-label';
+  label.textContent = dict['metric_feedback'] || 'Suggestions';
+  const valueSpan = document.createElement('span');
+  valueSpan.className = 'metric-value';
+  valueSpan.innerHTML = metrics.feedback.map(key => dict[key] || key).join('<br>');
+  feedbackWrap.append(label, valueSpan);
+  metricsContainer.appendChild(feedbackWrap);
+}
+
+function updateAnalysisSummary(metrics) {
+  const dict = dictionaries[currentLang] || {};
+  if (!analysisSummary) return;
+  if (!metrics) {
+    analysisSummary.innerHTML = dict['analysis_summary_default'] || '';
+    return;
+  }
+
+  const segments = [];
+  if (!metrics.subjectRect) {
+    segments.push(dict['summary_subject_missing']);
+  } else {
+    const offset = Math.max(Math.abs(metrics.subjectOffset.x), Math.abs(metrics.subjectOffset.y));
+    if (offset < 0.12) {
+      segments.push(dict['summary_subject_centered']);
+    } else {
+      segments.push(dict['summary_subject_off_center']);
+    }
+  }
+
+  if (Math.abs(metrics.horizonAngle) <= 1) {
+    segments.push(dict['summary_horizon_level']);
+  } else {
+    const template = dict['summary_horizon_tilted'] || '';
+    segments.push(template.replace('{{angle}}', formatters.degrees(Math.abs(metrics.horizonAngle))));
+  }
+
+  if (metrics.exposure < 110) {
+    segments.push(dict['summary_exposure_dark']);
+  } else if (metrics.exposure > 150) {
+    segments.push(dict['summary_exposure_bright']);
+  } else {
+    segments.push(dict['summary_exposure_balanced']);
+  }
+
+  if (metrics.foregroundBackground > 1.2) {
+    segments.push(dict['summary_balance_foreground']);
+  } else if (metrics.foregroundBackground < 0.8) {
+    segments.push(dict['summary_balance_background']);
+  } else {
+    segments.push(dict['summary_balance_even']);
+  }
+
+  if (metrics.sharpnessVariance < 120) {
+    segments.push(dict['summary_sharpness_soft']);
+  }
+
+  analysisSummary.innerHTML = segments.filter(Boolean).join(' ');
+}
+
+function scaleDimensions(width, height, maxSize) {
+  if (Math.max(width, height) <= maxSize) {
+    return { width, height };
+  }
+  const ratio = width / height;
+  if (ratio > 1) {
+    return { width: maxSize, height: Math.round(maxSize / ratio) };
+  }
+  return { width: Math.round(maxSize * ratio), height: maxSize };
+}
+
+function readFileAsArrayBuffer(file, length = 128 * 1024) {
+  return new Promise((resolve, reject) => {
+    const reader = new FileReader();
+    reader.onload = () => resolve(reader.result);
+    reader.onerror = () => reject(reader.error);
+    reader.readAsArrayBuffer(file.slice(0, length));
+  });
+}
+
+async function getExifOrientation(file) {
+  try {
+    const buffer = await readFileAsArrayBuffer(file);
+    const view = new DataView(buffer);
+    if (view.getUint16(0, false) !== 0xffd8) {
+      return 1;
+    }
+    let offset = 2;
+    const length = view.byteLength;
+    while (offset < length) {
+      const marker = view.getUint16(offset, false);
+      offset += 2;
+      if (marker === 0xffe1) {
+        const blockLength = view.getUint16(offset, false);
+        offset += 2;
+        if (view.getUint32(offset, false) !== 0x45786966) {
+          break;
+        }
+        offset += 6;
+        const little = view.getUint16(offset, false) === 0x4949;
+        offset += view.getUint32(offset + 4, little);
+        const tags = view.getUint16(offset, little);
+        offset += 2;
+        for (let i = 0; i < tags; i++) {
+          const tagOffset = offset + i * 12;
+          if (view.getUint16(tagOffset, little) === 0x0112) {
+            return view.getUint16(tagOffset + 8, little);
+          }
+        }
+      } else if ((marker & 0xff00) !== 0xff00) {
+        break;
+      } else {
+        offset += view.getUint16(offset, false);
+      }
+    }
+  } catch (error) {
+    console.warn('Failed to read EXIF orientation', error);
+  }
+  return 1;
+}
+
+function orientImageSource(source, orientation) {
+  const width = source.width || source.naturalWidth;
+  const height = source.height || source.naturalHeight;
+  const canvas = document.createElement('canvas');
+  const ctx = canvas.getContext('2d');
+
+  switch (orientation) {
+    case 2:
+      canvas.width = width;
+      canvas.height = height;
+      ctx.translate(width, 0);
+      ctx.scale(-1, 1);
+      break;
+    case 3:
+      canvas.width = width;
+      canvas.height = height;
+      ctx.translate(width, height);
+      ctx.rotate(Math.PI);
+      break;
+    case 4:
+      canvas.width = width;
+      canvas.height = height;
+      ctx.translate(0, height);
+      ctx.scale(1, -1);
+      break;
+    case 5:
+      canvas.width = height;
+      canvas.height = width;
+      ctx.rotate(0.5 * Math.PI);
+      ctx.scale(1, -1);
+      break;
+    case 6:
+      canvas.width = height;
+      canvas.height = width;
+      ctx.rotate(0.5 * Math.PI);
+      ctx.translate(0, -height);
+      break;
+    case 7:
+      canvas.width = height;
+      canvas.height = width;
+      ctx.rotate(0.5 * Math.PI);
+      ctx.translate(width, -height);
+      ctx.scale(-1, 1);
+      break;
+    case 8:
+      canvas.width = height;
+      canvas.height = width;
+      ctx.rotate(-0.5 * Math.PI);
+      ctx.translate(-width, 0);
+      break;
+    default:
+      canvas.width = width;
+      canvas.height = height;
+      break;
+  }
+
+  ctx.drawImage(source, 0, 0);
+  return canvas;
+}
+
+function drawSourceToCanvas(source) {
+  const width = source.width || source.naturalWidth;
+  const height = source.height || source.naturalHeight;
+  const canvas = document.createElement('canvas');
+  canvas.width = width;
+  canvas.height = height;
+  const ctx = canvas.getContext('2d');
+  ctx.drawImage(source, 0, 0);
+  if (typeof source.close === 'function') {
+    source.close();
+  }
+  return canvas;
+}
+
+function loadImageElement(file) {
+  return new Promise((resolve, reject) => {
+    const reader = new FileReader();
+    reader.onload = () => {
+      const img = new Image();
+      img.onload = () => resolve(img);
+      img.onerror = reject;
+      img.src = reader.result;
+    };
+    reader.onerror = () => reject(reader.error);
+    reader.readAsDataURL(file);
+  });
+}
+
+async function readImageFile(file) {
+  const orientation = await getExifOrientation(file);
+  let source = null;
+  let orientationHandled = false;
+
+  if ('createImageBitmap' in window) {
+    try {
+      source = await createImageBitmap(file, { imageOrientation: 'from-image' });
+      orientationHandled = true;
+    } catch (error) {
+      console.warn('createImageBitmap failed, falling back to <img>', error);
+    }
+  }
+
+  if (!source) {
+    source = await loadImageElement(file);
+  }
+
+  const baseCanvas = orientationHandled ? drawSourceToCanvas(source) : orientImageSource(source, orientation);
+  const targetSize = scaleDimensions(baseCanvas.width, baseCanvas.height, MAX_DIMENSION);
+  const resizedCanvas = document.createElement('canvas');
+  resizedCanvas.width = targetSize.width;
+  resizedCanvas.height = targetSize.height;
+  const ctx = resizedCanvas.getContext('2d');
+  ctx.drawImage(baseCanvas, 0, 0, targetSize.width, targetSize.height);
+  const imageData = ctx.getImageData(0, 0, targetSize.width, targetSize.height);
+  return { canvas: resizedCanvas, imageData };
+}
+
+function computeStatistics(values) {
+  let sum = 0;
+  for (let i = 0; i < values.length; i++) {
+    sum += values[i];
+  }
+  const mean = sum / values.length;
+  let varianceSum = 0;
+  for (let i = 0; i < values.length; i++) {
+    const diff = values[i] - mean;
+    varianceSum += diff * diff;
+  }
+  return { mean, std: Math.sqrt(varianceSum / values.length) };
+}
+
+function samplePercentile(values, percentile) {
+  const step = Math.max(1, Math.floor(values.length / 10000));
+  const sample = [];
+  for (let i = 0; i < values.length; i += step) {
+    sample.push(values[i]);
+  }
+  sample.sort((a, b) => a - b);
+  const index = Math.min(sample.length - 1, Math.max(0, Math.floor(percentile * (sample.length - 1))));
+  return sample[index] || 0;
+}
+
+function computeMetrics(imageData) {
+  const { width, height, data } = imageData;
+  const pixelCount = width * height;
+  const grayscale = new Float32Array(pixelCount);
+  const gradX = new Float32Array(pixelCount);
+  const gradY = new Float32Array(pixelCount);
+  const gradient = new Float32Array(pixelCount);
+
+  const colorBalance = { r: 0, g: 0, b: 0 };
+
+  for (let i = 0; i < pixelCount; i++) {
+    const idx = i * 4;
+    const r = data[idx];
+    const g = data[idx + 1];
+    const b = data[idx + 2];
+    colorBalance.r += r;
+    colorBalance.g += g;
+    colorBalance.b += b;
+    grayscale[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
+  }
+
+  colorBalance.r /= pixelCount;
+  colorBalance.g /= pixelCount;
+  colorBalance.b /= pixelCount;
+
+  for (let y = 1; y < height - 1; y++) {
+    for (let x = 1; x < width - 1; x++) {
+      const idx = y * width + x;
+      const gx =
+        -grayscale[idx - width - 1] - 2 * grayscale[idx - 1] - grayscale[idx + width - 1] +
+        grayscale[idx - width + 1] + 2 * grayscale[idx + 1] + grayscale[idx + width + 1];
+      const gy =
+        -grayscale[idx - width - 1] - 2 * grayscale[idx - width] - grayscale[idx - width + 1] +
+        grayscale[idx + width - 1] + 2 * grayscale[idx + width] + grayscale[idx + width + 1];
+      gradX[idx] = gx;
+      gradY[idx] = gy;
+      gradient[idx] = Math.hypot(gx, gy);
+    }
+  }
+
+  const stats = computeStatistics(grayscale);
+  const gradientThreshold = samplePercentile(gradient, 0.9);
+  const horizonThreshold = samplePercentile(gradient, 0.85);
+
+  let minX = width;
+  let minY = height;
+  let maxX = 0;
+  let maxY = 0;
+  let sumX = 0;
+  let sumY = 0;
+  let strongCount = 0;
+
+  let horizonAngle = 0;
+  let horizonWeight = 0;
+
+  for (let y = 1; y < height - 1; y++) {
+    for (let x = 1; x < width - 1; x++) {
+      const idx = y * width + x;
+      const magnitude = gradient[idx];
+      if (magnitude > gradientThreshold) {
+        if (x < minX) minX = x;
+        if (x > maxX) maxX = x;
+        if (y < minY) minY = y;
+        if (y > maxY) maxY = y;
+        sumX += x;
+        sumY += y;
+        strongCount++;
+      }
+      if (magnitude > horizonThreshold && y > height * 0.25 && y < height * 0.75) {
+        const gx = gradX[idx];
+        const gy = gradY[idx];
+        const angle = ((Math.atan2(gy, gx) * 180) / Math.PI) + 90;
+        const normalized = ((angle + 180) % 180) - 90;
+        horizonAngle += normalized * magnitude;
+        horizonWeight += magnitude;
+      }
+    }
+  }
+
+  const metrics = {
+    imageSize: { width, height },
+    subjectRect: null,
+    subjectCenter: { x: width / 2, y: height / 2 },
+    subjectOffset: { x: 0, y: 0 },
+    subjectSize: 0,
+    horizonAngle: horizonWeight ? horizonAngle / horizonWeight : 0,
+    horizonLine: null,
+    ruleOfThirdsScore: 0,
+    sharpnessVariance: 0,
+    exposure: stats.mean,
+    contrast: stats.std,
+    saturation: 0,
+    colorBalance,
+    foregroundBackground: 0,
+    feedback: []
+  };
+
+  if (strongCount > 50) {
+    const widthRect = maxX - minX;
+    const heightRect = maxY - minY;
+    metrics.subjectRect = {
+      x: Math.max(0, minX - 4),
+      y: Math.max(0, minY - 4),
+      width: Math.min(width, widthRect + 8),
+      height: Math.min(height, heightRect + 8)
+    };
+    metrics.subjectCenter = {
+      x: sumX / strongCount,
+      y: sumY / strongCount
+    };
+    metrics.subjectOffset = {
+      x: metrics.subjectCenter.x / width - 0.5,
+      y: metrics.subjectCenter.y / height - 0.5
+    };
+    metrics.subjectSize = (widthRect * heightRect) / (width * height);
+  }
+
+  const thirdsX = [width / 3, (2 * width) / 3];
+  const thirdsY = [height / 3, (2 * height) / 3];
+  const nearestX = Math.min(...thirdsX.map(x => Math.abs(metrics.subjectCenter.x - x)));
+  const nearestY = Math.min(...thirdsY.map(y => Math.abs(metrics.subjectCenter.y - y)));
+  metrics.ruleOfThirdsScore = 1 - (nearestX / width + nearestY / height);
+
+  let sharpnessAccumulator = 0;
+  for (let i = 0; i < gradient.length; i++) {
+    sharpnessAccumulator += gradient[i] * gradient[i];
+  }
+  metrics.sharpnessVariance = sharpnessAccumulator / gradient.length;
+
+  let saturationSum = 0;
+  for (let i = 0; i < pixelCount; i++) {
+    const idx = i * 4;
+    const r = data[idx] / 255;
+    const g = data[idx + 1] / 255;
+    const b = data[idx + 2] / 255;
+    const max = Math.max(r, g, b);
+    const min = Math.min(r, g, b);
+    saturationSum += max - min;
+  }
+  metrics.saturation = (saturationSum / pixelCount) * 255;
+
+  const half = Math.floor(height / 2);
+  let topSum = 0;
+  let bottomSum = 0;
+  for (let y = 0; y < half; y++) {
+    for (let x = 0; x < width; x++) {
+      topSum += grayscale[y * width + x];
+    }
+  }
+  for (let y = half; y < height; y++) {
+    for (let x = 0; x < width; x++) {
+      bottomSum += grayscale[y * width + x];
+    }
+  }
+  const topMean = topSum / (half * width);
+  const bottomMean = bottomSum / (Math.max(1, height - half) * width);
+  metrics.foregroundBackground = bottomMean / Math.max(1, topMean);
+
+  const center = { x: width / 2, y: height / 2 };
+  const angleRad = (metrics.horizonAngle * Math.PI) / 180;
+  const lengthLine = Math.max(width, height);
+  const dx = Math.cos(angleRad) * lengthLine;
+  const dy = Math.sin(angleRad) * lengthLine;
+  metrics.horizonLine = [
+    { x: center.x - dx / 2, y: center.y - dy / 2 },
+    { x: center.x + dx / 2, y: center.y + dy / 2 }
+  ];
+
+  const feedback = new Set();
+  if (Math.abs(metrics.horizonAngle) > 1.5) {
+    feedback.add('feedback_rotation');
+  }
+  if (metrics.subjectRect && metrics.ruleOfThirdsScore < 0.6) {
+    feedback.add('feedback_crop');
+  }
+  if (metrics.exposure < 105) {
+    feedback.add('feedback_exposure');
+  } else if (metrics.exposure > 160) {
+    feedback.add('feedback_balance');
+  }
+  if (metrics.contrast < 45) {
+    feedback.add('feedback_contrast');
+  }
+  if (metrics.saturation < 50) {
+    feedback.add('feedback_saturation');
+  }
+  if (metrics.sharpnessVariance < 120) {
+    feedback.add('feedback_sharpness');
+  }
+  if (metrics.foregroundBackground < 0.8 || metrics.foregroundBackground > 1.2) {
+    feedback.add('feedback_balance');
+  }
+  if (feedback.size === 0) {
+    feedback.add('feedback_good');
+  }
+  metrics.feedback = Array.from(feedback);
+
+  return metrics;
+}
+
+function improveImage(baseCanvas, metrics) {
+  const width = baseCanvas.width;
+  const height = baseCanvas.height;
+
+  const cropWidth = Math.round(width * 0.9);
+  const cropHeight = Math.round(height * 0.9);
+
+  let desiredX = cropWidth / 2;
+  let desiredY = cropHeight / 2;
+  if (metrics.subjectRect) {
+    desiredX = metrics.subjectCenter.x < width / 2 ? cropWidth / 3 : (2 * cropWidth) / 3;
+    desiredY = metrics.subjectCenter.y < height / 2 ? cropHeight / 3 : (2 * cropHeight) / 3;
+  }
+
+  let cropX = Math.round((metrics.subjectCenter.x || width / 2) - desiredX);
+  let cropY = Math.round((metrics.subjectCenter.y || height / 2) - desiredY);
+
+  cropX = Math.max(0, Math.min(width - cropWidth, cropX));
+  cropY = Math.max(0, Math.min(height - cropHeight, cropY));
+
+  const cropCanvas = document.createElement('canvas');
+  cropCanvas.width = cropWidth;
+  cropCanvas.height = cropHeight;
+  const cropCtx = cropCanvas.getContext('2d');
+  cropCtx.drawImage(baseCanvas, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
+
+  const rotation = (-metrics.horizonAngle * Math.PI) / 180;
+  const cos = Math.cos(rotation);
+  const sin = Math.sin(rotation);
+  const rotatedWidth = Math.round(Math.abs(cos) * cropWidth + Math.abs(sin) * cropHeight);
+  const rotatedHeight = Math.round(Math.abs(sin) * cropWidth + Math.abs(cos) * cropHeight);
+  const rotatedCanvas = document.createElement('canvas');
+  rotatedCanvas.width = rotatedWidth;
+  rotatedCanvas.height = rotatedHeight;
+  const rotatedCtx = rotatedCanvas.getContext('2d');
+  rotatedCtx.translate(rotatedWidth / 2, rotatedHeight / 2);
+  rotatedCtx.rotate(rotation);
+  rotatedCtx.drawImage(cropCanvas, -cropWidth / 2, -cropHeight / 2);
+
+  const finalCanvas = document.createElement('canvas');
+  finalCanvas.width = cropWidth;
+  finalCanvas.height = cropHeight;
+  const finalCtx = finalCanvas.getContext('2d');
+
+  const brightness = metrics.exposure < 110 ? 1.1 : metrics.exposure > 160 ? 0.95 : 1;
+  const contrast = metrics.contrast < 45 ? 1.05 : metrics.contrast > 80 ? 0.95 : 1;
+  const saturation = metrics.saturation < 50 ? 1.12 : metrics.saturation > 160 ? 0.92 : 1;
+  finalCtx.filter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`;
+
+  const offsetX = (rotatedWidth - cropWidth) / 2;
+  const offsetY = (rotatedHeight - cropHeight) / 2;
+  finalCtx.drawImage(rotatedCanvas, offsetX, offsetY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
+
+  return finalCanvas;
+}
+
+async function processFile(file) {
+  setLoading(true);
+  downloadButton.disabled = true;
+  try {
+    const { canvas, imageData } = await readImageFile(file);
+    lastOriginalCanvas = canvas;
+    currentMetrics = computeMetrics(imageData);
+    renderMetrics(currentMetrics);
+    updateAnalysisSummary(currentMetrics);
+
+    renderToCanvas(originalCanvas, lastOriginalCanvas, {
+      showGuides: toggleGrid.checked,
+      metrics: currentMetrics,
+      includeAnnotations: true
+    });
+    setCanvasMeta(originalMeta, lastOriginalCanvas);
+
+    lastImprovedCanvas = improveImage(lastOriginalCanvas, currentMetrics);
+    renderToCanvas(improvedCanvas, lastImprovedCanvas, {
+      showGuides: toggleGrid.checked,
+      metrics: currentMetrics,
+      includeAnnotations: false
+    });
+    setCanvasMeta(improvedMeta, lastImprovedCanvas);
+
+    await prepareDownload(lastImprovedCanvas);
+  } catch (error) {
+    console.error(error);
+    showError('error_processing', 'Unable to process this file. Please try another image.');
+  } finally {
+    setLoading(false);
+  }
+}
+
+function handleFileInput(event) {
+  const file = event.target.files?.[0];
+  if (file) {
+    processFile(file);
+  }
+}
+
+function handleDrop(event) {
+  event.preventDefault();
+  dropZone.classList.remove('dragover');
+  const file = event.dataTransfer.files?.[0];
+  if (file) {
+    processFile(file);
+  }
+}
+
+function handleDrag(event) {
+  event.preventDefault();
+  if (event.type === 'dragover') {
+    dropZone.classList.add('dragover');
+  } else {
+    dropZone.classList.remove('dragover');
+  }
+}
+
+function initEventListeners() {
+  uploadButton.addEventListener('click', () => fileInput.click());
+  fileInput.addEventListener('change', handleFileInput);
+  dropZone.addEventListener('click', () => fileInput.click());
+  dropZone.addEventListener('keydown', event => {
+    if (event.key === 'Enter' || event.key === ' ') {
+      event.preventDefault();
+      fileInput.click();
+    }
+  });
+  dropZone.addEventListener('dragover', handleDrag);
+  dropZone.addEventListener('dragleave', handleDrag);
+  dropZone.addEventListener('drop', handleDrop);
+  toggleGrid.addEventListener('change', refreshCanvases);
+  resetButton.addEventListener('click', resetInterface);
+  downloadButton.addEventListener('click', () => {
+    if (!currentDownloadUrl) return;
+    const a = document.createElement('a');
+    a.href = currentDownloadUrl;
+    a.download = downloadButton.dataset.filename || 'improved-photo.png';
+    a.click();
+  });
+  langToggleButtons.forEach(btn => {
+    btn.addEventListener('click', () => {
+      if (btn.dataset.lang !== currentLang) {
+        currentLang = btn.dataset.lang;
+        translatePage();
+        refreshCanvases();
+      }
+    });
+  });
+}
+
+async function loadDictionaries() {
+  const langs = Object.keys(fallbackDictionaries);
+  await Promise.all(
+    langs.map(async lang => {
+      try {
+        const response = await fetch(`translations/${lang}.json`, { cache: 'no-store' });
+        if (!response.ok) {
+          throw new Error(`Failed to load dictionary for ${lang}`);
+        }
+        const data = await response.json();
+        dictionaries[lang] = { ...dictionaries[lang], ...data };
+      } catch (error) {
+        console.warn('Dictionary load failed', error);
+        if (!dictionaryWarningShown) {
+          showError('error_dictionary', 'Using built-in language defaults. Some translations may be missing.');
+          dictionaryWarningShown = true;
+        }
+      }
+    })
+  );
+  translatePage();
+}
+
+async function init() {
+  dictionaries = cloneFallback();
+  downloadButton.disabled = true;
+  translatePage();
+  initEventListeners();
+  try {
+    await loadDictionaries();
+  } catch (error) {
+    console.warn('Unable to refresh dictionaries', error);
+  }
+  engineStatusState = 'ready';
+  updateStatusBadge();
+}
+
+init();
+
+window.addEventListener('beforeunload', () => {
+  cleanupCanvases();
+  revokeDownloadUrl();
+});
