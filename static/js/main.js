/**
 * ==========================================================================
 * SHROOMY — Stage 1 Landing Page Interactive Controller
 * Handles sticky navigation, mobile menu, 3D developer flip cards,
 * Stage 2 preview modal, scroll animations, and live /api/info telemetry.
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    /* ---------- 0. Hero Title Typewriter ---------- */
    initHeroTypewriter();

    /* ---------- 1. Sticky Header & Scroll Spy ---------- */
    const siteHeader = document.getElementById('site-header');
    const navLinks = Array.from(document.querySelectorAll('.nav-link'));
    const sections = navLinks
        .map(link => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    function handleScroll() {
        if (window.scrollY > 16) {
            siteHeader.classList.add('is-scrolled');
        } else {
            siteHeader.classList.remove('is-scrolled');
        }

        const scrollPos = window.scrollY + 140;
        let currentSectionId = '';

        sections.forEach(sec => {
            if (scrollPos >= sec.offsetTop) {
                currentSectionId = '#' + sec.id;
            }
        });

        navLinks.forEach(link => {
            link.classList.toggle('is-active', link.getAttribute('href') === currentSectionId);
        });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    /* ---------- 2. Mobile Navigation Toggle ---------- */
    const menuToggle = document.getElementById('menu-toggle');
    const siteNav = document.querySelector('.site-nav');

    if (menuToggle && siteNav) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = siteNav.classList.toggle('is-open');
            menuToggle.setAttribute('aria-expanded', String(isOpen));
        });

        siteNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                siteNav.classList.remove('is-open');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });

        document.addEventListener('click', (e) => {
            if (siteNav.classList.contains('is-open') && !siteNav.contains(e.target) && !menuToggle.contains(e.target)) {
                siteNav.classList.remove('is-open');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    /* ---------- 3. Modal Helper (If Triggered Explicitly) ---------- */
    const modal = document.getElementById('stage2-modal');
    const btnCloseModal = document.getElementById('modal-close-btn');
    const btnUnderstand = document.getElementById('btn-modal-understand');

    function closeModal() {
        if (!modal) return;
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    if (btnUnderstand) btnUnderstand.addEventListener('click', closeModal);

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) {
            closeModal();
        }
    });

    /* ---------- 4. Developer 3D Flip Cards & Interactive Step Cards ---------- */
    const flipCards = document.querySelectorAll('.dev-flip-card');

    flipCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('a')) return;
            card.classList.toggle('is-flipped');
        });

        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.classList.toggle('is-flipped');
            }
        });
    });

    const stepCards = document.querySelectorAll('.step-card');

    stepCards.forEach(card => {
        card.addEventListener('click', () => {
            const wasActive = card.classList.contains('is-active');
            stepCards.forEach(c => c.classList.remove('is-active'));
            if (!wasActive) {
                card.classList.add('is-active');
            }
        });

        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    });

    /* ---------- 5. Interactive Platform Capabilities Visualizer ---------- */
    const shroomSvg = document.getElementById('shroom-3d-svg');
    const shroomStage = document.getElementById('shroom-stage');
    const capPath = document.getElementById('shroom-cap-path');
    const capClipPath = document.getElementById('shroom-cap-clip-path');
    const capStopLight = document.getElementById('cap-stop-light');
    const capStopMain = document.getElementById('cap-stop-main');
    const capStopDark = document.getElementById('cap-stop-dark');

    const rgbReadout = document.getElementById('rgb-live-readout');
    const stageColorLabel = document.getElementById('stage-color-label');
    const stageShapeShort = document.getElementById('stage-shape-short');
    const shapeActiveName = document.getElementById('shape-active-name');
    const stageZoneBadge = document.getElementById('stage-zone-badge');

    const faceFriendly = document.getElementById('face-friendly');
    const faceFierce = document.getElementById('face-fierce');
    const moodBtns = document.querySelectorAll('.mood-btn');
    const shapeBtns = document.querySelectorAll('.shape-btn');
    const colorSwatches = document.querySelectorAll('.color-swatch-item');
    const morphologyGroups = document.querySelectorAll('.morphology-group');

    // 6 Cap Shape SVG paths (matching UCI cap-shape categories)
    const CAP_SHAPES = {
        convex: 'M 42 152 C 40 50, 280 50, 278 152 C 278 174, 230 180, 160 180 C 90 180, 42 174, 42 152 Z',
        bell: 'M 48 164 C 66 135, 92 42, 160 42 C 228 42, 254 135, 272 164 C 280 176, 228 182, 160 182 C 92 182, 40 176, 48 164 Z',
        conical: 'M 40 166 L 152 38 C 157 32, 163 32, 168 38 L 280 166 C 286 174, 230 180, 160 180 C 90 180, 34 174, 40 166 Z',
        flat: 'M 32 136 C 32 108, 288 108, 288 136 C 288 166, 240 176, 160 176 C 80 176, 32 166, 32 136 Z',
        knobbed: 'M 42 158 C 42 118, 95 112, 114 72 C 125 44, 195 44, 206 72 C 225 112, 278 118, 278 158 C 278 176, 230 180, 160 180 C 90 180, 42 176, 42 158 Z',
        sunken: 'M 38 122 C 38 78, 108 134, 160 134 C 212 134, 282 78, 282 122 C 282 168, 228 178, 160 178 C 92 178, 38 168, 38 122 Z'
    };

    const ZONE_LABELS = {
        cap: 'Zona Aktif: Tudung (Cap & Bruises)',
        gills: 'Zona Aktif: Insang (Gills)',
        stalk: 'Zona Aktif: Batang (Stalk)',
        ring: 'Zona Aktif: Selubung & Cincin (Ring)',
        ecology: 'Zona Aktif: Ekologi & Sensori'
    };

    function triggerShroomPop() {
        if (!shroomSvg) return;
        shroomSvg.classList.remove('is-popping');
        void shroomSvg.offsetWidth;
        shroomSvg.classList.add('is-popping');
    }

    function setMood(mood) {
        moodBtns.forEach(btn => {
            btn.classList.toggle('is-active', btn.dataset.mood === mood);
        });
        if (faceFriendly && faceFierce) {
            if (mood === 'fierce') {
                faceFriendly.style.display = 'none';
                faceFierce.style.display = 'block';
            } else {
                faceFriendly.style.display = 'block';
                faceFierce.style.display = 'none';
            }
        }
    }

    moodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setMood(btn.dataset.mood);
            triggerShroomPop();
        });
    });

    shapeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const shapeKey = btn.dataset.shape;
            const pathData = CAP_SHAPES[shapeKey];
            if (!pathData) return;

            shapeBtns.forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');

            if (capPath) capPath.setAttribute('d', pathData);
            if (capClipPath) capClipPath.setAttribute('d', pathData);
            if (shapeActiveName && btn.dataset.shapeLabel) {
                shapeActiveName.textContent = btn.dataset.shapeLabel;
            }
            if (stageShapeShort) {
                const spanEl = btn.querySelector('span');
                if (spanEl) stageShapeShort.textContent = spanEl.textContent;
            }

            triggerShroomPop();
        });
    });

    colorSwatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            colorSwatches.forEach(s => s.classList.remove('is-active'));
            swatch.classList.add('is-active');

            const hex = swatch.dataset.hex;
            const light = swatch.dataset.light;
            const dark = swatch.dataset.dark;
            const rgb = swatch.dataset.rgb;
            const name = swatch.dataset.colorName;
            const mood = swatch.dataset.mood;

            if (capStopLight && light) capStopLight.setAttribute('stop-color', light);
            if (capStopMain && hex) capStopMain.setAttribute('stop-color', hex);
            if (capStopDark && dark) capStopDark.setAttribute('stop-color', dark);
            if (capPath && dark) capPath.setAttribute('stroke', dark);

            // Sync mini shape icons with chosen cap color
            shapeBtns.forEach(b => {
                b.style.color = hex || '#c32828';
            });

            if (rgbReadout && rgb) rgbReadout.textContent = rgb;
            if (stageColorLabel && name) stageColorLabel.textContent = name;
            if (mood) setMood(mood);

            triggerShroomPop();
        });
    });

    const zonePanels = document.querySelectorAll('.zone-panel-content');

    morphologyGroups.forEach(group => {
        group.addEventListener('click', () => {
            const zone = group.dataset.zone;
            morphologyGroups.forEach(g => {
                g.classList.remove('is-selected');
                g.setAttribute('aria-selected', 'false');
            });
            group.classList.add('is-selected');
            group.setAttribute('aria-selected', 'true');

            zonePanels.forEach(panel => {
                panel.classList.toggle('is-visible', panel.dataset.zonePanel === zone);
            });

            if (shroomStage && zone) {
                shroomStage.setAttribute('data-active-zone', zone);
            }
            if (stageZoneBadge && ZONE_LABELS[zone]) {
                stageZoneBadge.innerHTML = `<span class="stage-pulse"></span>${ZONE_LABELS[zone]}`;
            }
            triggerShroomPop();
        });

        group.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                group.click();
            }
        });
    });

    if (shroomSvg) {
        shroomSvg.addEventListener('click', () => {
            const isFierce = faceFierce && faceFierce.style.display === 'block';
            setMood(isFierce ? 'friendly' : 'fierce');
            triggerShroomPop();
        });
    }

    /* ---------- 6. Choreographed Scroll Pop-Up Animations ---------- */
    const staggerGroups = [
        '.about-grid .about-card',
        '.steps-timeline .step-card',
        '.ai-pipeline-diagram .pipeline-step-card',
        '.features-grid .feature-benefit-card',
        '.benchmark-cards-grid .benchmark-card',
        '.workspace-models-grid .ws-model-card',
        '.exploration-columns .exp-col',
        '.team-grid .dev-card-wrapper',
        '.security-content-grid .security-point'
    ];

    staggerGroups.forEach(selector => {
        document.querySelectorAll(selector).forEach((el, idx) => {
            el.style.setProperty('--stagger', String(idx));
        });
    });

    const revealTargets = document.querySelectorAll(
        '.section-header, .about-card, .step-card, .pipeline-step-card, .ai-transparency-card, .feature-benefit-card, .benchmark-card, .ws-model-card, .exploration-sidebar, .exp-col, .security-box, .security-point, .dev-card-wrapper'
    );

    if ('IntersectionObserver' in window) {
        revealTargets.forEach(el => el.classList.add('reveal-on-scroll'));

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -36px 0px' });

        revealTargets.forEach(el => observer.observe(el));

        // Scroll-triggered botanical background decorations (landing page sections #about -> #team)
        const botanicalTargets = document.querySelectorAll('.bg-botanical-curve, .bg-decor-item');
        if (botanicalTargets.length > 0) {
            const bgDecorObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-decor-visible');
                        bgDecorObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' });

            botanicalTargets.forEach(el => bgDecorObserver.observe(el));
        }
    } else {
        revealTargets.forEach(el => el.classList.add('is-visible'));
        document.querySelectorAll('.has-botanical-bg, .bg-botanical-curve, .bg-decor-item').forEach(el => el.classList.add('is-decor-visible'));
    }

    /* ---------- 7. Live Model Telemetry Check (/api/info) ---------- */
    async function syncBackendModelInfo() {
        try {
            const res = await fetch('/api/info');
            if (!res.ok) return;
            const data = await res.json();

            const nameEl = document.getElementById('stat-model-name');
            if (nameEl && data.model_name) {
                nameEl.textContent = `Akurasi ${data.model_name}`;
            }

            if (Array.isArray(data.summary) && data.summary.length > 0) {
                const best = data.summary[0];
                const accEl = document.getElementById('stat-model-accuracy');
                const fnEl = document.getElementById('stat-false-negatives');

                if (accEl && best.Accuracy !== undefined) {
                    const num = parseFloat(best.Accuracy);
                    if (!isNaN(num)) {
                        accEl.textContent = `${Math.round(num * 100)}%`;
                    }
                }
                if (fnEl && best['False Negatives'] !== undefined) {
                    fnEl.textContent = String(best['False Negatives']);
                }
            }
        } catch (_) {
            /* Fallback ke nilai statis jika offline */
        }
    }

    syncBackendModelInfo();

    /* ---------- 8. Smooth Portal Launch Animation to /workspace ---------- */
    const workspaceLinks = document.querySelectorAll('a[href*="/workspace"]');
    workspaceLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            e.preventDefault();
            const targetUrl = link.getAttribute('href');
            try {
                sessionStorage.setItem('shroomy_welcome_roomie', '1');
            } catch (_) {}
            document.body.classList.add('is-launching-workspace');
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 340);
        });
    });

    /* ---------- 9. Roomie Centered Welcome -> Dock Bottom-Right -> Tanya Roomie FAQ ---------- */
    const welcomeBackdrop = document.getElementById('roomie-landing-welcome-backdrop');
    const welcomeCard = document.getElementById('roomie-landing-welcome-card');
    const welcomeDismissBtn = document.getElementById('roomie-welcome-dismiss');
    const welcomeMinimizeBtn = document.getElementById('roomie-welcome-minimize');
    const welcomeOpenChatBtn = document.getElementById('roomie-welcome-open-chat');

    const faqPanel = document.getElementById('roomie-faq-panel');
    const faqLauncher = document.getElementById('roomie-faq-launcher');
    const faqCloseBtn = document.getElementById('roomie-faq-close');
    const faqResetBtn = document.getElementById('roomie-faq-reset');
    const chatMessages = document.getElementById('roomie-chat-messages');
    const chatForm = document.getElementById('roomie-chat-form');
    const chatInput = document.getElementById('roomie-chat-input');
    const quickChips = document.querySelectorAll('.roomie-chip');

    let welcomeTimer = null;

    function shrinkWelcomeToCorner() {
        // Dispatch event for typewriter title animation
        window.dispatchEvent(new CustomEvent('shroomy:welcome-dismissed'));
        if (!welcomeBackdrop || !welcomeBackdrop.classList.contains('is-open')) return;
        if (welcomeTimer) {
            clearTimeout(welcomeTimer);
            welcomeTimer = null;
        }
        welcomeBackdrop.classList.remove('is-open');
        welcomeBackdrop.classList.add('is-shrinking');
        welcomeBackdrop.setAttribute('aria-hidden', 'true');

        setTimeout(() => {
            if (faqLauncher) {
                faqLauncher.classList.remove('is-catching');
                void faqLauncher.offsetWidth;
                faqLauncher.classList.add('is-catching');
            }
        }, 280);
    }

    function openFaqPanel() {
        if (!faqPanel) return;
        shrinkWelcomeToCorner();
        faqPanel.classList.add('is-open');
        faqPanel.setAttribute('aria-hidden', 'false');
        if (faqLauncher) faqLauncher.setAttribute('aria-expanded', 'true');
        setTimeout(() => {
            if (chatInput) chatInput.focus();
        }, 180);
    }

    function closeFaqPanel() {
        if (!faqPanel) return;
        faqPanel.classList.remove('is-open');
        faqPanel.setAttribute('aria-hidden', 'true');
        if (faqLauncher) faqLauncher.setAttribute('aria-expanded', 'false');
    }

    // Show Roomie centered welcome popup on first load, then shrink to bottom-right corner
    if (welcomeBackdrop) {
        setTimeout(() => {
            if (faqPanel && faqPanel.classList.contains('is-open')) return;
            welcomeBackdrop.classList.remove('is-shrinking');
            welcomeBackdrop.classList.add('is-open');
            welcomeBackdrop.setAttribute('aria-hidden', 'false');

            welcomeTimer = setTimeout(() => {
                shrinkWelcomeToCorner();
            }, 6000);
        }, 500);

        welcomeBackdrop.addEventListener('click', (e) => {
            if (e.target === welcomeBackdrop) {
                shrinkWelcomeToCorner();
            }
        });
    }

    if (welcomeDismissBtn) welcomeDismissBtn.addEventListener('click', shrinkWelcomeToCorner);
    if (welcomeMinimizeBtn) welcomeMinimizeBtn.addEventListener('click', shrinkWelcomeToCorner);
    if (welcomeOpenChatBtn) welcomeOpenChatBtn.addEventListener('click', openFaqPanel);

    if (faqLauncher) {
        faqLauncher.addEventListener('click', () => {
            if (faqPanel && faqPanel.classList.contains('is-open')) {
                closeFaqPanel();
            } else {
                openFaqPanel();
            }
        });
    }

    if (faqCloseBtn) faqCloseBtn.addEventListener('click', closeFaqPanel);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (faqPanel && faqPanel.classList.contains('is-open')) {
                closeFaqPanel();
            } else if (welcomeBackdrop && welcomeBackdrop.classList.contains('is-open')) {
                shrinkWelcomeToCorner();
            }
        }
    });

    // Knowledge Base & Out-of-Scope Fallback Template for Tanya Roomie
    const ROOMIE_INITIAL_GREETING =
        'Halo! Aku <strong>Roomie</strong>, asisten FAQ 24/7 di Shroomy.<br><br>' +
        'Kamu dapat menanyakan hal-hal umum seputar:<br>' +
        '• <strong>Model Deep Learning</strong> (CNN MobileNetV2 224×224 px)<br>' +
        '• <strong>Sains Mikologi &amp; Morfologi</strong> (Anatomi jamur, warna tudung, keamanan konsumsi)<br>' +
        '• <strong>Panduan Workspace Shroomy</strong> (2 mode: Scan Kamera &amp; Input Gambar, serta profil tim IPB)';

    const ROOMIE_FALLBACK_TEMPLATE =
        'Maaf, pertanyaan tersebut berada <strong>di luar batas kemampuan Roomie</strong>.<br>' +
        '<div class="roomie-msg-fallback-box">' +
        '<strong>Batas Topik Jawaban Roomie:</strong><br>' +
        'Saat ini Roomie hanya diprogram untuk menjawab pertanyaan umum seputar:<br>' +
        '1. <strong>Model Deep Learning</strong> (CNN MobileNetV2, preprocessing 224×224 px &amp; safety gate 75%)<br>' +
        '2. <strong>Sains Mikologi &amp; Jamur</strong> (Anatomi fisik, keamanan konsumsi, warna tudung)<br>' +
        '3. <strong>Website Shroomy</strong> (Cara kerja 2 mode Workspace &amp; tim pengembang IPB)<br><br>' +
        'Silakan pilih topik pertanyaan populer di bawah atau ajukan pertanyaan terkait ketiga topik tersebut.' +
        '</div>';

    const ROOMIE_FAQ_KNOWLEDGE = [
        {
            keywords: ['halo', 'hai', 'hi', 'pagi', 'siang', 'sore', 'malam', 'assalamualaikum', 'roomie', 'siapa kamu', 'perkenalkan'],
            answer:
                'Halo! Aku <strong>Roomie</strong>, maskot sekaligus asisten tanya jawab di website <strong>Shroomy</strong>.<br><br>' +
                'Aku bisa membantumu memahami <strong>model Deep Learning</strong> yang dipakai (CNN MobileNetV2), <strong>ciri visual jamur</strong>, serta <strong>panduan menggunakan 2 mode Workspace</strong>.'
        },
        {
            keywords: ['apa itu shroomy', 'tentang shroomy', 'website ini', 'aplikasi apa', 'fungsi shroomy', 'kegunaan', 'tujuan'],
            answer:
                '<strong>Shroomy (Identifikasi Jamur Terpadu)</strong> adalah platform edukasi dan analisis mikologi berbasis <strong>Deep Learning Computer Vision</strong> untuk mengevaluasi citra jamur liar secara praktis dan terpadu.<br><br>' +
                'Sistem mengandalkan arsitektur <strong>CNN MobileNetV2</strong> yang memproses citra 224×224 piksel secara otomatis tanpa perlu pengisian formulir manual yang rumit.'
        },
        {
            keywords: ['model', 'machine learning', 'ml', 'algoritma', 'akurasi', 'presisi', 'svm', 'support vector', 'random forest', 'cnn', 'mobilenet', 'mobilenetv2', 'roc', 'f1'],
            answer:
                'Shroomy menggunakan <strong>MobileNetV2 pretrained ImageNet</strong> sebagai ekstraktor fitur visual (1.280 dimensi) yang dipadukan dengan classifier <strong>SVM RBF Multikelas (39 spesies)</strong> dan <strong>SVM RBF Biner (2 kelas)</strong> pada resolusi input <strong>224×224 piksel RGB</strong>.<br><br>' +
                'Sistem dilengkapi <strong>Ambang Keyakinan Visual 50%</strong> serta pemeriksaan konsistensi antar-model untuk mencegah kepastian semu.'
        },
        {
            keywords: ['workspace', '3 mode', 'tiga mode', '2 mode', 'dua mode', 'cara pakai', 'cara kerja', 'cara menggunakan', 'kamera', 'upload', 'gambar', 'tabel', 'scan', 'prediksi'],
            answer:
                'Di halaman <strong>Workspace Identifikasi</strong> (tombol <em>Mulai Eksplorasi</em>), tersedia <strong>2 mode kerja terpadu</strong>:<br><br>' +
                '• <strong>Mode 1 — Scan Kamera Realtime</strong>: Memindai spesimen secara langsung menggunakan kamera dengan area fokus 224×224 piksel, dianalisis instan oleh <strong>CNN MobileNetV2</strong>.<br>' +
                '• <strong>Mode 2 — Input Gambar</strong>: Mengunggah berkas foto jamur dari perangkat (JPG, PNG, WEBP) untuk dievaluasi oleh <strong>CNN MobileNetV2</strong> sekaligus ekstraksi spektrum warna tudung berbasis RGB.'
        },
        {
            keywords: ['false negative', '0 false', 'zero false', 'keamanan', 'etika', 'when in doubt', 'aman dikonsumsi', 'makan'],
            answer:
                '<strong>False Negative</strong> adalah kondisi fatal ketika jamur yang sebenarnya <strong>beracun</strong> salah diprediksi sebagai <strong>aman</strong>.<br><br>' +
                'Untuk memitigasi bahaya ini, Shroomy menerapkan <strong>ambang batas keyakinan (confidence threshold) ≥ 75%</strong>. Jika skor keyakinan di bawah 75%, sistem secara otomatis menetapkan status <em>Inconclusive</em> (Tidak Pasti). Sesuai kaidah mikologi <em>"When in Doubt, Never Ingest"</em>, hasil identifikasi ditujukan untuk riset dan edukasi—verifikasi ahli mikologi tetap mutlak sebelum menyentuh jamur liar.'
        },
        {
            keywords: ['ciri', 'morfologi', '20', 'dua puluh', 'parameter', 'beracun', 'aman', 'edible', 'poisonous', 'bau', 'aroma', 'odor', 'spora', 'memar', 'insang', 'tudung', 'cincin', 'amanita'],
            answer:
                'Dalam sains mikologi, jamur dievaluasi melalui 5 zona anatomi utama: <strong>Tudung &amp; Memar</strong>, <strong>Insang</strong>, <strong>Batang</strong>, <strong>Cincin &amp; Selubung</strong>, serta <strong>Ekologi &amp; Spora</strong>.<br><br>' +
                'Di Shroomy, ciri visual seperti warna tudung dan tekstur permukaan dianalisis secara otomatis dari piksel citra oleh <strong>CNN MobileNetV2</strong> tanpa perlu input manual.'
        },
        {
            keywords: ['warna', 'rgb', 'roi', 'spektroskopi', 'euclidean', 'pillow', 'preprocessing', 'one-hot', 'normalisasi', 'standardscaler', 'dataset', 'uci', '8124', '8.124'],
            answer:
                'Pada tahapan <strong>Preprocessing Citra Shroomy</strong>:<br><br>' +
                '• <strong>Standarisasi Ukuran</strong>: Citra diubah ukurannya langsung (*direct resize*) ke <strong>224×224 piksel</strong> kanal RGB.<br>' +
                '• <strong>Normalisasi ImageNet</strong>: Nilai piksel dinormalisasi dengan bobot standar computer vision (mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]).<br>' +
                '• <strong>Deteksi Warna (ROI)</strong>: Area tengah spesimen dianalisis untuk mencocokkan spektrum warna ke 10 palet botani acuan.'
        },
        {
            keywords: ['tim', 'pengembang', 'developer', 'pembuat', 'siapa yang buat', 'ipb', 'kampus', 'mahasiswa', 'faza', 'nailah', 'fachry', 'kelompok'],
            answer:
                'Website <strong>Shroomy</strong> dikembangkan oleh <strong>Kelompok 4 PJBL Machine Learning 2026</strong>, Mahasiswa <strong>Teknologi Rekayasa Komputer IPB</strong>:<br><br>' +
                '1. <strong>Mohammad Faza Munsya\'ari</strong> (NIM J0404241169) — <em>Machine Learning Engineer</em> (CNN MobileNetV2 &amp; Model Evaluation)<br>' +
                '2. <strong>Nailah Syarifah Sagala</strong> (NIM J0404241082) — <em>Data Engineer &amp; Preprocessing</em> (Standardized Image Pipeline &amp; Normalization)<br>' +
                '3. <strong>Fachryreza Andaris Albar</strong> (NIM J0404241004) — <em>Full-Stack Web Architect</em> (Flask REST API, UI/UX &amp; System Integration)'
        }
    ];

    function findRoomieAnswer(userText) {
        const normalized = userText.toLowerCase().trim();
        let bestMatch = null;
        let bestScore = 0;

        ROOMIE_FAQ_KNOWLEDGE.forEach(item => {
            let score = 0;
            item.keywords.forEach(kw => {
                if (normalized.includes(kw)) {
                    score += kw.length >= 5 ? 2 : 1;
                }
            });
            if (score > bestScore) {
                bestScore = score;
                bestMatch = item;
            }
        });

        if (bestMatch && bestScore > 0) {
            return bestMatch.answer;
        }
        return ROOMIE_FALLBACK_TEMPLATE;
    }

    function appendChatMessage(role, htmlContent) {
        if (!chatMessages) return;
        const row = document.createElement('div');
        row.className = `roomie-msg-row ${role === 'user' ? 'is-user' : 'is-bot'}`;

        const bubble = document.createElement('div');
        bubble.className = 'roomie-msg-bubble';
        if (role === 'user') {
            bubble.textContent = htmlContent;
        } else {
            bubble.innerHTML = htmlContent;
        }

        row.appendChild(bubble);
        chatMessages.appendChild(row);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function askRoomieQuestion(questionText) {
        const clean = (questionText || '').trim();
        if (!clean || !chatMessages) return;

        openFaqPanel();
        appendChatMessage('user', clean);

        // Show typing indicator bubble
        const typingRow = document.createElement('div');
        typingRow.className = 'roomie-msg-row is-bot';
        typingRow.innerHTML =
            '<div class="roomie-msg-bubble"><div class="roomie-typing-dots"><span></span><span></span><span></span></div></div>';
        chatMessages.appendChild(typingRow);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        setTimeout(() => {
            if (typingRow.parentNode) typingRow.parentNode.removeChild(typingRow);
            const replyHtml = findRoomieAnswer(clean);
            appendChatMessage('bot', replyHtml);
        }, 420);
    }

    // Initialize greeting message in chat window
    if (chatMessages) {
        appendChatMessage('bot', ROOMIE_INITIAL_GREETING);
    }

    if (faqResetBtn && chatMessages) {
        faqResetBtn.addEventListener('click', () => {
            chatMessages.innerHTML = '';
            appendChatMessage('bot', ROOMIE_INITIAL_GREETING);
        });
    }

    quickChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const q = chip.getAttribute('data-question');
            if (q) askRoomieQuestion(q);
        });
    });

    if (chatForm && chatInput) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const val = chatInput.value.trim();
            if (!val) return;
            chatInput.value = '';
            askRoomieQuestion(val);
        });
    }
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


/* ==========================================================================
   HERO TITLE TYPEWRITER ANIMATION (Triggered after Roomie welcome popup)
   ========================================================================== */
function initHeroTypewriter() {
    const heroTitle = document.querySelector('.hero-title');
    if (!heroTitle) return;

    const part1 = "Inteligensi Mikologi Presisi untuk ";
    const part2 = "Identifikasi Jamur Liar";

    let hasStarted = false;

    // Set initial state: waiting for Roomie popup to close
    heroTitle.classList.add('is-typing-ready');
    heroTitle.innerHTML = '<span class="typewriter-text"></span><span class="typewriter-cursor">|</span>';

    function startTyping() {
        if (hasStarted) return;
        hasStarted = true;

        const textSpan = heroTitle.querySelector('.typewriter-text');
        const cursorSpan = heroTitle.querySelector('.typewriter-cursor');
        if (!textSpan) return;

        let i = 0;
        let j = 0;
        const speed1 = 36; // ms per char
        const speed2 = 42; // ms per char

        function typePart1() {
            if (i < part1.length) {
                textSpan.textContent += part1.charAt(i);
                i++;
                setTimeout(typePart1, speed1);
            } else {
                const highlightSpan = document.createElement('span');
                highlightSpan.className = 'highlight';
                textSpan.appendChild(highlightSpan);
                typePart2(highlightSpan);
            }
        }

        function typePart2(targetSpan) {
            if (j < part2.length) {
                targetSpan.textContent += part2.charAt(j);
                j++;
                setTimeout(() => typePart2(targetSpan), speed2);
            } else {
                heroTitle.classList.add('is-typing-done');
                setTimeout(() => {
                    if (cursorSpan) {
                        cursorSpan.classList.add('is-finished');
                    }
                }, 2500);
            }
        }

        setTimeout(typePart1, 300);
    }

    // Listen for Roomie welcome popup dismissal
    window.addEventListener('shroomy:welcome-dismissed', () => {
        setTimeout(startTyping, 200);
    }, { once: true });

    // Fallback: If popup is dismissed or not present, start typing safely
    const welcomeBackdrop = document.getElementById('roomie-landing-welcome-backdrop');
    if (!welcomeBackdrop) {
        setTimeout(startTyping, 400);
    } else {
        // Safety timeout so title is never empty if user takes no action
        setTimeout(() => {
            if (!hasStarted) startTyping();
        }, 6800);
    }
}
