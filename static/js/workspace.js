/**
 * ==========================================================================
 * SHROOMY — Full-Page AI Workspace Controller
 * 1. Entrance Animation & 4-Click Roomie Welcome Popup
 *    (Step 1: Menyapa -> Step 2: Detektif Kamera -> Step 3: Ilmuwan Citra -> Step 4: Profesor Tabel Data -> Masuk Workspace)
 * 2. Mode 1: Ekstraksi Visual Kamera (Area Fokus 224×224 px)
 * 3. Mode 2: Input Citra Digital (Ekstraksi Spektrum RGB & Tekstur)
 * 4. Mode 3: Tabel Data Morfologi 20 Parameter (Support Vector Machine & Random Forest)
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    /* ---------- 0. Top Bar Scroll Spy, Hash Active State & Mobile Menu ---------- */
    const wsSiteNav = document.getElementById('ws-site-nav');
    const wsMenuToggle = document.getElementById('ws-menu-toggle');
    const wsNavLinks = Array.from(document.querySelectorAll('#ws-site-nav .nav-link'));
    const wsSections = wsNavLinks
        .map(link => {
            const href = link.getAttribute('href');
            return href && href.startsWith('#') ? document.querySelector(href) : null;
        })
        .filter(Boolean);

    function setActiveWsNav(targetHash) {
        wsNavLinks.forEach(link => {
            link.classList.toggle('is-active', link.getAttribute('href') === targetHash);
        });
    }

    function updateWsScrollSpy() {
        if (wsSections.length === 0) return;

        // If user reached the bottom of the page, highlight the last section
        const atBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 40);
        if (atBottom) {
            setActiveWsNav('#' + wsSections[wsSections.length - 1].id);
            return;
        }

        const scrollPos = window.scrollY + 150;
        let currentId = '#' + wsSections[0].id;
        wsSections.forEach(sec => {
            if (scrollPos >= sec.offsetTop) {
                currentId = '#' + sec.id;
            }
        });
        setActiveWsNav(currentId);
    }

    if (wsMenuToggle && wsSiteNav) {
        wsMenuToggle.addEventListener('click', () => {
            const isOpen = wsSiteNav.classList.toggle('is-open');
            wsMenuToggle.setAttribute('aria-expanded', String(isOpen));
        });
    }

    wsNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            const href = link.getAttribute('href');
            if (href) setActiveWsNav(href);
            if (wsSiteNav && wsMenuToggle) {
                wsSiteNav.classList.remove('is-open');
                wsMenuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });

    window.addEventListener('scroll', updateWsScrollSpy, { passive: true });
    window.addEventListener('hashchange', () => {
        if (window.location.hash) {
            setActiveWsNav(window.location.hash);
        } else {
            updateWsScrollSpy();
        }
    });

    if (window.location.hash && document.querySelector(window.location.hash)) {
        setActiveWsNav(window.location.hash);
    } else {
        updateWsScrollSpy();
    }

    /* ---------- 0B. Botanical Scroll Background Decorations (/workspace) ---------- */
    const wsBotanicalTargets = document.querySelectorAll('.bg-botanical-curve, .bg-decor-item');
    if (wsBotanicalTargets.length > 0) {
        if ('IntersectionObserver' in window) {
            const wsBgObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-decor-visible');
                        wsBgObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
            wsBotanicalTargets.forEach(el => wsBgObserver.observe(el));
        } else {
            wsBotanicalTargets.forEach(el => el.classList.add('is-decor-visible'));
        }
    }

    /* ---------- 1. Entrance Animation & 4-Step Roomie Welcome Popup ---------- */
    const bodyEl = document.getElementById('workspace-body');
    const curtainEl = document.getElementById('ws-entrance-curtain');
    const welcomeModal = document.getElementById('roomie-welcome-modal');
    const clickableCard = document.getElementById('roomie-clickable-card');
    const modalAvatar = document.getElementById('roomie-modal-avatar');
    const stepBadge = document.getElementById('roomie-step-badge');
    const modalKicker = document.getElementById('roomie-modal-kicker');
    const modalTitle = document.getElementById('roomie-modal-title');
    const modalDesc = document.getElementById('roomie-modal-desc');
    const stageModeChip = document.getElementById('roomie-stage-mode-chip');
    const btnNextStep = document.getElementById('btn-roomie-next-step');
    const btnNextText = document.getElementById('btn-roomie-next-text');
    const stepDots = document.querySelectorAll('.r-dot');

    const ROOMIE_ONBOARDING_STEPS = [
        {
            pose: 'wave',
            badge: 'Tahap 1 dari 4',
            stageChip: 'Sambutan Roomie',
            kicker: 'Sambutan Workspace Shroomy',
            title: 'Halo! Kenalkan, Aku Roomie',
            desc: 'Selamat datang di <strong>Workspace Identifikasi Jamur Terpadu</strong>. Aku akan memperkenalkan 3 mode yang tersedia di halaman ini. Klik Roomie untuk melihat mode pertama.',
            btnLabel: 'Lanjut ke Ekstraksi Kamera (1/4)'
        },
        {
            pose: 'camera',
            badge: 'Tahap 2 dari 4',
            stageChip: 'Detektif Kamera · Ekstraksi Visual',
            kicker: 'Mode 01 · Ekstraksi Visual Kamera',
            title: 'Detektif Kamera (Ekstraksi Visual)',
            desc: 'Pada <strong>Mode 1</strong>, arahkan kamera perangkat langsung ke jamur. Sistem otomatis mengambil area fokus 224×224 px untuk mengekstrak warna tudung dan tekstur permukaan guna disinkronkan ke tabel morfologi.',
            btnLabel: 'Lanjut ke Ekstraksi Citra (2/4)'
        },
        {
            pose: 'scientist',
            badge: 'Tahap 3 dari 4',
            stageChip: 'Ilmuwan Citra · Ekstraksi Citra Digital',
            kicker: 'Mode 02 · Ekstraksi Citra Digital',
            title: 'Ilmuwan Citra (Ekstraksi Warna & Tekstur)',
            desc: 'Pada <strong>Mode 2</strong>, unggah file foto jamur dari perangkatmu. Sistem mengekstrak spektrum warna tudung (RGB & HEX) serta tekstur permukaan untuk menyelaraskan parameter morfologi pada tabel data.',
            btnLabel: 'Lanjut ke Tabel Data (3/4)'
        },
        {
            pose: 'professor',
            badge: 'Tahap 4 dari 4',
            stageChip: 'Profesor Tabel · SVM & Random Forest',
            kicker: 'Mode 03 · Tabel Data Morfologi',
            title: 'Profesor Tabel Data (SVM & Random Forest)',
            desc: 'Pada <strong>Mode 3</strong>, tersedia <strong>Tabel 20 Karakteristik Morfologi</strong> yang diklasifikasikan oleh algoritma <strong>Support Vector Machine (SVM)</strong> dan <strong>Random Forest</strong> dengan akurasi dan presisi uji 100%.',
            btnLabel: 'Mulai Gunakan Workspace (4/4)'
        }
    ];

    let currentOnboardingStep = 0;

    function renderOnboardingStep(idx) {
        const step = ROOMIE_ONBOARDING_STEPS[idx];
        if (!step) return;

        if (clickableCard) clickableCard.setAttribute('data-pose', step.pose);
        if (modalAvatar) {
            modalAvatar.setAttribute('data-pose', step.pose);
            modalAvatar.classList.remove('is-popping');
            void modalAvatar.offsetWidth;
            modalAvatar.classList.add('is-popping');
        }
        if (stepBadge) stepBadge.textContent = step.badge;
        if (stageModeChip) stageModeChip.textContent = step.stageChip;
        if (modalKicker) modalKicker.textContent = step.kicker;
        if (modalTitle) modalTitle.textContent = step.title;
        if (modalDesc) modalDesc.innerHTML = step.desc;
        if (btnNextText) btnNextText.textContent = step.btnLabel;

        stepDots.forEach((dot, dIdx) => {
            dot.classList.toggle('is-active', dIdx === idx);
            dot.classList.toggle('is-done', dIdx < idx);
        });
    }

    function advanceRoomieStep() {
        currentOnboardingStep += 1;
        if (currentOnboardingStep < ROOMIE_ONBOARDING_STEPS.length) {
            renderOnboardingStep(currentOnboardingStep);
        } else {
            if (welcomeModal) welcomeModal.classList.remove('is-open');
        }
    }

    // Play entrance curtain reveal then open the 4-click Roomie popup
    setTimeout(() => {
        if (curtainEl) curtainEl.classList.add('is-hidden');
        if (bodyEl) {
            bodyEl.classList.remove('is-entering');
            bodyEl.classList.add('has-entered');
        }
    }, 450);

    setTimeout(() => {
        currentOnboardingStep = 0;
        renderOnboardingStep(0);
        if (welcomeModal) welcomeModal.classList.add('is-open');
    }, 680);

    if (clickableCard) {
        clickableCard.addEventListener('click', () => {
            advanceRoomieStep();
        });
    }

    if (btnNextStep) {
        btnNextStep.addEventListener('click', (e) => {
            e.stopPropagation();
            advanceRoomieStep();
        });
    }

    /* ---------- 2. Mode Tab Switching & URL Query Sync ---------- */
    const tabBtns = document.querySelectorAll('.ws-tab-btn');
    const modePanels = document.querySelectorAll('.ws-mode-panel');
    let currentStream = null;
    let lastDetectedVision = null;

    function switchWorkspaceMode(targetMode) {
        tabBtns.forEach(btn => {
            const isTarget = btn.dataset.wsMode === targetMode;
            btn.classList.toggle('is-active', isTarget);
            btn.setAttribute('aria-selected', String(isTarget));
        });

        modePanels.forEach(panel => {
            const isMatch = panel.dataset.modePanel === targetMode;
            panel.classList.toggle('is-active', isMatch);
            panel.classList.toggle('is-visible', isMatch);
        });

        if (targetMode !== 'camera' && currentStream) {
            stopCameraStream();
        }
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchWorkspaceMode(btn.dataset.wsMode);
        });
    });

    const urlParams = new URLSearchParams(window.location.search);
    const initialMode = urlParams.get('mode');
    if (initialMode && ['camera', 'upload', 'form'].includes(initialMode)) {
        switchWorkspaceMode(initialMode);
    }

    /* ---------- 3. Result Panel Updating Helper ---------- */
    const resEngineName = document.getElementById('res-engine-name');
    const resVerdictBox = document.getElementById('res-verdict-box');
    const resVerdictSub = document.getElementById('res-verdict-sub');
    const resVerdictTitle = document.getElementById('res-verdict-title');
    const resProbEdible = document.getElementById('res-prob-edible');
    const resProbPoisonous = document.getElementById('res-prob-poisonous');
    const barProbEdible = document.getElementById('bar-prob-edible');
    const barProbPoisonous = document.getElementById('bar-prob-poisonous');
    const resConfidenceVal = document.getElementById('res-confidence-val');
    const resModelPrecision = document.getElementById('res-model-precision');
    const resColorDot = document.getElementById('res-color-dot');
    const resColorText = document.getElementById('res-color-text');
    const resDetectedRgb = document.getElementById('res-detected-rgb');

    function renderPredictionResult(data, sourceType) {
        if (resEngineName) {
            resEngineName.textContent = data.model_used || 'Model Aktif';
        }

        const probSection = document.querySelector('.ws-prob-section');
        const telConfItem = resConfidenceVal ? resConfidenceVal.closest('.telemetry-item') : null;
        const labelProbE = document.querySelector('.prob-row:first-child .prob-header span');
        const labelProbP = document.querySelector('.prob-row:nth-child(2) .prob-header span');
        const telConfLabel = resConfidenceVal ? resConfidenceVal.closest('.telemetry-item')?.querySelector('.tel-label') : null;

        if (sourceType === 'vision' && (data.classification_available === false || data.label === 'unclassified')) {
            // Mode Ekstraksi Fitur Visual (Non-CNN / Serverless Runtime)
            // Sembunyikan bar probabilitas dan tingkat keyakinan agar tidak menampilkan nilai strip
            if (probSection) probSection.style.display = 'none';
            if (telConfItem) telConfItem.style.display = 'none';

            if (resVerdictBox) {
                resVerdictBox.classList.remove('is-edible', 'is-poisonous');
                resVerdictBox.classList.add('is-neutral');
            }
            if (resVerdictSub) {
                resVerdictSub.textContent = 'Ekstraksi Fitur Visual (Non-CNN)';
            }
            if (resVerdictTitle) {
                resVerdictTitle.textContent = 'Ekstraksi Fitur Visual Berhasil — Klasifikasi Gambar Belum Tersedia';
            }
            if (resModelPrecision) {
                resModelPrecision.textContent = 'Ekstraksi Fitur (Heuristik RGB)';
            }
        } else {
            // Tampilkan kembali bar probabilitas dan tingkat keyakinan jika sebelumnya disembunyikan
            if (probSection) probSection.style.display = '';
            if (telConfItem) telConfItem.style.display = '';

            // Mode Klasifikasi Aktif (Tabular SVM/RF atau Native CNN)
            const isPoison = data.label === 'poisonous';
            const isSVM = data.score_type === 'uncalibrated_decision_score' || (data.model_used && data.model_used.includes('SVM'));
            const scores = data.probabilities || data.class_scores || {};
            const probE = scores.e !== undefined ? scores.e : (isPoison ? 0 : 100);
            const probP = scores.p !== undefined ? scores.p : (isPoison ? 100 : 0);

            if (resVerdictBox) {
                resVerdictBox.classList.remove('is-neutral', 'is-edible', 'is-poisonous');
                resVerdictBox.classList.add(isPoison ? 'is-poisonous' : 'is-edible');
            }

            if (resVerdictSub) {
                if (sourceType === 'vision') {
                    resVerdictSub.textContent = 'Evaluasi Citra (CNN MobileNetV2)';
                } else if (isSVM) {
                    resVerdictSub.textContent = 'Klasifikasi Morfologi (SVM · Skor Keputusan)';
                } else {
                    resVerdictSub.textContent = 'Klasifikasi Morfologi (Random Forest · Estimasi Probabilitas)';
                }
            }

            if (resVerdictTitle) {
                resVerdictTitle.textContent = data.label_full || (isPoison ? 'POISONOUS (Beracun)' : 'EDIBLE (Aman Dimakan)');
            }

            // Atur label dan nilai probabilitas / skor keputusan secara akurat
            if (isSVM) {
                if (labelProbE) labelProbE.textContent = 'Skor Estimasi Aman (Edible)';
                if (labelProbP) labelProbP.textContent = 'Skor Estimasi Beracun (Poisonous)';
                if (telConfLabel) telConfLabel.textContent = 'Skor Keputusan (SVM)';
                if (resConfidenceVal) {
                    const rawDec = data.decision_score !== undefined && data.decision_score !== null ? ` (Margin: ${data.decision_score})` : '';
                    resConfidenceVal.textContent = `${data.estimated_score}%${rawDec}`;
                }
                if (resModelPrecision) {
                    resModelPrecision.textContent = '100.0% Presisi Uji (Margin RBF Optimal)';
                }
            } else {
                if (labelProbE) labelProbE.textContent = 'Estimasi Probabilitas Aman (Edible)';
                if (labelProbP) labelProbP.textContent = 'Estimasi Probabilitas Beracun (Poisonous)';
                if (telConfLabel) telConfLabel.textContent = 'Estimasi Probabilitas (RF)';
                if (resConfidenceVal) {
                    resConfidenceVal.textContent = data.confidence !== null && data.confidence !== undefined ? `${data.confidence}%` : (data.estimated_score !== undefined ? `${data.estimated_score}%` : '—');
                }
                if (resModelPrecision) {
                    resModelPrecision.textContent = sourceType === 'vision'
                        ? 'Inference MobileNetV2'
                        : '100.0% Presisi (100 Trees Ensemble)';
                }
            }

            if (resProbEdible) resProbEdible.textContent = `${probE}%`;
            if (resProbPoisonous) resProbPoisonous.textContent = `${probP}%`;
            if (barProbEdible) barProbEdible.style.width = `${probE}%`;
            if (barProbPoisonous) barProbPoisonous.style.width = `${probP}%`;
        }

        if (data.detected_color_name && resColorText && resColorDot) {
            resColorText.textContent = data.detected_color_name;
            resColorDot.style.background = data.hex || '#16a34a';
        }

        if (data.rgb && resDetectedRgb) {
            const surf = data.detected_surface_name ? ` · ${data.detected_surface_name}` : '';
            resDetectedRgb.textContent = `RGB(${data.rgb.join(', ')})${surf}`;
        } else if (sourceType === 'tabular' && resDetectedRgb) {
            resDetectedRgb.textContent = '20 Parameter Tabel';
        }
    }

    /* ---------- 4. Synthetic Specimen Canvas Renderer ---------- */
    function drawSyntheticMushroom(canvas, type) {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#143828');
        bgGrad.addColorStop(1, '#081c14');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#f1ece1';
        ctx.beginPath();
        ctx.roundRect(w * 0.41, h * 0.48, w * 0.18, h * 0.42, 12);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(w * 0.5, h * 0.46, w * 0.38, h * 0.28, 0, Math.PI, 0, false);
        ctx.closePath();

        if (type === 'toxic') {
            ctx.fillStyle = '#c82323';
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            const spots = [
                [0.5, 0.36, 9], [0.40, 0.41, 7], [0.60, 0.40, 8],
                [0.46, 0.46, 6], [0.55, 0.47, 7], [0.35, 0.46, 6], [0.65, 0.46, 6]
            ];
            spots.forEach(([sx, sy, sr]) => {
                ctx.beginPath();
                ctx.arc(w * sx, h * sy, sr, 0, Math.PI * 2);
                ctx.fill();
            });
        } else {
            ctx.fillStyle = '#784b26';
            ctx.fill();
        }
    }

    /* ---------- 5. MODE 1: Live Camera Scanner ---------- */
    const videoEl = document.getElementById('camera-video');
    const canvasEl = document.getElementById('camera-canvas');
    const cameraPlaceholder = document.getElementById('camera-placeholder');
    const cameraFacingSelect = document.getElementById('camera-facing-select');
    const btnStartCam = document.getElementById('btn-start-camera');
    const btnCaptureCam = document.getElementById('btn-capture-camera');
    const btnStopCam = document.getElementById('btn-stop-camera');
    const btnSimCamSafe = document.getElementById('btn-sim-cam-safe');
    const btnSimCamToxic = document.getElementById('btn-sim-cam-toxic');

    async function startCameraStream() {
        try {
            if (currentStream) {
                currentStream.getTracks().forEach(t => t.stop());
            }
            const facing = cameraFacingSelect ? cameraFacingSelect.value : 'environment';
            currentStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facing, width: { ideal: 640 }, height: { ideal: 480 } },
                audio: false
            });
            if (videoEl) {
                videoEl.srcObject = currentStream;
                videoEl.classList.add('is-streaming');
            }
            if (canvasEl) canvasEl.classList.remove('is-sim-visible');
            if (cameraPlaceholder) cameraPlaceholder.classList.add('is-hidden');
            if (btnCaptureCam) btnCaptureCam.disabled = false;
            if (btnStartCam) btnStartCam.style.display = 'none';
            if (btnStopCam) btnStopCam.style.display = 'inline-flex';
        } catch (_) {
            runCameraSimulation('safe');
        }
    }

    function stopCameraStream() {
        if (currentStream) {
            currentStream.getTracks().forEach(t => t.stop());
            currentStream = null;
        }
        if (videoEl) {
            videoEl.srcObject = null;
            videoEl.classList.remove('is-streaming');
        }
        if (canvasEl) canvasEl.classList.remove('is-sim-visible');
        if (cameraPlaceholder) cameraPlaceholder.classList.remove('is-hidden');
        if (btnCaptureCam) btnCaptureCam.disabled = true;
        if (btnStartCam) btnStartCam.style.display = 'inline-flex';
        if (btnStopCam) btnStopCam.style.display = 'none';
    }

    function evaluateCanvasVision(targetCanvas, onDone) {
        if (!targetCanvas) return;
        targetCanvas.toBlob(async (blob) => {
            if (!blob) return;
            const formData = new FormData();
            formData.append('image', blob, 'capture_224.jpg');
            try {
                const res = await fetch('/api/predict-vision', {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                if (!data.error) {
                    lastDetectedVision = data;
                    renderPredictionResult(data, 'vision');
                    updateExtractedImageTable(data);
                    syncVisionToFormFields(data);
                }
            } catch (_) {
                /* ignore */
            } finally {
                if (typeof onDone === 'function') onDone();
            }
        }, 'image/jpeg', 0.94);
    }

    function captureFromActiveCamera() {
        if (!canvasEl) return;
        const ctx = canvasEl.getContext('2d');
        if (videoEl && currentStream) {
            ctx.drawImage(videoEl, 0, 0, 224, 224);
        }
        if (btnCaptureCam) {
            btnCaptureCam.disabled = true;
            const span = btnCaptureCam.querySelector('span');
            const orig = span.textContent;
            span.textContent = 'Mengekstrak Warna...';
            evaluateCanvasVision(canvasEl, () => {
                btnCaptureCam.disabled = false;
                span.textContent = orig;
            });
        } else {
            evaluateCanvasVision(canvasEl);
        }
    }

    function runCameraSimulation(type) {
        if (!canvasEl) return;
        drawSyntheticMushroom(canvasEl, type);
        canvasEl.classList.add('is-sim-visible');
        if (cameraPlaceholder) cameraPlaceholder.classList.add('is-hidden');
        if (btnCaptureCam) btnCaptureCam.disabled = false;
        evaluateCanvasVision(canvasEl);
    }

    if (btnStartCam) btnStartCam.addEventListener('click', startCameraStream);
    if (btnStopCam) btnStopCam.addEventListener('click', stopCameraStream);
    if (btnCaptureCam) btnCaptureCam.addEventListener('click', captureFromActiveCamera);
    if (cameraFacingSelect) {
        cameraFacingSelect.addEventListener('change', () => {
            if (currentStream) startCameraStream();
        });
    }
    if (btnSimCamSafe) btnSimCamSafe.addEventListener('click', () => runCameraSimulation('safe'));
    if (btnSimCamToxic) btnSimCamToxic.addEventListener('click', () => runCameraSimulation('toxic'));

    /* ---------- 6. MODE 2: Image Upload & Extraction Table ---------- */
    const uploadInput = document.getElementById('image-upload-input');
    const uploadDropzone = document.getElementById('upload-dropzone');
    const uploadPreviewWrap = document.getElementById('upload-preview-wrap');
    const uploadPreviewImg = document.getElementById('upload-preview-img');
    const uploadRoiCanvas = document.getElementById('upload-roi-canvas');
    const uploadEmptyState = document.getElementById('upload-empty-state');
    const btnAnalyzeUpload = document.getElementById('btn-analyze-upload');
    const btnSyncToForm = document.getElementById('btn-sync-to-form');
    const btnSampleImgSafe = document.getElementById('btn-sample-img-safe');
    const btnSampleImgToxic = document.getElementById('btn-sample-img-toxic');
    let selectedImageBlob = null;

    function updateExtractedImageTable(data) {
        const cName = document.getElementById('img-tbl-color-name');
        const cCode = document.getElementById('img-tbl-color-code');
        const sName = document.getElementById('img-tbl-surf-name');
        const sCode = document.getElementById('img-tbl-surf-code');
        const rgbVal = document.getElementById('img-tbl-rgb-val');
        const hexVal = document.getElementById('img-tbl-hex-val');

        if (cName && data.detected_color_name) cName.textContent = data.detected_color_name;
        if (cCode && data.detected_color_code) cCode.textContent = `Kode: ${data.detected_color_code}`;
        if (sName && data.detected_surface_name) sName.textContent = data.detected_surface_name;
        if (sCode && data.detected_surface_code) sCode.textContent = `Kode: ${data.detected_surface_code}`;
        if (rgbVal && data.rgb) rgbVal.textContent = `RGB(${data.rgb.join(', ')})`;
        if (hexVal && data.hex) hexVal.textContent = data.hex;
    }

    function handleSelectedFile(file) {
        if (!file || !file.type.startsWith('image/')) return;
        selectedImageBlob = file;

        const reader = new FileReader();
        reader.onload = (e) => {
            if (uploadPreviewImg) uploadPreviewImg.src = e.target.result;
            if (uploadPreviewWrap) uploadPreviewWrap.classList.add('is-visible');
            if (uploadEmptyState) uploadEmptyState.classList.add('is-hidden');
            if (btnAnalyzeUpload) btnAnalyzeUpload.disabled = false;
            if (btnSyncToForm) btnSyncToForm.disabled = false;
            runUploadAnalysis();
        };
        reader.readAsDataURL(file);
    }

    async function runUploadAnalysis() {
        if (!selectedImageBlob || !btnAnalyzeUpload) return;
        btnAnalyzeUpload.disabled = true;
        const spanEl = btnAnalyzeUpload.querySelector('span');
        const origText = spanEl.textContent;
        spanEl.textContent = 'Mengekstrak Fitur...';

        const formData = new FormData();
        formData.append('image', selectedImageBlob, 'uploaded_mushroom.jpg');

        try {
            const res = await fetch('/api/predict-vision', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (!data.error) {
                lastDetectedVision = data;
                renderPredictionResult(data, 'vision');
                updateExtractedImageTable(data);
                syncVisionToFormFields(data);
                if (btnSyncToForm) btnSyncToForm.disabled = false;
            }
        } catch (_) {
            /* ignore */
        } finally {
            btnAnalyzeUpload.disabled = false;
            spanEl.textContent = origText;
        }
    }

    function loadSampleImageForUpload(type) {
        if (!uploadRoiCanvas) return;
        drawSyntheticMushroom(uploadRoiCanvas, type);
        const dataUrl = uploadRoiCanvas.toDataURL('image/jpeg', 0.94);
        if (uploadPreviewImg) uploadPreviewImg.src = dataUrl;
        if (uploadPreviewWrap) uploadPreviewWrap.classList.add('is-visible');
        if (uploadEmptyState) uploadEmptyState.classList.add('is-hidden');
        if (btnAnalyzeUpload) btnAnalyzeUpload.disabled = false;
        if (btnSyncToForm) btnSyncToForm.disabled = false;

        uploadRoiCanvas.toBlob((blob) => {
            if (!blob) return;
            selectedImageBlob = blob;
            runUploadAnalysis();
        }, 'image/jpeg', 0.94);
    }

    if (uploadInput) {
        uploadInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                handleSelectedFile(e.target.files[0]);
            }
        });
    }

    if (uploadDropzone) {
        uploadDropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadDropzone.classList.add('is-dragover');
        });
        uploadDropzone.addEventListener('dragleave', () => {
            uploadDropzone.classList.remove('is-dragover');
        });
        uploadDropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadDropzone.classList.remove('is-dragover');
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleSelectedFile(e.dataTransfer.files[0]);
            }
        });
    }

    if (btnAnalyzeUpload) btnAnalyzeUpload.addEventListener('click', runUploadAnalysis);
    if (btnSampleImgSafe) btnSampleImgSafe.addEventListener('click', () => loadSampleImageForUpload('safe'));
    if (btnSampleImgToxic) btnSampleImgToxic.addEventListener('click', () => loadSampleImageForUpload('toxic'));

    function syncVisionToFormFields(data) {
        const capColorSelect = document.getElementById('f-cap-color');
        const capSurfaceSelect = document.getElementById('f-cap-surface');
        if (capColorSelect && data.detected_color_code) {
            capColorSelect.value = data.detected_color_code;
        }
        if (capSurfaceSelect && data.detected_surface_code) {
            capSurfaceSelect.value = data.detected_surface_code;
        }
    }

    if (btnSyncToForm) {
        btnSyncToForm.addEventListener('click', () => {
            if (lastDetectedVision) {
                syncVisionToFormFields(lastDetectedVision);
            }
            switchWorkspaceMode('form');
        });
    }

    /* ---------- 7. MODE 3: 20-Characteristic Data Table (SVM & Random Forest) ---------- */
    const algoPills = document.querySelectorAll('.algo-pill');
    const morphologyForm = document.getElementById('morphology-form');
    const btnPresetEdible = document.getElementById('btn-preset-edible');
    const btnPresetPoisonous = document.getElementById('btn-preset-poisonous');
    let selectedAlgo = 'rf';

    algoPills.forEach(pill => {
        pill.addEventListener('click', () => {
            algoPills.forEach(p => p.classList.remove('is-active'));
            pill.classList.add('is-active');
            selectedAlgo = pill.dataset.algo || 'rf';
            if (morphologyForm) morphologyForm.dispatchEvent(new Event('submit'));
        });
    });

    const PRESET_EDIBLE = {
        'cap-shape': 'x', 'cap-surface': 's', 'cap-color': 'n', 'bruises': 't', 'odor': 'a',
        'gill-attachment': 'f', 'gill-spacing': 'c', 'gill-size': 'b', 'gill-color': 'k',
        'stalk-shape': 't', 'stalk-surface-above-ring': 's', 'stalk-surface-below-ring': 's',
        'stalk-color-above-ring': 'w', 'stalk-color-below-ring': 'w', 'veil-color': 'w',
        'ring-number': 'o', 'ring-type': 'p', 'spore-print-color': 'n', 'population': 's', 'habitat': 'g'
    };

    const PRESET_POISONOUS = {
        'cap-shape': 'x', 'cap-surface': 'y', 'cap-color': 'e', 'bruises': 'f', 'odor': 'f',
        'gill-attachment': 'f', 'gill-spacing': 'c', 'gill-size': 'n', 'gill-color': 'b',
        'stalk-shape': 't', 'stalk-surface-above-ring': 'k', 'stalk-surface-below-ring': 'k',
        'stalk-color-above-ring': 'p', 'stalk-color-below-ring': 'p', 'veil-color': 'w',
        'ring-number': 'o', 'ring-type': 'e', 'spore-print-color': 'w', 'population': 'v', 'habitat': 'd'
    };

    function applyFormPreset(presetObj) {
        if (!morphologyForm) return;
        Object.entries(presetObj).forEach(([name, val]) => {
            const el = morphologyForm.elements[name];
            if (el) el.value = val;
        });
        morphologyForm.dispatchEvent(new Event('submit'));
    }

    if (btnPresetEdible) {
        btnPresetEdible.addEventListener('click', () => applyFormPreset(PRESET_EDIBLE));
    }
    if (btnPresetPoisonous) {
        btnPresetPoisonous.addEventListener('click', () => applyFormPreset(PRESET_POISONOUS));
    }

    if (morphologyForm) {
        morphologyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(morphologyForm);
            const payload = { model_type: selectedAlgo };
            formData.forEach((value, key) => {
                payload[key] = value;
            });

            try {
                const res = await fetch('/predict', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (!data.error) {
                    renderPredictionResult(data, 'tabular');
                }
            } catch (_) {
                alert('Gagal melakukan prediksi morfologi.');
            }
        });
    }
});
