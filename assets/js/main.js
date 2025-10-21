+const MAX_DIMENSION = 2048;
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
+let dictionaries = {};
+let currentLang = 'en-US';
+let currentMetrics = null;
+let currentDownloadUrl = null;
+let lastOriginalMat = null;
+let lastImprovedMat = null;
+let engineStatusState = 'loading';
+let errorTimeoutId = null;
+
+let cvReadyResolver;
+let cvReadyResolved = false;
+const cvReady = new Promise(resolve => {
+  cvReadyResolver = () => {
+    if (!cvReadyResolved) {
+      cvReadyResolved = true;
+      resolve();
+    }
+  };
+});
+
+(function ensureCvReady() {
+  if (typeof cv !== 'undefined') {
+    if (cv.Mat) {
+      cvReadyResolver();
+    } else {
+      cv.onRuntimeInitialized = () => cvReadyResolver();
+    }
+  } else {
+    const timer = setInterval(() => {
+      if (typeof cv !== 'undefined') {
+        clearInterval(timer);
+        if (cv.Mat) {
+          cvReadyResolver();
+        } else {
+          cv.onRuntimeInitialized = () => cvReadyResolver();
+        }
+      }
+    }, 50);
+  }
+})();
+
+const formatters = {
+  percent: value => `${Math.round(value * 100)}%`,
+  degrees: value => `${value.toFixed(1)}°`,
+  score: value => value.toFixed(2),
+  numeric: value => value.toFixed(1)
+};
+
+async function loadDictionaries() {
+  const langs = ['en-US', 'zh-TW'];
+  for (const lang of langs) {
+    const response = await fetch(`translations/${lang}.json`);
+    if (!response.ok) {
+      throw new Error(`Failed to load dictionary for ${lang}`);
+    }
+    dictionaries[lang] = await response.json();
+  }
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
+function setCanvasMeta(element, mat) {
+  if (!element) return;
+  if (!mat) {
+    element.textContent = '';
+    return;
+  }
+  const dict = dictionaries[currentLang] || {};
+  const template = dict['meta_dimensions'] || '{{width}}×{{height}} px';
+  element.textContent = template.replace('{{width}}', mat.cols).replace('{{height}}', mat.rows);
+}
+
+function renderMetrics(metrics) {
+  const dict = dictionaries[currentLang];
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
+  label.textContent = dict['metric_feedback'];
+  const valueSpan = document.createElement('span');
+  valueSpan.className = 'metric-value';
+  valueSpan.innerHTML = metrics.feedback.map(key => dict[key] || key).join('<br>');
+  feedbackWrap.append(label, valueSpan);
+  metricsContainer.appendChild(feedbackWrap);
+}
+
+function updateAnalysisSummary(metrics) {
+  const dict = dictionaries[currentLang];
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
+function translatePage() {
+  const dict = dictionaries[currentLang];
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
+  if (currentMetrics) {
+    renderMetrics(currentMetrics);
+  }
+  updateAnalysisSummary(currentMetrics);
+  setCanvasMeta(originalMeta, lastOriginalMat);
+  setCanvasMeta(improvedMeta, lastImprovedMat);
+  updateStatusBadge();
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
+function cleanupMats() {
+  if (lastOriginalMat) {
+    lastOriginalMat.delete();
+    lastOriginalMat = null;
+  }
+  if (lastImprovedMat) {
+    lastImprovedMat.delete();
+    lastImprovedMat = null;
+  }
+}
+
+function resetInterface() {
+  cleanupMats();
+  currentMetrics = null;
+  metricsContainer.innerHTML = '';
+  analysisSummary.innerHTML = dictionaries[currentLang]['analysis_summary_default'] || '';
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
+async function prepareDownload(mat) {
+  revokeDownloadUrl();
+  const offscreen = document.createElement('canvas');
+  offscreen.width = mat.cols;
+  offscreen.height = mat.rows;
+  cv.imshow(offscreen, mat);
+  await new Promise(resolve => {
+    offscreen.toBlob(blob => {
+      const dict = dictionaries[currentLang];
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
+function renderToCanvas(canvas, mat, options = {}) {
+  canvas.width = mat.cols;
+  canvas.height = mat.rows;
+  cv.imshow(canvas, mat);
+  drawGuides(canvas, options.metrics, {
+    showGuides: options.showGuides,
+    includeAnnotations: options.includeAnnotations
+  });
+}
+
+function refreshCanvases() {
+  if (!currentMetrics) return;
+  if (lastOriginalMat) {
+    renderToCanvas(originalCanvas, lastOriginalMat, {
+      showGuides: toggleGrid.checked,
+      metrics: currentMetrics,
+      includeAnnotations: true
+    });
+    setCanvasMeta(originalMeta, lastOriginalMat);
+  }
+  if (lastImprovedMat) {
+    renderToCanvas(improvedCanvas, lastImprovedMat, {
+      showGuides: toggleGrid.checked,
+      metrics: currentMetrics,
+      includeAnnotations: false
+    });
+    setCanvasMeta(improvedMeta, lastImprovedMat);
+  }
+}
+
+async function safeCreateImageBitmap(file) {
+  if ('createImageBitmap' in window) {
+    try {
+      return await createImageBitmap(file, { imageOrientation: 'from-image' });
+    } catch (error) {
+      console.warn('createImageBitmap failed, falling back to Image()', error);
+    }
+  }
+  return new Promise((resolve, reject) => {
+    const reader = new FileReader();
+    reader.onerror = () => reject(reader.error);
+    reader.onload = () => {
+      const img = new Image();
+      img.onload = () => resolve(img);
+      img.onerror = () => reject(new Error('Image load error'));
+      img.src = reader.result;
+    };
+    reader.readAsDataURL(file);
+  });
+}
+
+async function readImageFile(file) {
+  const bitmap = await safeCreateImageBitmap(file);
+  const widthSource = bitmap.width || bitmap.naturalWidth;
+  const heightSource = bitmap.height || bitmap.naturalHeight;
+  const { width, height } = scaleDimensions(widthSource, heightSource, MAX_DIMENSION);
+  const canvas = document.createElement('canvas');
+  canvas.width = width;
+  canvas.height = height;
+  const ctx = canvas.getContext('2d');
+  ctx.drawImage(bitmap, 0, 0, width, height);
+  if (typeof bitmap.close === 'function') {
+    bitmap.close();
+  }
+  return canvas;
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
+function computeMetrics(src) {
+  const metrics = {
+    imageSize: { width: src.cols, height: src.rows },
+    subjectRect: null,
+    subjectCenter: { x: src.cols / 2, y: src.rows / 2 },
+    subjectOffset: { x: 0, y: 0 },
+    subjectSize: 0,
+    horizonAngle: 0,
+    horizonLine: null,
+    ruleOfThirdsScore: 0,
+    sharpnessVariance: 0,
+    exposure: 0,
+    contrast: 0,
+    saturation: 0,
+    colorBalance: { r: 0, g: 0, b: 0 },
+    foregroundBackground: 0,
+    feedback: []
+  };
+
+  const gray = new cv.Mat();
+  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
+
+  const blur = new cv.Mat();
+  cv.GaussianBlur(gray, blur, new cv.Size(5, 5), 0);
+
+  const edges = new cv.Mat();
+  cv.Canny(blur, edges, 60, 150, 3, false);
+
+  const lap = new cv.Mat();
+  cv.Laplacian(gray, lap, cv.CV_64F);
+  const lapMean = new cv.Mat();
+  const lapStd = new cv.Mat();
+  cv.meanStdDev(lap, lapMean, lapStd);
+  metrics.sharpnessVariance = lapStd.doubleAt(0, 0) ** 2;
+
+  const contours = new cv.MatVector();
+  const hierarchy = new cv.Mat();
+  cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
+  let maxArea = 0;
+  for (let i = 0; i < contours.size(); i++) {
+    const contour = contours.get(i);
+    const rect = cv.boundingRect(contour);
+    const area = rect.width * rect.height;
+    if (area > maxArea) {
+      maxArea = area;
+      metrics.subjectRect = rect;
+    }
+    contour.delete();
+  }
+  if (metrics.subjectRect) {
+    metrics.subjectCenter = {
+      x: metrics.subjectRect.x + metrics.subjectRect.width / 2,
+      y: metrics.subjectRect.y + metrics.subjectRect.height / 2
+    };
+    metrics.subjectSize = maxArea / (src.cols * src.rows);
+    metrics.subjectOffset = {
+      x: metrics.subjectCenter.x / src.cols - 0.5,
+      y: metrics.subjectCenter.y / src.rows - 0.5
+    };
+  }
+
+  const thirdsX = [src.cols / 3, (2 * src.cols) / 3];
+  const thirdsY = [src.rows / 3, (2 * src.rows) / 3];
+  const nearestX = Math.min(...thirdsX.map(x => Math.abs(metrics.subjectCenter.x - x)));
+  const nearestY = Math.min(...thirdsY.map(y => Math.abs(metrics.subjectCenter.y - y)));
+  metrics.ruleOfThirdsScore = 1 - (nearestX / src.cols + nearestY / src.rows);
+
+  const lines = new cv.Mat();
+  cv.HoughLinesP(edges, lines, 1, Math.PI / 180, 60, src.cols * 0.3, 30);
+  let bestAngle = 0;
+  let bestLine = null;
+  for (let i = 0; i < lines.rows; i++) {
+    const [x1, y1, x2, y2] = lines.data32S.slice(i * 4, i * 4 + 4);
+    const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
+    const normalized = ((angle + 180) % 180) - 90;
+    if (bestLine === null || Math.abs(normalized) < Math.abs(bestAngle)) {
+      bestAngle = normalized;
+      bestLine = [
+        { x: x1, y: y1 },
+        { x: x2, y: y2 }
+      ];
+    }
+  }
+  metrics.horizonAngle = bestAngle;
+  metrics.horizonLine = bestLine;
+
+  const meanMat = new cv.Mat();
+  const stdMat = new cv.Mat();
+  cv.meanStdDev(gray, meanMat, stdMat);
+  metrics.exposure = meanMat.doubleAt(0, 0);
+  metrics.contrast = stdMat.doubleAt(0, 0);
+
+  const rgb = new cv.Mat();
+  cv.cvtColor(src, rgb, cv.COLOR_RGBA2RGB);
+  const hsv = new cv.Mat();
+  cv.cvtColor(rgb, hsv, cv.COLOR_RGB2HSV);
+  const hsvPlanes = new cv.MatVector();
+  cv.split(hsv, hsvPlanes);
+  metrics.saturation = cv.mean(hsvPlanes.get(1))[0];
+
+  const colorPlanes = new cv.MatVector();
+  cv.split(rgb, colorPlanes);
+  metrics.colorBalance = {
+    r: cv.mean(colorPlanes.get(0))[0],
+    g: cv.mean(colorPlanes.get(1))[0],
+    b: cv.mean(colorPlanes.get(2))[0]
+  };
+
+  const half = Math.max(1, Math.floor(src.rows / 2));
+  const topGray = gray.roi(new cv.Rect(0, 0, src.cols, half));
+  const bottomGray = gray.roi(new cv.Rect(0, src.rows - half, src.cols, half));
+  const topLap = new cv.Mat();
+  const bottomLap = new cv.Mat();
+  cv.Laplacian(topGray, topLap, cv.CV_64F);
+  cv.Laplacian(bottomGray, bottomLap, cv.CV_64F);
+  const topStd = new cv.Mat();
+  const topMean = new cv.Mat();
+  const bottomStd = new cv.Mat();
+  const bottomMean = new cv.Mat();
+  cv.meanStdDev(topLap, topMean, topStd);
+  cv.meanStdDev(bottomLap, bottomMean, bottomStd);
+  const foregroundVar = bottomStd.doubleAt(0, 0) ** 2;
+  const backgroundVar = topStd.doubleAt(0, 0) ** 2;
+  metrics.foregroundBackground = foregroundVar / (backgroundVar + 1e-6);
+
+  const feedback = [];
+  if (Math.abs(metrics.horizonAngle) > 2) {
+    feedback.push('feedback_rotation');
+  }
+  if (Math.abs(metrics.subjectOffset.x) > 0.15 || Math.abs(metrics.subjectOffset.y) > 0.15) {
+    feedback.push('feedback_crop');
+  }
+  if (metrics.exposure < 105 || metrics.exposure > 160) {
+    feedback.push('feedback_exposure');
+  }
+  if (metrics.contrast < 40) {
+    feedback.push('feedback_contrast');
+  }
+  if (metrics.saturation < 85) {
+    feedback.push('feedback_saturation');
+  }
+  if (metrics.sharpnessVariance < 150) {
+    feedback.push('feedback_sharpness');
+  }
+  if (metrics.foregroundBackground < 0.8 || metrics.foregroundBackground > 1.4) {
+    feedback.push('feedback_balance');
+  }
+  if (!feedback.length) {
+    feedback.push('feedback_good');
+  }
+  metrics.feedback = feedback;
+
+  gray.delete();
+  blur.delete();
+  edges.delete();
+  lap.delete();
+  lapMean.delete();
+  lapStd.delete();
+  contours.delete();
+  hierarchy.delete();
+  lines.delete();
+  meanMat.delete();
+  stdMat.delete();
+  rgb.delete();
+  hsv.delete();
+  hsvPlanes.delete();
+  colorPlanes.delete();
+  topGray.delete();
+  bottomGray.delete();
+  topLap.delete();
+  bottomLap.delete();
+  topStd.delete();
+  topMean.delete();
+  bottomStd.delete();
+  bottomMean.delete();
+
+  return metrics;
+}
+
+function rotatePoint(x, y, mat) {
+  const m = mat.data64F || mat.data32F;
+  const nx = m[0] * x + m[1] * y + m[2];
+  const ny = m[3] * x + m[4] * y + m[5];
+  return { x: nx, y: ny };
+}
+
+function improveImage(src, metrics) {
+  const base = new cv.Mat();
+  src.copyTo(base);
+
+  let rotated = new cv.Mat();
+  let transform = null;
+  if (Math.abs(metrics.horizonAngle) > 0.5) {
+    const center = new cv.Point(base.cols / 2, base.rows / 2);
+    transform = cv.getRotationMatrix2D(center, metrics.horizonAngle, 1);
+    const bounds = new cv.Size(base.cols, base.rows);
+    cv.warpAffine(base, rotated, transform, bounds, cv.INTER_LINEAR, cv.BORDER_REFLECT);
+  } else {
+    rotated = base.clone();
+  }
+
+  const subject = metrics.subjectCenter;
+  let rotatedSubject = subject;
+  if (transform) {
+    rotatedSubject = rotatePoint(subject.x, subject.y, transform);
+    transform.delete();
+  }
+
+  const scale = metrics.subjectSize < 0.15 ? 0.8 : metrics.subjectSize > 0.45 ? 1.0 : 0.88;
+  const cropWidth = Math.max(1, Math.round(rotated.cols * scale));
+  const cropHeight = Math.max(1, Math.round(rotated.rows * scale));
+  const targetX = rotatedSubject.x < rotated.cols / 2 ? cropWidth / 3 : (cropWidth * 2) / 3;
+  const targetY = rotatedSubject.y < rotated.rows / 2 ? cropHeight / 3 : (cropHeight * 2) / 3;
+  let cropX = Math.round(rotatedSubject.x - targetX);
+  let cropY = Math.round(rotatedSubject.y - targetY);
+  cropX = Math.min(Math.max(0, cropX), Math.max(0, rotated.cols - cropWidth));
+  cropY = Math.min(Math.max(0, cropY), Math.max(0, rotated.rows - cropHeight));
+  const cropRect = new cv.Rect(cropX, cropY, cropWidth, cropHeight);
+  const croppedRoi = rotated.roi(cropRect);
+  const cropped = croppedRoi.clone();
+  croppedRoi.delete();
+
+  const adjusted = new cv.Mat();
+  const exposureTarget = 135;
+  const beta = (exposureTarget - metrics.exposure) * 0.2;
+  const contrastTarget = 55;
+  const alpha = 1 + Math.max(-0.25, Math.min(0.35, (contrastTarget - metrics.contrast) / 160));
+  cropped.convertTo(adjusted, -1, alpha, beta);
+
+  const channels = new cv.MatVector();
+  cv.split(adjusted, channels);
+  const average = (metrics.colorBalance.r + metrics.colorBalance.g + metrics.colorBalance.b) / 3;
+  const adjustments = [
+    average - metrics.colorBalance.r,
+    average - metrics.colorBalance.g,
+    average - metrics.colorBalance.b
+  ];
+  for (let i = 0; i < Math.min(3, channels.size()); i++) {
+    const channel = channels.get(i);
+    const scalar = new cv.Mat(channel.rows, channel.cols, channel.type(), new cv.Scalar(adjustments[i] * 0.15));
+    cv.add(channel, scalar, channel);
+    scalar.delete();
+  }
+  const alphaChannel = channels.size() > 3 ? channels.get(3).clone() : null;
+  const merged = new cv.Mat();
+  cv.merge(channels, merged);
+  channels.delete();
+
+  const rgb = new cv.Mat();
+  cv.cvtColor(merged, rgb, cv.COLOR_RGBA2RGB);
+  const hsv = new cv.Mat();
+  cv.cvtColor(rgb, hsv, cv.COLOR_RGB2HSV);
+  const hsvChannels = new cv.MatVector();
+  cv.split(hsv, hsvChannels);
+  const satMat = hsvChannels.get(1);
+  const satData = satMat.data;
+  const satFactor = metrics.saturation < 95 ? 1.1 : 1.0;
+  for (let i = 0; i < satData.length; i++) {
+    satData[i] = Math.min(255, satData[i] * satFactor);
+  }
+  cv.merge(hsvChannels, hsv);
+  const finalRgb = new cv.Mat();
+  cv.cvtColor(hsv, finalRgb, cv.COLOR_HSV2RGB);
+  const final = new cv.Mat();
+  cv.cvtColor(finalRgb, final, cv.COLOR_RGB2RGBA);
+
+  if (alphaChannel) {
+    const planes = new cv.MatVector();
+    cv.split(final, planes);
+    planes.get(3).delete();
+    planes.push_back(alphaChannel);
+    cv.merge(planes, final);
+    planes.delete();
+    alphaChannel.delete();
+  }
+
+  base.delete();
+  rotated.delete();
+  cropped.delete();
+  adjusted.delete();
+  merged.delete();
+  rgb.delete();
+  hsv.delete();
+  hsvChannels.delete();
+  finalRgb.delete();
+
+  return final;
+}
+
+async function processFile(file) {
+  await cvReady;
+  engineStatusState = 'ready';
+  updateStatusBadge();
+  setLoading(true);
+  downloadButton.disabled = true;
+  try {
+    const resizedCanvas = await readImageFile(file);
+    const src = cv.imread(resizedCanvas);
+
+    const metrics = computeMetrics(src);
+    currentMetrics = metrics;
+    renderMetrics(metrics);
+    updateAnalysisSummary(metrics);
+
+    if (lastOriginalMat) lastOriginalMat.delete();
+    lastOriginalMat = src.clone();
+    renderToCanvas(originalCanvas, lastOriginalMat, {
+      showGuides: toggleGrid.checked,
+      metrics,
+      includeAnnotations: true
+    });
+    setCanvasMeta(originalMeta, lastOriginalMat);
+
+    const improved = improveImage(src, metrics);
+    if (lastImprovedMat) lastImprovedMat.delete();
+    lastImprovedMat = improved.clone();
+    renderToCanvas(improvedCanvas, lastImprovedMat, {
+      showGuides: toggleGrid.checked,
+      metrics,
+      includeAnnotations: false
+    });
+    setCanvasMeta(improvedMeta, lastImprovedMat);
+
+    await prepareDownload(lastImprovedMat);
+
+    src.delete();
+    improved.delete();
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
+async function init() {
+  downloadButton.disabled = true;
+  await loadDictionaries();
+  translatePage();
+  initEventListeners();
+  cvReady.then(() => {
+    engineStatusState = 'ready';
+    updateStatusBadge();
+  });
+}
+
+init();
+
+window.addEventListener('beforeunload', () => {
+  cleanupMats();
+  revokeDownloadUrl();
+});
