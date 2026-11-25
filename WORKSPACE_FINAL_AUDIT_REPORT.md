# WORKSPACE FINAL VISUAL & FUNCTIONAL AUDIT REPORT — SHROOMY

**Tanggal Audit:** 24 November 2026  
**Workspace:** `C:\Users\Fahry\jamoor`  
**URL Pengujian:** `http://127.0.0.1:5000` & `http://127.0.0.1:5000/workspace`  
**Runtime Server:** `.\.venv_vision\Scripts\python.exe app.py`  
**Browser Engine Pengujian:** Google Chrome (`1440×950` Desktop & `390×844` Mobile Viewport via Chrome DevTools Protocol)  
**Status Modifikasi Kode:** Read-Only Audit (Tidak ada perubahan kode, desain, model, maupun dataset selama audit).

---

## RINGKASAN STATUS AUDIT PER BAGIAN

| Bagian Pemeriksaan | Status | Ringkasan Temuan Utama |
|---|---|---|
| **1. Pemeriksaan Visual UI Desktop (`1440×950`)** | **WARNING** | Layout 2 kolom (`644px : 644px`) sejajar vertikal (`top: 164px`) tanpa horizontal overflow (`scrollWidth = 1425px`). Seluruh badge confidence, warna tudung, morfologi, dan peringatan konsistensi terbaca jelas. Namun terdapat selisih tinggi kolom kanan (~`1140px`) vs kolom kiri (~`784px`), pemotongan teks nama umum pada baris kandidat #2/#3 akibat label status yang panjang, serta header sticky yang menutupi sebagian tab saat *anchor scroll*. |
| **2. Pemeriksaan Responsif Mobile (`390×844`)** | **FAIL (Visual Layout pada Widget Top 3 Kandidat)** | Tidak ada horizontal overflow tingkat halaman (`scrollWidth = clientWidth = 390px`), dan kedua kolom tersusun vertikal dengan rapi (`width: 342px`). **Namun ditemukan bug visual kritis pada daftar Top 3 Kandidat Spesies di layar mobile**: tag status referensi yang panjang (`"Tercatat sebagai jamur pangan gourmet"`) dengan `flex-shrink: 0` mendesak kolom nama spesies (`.cand-info`) hingga lebarnya menyempit menjadi `~0–4px`, sehingga **nama spesies dan progress bar kandidat #1, #2, dan #3 hilang/tidak terbaca di layar mobile**. Selain itu, judul `"Hasil Identifikasi Spesies"` terlipat menjadi 3 baris sempit karena berhimpitan dengan badge nama model. |
| **3. Pengujian Alur Identifikasi 4 Gambar Dataset** | **PASS** | Keempat gambar uji berhasil diunggah dan diidentifikasi secara akurat sesuai respons API `/api/predict-vision`. Badge `Keyakinan Visual` (hijau) vs `Belum Meyakinkan` (amber), kartu status referensi netral saat `< 50%`, peringatan perbedaan Binary SVM vs status referensi (`is-inconsistent`), serta persentase warna tudung tampil 100% sesuai spesifikasi. |
| **4. Pemeriksaan Interaksi & JavaScript Console** | **PASS (dengan Catatan UX Minor)** | Validasi format berkas tidak valid (`.txt`), validasi ukuran berkas (`> 10 MB`), preview gambar, indikator loading tombol, tombol sampel uji, dan unggah ulang berjalan dengan **0 JavaScript runtime error** dan **0 page exception**. Catatan UX minor: pemilihan file langsung menjalankan klasifikasi otomatis sebelum tombol `"Klasifikasi Gambar AI"` diklik, dan belum ada tombol khusus `"Reset"` untuk mengosongkan hasil kembali ke kondisi awal. |

---

## 1. HASIL PEMERIKSAAN VISUAL DESKTOP (`1440×950`) — **STATUS: WARNING**

### Bukti Tangkapan Layar Desktop:
- Skenario 1 (*Amanita muscaria*): `C:\Users\Fahry\.gemini\antigravity\brain\eb27d8be-503e-4522-b947-3c77b1a47954\audit_desktop_1_amanita_muscaria.png`
- Skenario 2 (*Coprinus comatus*): `C:\Users\Fahry\.gemini\antigravity\brain\eb27d8be-503e-4522-b947-3c77b1a47954\audit_desktop_2_coprinus_comatus.png`
- Skenario 3 (*Cantharellus cibarius*): `C:\Users\Fahry\.gemini\antigravity\brain\eb27d8be-503e-4522-b947-3c77b1a47954\audit_desktop_3_cantharellus_cibarius.png`
- Skenario 4 (*Volvariella volvacea*): `C:\Users\Fahry\.gemini\antigravity\brain\eb27d8be-503e-4522-b947-3c77b1a47954\audit_desktop_4_volvariella_volvacea.png`

### Evaluasi Parameter Visual Desktop:
1. **Keseimbangan Layout Dua Kolom:**
   - Kolom kiri (`.ws-input-column`) dan kolom kanan (`.ws-result-column`) sama-sama dimulai pada posisi vertikal **`top: 164px`** dan memiliki lebar identik **`644px : 644px`** (proporsi 50:50 sempurna).
   - **Temuan (WARNING):** Setelah hasil identifikasi muncul, tinggi kolom kiri adalah **`784px–805px`**, sedangkan tinggi kolom kanan mencapai **`1077px–1184px`** (selisih `~293px–379px`). Akibatnya, terdapat ruang kosong di bawah tabel ringkasan visual pada kolom kiri dan kartu `Status Referensi Ilmiah` di kolom kanan terdorong melewati batas bawah layar pertama (*below the fold* pada tinggi layar `900px–950px`).
2. **Keterbacaan Nama Spesies & Skor Confidence:**
   - Nama ilmiah spesies (`#res-species-name`, `22px bold italic`) dan nama umum (`#res-species-common`, `13px`) sangat jelas dan kontras.
3. **Tampilan Badge `Keyakinan Visual` vs `Belum Meyakinkan`:**
   - Pada confidence $\ge 50\%$ (`98,4%` dan `95,4%`), badge `#res-species-confidence` tampil berwarna hijau (`background: rgb(220, 252, 231)`, `color: rgb(21, 128, 61)`) dengan teks **`"98,4% · Keyakinan Visual"`**.
   - Pada confidence $< 50\%$ (`25,5%` dan `30,1%`), badge `#res-species-confidence` otomatis berubah menjadi kuning/amber (`.is-low-confidence`, `background: rgb(254, 243, 199)`, `color: rgb(180, 83, 9)`) dengan teks **`"25,5% · Belum Meyakinkan"`**.
4. **Tampilan Kartu Status Referensi & Peringatan Ketidakkonsistenan Model:**
   - Ketika confidence tinggi dan spesies beracun (*Amanita muscaria*, *Coprinopsis atramentaria*), kartu `#res-ref-status-card` menggunakan gaya `.is-poisonous` (`background: rgb(255, 247, 237)`).
   - Ketika confidence rendah (`< 50%`, *Cantharellus cibarius* `25,5%` & *Volvariella volvacea* `30,1%`), kartu `#res-ref-status-card` tampil netral (`.is-neutral`, `background: rgb(248, 250, 252)`) dengan badge **`"Status Referensi: Belum Dapat Dipastikan (Belum Meyakinkan)"`**.
   - Ketika Binary SVM berbeda pendapat dengan referensi spesies Top-1 (Skenario 2, 3, dan 4), baris `#res-binary-meta` mendapatkan highlight kotak amber (`.is-inconsistent`, `background: rgb(255, 251, 235)`, border `#fcd34d`) dengan teks peringatan tebal yang sangat mudah dikenali.
5. **Informasi Warna Tudung & Persentase Area:**
   - Lingkaran swatch warna utama (`#res-color-dot-1`) dan sekunder (`#res-color-dot-2`) tampil sejajar dengan teks nama warna dan persentase area (misal: **`"Merah Cerah (Bright Red / Scarlet) (62,5%) + Putih (White) (16,8%)"`**).
6. **Pemotongan Teks & Overflow pada Desktop:**
   - Tidak ada horizontal overflow (`scrollWidth = 1425px`, `clientWidth = 1425px`).
   - **Temuan (WARNING):** Pada daftar `Top 3 Kandidat Spesies`, ketika label `.cand-status-tag` sangat panjang (misal `"Tercatat sebagai jamur pangan gourmet"` pada Skenario 2 dan 4), teks nama umum kandidat di sebelahnya terpotong tanpa elipsis penuh (misal: `Craterellus cornucopioides (Horn of Plenty / Black` dan `Morchella esculenta (Yellow Morel / Jamur Morel Kun`).
   - **Temuan (WARNING):** Saat melakukan *scroll* ke anchor `#workspace-app`, header navigasi yang bersifat `sticky` menutupi separuh bagian atas tombol tab `1. Identifikasi Melalui Kamera` dan `2. Identifikasi Melalui Gambar`.

---

## 2. HASIL PEMERIKSAAN RESPONSIF MOBILE (`390×844`) — **STATUS: FAIL**

### Bukti Tangkapan Layar Mobile:
- Panel Upload Mobile: `C:\Users\Fahry\.gemini\antigravity\brain\eb27d8be-503e-4522-b947-3c77b1a47954\audit_mobile_upload_panel.png`
- Kartu Hasil Mobile: `C:\Users\Fahry\.gemini\antigravity\brain\eb27d8be-503e-4522-b947-3c77b1a47954\audit_mobile_result_card.png`

### Evaluasi Parameter Responsif Mobile:
1. **Stacking Kolom & Overflow Halaman:**
   - Pada viewport `390×844`, grid dua kolom otomatis berubah menjadi 1 kolom vertikal (`columns_stacked_vertically: true`, lebar kartu `342px`).
   - Tidak ada horizontal overflow pada level dokumen (`document.documentElement.scrollWidth = 390px`, `clientWidth = 390px`), dan tabel ringkasan visual (`.ws-compact-table`) muat di dalam kontainernya (`310px` di dalam `312px`).
   - Grid `Karakteristik Visual` (`.morph-info-grid`) berhasil berubah dari 2 kolom menjadi 1 kolom penuh (`width: 282px` per item).
2. **Temuan Kritis 1 (FAIL — Nama Spesies & Bar pada Top 3 Kandidat Hilang/Tergencet di Layar Mobile):**
   - **Lokasi:** `static/css/style.css` baris 7698–7790 (`.candidate-row`, `.cand-info`, `.cand-meta`, `.cand-status-tag`) & `static/js/workspace.js` baris 309–328.
   - **Bukti Visual (`audit_mobile_result_card.png`):** Pada layar mobile `390px`, setiap baris `.candidate-row` menggunakan `display: flex; flex-wrap: nowrap`. Bagian kanan (`.cand-meta`) memiliki `flex-shrink: 0` dan memuat `.cand-status-tag` dengan teks panjang seperti `"Tercatat sebagai jamur pangan gourmet"` (lebar ~`215px`). Akibatnya, ruang tersisa untuk `.cand-info` (yang memuat nama ilmiah spesies, nama umum, dan progress bar) menyusut menjadi **`0px–4px`**, sehingga **ketiga baris Top 3 Kandidat Spesies hanya menampilkan nomor `#1/#2/#3`, angka persentase, dan badge hijau panjang, sementara nama spesiesnya hilang sama sekali!**
3. **Temuan Visual 2 (WARNING — Header Kartu Hasil Terlipat Sempit di Mobile):**
   - **Lokasi:** `static/css/style.css` (`.ws-result-header`, `.ws-active-engine-badge`).
   - **Bukti Visual (`audit_mobile_result_card.png`):** Pada layar mobile, `.ws-result-header` menempatkan grup judul dan badge `MobileNetV2 (1280-D) + SVM RBF (39 Spesies)` secara berdampingan tanpa `flex-wrap: wrap`, sehingga judul **`"Hasil Identifikasi Spesies"`** tertekan dan terlipat menjadi 3 baris vertikal sempit (`Hasil` / `Identifikasi` / `Spesies`).
4. **Temuan Visual 3 (WARNING — Baris Header Hero Spesies di Mobile):**
   - Pada `.species-hero-meta`, tag `SPESIES UTAMA (MULTICLASS SVM)` dan badge `30,1% · Belum Meyakinkan` tampak berdesakan pada lebar `280px` dan terbungkus menjadi 2 baris di dalam pill masing-masing.

---

## 3. HASIL PENGUJIAN EMPAT GAMBAR DATASET — **STATUS: PASS**

Keempat gambar dari dataset diunggah satu per satu melalui `#image-upload-input` pada browser Chrome dan diverifikasi terhadap respons API `/api/predict-vision`:

### Tabel Hasil Aktual pada Antarmuka Website

| Parameter UI | 1. `amanita_muscaria/764650132.jpg` | 2. `coprinus_comatus/763635548.jpg` | 3. `cantharellus_cibarius/745923629.jpg` | 4. `volvariella_volvacea/296268195.jpg` |
|---|---|---|---|---|
| **Spesies Utama (`#res-species-name`)** | *Amanita muscaria* | *Coprinopsis atramentaria* | *Entoloma sinuatum* | *Volvariella volvacea* |
| **Subjudul & Konteks (`#res-species-common`)** | `Fly Agaric / Jamur Lalat (Skor kemiripan visual model, bukan jaminan identifikasi mutlak)` | `Inky Cap / Jamur Tinta (Skor kemiripan visual model, bukan jaminan identifikasi mutlak)` | `Livent Entoloma / Poison Pie — Kandidat terdekat, belum teridentifikasi secara konklusif` | `Jamur Merang / Straw Mushroom — Kandidat terdekat, belum teridentifikasi secara konklusif` |
| **Badge Confidence (`#res-species-confidence`)** | **`98,4% · Keyakinan Visual`** (Hijau) | **`95,4% · Keyakinan Visual`** (Hijau) | **`25,5% · Belum Meyakinkan`** (Amber `.is-low-confidence`) | **`30,1% · Belum Meyakinkan`** (Amber `.is-low-confidence`) |
| **Top 3 Kandidat (`#res-candidates-list`)** | `#1 Amanita muscaria (98.4%)`<br>`#2 Inocybe geophylla (0.5%)`<br>`#3 Amanita pantherina (0.2%)` | `#1 Coprinopsis atramentaria (95.4%)`<br>`#2 Chlorophyllum molybdites (2.8%)`<br>`#3 Cantharellus cibarius (0.5%)` | `#1 Entoloma sinuatum (25.5%)`<br>`#2 Boletus satanas (24.9%)`<br>`#3 Flammulina velutipes (24.2%)` | `#1 Volvariella volvacea (30.1%)`<br>`#2 Craterellus cornucopioides (23.3%)`<br>`#3 Morchella esculenta (8.4%)` |
| **Warna Tudung & Area (`#res-color-text-primary`)** | `Merah Cerah (Bright Red / Scarlet) (62,5%) + Putih (White) (16,8%)` (`#930d22`) | `Abu-abu Terang (Light Gray) (44,6%) + Putih (White) (28,7%)` (`#99968f`) | `Cokelat Kemerahan (Reddish Brown) (64,9%) + Krem / Buff (Buff/Cream) (25,4%)` (`#ae817b`) | `Krem / Buff (Buff/Cream) (46,5%) + Cokelat Tua / Gelap (Dark Brown) (30,6%)` (`#d6b997`) |
| **Kelas Kartu Status (`#res-ref-status-card`)** | `is-poisonous` (Oranye lembut) | `is-poisonous` (Oranye lembut) | **`is-neutral`** (Abu-abu netral — tidak menyimpulkan) | **`is-neutral`** (Abu-abu netral — tidak menyimpulkan) |
| **Badge Status Referensi (`#res-ref-status-badge`)** | `Status Referensi: Beracun (Asam Ibotenat & Muscimol)` | `Status Referensi: Beracun jika Bersama Alkohol (Coprine Syndrome)` | **`Status Referensi: Belum Dapat Dipastikan (Belum Meyakinkan)`** | **`Status Referensi: Belum Dapat Dipastikan (Belum Meyakinkan)`** |
| **Baris Prediksi Biner & Konsistensi (`#res-binary-score`)** | `P(Edible): 8.6% · P(Poisonous): 91.4% · [Selaras Referensi: POISONOUS]` | **`.is-inconsistent` (Amber):** `P(Edible): 88.3% · P(Poisonous): 11.7% · [PERINGATAN: Tidak Konsisten dengan Status Referensi (POISONOUS)]` | **`.is-inconsistent` (Amber):** `P(Edible): 75.5% · P(Poisonous): 24.5% · [PERINGATAN: Berbeda dari Referensi Kandidat (POISONOUS) & Belum Meyakinkan]` | **`.is-inconsistent` (Amber):** `P(Edible): 46.6% · P(Poisonous): 53.4% · [PERINGATAN: Berbeda dari Referensi Kandidat (EDIBLE) & Belum Meyakinkan]` |
| **Kesesuaian dengan Respons API** | **100% Sesuai** | **100% Sesuai** | **100% Sesuai** | **100% Sesuai** |

---

## 4. HASIL PEMERIKSAAN INTERAKSI & CONSOLE — **STATUS: PASS (DENGAN CATATAN UX MINOR)**

| Komponen Interaksi | Hasil Pengujian Aktual | Status |
|---|---|---|
| **1. Pemilihan Gambar & Preview** | Memilih gambar melalui `#image-upload-input` langsung menampilkan preview pada `#upload-preview-img` (`is-visible`), menyembunyikan `#upload-empty-state`, dan menampilkan badge `"Klik atau tarik foto baru untuk mengganti"`. | **PASS** |
| **2. Tombol Proses & Loading Indicator** | Selama request ke `/api/predict-vision` berlangsung, tombol `#btn-analyze-upload` dinonaktifkan (`disabled = true`) dan teksnya berubah menjadi `"Memproses Klasifikasi AI..."`, lalu kembali aktif menjadi `"Klasifikasi Gambar AI"` setelah respons diterima. | **PASS** |
| **3. Penanganan File Tidak Valid (`.txt`)** | Mengunggah file `notes.txt` (`text/plain`) ditolak sebelum dikirim ke API dengan pesan alert: `"Format berkas tidak didukung. Harap pilih gambar dengan format JPG, PNG, atau WEBP."` | **PASS** |
| **4. Penanganan File Terlalu Besar (`> 10 MB`)** | Mengunggah file `11.0 MB` ditolak dengan pesan alert: `"Ukuran berkas terlalu besar (11.0 MB). Maksimal ukuran berkas adalah 10 MB."` | **PASS** |
| **5. Penanganan Kegagalan API / Jaringan** | Blok `try / catch` pada `runUploadAnalysis()` dan `evaluateCanvasVision()` menangkap error HTTP (`!res.ok || data.error`) maupun kegagalan jaringan dan memulihkan state tombol di blok `finally`. | **PASS** |
| **6. Unggah Ulang vs Tombol Reset** | Unggah ulang gambar baru berfungsi mulus berkali-kali. Namun **belum tersedia tombol khusus "Reset"** untuk menghapus gambar dan mengembalikan panel hasil ke state kosong awal, serta pemilihan file langsung menjalankan klasifikasi otomatis tanpa menunggu klik tombol `"Klasifikasi Gambar AI"`. | **WARNING (UX Minor)** |
| **7. Pemeriksaan JavaScript Runtime Error** | `console_logs: []`, `page_errors: []` (**0 JavaScript error** selama seluruh siklus pengujian desktop, mobile, dan interaksi). | **PASS** |

---

## 5. DAFTAR MASALAH YANG DITEMUKAN

1. **[CRITICAL - Mobile Layout] Nama Spesies dan Progress Bar pada `Top 3 Kandidat Spesies` Hilang/Tergencet di Layar Mobile (`390px`):**
   - **Lokasi:** `static/css/style.css` (`.candidate-row`, `.cand-info`, `.cand-meta`, `.cand-status-tag` baris 7698–7790) & `static/js/workspace.js` (baris 309, `cleanStatus`).
   - **Penyebab:** Teks `.cand-status-tag` diambil dari `cand.reference_status.split('(')[0].trim()` yang menghasilkan string panjang seperti `"Tercatat sebagai jamur pangan gourmet"` (`37` karakter) di dalam kontainer `.cand-meta` (`flex-shrink: 0`). Pada layar mobile (dan sebagian desktop), badge panjang tersebut menghabiskan seluruh lebar baris dan menekan `.cand-info` hingga lebar `0px`.
2. **[MODERATE - Mobile Layout] Header Kartu Hasil (`.ws-result-header`) Tidak Memiliki `flex-wrap: wrap`:**
   - **Lokasi:** `static/css/style.css` (`.ws-result-header` & `.ws-active-engine-badge`).
   - **Penyebab:** Pada layar mobile `390px`, badge `MobileNetV2 (1280-D) + SVM RBF (39 Spesies)` mendesak judul `"Hasil Identifikasi Spesies"` hingga terlipat menjadi 3 baris pendek.
3. **[MODERATE - Desktop Layout] Selisih Tinggi Kolom Kanan (`~1140px`) vs Kolom Kiri (`~784px`):**
   - **Lokasi:** `static/css/style.css` (`.ws-result-card`, `.ws-species-hero-card`, `.ws-morphology-card`, `.ws-ref-status-card`).
   - **Penyebab:** Setelah penambahan teks penjelasan konsistensi model dan 5 kotak morfologi di kolom kanan, tinggi kolom kanan melebihi kolom kiri sebesar `~300–380px`, sehingga bagian bawah kartu status referensi dan peringatan keselamatan terdorong ke bawah lipatan layar (*below the fold*).
4. **[MINOR - Desktop Navigation] Header Sticky Menutupi Bagian Atas Mode Tabs Saat Scroll ke `#workspace-app`:**
   - **Lokasi:** `static/css/style.css` (`#workspace-app` / `.ws-main-section`).
   - **Penyebab:** Section `#workspace-app` belum memiliki properti `scroll-margin-top: 84px`.
5. **[MINOR - UX Flow] Auto-Submit Saat Pilih File & Ketiadaan Tombol Reset Hasil:**
   - **Lokasi:** `static/js/workspace.js` baris 660 (`handleSelectedFile` langsung memanggil `runUploadAnalysis()`).
   - **Penyebab:** Membuat langkah ke-2 dan ke-3 pada panduan (`2. Periksa Pratinjau -> 3. Klik Klasifikasi AI`) dilewati secara otomatis, serta tidak ada tombol `"Reset"` untuk membersihkan pratinjau kembali ke kondisi awal.

---

## 6. REKOMENDASI PERBAIKAN BERDASARKAN PRIORITAS

### Prioritas 1 (Tinggi — Perbaikan Bug Kritis Tampilan Top 3 Kandidat di Mobile & Desktop)
1. **Ringkas Label Tag Status pada Top 3 Kandidat (`static/js/workspace.js` baris 309):**
   - Gunakan label badge pendek yang konsisten berdasarkan `cand.status_category`:
     - `deadly` $\rightarrow$ `"Sangat Beracun"`
     - `poisonous` $\rightarrow$ `"Beracun"`
     - `edible` $\rightarrow$ `"Edible / Pangan"`
     - lainnya $\rightarrow$ `"Referensi"`
   - Dengan label pendek (`10–14` karakter, bukan `37` karakter), nama ilmiah spesies, nama umum, dan progress bar pada `Top 3 Kandidat Spesies` akan tampil utuh dan proporsional baik di layar desktop maupun mobile!
2. **Tambahkan Responsivitas Mobile pada `.candidate-row` dan `.ws-result-header` (`static/css/style.css`):**
   - Pada `@media (max-width: 640px)`, tambahkan `flex-wrap: wrap` pada `.ws-result-header` dan `.species-hero-meta`, serta atur `.cand-com` agar dapat disembunyikan atau di-ellipsis dengan rapi sehingga `.cand-sci` selalu memiliki ruang minimal `120px`.

### Prioritas 2 (Menengah — Optimasi Kepadatan Vertikal Kolom Kanan & Scroll Margin Desktop)
3. **Rapatkan Padding Vertikal Kolom Kanan (`static/css/style.css`):**
   - Kurangi sedikit margin/padding vertikal antar-elemen di dalam `.ws-result-card` dan batasi tinggi maksimum pratinjau/padding agar selisih tinggi antara kolom kiri dan kolom kanan berkurang dan kartu `Status Referensi Ilmiah` langsung terlihat dalam satu layar desktop.
4. **Tambahkan `scroll-margin-top: 84px` pada `#workspace-app` (`static/css/style.css`):**
   - Agar saat pengguna mengklik navigasi `"Workspace AI"`, tab mode tidak tertutup oleh sticky header.

### Prioritas 3 (Rendah — Penyempurnaan Alur Interaksi Upload)
5. **Tambahkan Tombol `"Reset"` di Samping `"Klasifikasi Gambar AI"` (Opsional):**
   - Memungkinkan pengguna mengosongkan gambar yang sedang diuji kembali ke tampilan awal tanpa harus memuat ulang halaman.
