/**
 * ==========================================================================
 * SHROOMY — Full-Page AI Workspace Controller
 * 1. Entrance Animation & 3-Click Roomie Welcome Popup
 *    (Step 1: Menyapa -> Step 2: Scan Kamera Realtime -> Step 3: Input Gambar Digital -> Masuk Workspace)
 * 2. Mode 1: Scan Kamera Realtime (Klasifikasi Citra CNN MobileNetV2 · 224×224 px)
 * 3. Mode 2: Input Citra Digital (Klasifikasi Citra CNN MobileNetV2 & Ekstraksi Warna)
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

        const atBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 60);
        if (atBottom) {
            setActiveWsNav('#' + wsSections[wsSections.length - 1].id);
            return;
        }

        const focalLine = window.innerHeight * 0.35;
        let matchedId = '#' + wsSections[0].id;

        for (const sec of wsSections) {
            const rect = sec.getBoundingClientRect();
            if (rect.top <= focalLine && rect.bottom > focalLine) {
                matchedId = '#' + sec.id;
                break;
            }
        }

        setActiveWsNav(matchedId);
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

    /* ---------- 1. Entrance Animation & 3-Stage Interactive Roomie Onboarding (Apple Liquid Glass) ---------- */
    const bodyEl = document.getElementById('workspace-body');
    const curtainEl = document.getElementById('ws-entrance-curtain');
    const welcomeModal = document.getElementById('roomie-welcome-modal');
    const clickableCard = document.getElementById('roomie-clickable-card');
    const characterTrigger = document.getElementById('roomie-character-trigger');
    const modalAvatar = document.getElementById('roomie-modal-avatar');
    const stepBadge = document.getElementById('roomie-step-badge');
    const modalKicker = document.getElementById('roomie-modal-kicker');
    const modalTitle = document.getElementById('roomie-modal-title');
    const modalDesc = document.getElementById('roomie-modal-desc');
    const stageModeChip = document.getElementById('roomie-stage-mode-chip');
    const btnNextStep = document.getElementById('btn-roomie-next-step');
    const btnNextText = document.getElementById('btn-roomie-next-text');
    const welcomeDismissBtn = document.getElementById('roomie-welcome-dismiss');
    const welcomeDismissAlt = document.getElementById('roomie-welcome-dismiss-btn');
    const stepDots = document.querySelectorAll('.r-dot');

    const ROOMIE_ONBOARDING_STEPS = [
        {
            pose: 'wave',
            badge: 'Tahap 1 dari 3',
            stageChip: 'Sambutan Roomie',
            kicker: 'Sambutan Workspace Shroomy',
            title: 'Halo! Kenalkan, Aku Roomie',
            desc: 'Selamat datang di <strong>Workspace Identifikasi Jamur Terpadu</strong>. Aku akan memperkenalkan 2 mode identifikasi citra yang tersedia di halaman ini. Klik Roomie untuk melihat mode pertama.',
            btnLabel: 'Lanjut ke Scan Kamera (1/3)'
        },
        {
            pose: 'camera',
            badge: 'Tahap 2 dari 3',
            stageChip: 'Detektif Kamera · Scan Realtime',
            kicker: 'Mode 01 · Scan Kamera Realtime',
            title: 'Detektif Kamera (Klasifikasi Citra CNN)',
            desc: 'Pada <strong>Mode 1</strong>, arahkan kamera perangkat langsung ke jamur. Sistem otomatis memproses citra pada resolusi 224×224 px menggunakan model deep learning <strong>CNN MobileNetV2</strong> secara realtime.',
            btnLabel: 'Lanjut ke Input Gambar (2/3)'
        },
        {
            pose: 'scientist',
            badge: 'Tahap 3 dari 3',
            stageChip: 'Ilmuwan Citra · Input File Gambar',
            kicker: 'Mode 02 · Input Gambar Digital',
            title: 'Ilmuwan Citra (Klasifikasi Citra & Analisis Warna)',
            desc: 'Pada <strong>Mode 2</strong>, unggah file foto jamur dari perangkatmu. Sistem mengevaluasi citra menggunakan model <strong>CNN MobileNetV2</strong> serta menganalisis estimasi spektrum warna tudung (RGB & HEX).',
            btnLabel: 'Mulai Gunakan Workspace (3/3)'
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
            closeWorkspaceWelcome();
        }
    }

    function closeWorkspaceWelcome() {
        if (!welcomeModal) return;
        welcomeModal.classList.remove('is-open');
        welcomeModal.classList.add('is-shrinking');
        welcomeModal.setAttribute('aria-hidden', 'true');
        setTimeout(() => {
            welcomeModal.classList.remove('is-shrinking');
            welcomeModal.style.display = 'none';
        }, 460);
    }

    if (characterTrigger) characterTrigger.addEventListener('click', advanceRoomieStep);
    if (btnNextStep) btnNextStep.addEventListener('click', advanceRoomieStep);
    if (welcomeDismissBtn) welcomeDismissBtn.addEventListener('click', closeWorkspaceWelcome);
    if (welcomeDismissAlt) welcomeDismissAlt.addEventListener('click', closeWorkspaceWelcome);
    if (welcomeModal) {
        welcomeModal.addEventListener('click', (e) => {
            if (e.target === welcomeModal) closeWorkspaceWelcome();
        });
    }

    // Play entrance curtain reveal then open Roomie popup
    setTimeout(() => {
        if (curtainEl) curtainEl.classList.add('is-hidden');
        if (bodyEl) {
            bodyEl.classList.remove('is-entering');
            bodyEl.classList.add('has-entered');
        }
    }, 450);

    /* ---------- 1B. Reveal Workspace Hero Banner (BridgeAI Editorial Effect) ---------- */
    const wsBannerTitle = document.getElementById('ws-banner-title');
    const wsBannerCopy = document.getElementById('ws-banner-copy');

    function revealWorkspaceHero() {
        if (wsBannerTitle) wsBannerTitle.classList.add('is-revealed');
        if (wsBannerCopy) wsBannerCopy.classList.add('is-revealed');
    }

    // Trigger reveal as soon as curtain clears
    setTimeout(revealWorkspaceHero, 550);

    setTimeout(() => {
        if (welcomeModal) {
            renderOnboardingStep(0);
            welcomeModal.style.display = 'flex';
            void welcomeModal.offsetWidth;
            welcomeModal.classList.add('is-open');
            welcomeModal.setAttribute('aria-hidden', 'false');
        }
    }, 680);

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
    if (initialMode && ['camera', 'upload'].includes(initialMode)) {
        switchWorkspaceMode(initialMode);
    }

    /* ---------- 3. Result Panel Updating Helper (Identifikasi & Edukasi) ---------- */
    const resEngineName = document.getElementById('res-engine-name');

    // A. Identitas Spesies Utama (Tingkat 1) & Specimen Showcase
    const resSpeciesKicker = document.getElementById('res-species-kicker');
    const resSpeciesName = document.getElementById('res-species-name');
    const resSpeciesCommon = document.getElementById('res-species-common');
    const resSpeciesConfidence = document.getElementById('res-species-confidence');
    const resLowConfBanner = document.getElementById('res-low-conf-banner');
    const resLowConfText = document.getElementById('res-low-conf-text');
    const resCandidatesList = document.getElementById('res-candidates-list');

    // Field Guide Visual Specimen Frame
    const resSpecimenImg = document.getElementById('res-specimen-img');
    const resSpecimenPlaceholder = document.getElementById('res-specimen-placeholder');
    const resSpecimenLensTag = document.getElementById('res-specimen-lens-tag');
    const resSpeciesEditorialDesc = document.getElementById('res-species-editorial-desc');
    const resSpeciesCommonOverlay = document.getElementById('res-species-common-overlay');
    const resSpeciesNameOverlay = document.getElementById('res-species-name-overlay');
    const resConfMeterWrap = document.getElementById('res-conf-meter-wrap');
    const resConfMeterFill = document.getElementById('res-conf-meter-fill');
    const resConfMeterVal = document.getElementById('res-conf-meter-val');
    const resColorHexBadge = document.getElementById('res-color-hex-badge');

    function updateSpecimenVisual(imageSrc, tagText) {
        if (!resSpecimenImg) return;
        if (imageSrc) {
            resSpecimenImg.src = imageSrc;
            resSpecimenImg.style.display = 'block';
            if (resSpecimenPlaceholder) resSpecimenPlaceholder.style.display = 'none';
            if (resSpecimenLensTag && tagText) resSpecimenLensTag.textContent = tagText;
        } else {
            resSpecimenImg.style.display = 'none';
            if (resSpecimenPlaceholder) resSpecimenPlaceholder.style.display = 'flex';
        }
    }

    // C. Status Spesies Berdasarkan Referensi
    const resRefStatusCard = document.getElementById('res-ref-status-card');
    const resRefStatusBadge = document.getElementById('res-ref-status-badge');
    const resRefStatusNote = document.getElementById('res-ref-status-note');
    const resConsistencyNotice = document.getElementById('res-consistency-notice');
    const resBinaryMeta = document.getElementById('res-binary-meta');
    const resBinaryScore = document.getElementById('res-binary-score');
    const resDetailStatusFull = document.getElementById('res-detail-status-full');

    // Tingkat 2 Toggle (Lihat Informasi Lengkap)
    const btnToggleFullInfo = document.getElementById('btn-toggle-full-info');
    const btnToggleFullInfoText = document.getElementById('btn-toggle-full-info-text');
    const wsDetailPanel = document.getElementById('ws-detail-panel');

    if (btnToggleFullInfo && wsDetailPanel) {
        btnToggleFullInfo.addEventListener('click', () => {
            const isExpanded = btnToggleFullInfo.getAttribute('aria-expanded') === 'true';
            const nextState = !isExpanded;
            btnToggleFullInfo.setAttribute('aria-expanded', String(nextState));
            btnToggleFullInfo.classList.toggle('is-open', nextState);
            wsDetailPanel.hidden = !nextState;
            if (btnToggleFullInfoText) {
                btnToggleFullInfoText.textContent = nextState ? 'Sembunyikan Informasi Lengkap' : 'Lihat Informasi Lengkap';
            }
        });
    }

    function formatAreaPct(val) {
        if (val === undefined || val === null || val === '' || isNaN(Number(val)) || Number(val) <= 0) {
            return '';
        }
        return ` (${String(Number(val).toFixed(1)).replace('.', ',')}%)`;
    }

    // B. Informasi Spesies & Morfologi
    const resColorDot1 = document.getElementById('res-color-dot-1');
    const resColorDot2 = document.getElementById('res-color-dot-2');
    const resColorTextPrimary = document.getElementById('res-color-text-primary');
    const resRefCapColor = document.getElementById('res-ref-cap-color');
    const resRefCapShape = document.getElementById('res-ref-cap-shape');
    const resDetSurface = document.getElementById('res-det-surface');
    const resRefCapSurface = document.getElementById('res-ref-cap-surface');
    const resRefStem = document.getElementById('res-ref-stem');
    const resRefHymenium = document.getElementById('res-ref-hymenium');
    const resRefHabitat = document.getElementById('res-ref-habitat');

    // D. Edukasi & Catatan Biologis
    const resSpeciesDesc = document.getElementById('res-species-desc');
    const resSpeciesFactBox = document.getElementById('res-species-fact-box');
    const resSpeciesFactText = document.getElementById('res-species-fact-text');
    const safetyEl = document.getElementById('res-safety-text');

    const CONCISE_SAFETY_TEXT = 'Hasil identifikasi Shroomy bersifat informatif dan edukatif, bukan rekomendasi konsumsi. Jangan mengonsumsi jamur hanya berdasarkan hasil aplikasi.';

    function renderPredictionResult(data) {
        if (resEngineName) {
            resEngineName.textContent = data.model_used || 'MobileNetV2 + SVM RBF';
        }

        if (safetyEl) {
            safetyEl.textContent = CONCISE_SAFETY_TEXT;
        }

        if (btnToggleFullInfo) {
            btnToggleFullInfo.disabled = false;
        }

        const conf = data.species_confidence !== undefined ? Number(data.species_confidence) : Number(data.confidence || 0);
        const threshold = data.confidence_threshold !== undefined ? Number(data.confidence_threshold) : 50.0;
        const isConfident = (data.is_confident !== undefined) ? Boolean(data.is_confident) : (conf >= threshold);
        const isInconclusive = !isConfident || data.status_code === 'inconclusive';
        const mappingVerified = data.mapping_verified !== false;
        const mc = data.model_consistency || {};
        const bp = data.binary_prediction || {};
        const refBinStatus = data.reference_binary_status || mc.reference_binary_status || 'unknown';
        const consistencyStatus = mc.consistency_status || bp.consistency_status || '';
        const isBinaryConsistent = (mc.is_binary_consistent !== undefined)
            ? Boolean(mc.is_binary_consistent)
            : (bp.is_consistent_with_reference !== false);

        // 1. Render Identitas Spesies Utama (Tingkat 1)
        if (resSpeciesKicker) {
            if (!mappingVerified) {
                resSpeciesKicker.textContent = 'Informasi Spesies Belum Terverifikasi';
            } else if (isInconclusive) {
                resSpeciesKicker.textContent = 'Kandidat Visual Terdekat';
            } else {
                resSpeciesKicker.textContent = 'Spesies Teridentifikasi';
            }
        }
        if (resSpeciesName) {
            resSpeciesName.textContent = data.species_name || 'Spesies Belum Teridentifikasi';
        }
        if (resSpeciesCommon) {
            resSpeciesCommon.textContent = data.common_name || 'Nama umum belum tersedia dalam referensi';
        }
        if (resSpeciesCommonOverlay) {
            resSpeciesCommonOverlay.textContent = data.common_name || data.species_name || 'Spesimen Terdeteksi';
        }
        if (resSpeciesNameOverlay) {
            resSpeciesNameOverlay.textContent = data.species_name || 'Klasifikasi Citra';
        }

        // Editorial 1-sentence botanical description
        if (resSpeciesEditorialDesc) {
            if (data.short_description) {
                resSpeciesEditorialDesc.textContent = data.short_description;
                resSpeciesEditorialDesc.style.display = 'block';
            } else {
                resSpeciesEditorialDesc.style.display = 'none';
            }
        }

        // Specimen image auto-sync if not set yet
        if (resSpecimenImg && (!resSpecimenImg.src || resSpecimenImg.style.display === 'none')) {
            if (uploadPreviewImg && uploadPreviewImg.src && uploadPreviewWrap && uploadPreviewWrap.classList.contains('is-visible')) {
                updateSpecimenVisual(uploadPreviewImg.src, 'Citra Unggahan');
            } else if (canvasEl && (canvasEl.classList.contains('is-sim-visible') || currentStream)) {
                try {
                    updateSpecimenVisual(canvasEl.toDataURL('image/jpeg', 0.94), 'Tangkapan Kamera');
                } catch (_) {}
            }
        }
        const confFormatted = String(conf.toFixed(1)).replace('.', ',');
        if (resSpeciesConfidence) {
            if (isInconclusive) {
                resSpeciesConfidence.textContent = `${confFormatted}% · Belum Meyakinkan`;
                resSpeciesConfidence.classList.add('is-low-confidence');
            } else {
                resSpeciesConfidence.textContent = `${confFormatted}% · Keyakinan Visual`;
                resSpeciesConfidence.classList.remove('is-low-confidence');
            }
        }

        if (resConfMeterWrap && resConfMeterFill && resConfMeterVal) {
            resConfMeterWrap.style.display = 'block';
            const confClamped = Math.min(100, Math.max(0, conf));
            resConfMeterFill.style.width = `${confClamped}%`;
            resConfMeterVal.textContent = `${confFormatted}%`;
            if (isInconclusive) {
                resConfMeterFill.classList.add('is-low');
            } else {
                resConfMeterFill.classList.remove('is-low');
            }
        }

        if (resLowConfBanner && resLowConfText) {
            if (!mappingVerified) {
                resLowConfBanner.style.display = 'flex';
                resLowConfText.textContent = 'Data referensi spesies ini belum terverifikasi di basis pengetahuan. Jangan jadikan hasil ini sebagai kepastian identifikasi.';
            } else if (isInconclusive) {
                resLowConfBanner.style.display = 'flex';
                resLowConfText.textContent = 'Tingkat keyakinan visual masih rendah (< 50%). Spesies di atas hanya kandidat terdekat dan belum dapat dipastikan.';
            } else {
                resLowConfBanner.style.display = 'none';
            }
        }

        // 2. Render Kandidat Kemiripan Visual Terdekat (Di dalam Tingkat 2 Detail Informasi)
        if (resCandidatesList) {
            if (data.top_candidates && data.top_candidates.length > 0) {
                let candHtml = '';
                data.top_candidates.slice(0, 3).forEach(cand => {
                    const pct = cand.confidence !== undefined ? cand.confidence : 0;
                    let tagClass = 'tag-neutral';
                    let cleanStatus = 'Referensi';
                    if (cand.status_category === 'deadly') {
                        tagClass = 'tag-deadly';
                        cleanStatus = 'Sangat Beracun';
                    } else if (cand.status_category === 'poisonous') {
                        tagClass = 'tag-poisonous';
                        cleanStatus = 'Referensi: Beracun';
                    } else if (cand.status_category === 'edible') {
                        tagClass = 'tag-edible';
                        cleanStatus = 'Referensi: Pangan';
                    }

                    candHtml += `
                      <div class="candidate-row">
                        <div class="cand-rank-badge">#${cand.rank}</div>
                        <div class="cand-info">
                          <div class="cand-names">
                            <strong class="cand-sci">${cand.species}</strong>
                            <span class="cand-com">${cand.common_name ? `(${cand.common_name})` : ''}</span>
                          </div>
                          <div class="cand-bar-wrap">
                            <div class="cand-bar-fill" style="width: ${Math.min(100, Math.max(3, pct))}%;"></div>
                          </div>
                        </div>
                        <div class="cand-meta">
                          <span class="cand-pct">${pct}%</span>
                          <span class="cand-status-tag ${tagClass}">${cleanStatus}</span>
                        </div>
                      </div>
                    `;
                });
                resCandidatesList.innerHTML = candHtml;
            } else {
                resCandidatesList.innerHTML = '<div class="candidate-row empty-state">Data kandidat spesies belum tersedia</div>';
            }
        }

        // 3. Render Status Spesies Berdasarkan Referensi Ilmiah & Evaluasi Konsistensi Model
        const cat = data.reference_status_category || 'unknown';
        if (resRefStatusCard) {
            resRefStatusCard.classList.remove('is-neutral', 'is-edible', 'is-poisonous', 'is-deadly', 'is-unmapped');
            if (!mappingVerified) {
                resRefStatusCard.classList.add('is-neutral', 'is-unmapped');
            } else if (isInconclusive) {
                resRefStatusCard.classList.add('is-neutral');
            } else if (cat === 'deadly') {
                resRefStatusCard.classList.add('is-deadly');
            } else if (cat === 'poisonous') {
                resRefStatusCard.classList.add('is-poisonous');
            } else if (cat === 'edible') {
                resRefStatusCard.classList.add('is-edible');
            } else {
                resRefStatusCard.classList.add('is-neutral');
            }
        }

        if (resRefStatusBadge) {
            if (!mappingVerified) {
                resRefStatusBadge.textContent = 'Belum Terverifikasi';
            } else if (isInconclusive) {
                resRefStatusBadge.textContent = 'Belum dapat dipastikan';
            } else if (cat === 'deadly') {
                resRefStatusBadge.textContent = 'Referensi: Sangat Beracun';
            } else if (cat === 'poisonous') {
                resRefStatusBadge.textContent = 'Referensi: Beracun';
            } else if (cat === 'edible') {
                resRefStatusBadge.textContent = 'Referensi: Pangan';
            } else {
                resRefStatusBadge.textContent = 'Referensi Ilmiah';
            }
        }

        if (resDetailStatusFull) {
            resDetailStatusFull.textContent = data.reference_status || 'Informasi belum tersedia';
        }

        if (resRefStatusNote) {
            if (!mappingVerified) {
                resRefStatusNote.textContent = 'Informasi status referensi spesies ini belum tersedia dalam basis pengetahuan. Status ini bukan rekomendasi konsumsi.';
            } else if (isInconclusive) {
                resRefStatusNote.textContent = `Status referensi belum dapat dipastikan karena tingkat keyakinan visual masih rendah (${String(conf.toFixed(1)).replace('.', ',')}%). Kandidat terdekat (${data.species_name || '—'}) tercatat dalam literatur sebagai: ${data.reference_status || '—'}. Informasi ini bukan rekomendasi konsumsi.`;
            } else {
                const baseNote = data.reference_status_note || 'Status tercatat dalam literatur mikologi ilmiah.';
                resRefStatusNote.textContent = `${baseNote} Informasi ini merupakan referensi ilmiah spesies, bukan rekomendasi konsumsi.`;
            }
        }

        if (resConsistencyNotice) {
            if (!isBinaryConsistent) {
                resConsistencyNotice.style.display = 'block';
                const binLabel = bp.predicted_class === 'edible' ? 'Pangan' : 'Beracun';
                const refLabel = refBinStatus === 'edible' ? 'Pangan' : 'Beracun';
                resConsistencyNotice.textContent = `Catatan: Klasifikasi referensi biner menunjukkan kecenderungan "${binLabel}", berbeda dengan catatan referensi spesies kandidat ("${refLabel}"). Harap gunakan informasi ini dengan kehati-hatian ekstra.`;
            } else {
                resConsistencyNotice.style.display = 'none';
                resConsistencyNotice.textContent = '';
            }
        }

        if (resBinaryMeta) {
            resBinaryMeta.classList.toggle('is-inconsistent', !isBinaryConsistent);
        }

        if (resBinaryScore && data.binary_prediction) {
            const baseBinScore = `Pangan: ${bp.p_edible}% · Beracun: ${bp.p_poisonous}%`;
            if (consistencyStatus === 'consistent_confident') {
                resBinaryScore.textContent = `${baseBinScore} (Selaras dengan referensi spesies)`;
            } else if (consistencyStatus === 'consistent_low_confidence') {
                resBinaryScore.textContent = `${baseBinScore} (Searah kandidat, namun identifikasi belum meyakinkan)`;
            } else if (!isBinaryConsistent) {
                resBinaryScore.textContent = `${baseBinScore} (Berbeda dengan status referensi spesies)`;
            } else {
                resBinaryScore.textContent = baseBinScore;
            }
        }

        // 4. Render Karakteristik Morfologi & Deteksi Visual
        const detColor = data.detected_cap_color || {};
        if (resColorDot1) {
            resColorDot1.style.background = detColor.primary_hex || data.hex || '#888888';
        }
        if (resColorHexBadge) {
            const hexVal = detColor.primary_hex || data.hex || '';
            if (hexVal) {
                resColorHexBadge.textContent = hexVal.toUpperCase();
                resColorHexBadge.style.display = 'inline-block';
            } else {
                resColorHexBadge.style.display = 'none';
            }
        }
        if (resColorDot2) {
            if (detColor.secondary_hex) {
                resColorDot2.style.display = 'inline-block';
                resColorDot2.style.background = detColor.secondary_hex;
            } else {
                resColorDot2.style.display = 'none';
            }
        }
        if (resColorTextPrimary) {
            if (detColor.primary_name) {
                let txt = `${detColor.primary_name}${formatAreaPct(detColor.primary_area_pct)}`;
                if (detColor.secondary_name) {
                    txt += ` + ${detColor.secondary_name}${formatAreaPct(detColor.secondary_area_pct)}`;
                }
                resColorTextPrimary.textContent = txt;
            } else {
                resColorTextPrimary.textContent = 'Warna tudung belum dapat diidentifikasi';
            }
        }

        const morph = data.morphology || {};
        if (resRefCapColor) {
            resRefCapColor.textContent = morph.cap_color || 'Informasi belum tersedia';
        }
        if (resRefCapShape) {
            resRefCapShape.textContent = morph.cap_shape || 'Informasi belum tersedia';
        }
        if (resDetSurface) {
            resDetSurface.textContent = detColor.surface_name || data.detected_surface_name || 'Belum dianalisis';
        }
        if (resRefCapSurface) {
            resRefCapSurface.textContent = morph.cap_surface || 'Informasi belum tersedia';
        }
        if (resRefStem) {
            resRefStem.textContent = morph.stem_characteristics || 'Informasi belum tersedia';
        }
        if (resRefHymenium) {
            resRefHymenium.textContent = morph.hymenium_type || 'Informasi belum tersedia';
        }
        if (resRefHabitat) {
            resRefHabitat.textContent = data.ecological_habitat || 'Informasi belum tersedia';
        }

        // 5. Render Edukasi & Fakta Biologis Spesies
        if (resSpeciesDesc) {
            resSpeciesDesc.textContent = data.short_description || 'Deskripsi ilmiah spesies belum tersedia dalam referensi.';
        }
        if (resSpeciesFactBox && resSpeciesFactText) {
            if (data.educational_facts) {
                resSpeciesFactBox.style.display = 'block';
                resSpeciesFactText.textContent = data.educational_facts;
            } else {
                resSpeciesFactBox.style.display = 'none';
            }
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
    const btnCameraControl = document.getElementById('btn-camera-control');
    const btnSimCamSafe = document.getElementById('btn-sim-cam-safe');
    const btnSimCamToxic = document.getElementById('btn-sim-cam-toxic');

    if (btnCameraControl && cameraFacingSelect) {
        btnCameraControl.addEventListener('click', () => {
            cameraFacingSelect.value = cameraFacingSelect.value === 'environment' ? 'user' : 'environment';
            if (currentStream) {
                startCameraStream();
            } else {
                cameraFacingSelect.focus();
            }
        });
    }

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
            if (btnCaptureCam) {
                btnCaptureCam.style.display = 'inline-flex';
                btnCaptureCam.disabled = false;
            }
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
        if (btnCaptureCam) {
            btnCaptureCam.style.display = 'none';
            btnCaptureCam.disabled = true;
        }
        if (btnStartCam) btnStartCam.style.display = 'inline-flex';
        if (btnStopCam) btnStopCam.style.display = 'none';
    }

    function evaluateCanvasVision(targetCanvas, onDone) {
        if (!targetCanvas) return;
        targetCanvas.toBlob(async (blob) => {
            if (!blob) {
                if (typeof onDone === 'function') onDone();
                return;
            }
            const formData = new FormData();
            formData.append('image', blob, 'capture_224.jpg');
            try {
                const res = await fetch('/api/predict-vision', {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok || data.error) {
                    alert(`Gagal memproses gambar kamera: ${data.error || ('Status HTTP ' + res.status)}`);
                    return;
                }
                lastDetectedVision = data;
                renderPredictionResult(data);
                updateExtractedImageTable(data);
            } catch (err) {
                alert(`Gangguan koneksi saat mengirim citra kamera: ${err.message || 'Network error'}`);
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
            try {
                updateSpecimenVisual(canvasEl.toDataURL('image/jpeg', 0.94), 'Tangkapan Kamera');
            } catch (_) {}
        }
        if (btnCaptureCam) {
            btnCaptureCam.disabled = true;
            const span = btnCaptureCam.querySelector('span');
            const orig = span ? span.textContent : 'Ambil Foto & Analisis AI';
            if (span) span.textContent = 'Menganalisis Citra AI...';
            evaluateCanvasVision(canvasEl, () => {
                btnCaptureCam.disabled = false;
                if (span) span.textContent = orig;
            });
        } else {
            evaluateCanvasVision(canvasEl);
        }
    }

    function runCameraSimulation(type) {
        if (!canvasEl) return;
        drawSyntheticMushroom(canvasEl, type);
        canvasEl.classList.add('is-sim-visible');
        try {
            updateSpecimenVisual(canvasEl.toDataURL('image/jpeg', 0.94), 'Simulasi Kamera');
        } catch (_) {}
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
    const btnSampleImgSafe = document.getElementById('btn-sample-img-safe');
    const btnSampleImgToxic = document.getElementById('btn-sample-img-toxic');
    let selectedImageBlob = null;

    function updateExtractedImageTable(data) {
        const spName = document.getElementById('img-tbl-species-name');
        const spConf = document.getElementById('img-tbl-species-conf');
        const cName = document.getElementById('img-tbl-color-name');
        const hexVal = document.getElementById('img-tbl-hex-val');
        const sName = document.getElementById('img-tbl-surf-name');
        const rgbVal = document.getElementById('img-tbl-rgb-val');

        const conf = data.species_confidence !== undefined ? Number(data.species_confidence) : Number(data.confidence || 0);
        const threshold = data.confidence_threshold !== undefined ? Number(data.confidence_threshold) : 50.0;
        const isConfident = (data.is_confident !== undefined) ? Boolean(data.is_confident) : (conf >= threshold);
        const isInconclusive = !isConfident || data.status_code === 'inconclusive';

        if (spName) {
            if (data.species_name) {
                const baseSp = `${data.species_name} ${data.common_name ? `(${data.common_name})` : ''}`.trim();
                spName.textContent = isInconclusive ? `${baseSp} [Kandidat Terdekat · Belum Meyakinkan]` : baseSp;
            } else {
                spName.textContent = 'Belum dianalisis';
            }
        }
        if (spConf) {
            if (data.species_confidence !== undefined || data.confidence !== undefined) {
                const confFormatted = String(conf.toFixed(1)).replace('.', ',');
                spConf.textContent = isInconclusive
                    ? `${confFormatted}% · Belum Meyakinkan`
                    : `${confFormatted}% · Keyakinan Visual`;
            } else {
                spConf.textContent = '—';
            }
        }
        if (cName) {
            const dc = data.detected_cap_color || {};
            if (dc.primary_name) {
                let cText = `${dc.primary_name}${formatAreaPct(dc.primary_area_pct)}`;
                if (dc.secondary_name) {
                    cText += ` + ${dc.secondary_name}${formatAreaPct(dc.secondary_area_pct)}`;
                }
                cName.textContent = cText;
            } else {
                cName.textContent = data.detected_color_name || 'Belum dianalisis';
            }
        }
        if (hexVal) {
            hexVal.textContent = data.hex || (data.detected_cap_color && data.detected_cap_color.primary_hex) || '—';
        }
        if (sName) {
            sName.textContent = (data.detected_cap_color && data.detected_cap_color.surface_name) || data.detected_surface_name || 'Belum dianalisis';
        }
        if (rgbVal && data.rgb) {
            rgbVal.textContent = `RGB(${data.rgb.join(', ')})`;
        }
    }

    function handleSelectedFile(file) {
        if (!file) return;

        // Validasi format berkas
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const validExts = ['.jpg', '.jpeg', '.png', '.webp'];
        const name = (file.name || '').toLowerCase();
        const hasValidExt = validExts.some(ext => name.endsWith(ext));
        const hasValidType = validTypes.includes(file.type);

        if (!hasValidType && !hasValidExt) {
            alert('Format berkas tidak didukung. Harap pilih gambar dengan format JPG, PNG, atau WEBP.');
            return;
        }

        // Validasi ukuran file (maksimal 10 MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('Ukuran berkas terlalu besar (' + (file.size / (1024 * 1024)).toFixed(1) + ' MB). Maksimal ukuran berkas adalah 10 MB.');
            return;
        }

        selectedImageBlob = file;

        const reader = new FileReader();
        reader.onload = (e) => {
            if (uploadPreviewImg) uploadPreviewImg.src = e.target.result;
            updateSpecimenVisual(e.target.result, 'Citra Unggahan');
            if (uploadPreviewWrap) uploadPreviewWrap.classList.add('is-visible');
            if (uploadEmptyState) uploadEmptyState.classList.add('is-hidden');
            if (btnAnalyzeUpload) btnAnalyzeUpload.disabled = false;
            runUploadAnalysis();
        };
        reader.readAsDataURL(file);
    }

    async function runUploadAnalysis() {
        if (!selectedImageBlob || !btnAnalyzeUpload) return;
        btnAnalyzeUpload.disabled = true;
        const spanEl = btnAnalyzeUpload.querySelector('span');
        const origText = spanEl ? spanEl.textContent : 'Klasifikasi Gambar AI';
        if (spanEl) spanEl.textContent = 'Memproses Klasifikasi AI...';

        const formData = new FormData();
        formData.append('image', selectedImageBlob, selectedImageBlob.name || 'uploaded_mushroom.jpg');

        try {
            const res = await fetch('/api/predict-vision', {
                method: 'POST',
                body: formData
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || data.error) {
                alert(`Gagal memproses gambar: ${data.error || ('Status HTTP ' + res.status)}`);
                return;
            }
            lastDetectedVision = data;
            renderPredictionResult(data);
            updateExtractedImageTable(data);
        } catch (err) {
            alert(`Gangguan koneksi saat mengirim citra: ${err.message || 'Network error'}`);
        } finally {
            btnAnalyzeUpload.disabled = false;
            if (spanEl) spanEl.textContent = origText;
        }
    }

    function loadSampleImageForUpload(type) {
        if (!uploadRoiCanvas) return;
        drawSyntheticMushroom(uploadRoiCanvas, type);
        const dataUrl = uploadRoiCanvas.toDataURL('image/jpeg', 0.94);
        if (uploadPreviewImg) uploadPreviewImg.src = dataUrl;
        updateSpecimenVisual(dataUrl, 'Sampel Pengujian');
        if (uploadPreviewWrap) uploadPreviewWrap.classList.add('is-visible');
        if (uploadEmptyState) uploadEmptyState.classList.add('is-hidden');
        if (btnAnalyzeUpload) btnAnalyzeUpload.disabled = false;

        fetch(dataUrl)
            .then(res => res.blob())
            .then(blob => {
                selectedImageBlob = blob;
                runUploadAnalysis();
            })
            .catch(() => {
                uploadRoiCanvas.toBlob((blob) => {
                    if (!blob) return;
                    selectedImageBlob = blob;
                    runUploadAnalysis();
                }, 'image/jpeg', 0.94);
            });
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


});


/* ==========================================================================
   SHROOMY BIOLUMINESCENT LIVING PARTICLES & SPORES (EYE-CATCHING EFFECT)
   Inspired by Reference Image 5 & 1 (Floating ethereal nature spores)
   ========================================================================== */
(function initBioluminescentSpores() {
    const targets = document.querySelectorAll('.hero-section, .ws-banner');
    if (!targets.length) return;

    targets.forEach(target => {
        if (target.querySelector('.shroomy-spores-canvas')) return;

        const canvas = document.createElement('canvas');
        canvas.className = 'shroomy-spores-canvas';
        canvas.style.position = 'absolute';
        canvas.style.inset = '0';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '1';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        target.style.position = 'relative';
        target.insertBefore(canvas, target.firstChild);

        const ctx = canvas.getContext('2d');
        let width = canvas.width = target.offsetWidth;
        let height = canvas.height = target.offsetHeight;

        let mouse = { x: -1000, y: -1000, active: false };
        target.addEventListener('mousemove', (e) => {
            const rect = target.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
            mouse.active = true;
        });
        target.addEventListener('mouseleave', () => {
            mouse.active = false;
        });

        const particles = [];
        const count = Math.min(42, Math.max(18, Math.floor((width * height) / 18000)));
        const colors = [
            'rgba(163, 230, 53, ',
            'rgba(134, 239, 172, ',
            'rgba(253, 224, 71, ',
            'rgba(110, 231, 183, '
        ];

        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 2.2 + 1.2,
                colorPrefix: colors[Math.floor(Math.random() * colors.length)],
                alpha: Math.random() * 0.55 + 0.25,
                vx: (Math.random() - 0.5) * 0.35,
                vy: -(Math.random() * 0.45 + 0.2),
                pulseSpeed: Math.random() * 0.02 + 0.01,
                pulseOffset: Math.random() * Math.PI * 2
            });
        }

        let isVisible = true;
        if ('IntersectionObserver' in window) {
            const obs = new IntersectionObserver(([entry]) => {
                isVisible = entry.isIntersecting;
            });
            obs.observe(target);
        }

        let t = 0;
        function render() {
            if (isVisible && width > 0 && height > 0) {
                ctx.clearRect(0, 0, width, height);
                t += 0.015;

                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    p.y += p.vy;
                    p.x += p.vx + Math.sin(t + p.pulseOffset) * 0.3;

                    if (mouse.active) {
                        const dx = p.x - mouse.x;
                        const dy = p.y - mouse.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < 120 && dist > 0) {
                            const force = (120 - dist) / 120;
                            p.x += (dx / dist) * force * 1.5;
                            p.y += (dy / dist) * force * 1.5;
                        }
                    }

                    if (p.y < -10) {
                        p.y = height + 10;
                        p.x = Math.random() * width;
                    }
                    if (p.x < -10) p.x = width + 10;
                    if (p.x > width + 10) p.x = -10;

                    const currentAlpha = p.alpha + Math.sin(t * p.pulseSpeed * 60 + p.pulseOffset) * 0.18;
                    const clampedAlpha = Math.max(0.08, Math.min(0.85, currentAlpha));

                    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3);
                    grad.addColorStop(0, p.colorPrefix + clampedAlpha + ')');
                    grad.addColorStop(0.4, p.colorPrefix + (clampedAlpha * 0.45) + ')');
                    grad.addColorStop(1, p.colorPrefix + '0)');

                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            requestAnimationFrame(render);
        }
        render();

        window.addEventListener('resize', () => {
            width = canvas.width = target.offsetWidth;
            height = canvas.height = target.offsetHeight;
        }, { passive: true });
    });
})();
