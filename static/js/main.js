/**
 * ==========================================================================
 * SHROOMY — Stage 1 Landing Page Interactive Controller
 * Handles sticky navigation, mobile menu, 3D developer flip cards,
 * Stage 2 preview modal, scroll animations, and live /api/info telemetry.
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    /* ---------- 0. Hero Title Typewriter & Live Atmosphere ---------- */
    initCinematicHeroReveal();
    initLiveHeroAtmosphere();

    /* ---------- 1. Sticky Header & Scroll Spy ---------- */
    const siteHeader = document.getElementById('site-header');
    const navLinks = Array.from(document.querySelectorAll('.site-nav .nav-link'));
    const sections = navLinks
        .map(link => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    function handleScroll() {
        if (window.scrollY > 20) {
            siteHeader.classList.add('is-scrolled');
        } else {
            siteHeader.classList.remove('is-scrolled');
        }

        let currentSectionId = '';
        const firstSection = sections[0];

        // When in Hero section (above #about), NO nav link is active
        if (firstSection) {
            const firstRect = firstSection.getBoundingClientRect();
            if (firstRect.top > 240) {
                currentSectionId = '';
            } else {
                // Find which section is currently in the active viewport focal zone
                sections.forEach(sec => {
                    const rect = sec.getBoundingClientRect();
                    if (rect.top <= 250 && rect.bottom > 120) {
                        currentSectionId = '#' + sec.id;
                    }
                });

                // Bottom of page threshold: activate last section (#team)
                if ((window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 60)) {
                    currentSectionId = '#' + sections[sections.length - 1].id;
                }
            }
        }

        navLinks.forEach(link => {
            link.classList.toggle('is-active', link.getAttribute('href') === currentSectionId);
        });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
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
                if (e.target.closest('a')) return;
                e.preventDefault();
                card.classList.toggle('is-flipped');
            }
        });

        const flipBtn = card.querySelector('.dev-action-capsule-btn');
        if (flipBtn) {
            flipBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                card.classList.add('is-flipped');
            });
        }

        const backBtn = card.querySelector('.dev-back-flip-btn');
        if (backBtn) {
            backBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                card.classList.remove('is-flipped');
            });
        }
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
        try {
            sessionStorage.setItem('shroomy_welcome_dismissed', '1');
        } catch (_) {}

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

    // Show Roomie centered welcome popup AFTER hero reveal completes + visual pause (Apple Choreography)
    if (welcomeBackdrop) {
        let hasTriggeredWelcome = false;

        function triggerRoomieWelcome() {
            if (hasTriggeredWelcome) return;
            hasTriggeredWelcome = true;

            // If FAQ panel is already open, do not interrupt
            if (faqPanel && faqPanel.classList.contains('is-open')) return;

            // Smooth scale-up entrance for Roomie
            welcomeBackdrop.classList.remove('is-shrinking');
            welcomeBackdrop.classList.add('is-open');
            welcomeBackdrop.setAttribute('aria-hidden', 'false');

            // Auto-shrink after 8 seconds if no manual interaction
            welcomeTimer = setTimeout(() => {
                shrinkWelcomeToCorner();
            }, 8000);
        }

        // Wait for hero reveal to finish, then pause for visual appreciation (~800ms)
        window.addEventListener('shroomy:hero-reveal-complete', () => {
            setTimeout(triggerRoomieWelcome, 800);
        }, { once: true });

        // Reliable fallback timer guaranteeing Roomie welcome appears after hero animation
        setTimeout(() => {
            if (!hasTriggeredWelcome) triggerRoomieWelcome();
        }, 2600);

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
/* ==========================================================================
   SHROOMY BIOLUMINESCENT LIVING SPORES ENGINE (TAHAP 1: HIGH-EFFICIENCY & APPLE MOTION)
   ========================================================================== */
(function initBioluminescentSpores() {
    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const targets = document.querySelectorAll('.ws-banner');
    if (!targets.length) return;

    targets.forEach(target => {
        if (target.querySelector('.shroomy-spores-canvas')) return;

        const canvas = document.createElement('canvas');
        canvas.className = 'shroomy-spores-canvas';
        target.style.position = 'relative';
        target.insertBefore(canvas, target.firstChild);

        const ctx = canvas.getContext('2d');
        let width = canvas.width = target.offsetWidth;
        let height = canvas.height = target.offsetHeight;

        let mouse = { x: -1000, y: -1000, active: false };
        let isVisible = true;
        let isTabActive = !document.hidden;

        // Throttled mouse tracking for ambient cursor flashlight beam
        let mouseTicking = false;
        target.addEventListener('mousemove', (e) => {
            const rect = target.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
            mouse.active = true;

            if (!mouseTicking) {
                requestAnimationFrame(() => {
                    target.style.setProperty('--hero-mouse-x', `${mouse.x}px`);
                    target.style.setProperty('--hero-mouse-y', `${mouse.y}px`);
                    mouseTicking = false;
                });
                mouseTicking = true;
            }
        }, { passive: true });

        target.addEventListener('mouseleave', () => {
            mouse.active = false;
        }, { passive: true });

        // Pause animation when tab is inactive to preserve CPU / GPU
        document.addEventListener('visibilitychange', () => {
            isTabActive = !document.hidden;
        });

        // Pause animation when target section is scrolled out of viewport
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(([entry]) => {
                isVisible = entry.isIntersecting;
            }, { threshold: 0.05 });
            observer.observe(target);
        }

        const isHeroLeaves = target.classList.contains('hero-section');
        const isMobile = window.innerWidth < 768;

        if (isHeroLeaves) {
            // Subtle, organic floating botanical leaves for Landing Hero
            const leafCount = isMobile ? 10 : 18;
            const leaves = [];
            const leafPalettes = [
                { fill: 'rgba(77, 124, 15, ', vein: 'rgba(236, 252, 203, ' },   // deep moss leaf
                { fill: 'rgba(101, 163, 13, ', vein: 'rgba(247, 254, 231, ' },  // fresh forest green
                { fill: 'rgba(21, 128, 61, ', vein: 'rgba(220, 252, 231, ' },   // emerald botanical
                { fill: 'rgba(132, 204, 22, ', vein: 'rgba(254, 249, 195, ' }   // sunlit lime leaf
            ];

            for (let i = 0; i < leafCount; i++) {
                const pal = leafPalettes[i % leafPalettes.length];
                leaves.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * 9 + 7,
                    palette: pal,
                    alpha: Math.random() * 0.34 + 0.24,
                    vy: Math.random() * 0.34 + 0.16,
                    vxBase: (Math.random() - 0.35) * 0.24,
                    swayAmp: Math.random() * 0.45 + 0.25,
                    swaySpeed: Math.random() * 0.015 + 0.01,
                    angle: Math.random() * Math.PI * 2,
                    spinSpeed: (Math.random() - 0.5) * 0.012,
                    tiltPhase: Math.random() * Math.PI * 2,
                    tiltSpeed: Math.random() * 0.02 + 0.01
                });
            }

            let lt = 0;
            function renderLeaves() {
                if (isVisible && isTabActive && width > 0 && height > 0) {
                    ctx.clearRect(0, 0, width, height);
                    lt += 1;

                    for (let i = 0; i < leaves.length; i++) {
                        const lf = leaves[i];
                        lf.y += lf.vy;
                        lf.x += lf.vxBase + Math.sin(lt * lf.swaySpeed + lf.tiltPhase) * lf.swayAmp;
                        lf.angle += lf.spinSpeed;

                        if (mouse.active) {
                            const dx = lf.x - mouse.x;
                            const dy = lf.y - mouse.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            if (dist < 130 && dist > 0) {
                                const force = (130 - dist) / 130;
                                lf.x += (dx / dist) * force * 1.1;
                                lf.y += (dy / dist) * force * 0.8;
                            }
                        }

                        if (lf.y > height + 24) {
                            lf.y = -20;
                            lf.x = Math.random() * width;
                        }
                        if (lf.x < -24) lf.x = width + 20;
                        if (lf.x > width + 24) lf.x = -20;

                        const tiltScale = 0.55 + 0.45 * Math.abs(Math.cos(lt * lf.tiltSpeed + lf.tiltPhase));

                        ctx.save();
                        ctx.translate(lf.x, lf.y);
                        ctx.rotate(lf.angle);
                        ctx.scale(1, tiltScale);

                        // Draw organic pointed botanical leaf
                        const s = lf.size;
                        ctx.beginPath();
                        ctx.moveTo(-s, 0);
                        ctx.quadraticCurveTo(0, -s * 0.72, s, 0);
                        ctx.quadraticCurveTo(0, s * 0.72, -s, 0);
                        ctx.closePath();
                        ctx.fillStyle = lf.palette.fill + lf.alpha + ')';
                        ctx.fill();

                        // Subtle center vein
                        ctx.beginPath();
                        ctx.moveTo(-s * 0.82, 0);
                        ctx.lineTo(s * 0.85, 0);
                        ctx.strokeStyle = lf.palette.vein + (lf.alpha * 0.75) + ')';
                        ctx.lineWidth = 0.8;
                        ctx.stroke();

                        ctx.restore();
                    }
                }
                requestAnimationFrame(renderLeaves);
            }
            renderLeaves();
        } else {
            // Workspace Banner (.ws-banner): keep original bioluminescent particles untouched
            const particleCount = isMobile ? 18 : 36;
            const particles = [];
            const colors = [
                'rgba(188, 231, 154, ', // living-green
                'rgba(163, 230, 53, ',  // lime-glow
                'rgba(52, 211, 153, ',  // emerald
                'rgba(251, 191, 36, '   // spore-amber
            ];

            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 2.2 + 1.1,
                    colorPrefix: colors[Math.floor(Math.random() * colors.length)],
                    alpha: Math.random() * 0.55 + 0.25,
                    vx: (Math.random() - 0.5) * 0.32,
                    vy: -(Math.random() * 0.42 + 0.18),
                    pulseSpeed: Math.random() * 0.02 + 0.012,
                    pulseOffset: Math.random() * Math.PI * 2
                });
            }

            let t = 0;
            function render() {
                if (isVisible && isTabActive && width > 0 && height > 0) {
                    ctx.clearRect(0, 0, width, height);
                    t += 0.02;

                    for (let i = 0; i < particles.length; i++) {
                        const p = particles[i];
                        p.x += p.vx;
                        p.y += p.vy;

                        // Mouse soft repulsion
                        if (mouse.active) {
                            const dx = p.x - mouse.x;
                            const dy = p.y - mouse.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            if (dist < 110 && dist > 0) {
                                const force = (110 - dist) / 110;
                                p.x += (dx / dist) * force * 1.8;
                                p.y += (dy / dist) * force * 1.8;
                            }
                        }

                        // Wrap around boundaries smoothly
                        if (p.x < -15) p.x = width + 15;
                        if (p.x > width + 15) p.x = -15;
                        if (p.y < -15) p.y = height + 15;
                        if (p.y > height + 15) p.y = -15;

                        const pulse = Math.sin(t * p.pulseSpeed * 60 + p.pulseOffset);
                        const currentAlpha = p.alpha + pulse * 0.16;
                        const clampedAlpha = Math.max(0.08, Math.min(0.85, currentAlpha));

                        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3.2);
                        grad.addColorStop(0, p.colorPrefix + clampedAlpha + ')');
                        grad.addColorStop(0.45, p.colorPrefix + (clampedAlpha * 0.42) + ')');
                        grad.addColorStop(1, p.colorPrefix + '0)');

                        ctx.fillStyle = grad;
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.radius * 3.2, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
                requestAnimationFrame(render);
            }
            render();
        }

        window.addEventListener('resize', () => {
            width = canvas.width = target.offsetWidth;
            height = canvas.height = target.offsetHeight;
        }, { passive: true });
    });
})();


/* ==========================================================================
   CINEMATIC OPENING EXPERIENCE (Apple Product Introduction Choreography)
   1. Live Background & Subtle Drift
   2. Navbar Entrance
   3. Hero Title Staggered Two-Tone Fade-in (Line 1 -> Line 2)
   4. Description Harmonious Rise
   5. Visual Appreciation Pause
   6. Roomie Welcome Popup (Dispatched via 'shroomy:hero-reveal-complete')
   ========================================================================== */
function initCinematicHeroReveal() {
    const heroTitle = document.getElementById('hero-title');
    const heroCopy = document.querySelector('.hero-copy');
    if (!heroTitle) return;

    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let hasRevealed = false;

    function revealHero() {
        if (hasRevealed) return;
        hasRevealed = true;
        heroTitle.classList.add('is-revealed');
        if (heroCopy) heroCopy.classList.add('is-revealed');

        // Allow duration of cinematic typography reveal to finish (~1500ms)
        const revealDuration = prefersReduced ? 50 : 1500;
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('shroomy:hero-reveal-complete'));
        }, revealDuration);
    }

    if (prefersReduced) {
        revealHero();
    } else {
        // Fase 1 & 2: Start title reveal after initial environment settles (260ms)
        setTimeout(revealHero, 260);
    }
}

/* ==========================================================================
   LIVE HERO ATMOSPHERE ENGINE (Subtle Depth & Parallax Drift)
   ========================================================================== */
function initLiveHeroAtmosphere() {
    const liveStage = document.getElementById('hero-live-stage');
    if (!liveStage) return;

    const bgLayer = document.getElementById('hero-live-bg-layer');
    if (!bgLayer) return;

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let isVisible = true;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId = null;

    function onMouseMove(e) {
        if (!isVisible) return;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        // Subtle max displacement of 12px
        targetX = ((e.clientX - centerX) / centerX) * 12;
        targetY = ((e.clientY - centerY) / centerY) * 10;
        if (!rafId) {
            rafId = requestAnimationFrame(updateParallax);
        }
    }

    function updateParallax() {
        // Smooth lerp (linear interpolation)
        currentX += (targetX - currentX) * 0.05;
        currentY += (targetY - currentY) * 0.05;

        bgLayer.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;

        if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
            rafId = requestAnimationFrame(updateParallax);
        } else {
            rafId = null;
        }
    }

    // Only listen on desktop devices with hover support
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        window.addEventListener('mousemove', onMouseMove, { passive: true });
    }

    // Observe visibility to eliminate idle work
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(([entry]) => {
            isVisible = entry.isIntersecting;
            if (!isVisible && rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        }, { threshold: 0.05 

    

});
        observer.observe(liveStage);
    }
}

/* ---------- 9. Continuous Living Forest 2.5D Parallax & Cursor Engine ---------- */
(function initLivingForestEngine() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const forestItems = document.querySelectorAll('.forest-env-item[data-parallax]');
    if (forestItems.length === 0) return;

    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let ticking = false;

    // Track subtle cursor movement with gentle boundary
    window.addEventListener('mousemove', (e) => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        targetMouseX = ((e.clientX - cx) / cx) * 8; // max 8px shift
        targetMouseY = ((e.clientY - cy) / cy) * 6; // max 6px shift
        requestTick();
    }, { passive: true });

    // Update on scroll
    window.addEventListener('scroll', requestTick, { passive: true });

    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateForestParallax);
            ticking = true;
        }
    }

    function updateForestParallax() {
        // Smooth cursor interpolation
        mouseX += (targetMouseX - mouseX) * 0.08;
        mouseY += (targetMouseY - mouseY) * 0.08;

        const winH = window.innerHeight;

        forestItems.forEach(item => {
            const rect = item.parentElement.getBoundingClientRect();
            // Check if section is anywhere near viewport
            if (rect.bottom < -200 || rect.top > winH + 200) return;

            const rate = parseFloat(item.getAttribute('data-parallax')) || 0.05;
            const mid = rect.top + rect.height / 2;
            const distFromCenter = (mid - winH / 2) / winH;
            const parallaxY = distFromCenter * rate * 90; // subtle depth offset

            const anchor = item.getAttribute('data-anchor') || 'center';
            let cursorFactorX = 1;
            let cursorFactorY = 1;

            if (anchor.includes('left')) cursorFactorX = -1;
            if (anchor.includes('top')) cursorFactorY = -1;

            const curX = mouseX * cursorFactorX;
            const curY = mouseY * cursorFactorY;

            item.style.transform = `translate3d(${curX.toFixed(2)}px, ${(parallaxY + curY).toFixed(2)}px, 0)`;
        });

        ticking = false;
    }

    // Initial run
    requestTick();
})();
