# MODEL CONSISTENCY & CONFIDENCE WARNING UI IMPLEMENTATION REPORT — SHROOMY

**Tanggal Implementasi:** 24 November 2026  
**Workspace:** `C:\Users\Fahry\jamoor`  
**Acuan Audit:** `MODEL_CONSISTENCY_INTEGRATION_AUDIT.md`

---

## 1. DAFTAR FILE YANG DIUBAH / DIBUAT

1. **`C:\Users\Fahry\jamoor\static\js\workspace.js`** *(Diubah)* — Implementasi pembacaan dan penampilan `is_confident`, `status_code`, `model_consistency`, `binary_prediction`, `reference_binary_status`, `mapping_verified`, serta persentase area warna tudung (`primary_area_pct` & `secondary_area_pct`) pada fungsi `renderPredictionResult()` dan `updateExtractedImageTable()`.
2. **`C:\Users\Fahry\jamoor\static\css\style.css`** *(Diubah)* — Penambahan modifier CSS ringan `.species-conf-badge.is-low-confidence`, `.ref-binary-meta.is-inconsistent`, dan `.ws-ref-status-card.is-unmapped` tanpa mengubah struktur grid, ukuran kartu, maupun layout utama.
3. **`C:\Users\Fahry\jamoor\api\index.py`** *(Diubah - Minor)* — Penerusan field `area_percentage`, `secondary_area_percentage`, dan `roi_zone` pada endpoint pendukung `POST /api/extract-color`.
4. **`C:\Users\Fahry\jamoor\MODEL_CONSISTENCY_UI_IMPLEMENTATION_REPORT.md`** *(Dibuat)* — Laporan implementasi dan hasil pengujian 4 skenario.

*(Tidak ada perubahan pada `vision_classifier.py`, `templates/workspace.html`, file model `.joblib`, `species_knowledge_base.json`, maupun `species_status_map.json`).*

---

## 2. RINGKASAN IMPLEMENTASI

### A. Penanganan Confidence Spesies (`static/js/workspace.js`)
- **Confidence `< 50.0%` (`is_confident === false` atau `status_code === "inconclusive"`):**
  - Badge `#res-species-confidence` dan sel tabel `#img-tbl-species-conf` menampilkan **`"{confidence}% · Belum Meyakinkan"`** dengan class modifier `.is-low-confidence` (warna amber/kuning peringatan).
  - Subjudul `#res-species-common` menampilkan `"{common_name} — Kandidat terdekat, belum teridentifikasi secara konklusif"` dan tabel `#img-tbl-species-name` menyertakan tag `"[Kandidat Terdekat · Belum Meyakinkan]"`.
- **Confidence `>= 50.0%` (`is_confident === true`):**
  - Badge `#res-species-confidence` dan `#img-tbl-species-conf` menampilkan **`"{confidence}% · Keyakinan Visual"`**.
  - Subjudul `#res-species-common` menyertakan konteks `"(Skor kemiripan visual model, bukan jaminan identifikasi mutlak)"`.

### B. Penanganan Status Referensi Saat Identifikasi Belum Meyakinkan (`inconclusive`) & Mapping Tidak Tersedia
- **Ketika `isInconclusive` (`confidence < 50%`):**
  - Kartu `#res-ref-status-card` **tidak lagi diberi warna kesimpulan** (`is-edible`, `is-poisonous`, `is-deadly`), melainkan dipaksa menggunakan tampilan netral **`is-neutral`**.
  - Badge `#res-ref-status-badge` menampilkan **`"Status Referensi: Belum Dapat Dipastikan (Belum Meyakinkan)"`**.
  - `#res-ref-status-note` menampilkan pesan wajib:  
    *"Status referensi kandidat belum dapat dipastikan karena hasil identifikasi spesies belum meyakinkan."* disertai rincian kandidat terdekat dan informasi Binary SVM secara transparan tanpa menyimpulkan mana yang benar.
- **Ketika `mapping_verified === false`:**
  - Kartu `#res-ref-status-card` menggunakan class `is-neutral is-unmapped`, `#res-ref-status-badge` menampilkan **`"Mapping Referensi Belum Tersedia"`**, dan `#res-ref-status-note` menampilkan pesan fallback dari API tanpa mengambil status dari spesies lain.

### C. Evaluasi Konsistensi Binary SVM vs Status Referensi Top-1 (`model_consistency`)
Menangani keempat status konsistensi secara eksplisit pada `#res-binary-meta`, `#res-binary-score`, dan `#res-ref-status-note`:
1. **`consistent_confident`**: Menampilkan `"P(Edible): X% · P(Poisonous): Y% · [Selaras Referensi: EDIBLE/POISONOUS]"`.
2. **`consistent_low_confidence`**: Menampilkan `"P(Edible): X% · P(Poisonous): Y% · [Searah Kandidat · Identifikasi Belum Meyakinkan]"`.
3. **`inconsistent_low_confidence`**: Mengaktifkan highlight peringatan `.is-inconsistent` pada `#res-binary-meta` dan menampilkan `"P(Edible): X% · P(Poisonous): Y% · [PERINGATAN: Berbeda dari Referensi Kandidat (...) & Belum Meyakinkan]"`.
4. **`inconsistent_model_disagreement`**: Mengaktifkan highlight peringatan `.is-inconsistent` pada `#res-binary-meta`, menampilkan `"P(Edible): X% · P(Poisonous): Y% · [PERINGATAN: Tidak Konsisten dengan Status Referensi (...)]"`, serta menyertakan penjelasan `binary_note` pada `#res-ref-status-note`.

### D. Persentase Area Warna Tudung (`primary_area_pct` & `secondary_area_pct`)
- Fungsi helper `formatAreaPct()` memformat nilai persentase dengan koma desimal bahasa Indonesia (misal `62.5` $\rightarrow$ `" (62,5%)"`) pada `#res-color-text-primary` dan `#img-tbl-color-name`, serta menyembunyikan tanda kurung persentase apabila nilainya tidak tersedia.

---

## 3. HASIL PENGUJIAN EMPAT SKENARIO WAJIB

Pengujian dilakukan secara end-to-end dengan mengeksekusi `static/js/workspace.js` terhadap server Flask aktif `http://127.0.0.1:5000/api/predict-vision` menggunakan keempat berkas citra uji nyata:

### Skenario 1: *Amanita muscaria* (`amanita_muscaria/764650132.jpg`)
- **Kondisi Model:** Confidence `98.4%`, Status Referensi `poisonous`, Binary SVM `poisonous` (`consistent_confident`).
- **Output DOM Aktual:**
  ```json
  {
    "species_name": "Amanita muscaria",
    "species_common": "Fly Agaric / Jamur Lalat (Skor kemiripan visual model, bukan jaminan identifikasi mutlak)",
    "confidence_badge_text": "98,4% · Keyakinan Visual",
    "confidence_badge_classes": [],
    "ref_status_card_classes": ["is-poisonous"],
    "ref_status_badge": "Status Referensi: Beracun (Asam Ibotenat & Muscimol)",
    "ref_status_note": "Status bersumber dari referensi mikologi dan farmakologi: racun neurotoksik dan halusinogenik. (Skor keyakinan visual adalah tingkat kemiripan fitur model, bukan jaminan identifikasi benar maupun rekomendasi konsumsi).",
    "binary_meta_classes": [],
    "binary_score_text": "P(Edible): 8.6% · P(Poisonous): 91.4% · [Selaras Referensi: POISONOUS]",
    "cap_color_text": "Merah Cerah (Bright Red / Scarlet) (62,5%) + Putih (White) (16,8%)",
    "table_species_name": "Amanita muscaria (Fly Agaric / Jamur Lalat)",
    "table_species_conf": "98,4% · Keyakinan Visual",
    "table_color_name": "Merah Cerah (Bright Red / Scarlet) (62,5%) + Putih (White) (16,8%)"
  }
  ```

### Skenario 2: *Coprinopsis atramentaria* (`coprinus_comatus/763635548.jpg`)
- **Kondisi Model:** Confidence `95.4%`, Status Referensi `poisonous`, Binary SVM `edible` (`inconsistent_model_disagreement`).
- **Output DOM Aktual:**
  ```json
  {
    "species_name": "Coprinopsis atramentaria",
    "species_common": "Inky Cap / Jamur Tinta (Skor kemiripan visual model, bukan jaminan identifikasi mutlak)",
    "confidence_badge_text": "95,4% · Keyakinan Visual",
    "confidence_badge_classes": [],
    "ref_status_card_classes": ["is-poisonous"],
    "ref_status_badge": "Status Referensi: Beracun jika Bersama Alkohol (Coprine Syndrome)",
    "ref_status_note": "Mengandung koprin yang menghambat pemecahan alkohol dalam tubuh. PERINGATAN PERBEDAAN MODEL: Model Multiclass mengidentifikasi Coprinopsis atramentaria (95.4%) yang tercatat berstatus 'Beracun jika Bersama Alkohol (Coprine Syndrome)' (POISONOUS), sedangkan model Biner terpisah memprediksi EDIBLE (Edible 88.3% / Poisonous 11.7%). Utamakan kewaspadaan referensi ilmiah dan jangan mengonsumsi jamur liar.",
    "binary_meta_classes": ["is-inconsistent"],
    "binary_score_text": "P(Edible): 88.3% · P(Poisonous): 11.7% · [PERINGATAN: Tidak Konsisten dengan Status Referensi (POISONOUS)]",
    "cap_color_text": "Abu-abu Terang (Light Gray) (44,6%) + Putih (White) (28,7%)",
    "table_species_name": "Coprinopsis atramentaria (Inky Cap / Jamur Tinta)",
    "table_species_conf": "95,4% · Keyakinan Visual",
    "table_color_name": "Abu-abu Terang (Light Gray) (44,6%) + Putih (White) (28,7%)"
  }
  ```

### Skenario 3: *Cantharellus cibarius* (`cantharellus_cibarius/745923629.jpg`)
- **Kondisi Model:** Confidence `25.5%` (Kandidat #1: *Entoloma sinuatum*, Referensi: `poisonous`), Binary SVM `edible` (`inconsistent_low_confidence`).
- **Output DOM Aktual:**
  ```json
  {
    "species_name": "Entoloma sinuatum",
    "species_common": "Livent Entoloma / Poison Pie — Kandidat terdekat, belum teridentifikasi secara konklusif",
    "confidence_badge_text": "25,5% · Belum Meyakinkan",
    "confidence_badge_classes": ["is-low-confidence"],
    "ref_status_card_classes": ["is-neutral"],
    "ref_status_badge": "Status Referensi: Belum Dapat Dipastikan (Belum Meyakinkan)",
    "ref_status_note": "Status referensi kandidat belum dapat dipastikan karena hasil identifikasi spesies belum meyakinkan. Kandidat terdekat #1 (Entoloma sinuatum, 25,5%) memiliki catatan referensi 'Beracun (Toksik Saluran Cerna Akut)', sedangkan model Biner terpisah memprediksi EDIBLE (Edible: 75.5% · Poisonous: 24.5%). Kedua informasi ditampilkan sebagai referensi edukatif tanpa menyimpulkan mana yang benar.",
    "binary_meta_classes": ["is-inconsistent"],
    "binary_score_text": "P(Edible): 75.5% · P(Poisonous): 24.5% · [PERINGATAN: Berbeda dari Referensi Kandidat (POISONOUS) & Belum Meyakinkan]",
    "cap_color_text": "Cokelat Kemerahan (Reddish Brown) (64,9%) + Krem / Buff (Buff/Cream) (25,4%)",
    "table_species_name": "Entoloma sinuatum (Livent Entoloma / Poison Pie) [Kandidat Terdekat · Belum Meyakinkan]",
    "table_species_conf": "25,5% · Belum Meyakinkan",
    "table_color_name": "Cokelat Kemerahan (Reddish Brown) (64,9%) + Krem / Buff (Buff/Cream) (25,4%)"
  }
  ```

### Skenario 4: *Volvariella volvacea* (`volvariella_volvacea/296268195.jpg`)
- **Kondisi Model:** Confidence `30.1%` (Kandidat #1: *Volvariella volvacea*, Referensi: `edible`), Binary SVM `poisonous` (`inconsistent_low_confidence`).
- **Output DOM Aktual:**
  ```json
  {
    "species_name": "Volvariella volvacea",
    "species_common": "Jamur Merang / Straw Mushroom — Kandidat terdekat, belum teridentifikasi secara konklusif",
    "confidence_badge_text": "30,1% · Belum Meyakinkan",
    "confidence_badge_classes": ["is-low-confidence"],
    "ref_status_card_classes": ["is-neutral"],
    "ref_status_badge": "Status Referensi: Belum Dapat Dipastikan (Belum Meyakinkan)",
    "ref_status_note": "Status referensi kandidat belum dapat dipastikan karena hasil identifikasi spesies belum meyakinkan. Kandidat terdekat #1 (Volvariella volvacea, 30,1%) memiliki catatan referensi 'Tercatat sebagai jamur pangan tropis (Edible)', sedangkan model Biner terpisah memprediksi POISONOUS (Edible: 46.6% · Poisonous: 53.4%). Kedua informasi ditampilkan sebagai referensi edukatif tanpa menyimpulkan mana yang benar.",
    "binary_meta_classes": ["is-inconsistent"],
    "binary_score_text": "P(Edible): 46.6% · P(Poisonous): 53.4% · [PERINGATAN: Berbeda dari Referensi Kandidat (EDIBLE) & Belum Meyakinkan]",
    "cap_color_text": "Krem / Buff (Buff/Cream) (46,5%) + Cokelat Tua / Gelap (Dark Brown) (30,6%)",
    "table_species_name": "Volvariella volvacea (Jamur Merang / Straw Mushroom) [Kandidat Terdekat · Belum Meyakinkan]",
    "table_species_conf": "30,1% · Belum Meyakinkan",
    "table_color_name": "Krem / Buff (Buff/Cream) (46,5%) + Cokelat Tua / Gelap (Dark Brown) (30,6%)"
  }
  ```

---

## 4. HASIL PEMERIKSAAN JAVASCRIPT & ENDPOINT PENDUKUNG

1. **JavaScript Runtime Verification:**
   - Eksekusi penuh `static/js/workspace.js` (inisialisasi `DOMContentLoaded`, pemilihan file, `fetch('/api/predict-vision')`, `renderPredictionResult()`, dan `updateExtractedImageTable()`) berjalan bersih dengan **0 JavaScript runtime error** dan **0 unhandled promise rejection**.
2. **Verifikasi Endpoint `POST /api/extract-color`:**
   - Mengembalikan `area_percentage: 62.5`, `secondary_area_percentage: 16.8`, dan `roi_zone: "lower_center (y:30%-85%)"` secara konsisten dengan `/api/predict-vision`.

---

## 5. MASALAH YANG MASIH DITEMUKAN (DI LUAR RUANG LINGKUP PERBAIKAN UI INI)

1. **Berkas Aset Contoh `static/img/specimen-amanita.jpg`:** Berkas contoh statis ini masih berisi gambar bunga matahari (*Helianthus annuus*), bukan jamur *Amanita muscaria* (saat diuji menghasilkan confidence rendah `17.9%` yang kini sudah ditangani dengan benar oleh UI sebagai `"17,9% · Belum Meyakinkan"` dengan kartu status netral).
2. **Keterbatasan Intrinsik Frozen Backbone MobileNetV2 pada Citra dengan Latar Dominan:** Sebagaimana tercatat pada `MODEL_QUALITY_AUDIT_REPORT.md`, citra dengan objek tangan manusia besar (`cantharellus_cibarius/745923629.jpg`) atau latar serpihan kayu yang menyaru (`volvariella_volvacea/296268195.jpg`) menghasilkan confidence `< 50%` pada model SVM, namun kini UI telah menyajikan kondisi tersebut secara jujur, netral, dan aman sebagai hasil yang **belum meyakinkan**.
