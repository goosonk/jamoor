/* ---------- Kamus kode atribut ---------- */
    const codeDictionary = {
        'odor': {
            'a': 'almond, seperti almond', 'l': 'anise, seperti adas manis',
            'c': 'creosote, seperti ter batubara', 'y': 'fishy, amis',
            'f': 'foul, busuk', 'm': 'musty, apek',
            'n': 'none, tidak berbau', 'p': 'pungent, tajam menyengat',
            's': 'spicy, pedas rempah'
        },
        'bruises': { 't': 'bruises, berubah warna bila memar', 'f': 'no, tidak berubah warna' },
        'cap-shape': {
            'b': 'bell, lonceng', 'c': 'conical, kerucut', 'x': 'convex, cembung',
            'f': 'flat, datar', 'k': 'knobbed, berbenjol', 's': 'sunken, cekung'
        },
        'cap-surface': {
            'f': 'fibrous, berserat', 'g': 'grooves, beralur',
            'y': 'scaly, bersisik', 's': 'smooth, halus'
        },
        'cap-color': {
            'n': 'brown, cokelat', 'b': 'buff, kuning pucat', 'c': 'cinnamon, kayu manis',
            'g': 'gray, abu-abu', 'r': 'green, hijau', 'p': 'pink, merah muda',
            'u': 'purple, ungu', 'e': 'red, merah', 'w': 'white, putih', 'y': 'yellow, kuning'
        },
        'gill-attachment': {
            'a': 'attached, menempel', 'd': 'descending, menurun',
            'f': 'free, bebas', 'n': 'notched, berlekuk'
        },
        'gill-spacing': {
            'c': 'close, rapat', 'w': 'crowded, sangat padat', 'd': 'distant, renggang'
        },
        'gill-size': { 'b': 'broad, lebar', 'n': 'narrow, sempit' },
        'gill-color': {
            'k': 'black, hitam', 'n': 'brown, cokelat', 'b': 'buff, kuning pucat',
            'h': 'chocolate, cokelat tua', 'g': 'gray, abu-abu', 'r': 'green, hijau',
            'o': 'orange, oranye', 'p': 'pink, merah muda', 'u': 'purple, ungu',
            'e': 'red, merah', 'w': 'white, putih', 'y': 'yellow, kuning'
        },
        'stalk-shape': { 'e': 'enlarging, membesar ke bawah', 't': 'tapering, mengecil ke bawah' },
        'stalk-surface-above-ring': {
            'f': 'fibrous, berserat', 'y': 'scaly, bersisik',
            'k': 'silky, halus mengilap', 's': 'smooth, licin'
        },
        'stalk-surface-below-ring': {
            'f': 'fibrous, berserat', 'y': 'scaly, bersisik',
            'k': 'silky, halus mengilap', 's': 'smooth, licin'
        },
        'stalk-color-above-ring': {
            'n': 'brown, cokelat', 'b': 'buff, kuning pucat', 'c': 'cinnamon, kayu manis',
            'g': 'gray, abu-abu', 'o': 'orange, oranye', 'p': 'pink, merah muda',
            'e': 'red, merah', 'w': 'white, putih', 'y': 'yellow, kuning'
        },
        'stalk-color-below-ring': {
            'n': 'brown, cokelat', 'b': 'buff, kuning pucat', 'c': 'cinnamon, kayu manis',
            'g': 'gray, abu-abu', 'o': 'orange, oranye', 'p': 'pink, merah muda',
            'e': 'red, merah', 'w': 'white, putih', 'y': 'yellow, kuning'
        },
        'veil-color': { 'n': 'brown, cokelat', 'o': 'orange, oranye', 'w': 'white, putih', 'y': 'yellow, kuning' },
        'ring-number': { 'n': 'none, tanpa cincin', 'o': 'one, satu cincin', 't': 'two, dua cincin' },
        'ring-type': {
            'c': 'cobwebby, seperti sarang laba-laba', 'e': 'evanescent, mudah lenyap',
            'f': 'flaring, melebar', 'l': 'large, besar', 'n': 'none, tidak ada',
            'p': 'pendant, menggantung', 's': 'sheathing, menyelubung', 'z': 'zone, bergaris'
        },
        'spore-print-color': {
            'k': 'black, hitam', 'n': 'brown, cokelat', 'b': 'buff, kuning pucat',
            'h': 'chocolate, cokelat tua', 'r': 'green, hijau', 'o': 'orange, oranye',
            'u': 'purple, ungu', 'w': 'white, putih', 'y': 'yellow, kuning'
        },
        'population': {
            'a': 'abundant, melimpah', 'c': 'clustered, berkelompok',
            'n': 'numerous, banyak', 's': 'scattered, tersebar',
            'v': 'several, beberapa', 'y': 'solitary, tunggal'
        },
        'habitat': {
            'g': 'grasses, padang rumput', 'l': 'leaves, serasah daun',
            'm': 'meadows, padang rumput basah', 'p': 'paths, jalan setapak',
            'u': 'urban, taman kota', 'w': 'waste, tempat limbah', 'd': 'woods, hutan'
        }
    };

    const featureLabels = {
        'cap-shape': 'Bentuk tudung',
        'cap-surface': 'Permukaan tudung',
        'cap-color': 'Warna tudung',
        'bruises': 'Memar kalau ditekan',
        'odor': 'Aroma',
        'gill-attachment': 'Cara insang menempel',
        'gill-spacing': 'Kerapatan insang',
        'gill-size': 'Lebar insang',
        'gill-color': 'Warna insang',
        'stalk-shape': 'Bentuk batang',
        'stalk-surface-above-ring': 'Permukaan batang atas cincin',
        'stalk-surface-below-ring': 'Permukaan batang bawah cincin',
        'stalk-color-above-ring': 'Warna batang atas cincin',
        'stalk-color-below-ring': 'Warna batang bawah cincin',
        'veil-color': 'Warna selubung',
        'ring-number': 'Jumlah cincin',
        'ring-type': 'Bentuk cincin',
        'spore-print-color': 'Warna cetakan spora',
        'population': 'Sebaran tumbuh',
        'habitat': 'Tempat tumbuh'
    };

    document.querySelectorAll('.field label').forEach(label => {
        const name = label.getAttribute('for');
        if (featureLabels[name]) {
            label.textContent = featureLabels[name];
            label.style.textTransform = 'none';
            label.style.letterSpacing = '0';
            label.style.fontSize = '12.5px';
        }
    });

    document.querySelectorAll('select').forEach(sel => {
        const dict = codeDictionary[sel.name] || {};
        sel.querySelectorAll('option').forEach(opt => {
            const raw = dict[opt.value];
            if (!raw) return;
            const parts = raw.split(', ');
            const id = parts.length > 1 ? parts.slice(1).join(', ') : parts[0];
            opt.textContent = id + ' · ' + opt.value;
        });
    });

    /* ---------- Tab ---------- */
    const tabs = Array.from(document.querySelectorAll('.tabbtn'));

    let audioCtx = null;

    function blip(freq = 520) {
        try {
            audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === 'suspended') audioCtx.resume();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            const now = audioCtx.currentTime;
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.exponentialRampToValueAtTime(0.05, now + 0.012);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
            osc.start(now);
            osc.stop(now + 0.14);
        } catch (err) { /* suara opsional */ }
    }

    function ripple(btn, ev) {
        const box = btn.getBoundingClientRect();
        const size = Math.max(box.width, box.height) * 2;
        const dot = document.createElement('span');
        dot.className = 'ripple';
        dot.style.width = dot.style.height = size + 'px';
        dot.style.left = ((ev ? ev.clientX : box.left + box.width / 2) - box.left - size / 2) + 'px';
        dot.style.top = ((ev ? ev.clientY : box.top + box.height / 2) - box.top - size / 2) + 'px';
        btn.appendChild(dot);
        setTimeout(() => dot.remove(), 640);
    }

    let lastIndex = 0;

    function activateTab(tab) {
        const index = tabs.indexOf(tab);
        const direction = index >= lastIndex ? 'slide-right' : 'slide-left';

        tabs.forEach(t => {
            const target = (t === tab);
            t.setAttribute('aria-selected', target ? 'true' : 'false');
            const panel = document.getElementById(t.getAttribute('aria-controls'));
            if (target) {
                panel.removeAttribute('hidden');
                panel.classList.remove('slide-right', 'slide-left');
                void panel.offsetWidth;
                panel.classList.add(direction);
            } else {
                panel.setAttribute('hidden', '');
                panel.classList.remove('slide-right', 'slide-left');
            }
        });

        lastIndex = index;
    }

    tabs.forEach((tab, index) => tab.addEventListener('click', (ev) => {
        ripple(tab, ev);
        blip(500 + index * 70);
        activateTab(tab);
        window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    }));

    activateTab(document.getElementById('tab-btn-home'));

    const btnExplore = document.getElementById('btn-explore');
    if (btnExplore) {
        btnExplore.addEventListener('click', () => {
            activateTab(document.getElementById('tab-btn-form'));
            document.getElementById('panel-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    /* ---------- Anatomi interaktif ---------- */
    const anatomy = document.getElementById('anatomy');
    const partButtons = Array.from(document.querySelectorAll('#part-list button'));
    const tip = document.getElementById('part-tip');

    const partInfo = {
        cap: ['Tudung', 'Lihat dari atas. Catat bentuknya (cembung, datar, cekung) dan permukaannya (halus, berserat, bersisik, beralur).'],
        bruises: ['Memar', 'Tekan atau gores sedikit daging tudung dengan kuku. Kalau muncul noda kebiruan atau kecokelatan, berarti memar.'],
        gills: ['Insang', 'Ada di kolong tudung. Perhatikan kerapatannya (rapat atau renggang), lebarnya, dan warnanya. Ini ciri yang paling sering membedakan jamur beracun.'],
        ring: ['Cincin', 'Sisa selubung yang melingkari batang. Bisa tidak ada, satu, atau dua. Cek juga bentuknya: menggantung, melebar, atau menyelubung.'],
        stalk: ['Batang', 'Perhatikan bentuknya (membesar atau mengecil ke bawah), permukaan di atas dan di bawah cincin, serta warnanya.'],
        volva: ['Volva', 'Selubung di pangkal batang, kadang tertanam di tanah. Gali sedikit, jangan dicabut asal, karena bagian ini sering terlewat.']
    };

    function selectPart(part) {
        const groups = anatomy.querySelectorAll('g[data-part]');
        groups.forEach(g => g.classList.toggle('is-active', g.dataset.part === part));

        anatomy.querySelectorAll('.marker').forEach(m => {
            m.classList.toggle('is-on', m.dataset.part === part);
        });
        anatomy.classList.add('has-active');

        partButtons.forEach(b => b.setAttribute('aria-pressed', b.dataset.part === part ? 'true' : 'false'));

        const info = partInfo[part];
        tip.innerHTML = '<h4>' + info[0] + '</h4><p>' + info[1] + '</p>';

        const label = document.getElementById('guide-active');
        if (label) label.textContent = 'Bagian aktif: ' + info[0].toLowerCase();
    }

    partButtons.forEach(btn => btn.addEventListener('click', () => selectPart(btn.dataset.part)));

    const PRESETS = {
        p: {"cap-shape":"x","cap-surface":"s","cap-color":"n","bruises":"t","odor":"p","gill-attachment":"f","gill-spacing":"c","gill-size":"n","gill-color":"k","stalk-shape":"e","stalk-surface-above-ring":"s","stalk-surface-below-ring":"s","stalk-color-above-ring":"w","stalk-color-below-ring":"w","veil-color":"w","ring-number":"o","ring-type":"p","spore-print-color":"k","population":"s","habitat":"u"},
        e: {"cap-shape":"x","cap-surface":"s","cap-color":"y","bruises":"t","odor":"a","gill-attachment":"f","gill-spacing":"c","gill-size":"b","gill-color":"k","stalk-shape":"e","stalk-surface-above-ring":"s","stalk-surface-below-ring":"s","stalk-color-above-ring":"w","stalk-color-below-ring":"w","veil-color":"w","ring-number":"o","ring-type":"p","spore-print-color":"n","population":"n","habitat":"g"}
    };

    /* Animasi masuk untuk bar fitur */
    const fiBars = Array.from(document.querySelectorAll('.fi-bar b'));
    fiBars.forEach(b => { b.style.width = '0'; });

    const fillBars = () => fiBars.forEach((b, i) => {
        setTimeout(() => { b.style.width = (b.dataset.w || 0) + '%'; }, i * 90);
    });

    if ('IntersectionObserver' in window && fiBars.length) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    fillBars();
                    io.disconnect();
                }
            });
        }, { threshold: 0.4 });
        io.observe(document.querySelector('.fi-list'));
    } else {
        fillBars();
    }

    const mascot = document.getElementById('hero-mascot');
    if (mascot) {
        const goForm = () => {
            activateTab(document.getElementById('tab-btn-form'));
            blip(560);
        };
        mascot.addEventListener('click', goForm);
        mascot.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                goForm();
            }
        });
    }

    const cheatToggle = document.getElementById('cheat-toggle');
    const cheatBody = document.getElementById('cheat-body');

    if (cheatToggle && cheatBody) {
        cheatToggle.addEventListener('click', () => {
            const open = cheatToggle.getAttribute('aria-expanded') === 'true';
            cheatToggle.setAttribute('aria-expanded', String(!open));
            if (open) {
                cheatBody.setAttribute('hidden', '');
            } else {
                cheatBody.removeAttribute('hidden');
            }
            blip(open ? 420 : 620);
        });
    }

    document.querySelectorAll('[data-preset]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const data = PRESETS[btn.dataset.preset];
            if (!data) return;
            Object.entries(data).forEach(([name, value]) => {
                const sel = document.getElementById(name);
                if (sel) sel.value = value;
            });

            activateTab(document.getElementById('tab-btn-form'));
            hasRun = true;

            const guide = document.querySelector('details.guide');
            if (guide) guide.removeAttribute('open');

            await predict();

            const card = document.querySelector('.ws-side .side-card');
            if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    });
    anatomy.querySelectorAll('g[data-part]').forEach(g => g.addEventListener('click', () => selectPart(g.dataset.part)));

    /* ---------- Ekstraksi warna dari foto ---------- */
    const imgInput = document.getElementById('mushroom-image-input');
    const imgPreview = document.getElementById('img-preview');
    const detected = document.getElementById('image-processing-result');
    const assistStatus = document.getElementById('assist-status');
    const colorSwatch = document.getElementById('color-swatch');
    const colorName = document.getElementById('color-name');

    const palette = {
        'n': { name: 'brown', rgb: [120, 75, 38] },
        'b': { name: 'buff', rgb: [225, 205, 145] },
        'c': { name: 'cinnamon', rgb: [165, 88, 42] },
        'g': { name: 'gray', rgb: [130, 130, 130] },
        'r': { name: 'green', rgb: [60, 130, 70] },
        'p': { name: 'pink', rgb: [235, 140, 160] },
        'u': { name: 'purple', rgb: [120, 50, 140] },
        'e': { name: 'red', rgb: [195, 40, 40] },
        'w': { name: 'white', rgb: [242, 242, 242] },
        'y': { name: 'yellow', rgb: [235, 205, 50] }
    };

    function nearestColor(r, g, b) {
        let best = 'n', min = Infinity;
        for (const [code, item] of Object.entries(palette)) {
            const dr = r - item.rgb[0], dg = g - item.rgb[1], db = b - item.rgb[2];
            const dist = Math.sqrt(2 * dr * dr + 4 * dg * dg + 3 * db * db);
            if (dist < min) { min = dist; best = code; }
        }
        return best;
    }

    function hexOf(r, g, b) {
        return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
    }

    function applyColor(code, name, hex) {
        const sel = document.getElementById('cap-color');
        if (sel) {
            sel.value = code;
            sel.classList.add('filled');
            setTimeout(() => sel.classList.remove('filled'), 1800);
            scheduleLivePredict();
        }
        colorSwatch.style.backgroundColor = hex;
        colorName.textContent = name;
    }

    function localExtraction(file) {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 64;
            canvas.height = 64;
            ctx.drawImage(img, 0, 0, 64, 64);
            const data = ctx.getImageData(16, 16, 32, 32).data;
            let r = 0, g = 0, b = 0, n = 0;
            for (let i = 0; i < data.length; i += 4) {
                r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
            }
            r /= n; g /= n; b /= n;
            const code = nearestColor(r, g, b);
            applyColor(code, palette[code].name, hexOf(r, g, b));
            assistStatus.classList.remove('on');
            detected.classList.add('on');
        };
        img.src = URL.createObjectURL(file);
    }

    if (imgInput) {
        imgInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const fileName = document.getElementById('file-name');
            if (fileName) fileName.textContent = file.name;

            const reader = new FileReader();
            reader.onload = (ev) => { imgPreview.src = ev.target.result; };
            reader.readAsDataURL(file);

            detected.classList.remove('on');
            assistStatus.classList.add('on');

            try {
                const fd = new FormData();
                fd.append('image', file);
                const res = await fetch('/api/extract-color', { method: 'POST', body: fd });
                if (!res.ok) throw new Error('unavailable');
                const data = await res.json();
                applyColor(data.detected_code, data.detected_name.split(' (')[0], data.hex);
                assistStatus.classList.remove('on');
                detected.classList.add('on');
            } catch (err) {
                localExtraction(file);
            }
        });
    }

    /* ---------- Prediksi ---------- */
    const form = document.getElementById('mushroom-form');
    const btnSubmit = document.getElementById('btn-submit');
    const btnReset = document.getElementById('btn-reset');
    const loading = document.getElementById('loading-state');
    const errorBox = document.getElementById('error-box');
    const resultBox = document.getElementById('result-wrapper');

    let liveTimer = null;
    let hasRun = false;

    function mascotSVG(danger) {
        const cap = danger ? '#a9532f' : '#2f6b4d';
        const cheek = danger ? '#e3b9a6' : '#f2c2bb';
        const mouth = danger
            ? '<path d="M52 94 q8 -5 16 0" stroke="#16231b" stroke-width="1.8" fill="none" stroke-linecap="round"/>'
            : '<path d="M52 93 q8 7 16 0" stroke="#16231b" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
        return `
        <svg class="mascot" viewBox="0 0 120 116" aria-hidden="true">
            <path d="M16 58 C16 26 104 26 104 58 C78 68 42 68 16 58 Z" fill="${cap}"/>
            <circle cx="44" cy="40" r="5" fill="#eef5ef" opacity="0.85"/>
            <circle cx="66" cy="34" r="4" fill="#eef5ef" opacity="0.85"/>
            <circle cx="80" cy="46" r="3.5" fill="#eef5ef" opacity="0.85"/>
            <path d="M48 62 h24 v26 q0 8 -12 8 q-12 0 -12 -8 z" fill="#f6efe0"/>
            <circle class="eye" cx="52" cy="82" r="2.4" fill="#16231b"/>
            <circle class="eye" cx="68" cy="82" r="2.4" fill="#16231b"/>
            <circle cx="45" cy="89" r="3" fill="${cheek}" opacity="0.75"/>
            <circle cx="75" cy="89" r="3" fill="${cheek}" opacity="0.75"/>
            ${mouth}
        </svg>`;
    }

    function countUp(el, target, suffix) {
        const started = performance.now();
        const dur = 640;
        function frame(now) {
            const k = Math.min(1, (now - started) / dur);
            const eased = 1 - Math.pow(1 - k, 3);
            el.textContent = Math.round(target * eased) + (suffix || '');
            if (k < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    }

    function renderResult(res) {
        const poisonous = res.label === 'poisonous';
        const conf = Math.round(res.confidence);
        const pE = Math.round(res.probabilities ? (res.probabilities['e'] || 0) : (poisonous ? 100 - conf : conf));
        const pP = Math.round(res.probabilities ? (res.probabilities['p'] || 0) : (poisonous ? conf : 100 - conf));

        const empty = document.getElementById('result-empty');
        if (empty) empty.hidden = true;

        const status = document.getElementById('side-status');
        if (status) {
            status.textContent = poisonous ? 'beracun' : 'layak';
            status.className = 'side-dot ' + (poisonous ? 'is-danger' : 'is-safe');
        }

        resultBox.className = 'result on ' + (poisonous ? 'is-danger' : 'is-safe');
        resultBox.innerHTML = `
            <div class="result-top">
                ${mascotSVG(poisonous)}
                <h2>${poisonous ? 'Beracun' : 'Layak konsumsi'}</h2>
                <span class="score">Aturan cocok <b class="js-score">0%</b><em class="js-support"></em></span>
            </div>
            <p class="desc">
                ${poisonous
                    ? 'Kombinasi ciri ini paling dekat dengan pola jamur beracun pada data latih. Jangan dimakan. Kalau sudah terlanjur, segera ke fasilitas kesehatan dan bawa sisa jamurnya.'
                    : 'Kombinasi ciri ini paling dekat dengan pola jamur layak konsumsi pada data latih. Tetap cek ulang ciri yang paling menentukan: bau dan warna insang.'}
            </p>
            <div class="meters">
                <div>
                    <div class="meter-label"><span>Layak konsumsi</span><span class="js-pct-e">0%</span></div>
                    <div class="meter-track"><div class="meter-fill is-safe" data-w="${pE}"></div></div>
                </div>
                <div>
                    <div class="meter-label"><span>Beracun</span><span class="js-pct-p">0%</span></div>
                    <div class="meter-track"><div class="meter-fill" data-w="${pP}"></div></div>
                </div>
            </div>
            <p class="footnote">
                Pohon keputusan ini punya daun murni, jadi angkanya selalu 0% atau 100%.
                Itu aturan hasil latihan, bukan probabilitas statistik. Bukan pengganti identifikasi mikologi.
            </p>
        `;

        countUp(resultBox.querySelector('.js-score'), conf, '%');
        countUp(resultBox.querySelector('.js-pct-e'), pE, '%');
        countUp(resultBox.querySelector('.js-pct-p'), pP, '%');

        const sup = resultBox.querySelector('.js-support');
        if (sup && res.rule_support) {
            sup.textContent = 'dari ' + res.rule_support.toLocaleString('id-ID') + ' sampel latih';
        }

        requestAnimationFrame(() => {
            resultBox.querySelectorAll('.meter-fill').forEach(bar => {
                bar.style.width = bar.dataset.w + '%';
            });
        });
    }

    async function predict() {
        const payload = Object.fromEntries(new FormData(form).entries());
        const sideCard = document.querySelector('.side-card');
        const status = document.getElementById('side-status');

        loading.classList.add('on');
        errorBox.classList.remove('on');
        btnSubmit.disabled = true;
        sideCard.classList.add('is-busy');
        status.textContent = 'menghitung';
        status.className = 'side-dot';

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Permintaan gagal diproses');
            renderResult(data);
        } catch (err) {
            errorBox.textContent = 'Prediksi gagal. ' + err.message;
            errorBox.classList.add('on');
        } finally {
            loading.classList.remove('on');
            btnSubmit.disabled = false;
            sideCard.classList.remove('is-busy');
        }
    }

    function scheduleLivePredict() {
        clearTimeout(liveTimer);
        liveTimer = setTimeout(predict, 450);
    }

    btnSubmit.addEventListener('click', (ev) => {
        ripple(btnSubmit, ev);
        blip(680);
    });

    btnReset.addEventListener('click', (ev) => {
        ripple(btnReset, ev);
        blip(420);
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        hasRun = true;
        clearTimeout(liveTimer);
        predict();
    });

    form.addEventListener('change', () => {
        if (hasRun) scheduleLivePredict();
    });

    btnReset.addEventListener('click', () => {
        hasRun = false;
        form.reset();
        resultBox.className = 'result';
        resultBox.innerHTML = '';
        errorBox.classList.remove('on');
        detected.classList.remove('on');

        const empty = document.getElementById('result-empty');
        if (empty) empty.hidden = false;

        const status = document.getElementById('side-status');
        if (status) {
            status.textContent = 'menunggu';
            status.className = 'side-dot';
        }

        document.querySelectorAll('select').forEach(s => s.classList.remove('filled'));
    });
