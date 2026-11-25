/**
 * SHROOMY — HERO MULTI-LAYER & MESH-DEFORMATION ENGINE (Varian A / Opsi 1 — final approved preview)
 * Isolated strictly to #hero on the Landing Page. Navbar, other sections and Workspace are untouched.
 *
 * - Base layer: photorealistic clean trunk (1376x768 + 110px top-left full-bleed outpainted extension).
 * - 9 mushroom instances grown via 22-strip vertical mesh deformation (stipe elongation + cap unfurling).
 * - 15 leaf / fern instances with root-anchored cantilever wind bending.
 * Geometry, anchors, timing and choreography are copied 1:1 from the approved standalone preview.
 */
(function initShroomyHeroMeshEngine() {
  const heroSection = document.getElementById('hero');
  const canvas = document.getElementById('hero-thornfield-canvas');
  if (!heroSection || !canvas) return;

  const ctx = canvas.getContext('2d');
  const prefersReduced =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const BASE_W = 1376;
  const BASE_H = 768;
  const EXT_TOP = 110; // top-left outpainted extension baked into clean_trunk_v2.webp

  const LAYER_PATH = '/static/img/hero_v2/';
  const ASSET_FILES = {
    trunk: 'clean_trunk_v2.webp',
    mush_1: 'mush_1.webp',
    mush_2: 'mush_2.webp',
    mush_4: 'mush_4.webp',
    mush_5: 'mush_5.webp',
    fern_left_top: 'fern_left_top.webp',
    leaf_veined_left: 'leaf_veined_left.webp',
    fern_valley_left: 'fern_valley_left.webp',
    fern_valley_right: 'fern_valley_right.webp',
    leaf_small_midright: 'leaf_small_midright.webp',
    leaf_sprig_right: 'leaf_sprig_right.webp',
    leaf_vine_farright: 'leaf_vine_farright.webp'
  };

  // Coordinates (rootX, rootY) are in the 1376x768 trunk coordinate space.
  const MUSHROOM_INSTANCES = [
    { tex: 'mush_1', rootX: 222, rootY: 162, w: 135, h: 148, scale: 0.66, angle: 0.05, flip: false, delay: 0.65, dur: 1.65, bend: -10, layer: 'back' },
    { tex: 'mush_4', rootX: 292, rootY: 242, w: 165, h: 150, scale: 0.38, angle: 0.28, flip: true, delay: 1.05, dur: 1.45, bend: 7, layer: 'back' },
    { tex: 'mush_2', rootX: 488, rootY: 446, w: 202, h: 184, scale: 0.65, angle: -0.02, flip: false, delay: 0.85, dur: 1.80, bend: 12, layer: 'back' },
    { tex: 'mush_1', rootX: 562, rootY: 492, w: 135, h: 148, scale: 0.42, angle: -0.18, flip: true, delay: 1.30, dur: 1.50, bend: 8, layer: 'back' },
    { tex: 'mush_4', rootX: 705, rootY: 642, w: 165, h: 150, scale: 0.62, angle: 0.05, flip: true, delay: 1.15, dur: 1.75, bend: -8, layer: 'front' },
    { tex: 'mush_5', rootX: 782, rootY: 545, w: 183, h: 154, scale: 0.38, angle: -0.10, flip: false, delay: 1.50, dur: 1.40, bend: 6, layer: 'back' },
    { tex: 'mush_4', rootX: 975, rootY: 536, w: 165, h: 150, scale: 0.64, angle: 0.0, flip: false, delay: 1.25, dur: 1.75, bend: -11, layer: 'back' },
    { tex: 'mush_1', rootX: 1105, rootY: 462, w: 135, h: 148, scale: 0.44, angle: -0.38, flip: true, delay: 1.60, dur: 1.50, bend: -7, layer: 'back' },
    { tex: 'mush_5', rootX: 1205, rootY: 558, w: 183, h: 154, scale: 0.64, angle: 0.0, flip: false, delay: 1.40, dur: 1.80, bend: -9, layer: 'front' }
  ];

  const LEAF_INSTANCES = [
    { tex: 'leaf_sprig_right', rootX: 65, rootY: -22, w: 135, h: 88, scale: 0.68, angle: 0.56, flip: true, delay: 0.50, dur: 1.35, ampX: 9.0, ampY: 3.0, freq: 1.90, phase: 0.7, layer: 'back' },
    { tex: 'leaf_sprig_right', rootX: 162, rootY: 78, w: 135, h: 88, scale: 0.70, angle: 0.58, flip: true, delay: 0.55, dur: 1.35, ampX: 9.5, ampY: 3.2, freq: 1.85, phase: 0.2, layer: 'back' },
    { tex: 'fern_left_top', rootX: 378, rootY: 344, w: 189, h: 167, scale: 0.88, angle: 0.0, flip: false, delay: 0.70, dur: 1.55, ampX: 13.0, ampY: 4.5, freq: 1.55, phase: 1.1, layer: 'back' },
    { tex: 'fern_valley_right', rootX: 318, rootY: 286, w: 133, h: 220, scale: 0.56, angle: 0.32, flip: true, delay: 0.90, dur: 1.45, ampX: 11.0, ampY: 3.5, freq: 1.95, phase: 2.4, layer: 'back' },
    { tex: 'leaf_veined_left', rootX: 432, rootY: 548, w: 129, h: 130, scale: 0.86, angle: 0.0, flip: false, delay: 0.80, dur: 1.40, ampX: 8.5, ampY: 3.0, freq: 1.70, phase: 0.8, layer: 'front' },
    { tex: 'leaf_small_midright', rootX: 295, rootY: 395, w: 71, h: 38, scale: 0.95, angle: 0.40, flip: false, delay: 1.00, dur: 1.25, ampX: 6.5, ampY: 2.2, freq: 2.20, phase: 3.1, layer: 'front' },
    { tex: 'fern_valley_left', rootX: 642, rootY: 682, w: 203, h: 229, scale: 0.88, angle: 0.0, flip: false, delay: 0.95, dur: 1.65, ampX: 14.0, ampY: 4.8, freq: 1.45, phase: 1.9, layer: 'front' },
    { tex: 'fern_valley_right', rootX: 768, rootY: 628, w: 133, h: 220, scale: 0.86, angle: 0.0, flip: false, delay: 1.05, dur: 1.60, ampX: 12.5, ampY: 4.0, freq: 1.65, phase: 2.9, layer: 'back' },
    { tex: 'leaf_sprig_right', rootX: 625, rootY: 522, w: 135, h: 88, scale: 0.76, angle: -0.15, flip: true, delay: 1.15, dur: 1.35, ampX: 9.0, ampY: 3.0, freq: 2.05, phase: 4.2, layer: 'back' },
    { tex: 'leaf_small_midright', rootX: 838, rootY: 546, w: 71, h: 38, scale: 1.02, angle: -0.12, flip: true, delay: 1.20, dur: 1.25, ampX: 7.0, ampY: 2.5, freq: 2.30, phase: 0.5, layer: 'front' },
    { tex: 'leaf_small_midright', rootX: 936, rootY: 568, w: 71, h: 38, scale: 0.95, angle: 0.0, flip: false, delay: 1.25, dur: 1.30, ampX: 6.5, ampY: 2.2, freq: 2.15, phase: 1.7, layer: 'front' },
    { tex: 'leaf_sprig_right', rootX: 1042, rootY: 472, w: 135, h: 88, scale: 0.88, angle: 0.0, flip: false, delay: 1.10, dur: 1.45, ampX: 10.5, ampY: 3.6, freq: 1.80, phase: 3.6, layer: 'back' },
    { tex: 'fern_left_top', rootX: 1155, rootY: 432, w: 189, h: 167, scale: 0.64, angle: -0.38, flip: true, delay: 1.30, dur: 1.55, ampX: 11.5, ampY: 3.8, freq: 1.60, phase: 4.8, layer: 'back' },
    { tex: 'leaf_veined_left', rootX: 1068, rootY: 585, w: 129, h: 130, scale: 0.68, angle: -0.35, flip: true, delay: 1.35, dur: 1.40, ampX: 8.0, ampY: 2.8, freq: 1.90, phase: 2.1, layer: 'front' },
    { tex: 'leaf_vine_farright', rootX: 1272, rootY: 545, w: 106, h: 128, scale: 0.90, angle: 0.0, flip: false, delay: 1.40, dur: 1.50, ampX: 10.0, ampY: 3.8, freq: 1.75, phase: 5.3, layer: 'front' },
    { tex: 'leaf_sprig_right', rootX: 1305, rootY: 336, w: 135, h: 88, scale: 0.72, angle: -0.25, flip: false, delay: 1.45, dur: 1.40, ampX: 9.5, ampY: 3.2, freq: 2.00, phase: 1.3, layer: 'back' }
  ];

  const BACK_LEAVES = LEAF_INSTANCES.filter((l) => l.layer === 'back');
  const FRONT_LEAVES = LEAF_INSTANCES.filter((l) => l.layer === 'front');
  const BACK_MUSH = MUSHROOM_INSTANCES.filter((m) => m.layer === 'back');
  const FRONT_MUSH = MUSHROOM_INSTANCES.filter((m) => m.layer === 'front');

  function clamp01(v) {
    return Math.max(0, Math.min(1, v));
  }
  function easeOutCubic(t) {
    const x = clamp01(t);
    return 1 - Math.pow(1 - x, 3);
  }
  function easeOutBack(t) {
    const c1 = 1.18;
    const c3 = c1 + 1;
    const x = clamp01(t);
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  }

  // ---------- Asset loading (decode before first paint to avoid flicker) ----------
  const images = {};
  const loadPromises = Object.entries(ASSET_FILES).map(([key, file]) => {
    const img = new Image();
    img.decoding = 'async';
    img.src = LAYER_PATH + file;
    images[key] = img;
    const ready = img.decode ? img.decode().catch(() => new Promise((res) => {
      if (img.complete) res();
      else { img.onload = res; img.onerror = res; }
    })) : new Promise((res) => { img.onload = res; img.onerror = res; });
    return ready;
  });

  function isReady(img) {
    return img && img.complete && img.naturalWidth > 0;
  }

  // ---------- Layout (identical to approved preview resize()) ----------
  let vpW = 0;
  let vpH = 0;
  let dpr = 1;
  let T = { x: 0, y: 0, scaleX: 1, scaleY: 1, scale: 1 };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    vpW = heroSection.clientWidth;
    vpH = heroSection.clientHeight;
    canvas.width = Math.round(vpW * dpr);
    canvas.height = Math.round(vpH * dpr);

    const drawW = vpW * 1.02;
    const sx = drawW / BASE_W;
    const drawH = Math.min(BASE_H * sx * 0.76, vpH * 0.70);
    const sy = drawH / BASE_H;
    const drawX = (vpW - drawW) * 0.5;
    const drawY = vpH - drawH + 14;
    T = { x: drawX, y: drawY, scaleX: sx, scaleY: sy, scale: (sx + sy) * 0.5 };
  }

  // ---------- Mushroom: 22-strip vertical mesh deformation ----------
  function drawDeformedMushroom(m, elapsed) {
    const img = images[m.tex];
    if (!isReady(img)) return;

    const rawT = clamp01((elapsed - m.delay) / m.dur);
    if (rawT <= 0.005) return;

    const ts = T.scale;
    const anchorX = T.x + m.rootX * T.scaleX;
    const anchorY = T.y + m.rootY * T.scaleY;

    const stemGrow = easeOutCubic(clamp01(rawT / 0.82));
    const capBloom = easeOutBack(clamp01((rawT - 0.16) / 0.84));

    const drawW = m.w * m.scale * ts;
    const drawH = m.h * m.scale * ts;
    const breathSway = Math.sin(elapsed * 1.35 + m.rootX * 0.02) * 1.1 * stemGrow * ts;

    ctx.save();
    ctx.translate(anchorX, anchorY);
    ctx.rotate(m.angle);
    if (m.flip) ctx.scale(-1, 1);

    const aoAlpha = 0.42 * easeOutCubic(rawT);
    const aoGrad = ctx.createRadialGradient(0, -2 * ts, 1, 0, -2 * ts, drawW * 0.44);
    aoGrad.addColorStop(0, `rgba(14, 11, 8, ${aoAlpha})`);
    aoGrad.addColorStop(0.6, `rgba(22, 17, 12, ${aoAlpha * 0.45})`);
    aoGrad.addColorStop(1, 'rgba(22, 17, 12, 0)');
    ctx.fillStyle = aoGrad;
    ctx.beginPath();
    ctx.ellipse(0, -1 * ts, drawW * 0.44, 8 * m.scale * ts, 0, 0, Math.PI * 2);
    ctx.fill();

    const STRIPS = 22;
    const srcStripH = img.height / STRIPS;
    const curTotalH = drawH * (0.12 + 0.88 * stemGrow);
    const dstStripH = curTotalH / STRIPS;

    ctx.globalAlpha = Math.min(1, rawT * 2.2);

    for (let i = 0; i < STRIPS; i++) {
      const s = (i + 0.5) / STRIPS;
      const capZone = clamp01((s - 0.32) / 0.68);
      const stemWidthScale = 0.55 + 0.45 * stemGrow;
      const capWidthScale = 0.28 + 0.72 * capBloom;
      const stripWidthScale = stemWidthScale * (1 - capZone) + capWidthScale * capZone;

      const growthBendOffset = m.bend * ts * (1 - stemGrow) * Math.pow(s, 1.45);
      const liveWindOffset = breathSway * Math.pow(s, 1.7);
      const dx = growthBendOffset + liveWindOffset;

      const stripW = drawW * stripWidthScale;
      const dstY = -(i + 1) * dstStripH;
      const srcY = img.height - (i + 1) * srcStripH;

      ctx.drawImage(
        img,
        0, Math.max(0, srcY - 0.4), img.width, srcStripH + 0.8,
        dx - stripW * 0.5, dstY - 0.4, stripW, dstStripH + 0.8
      );
    }
    ctx.restore();
  }

  // ---------- Leaves / ferns: root-anchored cantilever mesh bending ----------
  function drawDeformedLeaf(lf, elapsed) {
    const img = images[lf.tex];
    if (!isReady(img)) return;

    const rawT = clamp01((elapsed - lf.delay) / lf.dur);
    if (rawT <= 0.005) return;

    const ts = T.scale;
    const anchorX = T.x + lf.rootX * T.scaleX;
    const anchorY = T.y + lf.rootY * T.scaleY;

    const grow = easeOutCubic(rawT);
    const uncurl = easeOutBack(rawT);

    const drawW = lf.w * lf.scale * ts;
    const drawH = lf.h * lf.scale * ts;

    ctx.save();
    ctx.translate(anchorX, anchorY);
    ctx.rotate(lf.angle);
    if (lf.flip) ctx.scale(-1, 1);

    ctx.fillStyle = `rgba(14, 18, 10, ${0.26 * grow})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, drawW * 0.25, 4 * lf.scale * ts, 0, 0, Math.PI * 2);
    ctx.fill();

    const STRIPS = 22;
    const srcStripH = img.height / STRIPS;
    const curTotalH = drawH * (0.15 + 0.85 * grow);
    const dstStripH = curTotalH / STRIPS;

    ctx.globalAlpha = Math.min(1, rawT * 1.85);

    for (let i = 0; i < STRIPS; i++) {
      const s = (i + 0.5) / STRIPS;
      const w1 = Math.sin(elapsed * lf.freq + lf.phase - s * 1.05);
      const w2 = Math.cos(elapsed * (lf.freq * 1.62) + lf.phase * 1.3 - s * 1.4) * 0.35;
      const breeze = 0.82 + 0.28 * Math.sin(elapsed * 0.55 + lf.rootX * 0.005);

      const bendFactor = Math.pow(s, 1.85);
      const uncurlOffset = (1 - grow) * 14 * ts * Math.pow(s, 2.0);

      const dx = (lf.ampX * ts * (w1 + w2) * breeze * bendFactor) + uncurlOffset;
      const dy = (lf.ampY * ts * Math.sin(elapsed * (lf.freq * 1.2) + lf.phase) * Math.pow(s, 2.1));

      const stripW = drawW * (0.35 + 0.65 * Math.min(1, uncurl * (1.15 - s * 0.25)));
      const dstY = -(i + 1) * dstStripH + dy;
      const srcY = img.height - (i + 1) * srcStripH;

      ctx.drawImage(
        img,
        0, Math.max(0, srcY - 0.4), img.width, srcStripH + 0.8,
        dx - stripW * 0.5, dstY - 0.4, stripW, dstStripH + 0.8
      );
    }
    ctx.restore();
  }

  function drawScene(elapsed) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, vpW, vpH);

    for (const lf of BACK_LEAVES) drawDeformedLeaf(lf, elapsed);
    for (const m of BACK_MUSH) drawDeformedMushroom(m, elapsed);

    if (isReady(images.trunk)) {
      const drawW = BASE_W * T.scaleX;
      const drawH = (BASE_H + EXT_TOP) * T.scaleY;
      const drawYExt = T.y - EXT_TOP * T.scaleY;
      ctx.drawImage(images.trunk, T.x, drawYExt, drawW, drawH);
    }

    for (const m of FRONT_MUSH) drawDeformedMushroom(m, elapsed);
    for (const lf of FRONT_LEAVES) drawDeformedLeaf(lf, elapsed);
  }

  // ---------- Timeline with pause-on-offscreen (no jump on return) ----------
  let started = false;
  let rafId = null;
  let lastTs = null;
  let elapsed = 0;
  let isVisible = true;
  let pageVisible = !document.hidden;

  function tick(ts) {
    rafId = null;
    if (lastTs === null) lastTs = ts;
    // Real-time clock; only very large gaps (tab stalls) are clamped. Pauses reset lastTs, so no jump on return.
    const delta = Math.min(0.25, Math.max(0, (ts - lastTs) / 1000));
    lastTs = ts;
    elapsed += delta;
    drawScene(elapsed);
    scheduleNext();
  }

  function scheduleNext() {
    if (!started || prefersReduced) return;
    if (isVisible && pageVisible && rafId === null) {
      rafId = requestAnimationFrame(tick);
    }
  }

  function pauseLoop() {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
    lastTs = null;
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) scheduleNext();
        else pauseLoop();
      },
      { threshold: 0 }
    ).observe(heroSection);
  }

  document.addEventListener('visibilitychange', () => {
    pageVisible = !document.hidden;
    if (pageVisible) scheduleNext();
    else pauseLoop();
  });

  let resizeRaf = null;
  function onResize() {
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = null;
      const w = heroSection.clientWidth;
      const h = heroSection.clientHeight;
      if (w === vpW && h === vpH && Math.min(window.devicePixelRatio || 1, 2) === dpr) return;
      resize();
      if (started) drawScene(elapsed);
    });
  }
  if ('ResizeObserver' in window) {
    new ResizeObserver(onResize).observe(heroSection);
  } else {
    window.addEventListener('resize', onResize, { passive: true });
  }

  resize();

  Promise.all(loadPromises).then(() => {
    started = true;
    if (prefersReduced) {
      elapsed = 5.0; // final composition, static
      drawScene(elapsed);
      return;
    }
    elapsed = 0;
    lastTs = null;
    scheduleNext();
  });
})();
