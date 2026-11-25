# MODEL CONSISTENCY & MAPPING INTEGRATION AUDIT REPORT — SHROOMY

**Tanggal Audit:** 24 November 2026  
**Workspace:** `C:\Users\Fahry\jamoor`  
**Status Modifikasi:** Read-Only Audit (Belum ada file kode yang diubah; menunggu persetujuan rekomendasi).

---

## RINGKASAN EKSEKUTIF

Audit menyeluruh telah dilakukan terhadap alur data dari backend Machine Learning (`vision_classifier.py`) menuju endpoint API Flask (`api/index.py` & `app.py`) hingga ke layer presentasi frontend (`templates/workspace.html`, `static/js/workspace.js`, dan `static/css/style.css`).

### Kesimpulan Utama Audit:
1. **Kondisi Integrasi API (`api/index.py`):** **LENGKAP (PASS)**  
   Endpoint `POST /api/predict-vision` meneruskan seluruh dictionary hasil `vision_classifier.predict_mushroom_vision(file)` secara utuh melalui `jsonify(result)`. Seluruh field baru (`model_consistency`, `reference_binary_status`, `mapping_verified`, `mapping_status`, `is_confident`, `status_code`, serta `primary_area_pct` & `secondary_area_pct` pada `detected_cap_color`) **sudah terkirim dengan benar di dalam respons JSON API**. *(Catatan kecil: endpoint terpisah `POST /api/extract-color` belum meneruskan `area_percentage`)*.
2. **Kondisi Integrasi Frontend (`static/js/workspace.js` & `templates/workspace.html`):** **BELUM TERINTEGRASI PENUH (GAP TERIDENTIFIKASI)**  
   Fungsi `renderPredictionResult(data)` dan `updateExtractedImageTable(data)` di dalam `static/js/workspace.js` **belum membaca dan belum menampilkan** field `model_consistency`, `is_confident`, `status_code`, `mapping_verified`, `mapping_status`, maupun `primary_area_pct` / `secondary_area_pct`. Informasi evaluasi konsistensi dan status *inconclusive* saat ini **hanya berhenti di payload JSON API** dan belum direfleksikan secara visual kepada pengguna di halaman `/workspace`.

---

## 1. KONDISI INTEGRASI API (`vision_classifier.py` $\rightarrow$ `api/index.py`)

### 1.1 Pemeriksaan Endpoint `POST /api/predict-vision` (`api/index.py` baris 40–64)
Pada `api/index.py` baris 58–62:
```python
result = vision_classifier.predict_mushroom_vision(file)
if not result.get('success', False) and 'error' in result:
    return jsonify({'error': result['error']}), 400

return jsonify(result)
```
Karena `api/index.py` meneruskan objek `result` langsung ke `jsonify(result)` tanpa pemangkasan field, seluruh output dari `resolve_species_metadata()`, `evaluate_model_consistency()`, dan `segment_cap_region()` **sudah tersedia secara lengkap di respons HTTP JSON**:

| Kelompok Field pada Respons `/api/predict-vision` | Key JSON yang Dikirimkan | Status di Respons API |
|---|---|---|
| **Identitas & Confidence Spesies** | `species_name`, `common_name`, `species_confidence`, `taxon_id`, `is_confident`, `confidence_threshold`, `status_code` (`"classified"` / `"inconclusive"`) | **Tersedia Lengkap** |
| **Top 3 Kandidat Spesies** | `top_candidates[]` (`rank`, `species`, `species_name`, `common_name`, `confidence`, `confidence_pct`, `reference_status`, `status_category`, `reference_binary_status`, `mapping_verified`, `taxon_id`) | **Tersedia Lengkap** |
| **Status Referensi & Mapping** | `reference_status`, `reference_status_category`, `status_category`, `reference_binary_status`, `reference_status_note`, `mapping_verified`, `mapping_status` | **Tersedia Lengkap** |
| **Evaluasi Konsistensi Model** | `model_consistency` (`is_binary_consistent`, `consistency_status`, `binary_predicted_class`, `reference_binary_status`, `reference_status_category`, `multiclass_confident`, `multiclass_confidence_pct`, `binary_note`) | **Tersedia Lengkap** |
| **Prediksi Biner Edukatif** | `binary_prediction` (`predicted_class`, `p_edible`, `p_poisonous`, `is_consistent_with_reference`, `consistency_status`, `note`) | **Tersedia Lengkap** |
| **Deteksi Warna & Tekstur Tudung** | `detected_cap_color` (`identified`, `primary_name`, `primary_hex`, `primary_rgb`, `primary_area_pct`, `weighted_area_pct`, `secondary_name`, `secondary_hex`, `secondary_rgb`, `secondary_area_pct`, `roi_zone`, `clusters`, `surface_name`) | **Tersedia Lengkap** |
| **Morfologi, Edukasi & Disclaimer** | `morphology`, `ecological_habitat`, `short_description`, `educational_facts`, `safety_disclaimer` | **Tersedia Lengkap** |

### 1.2 Pemeriksaan Endpoint Pendukung `POST /api/extract-color` (`api/index.py` baris 88–110)
- Pada `api/index.py` baris 101–108, endpoint `/api/extract-color` hanya meneruskan `detected_code`, `detected_name`, `secondary_name`, `rgb`, `hex`, dan `surface_name`, tetapi **belum meneruskan** `area_percentage`, `secondary_area_percentage`, dan `roi_zone` dari `color_res`.

---

## 2. KONDISI INTEGRASI FRONTEND (`static/js/workspace.js` & `templates/workspace.html`)

Pemeriksaan baris-per-baris terhadap fungsi `renderPredictionResult(data)` (`static/js/workspace.js` baris 277–424) dan `updateExtractedImageTable(data)` (`static/js/workspace.js` baris 600–629) menemukan matriks kesenjangan (*gap*) berikut:

### 2.1 Tabel Matriks Field: API vs Frontend (`workspace.js`)

| Nama Field / Objek JSON API | Dibaca oleh `workspace.js`? | Ditampilkan di UI (`workspace.html`)? | Keterangan Kondisi Saat Ini |
|---|---|---|---|
| `species_name`, `common_name`, `species_confidence` | **Ya** | **Ya** (`#res-species-name`, `#res-species-common`, `#res-species-confidence`) | Selalu ditampilkan dengan gaya yang sama tanpa membedakan `confidence >= 50%` vs `< 50%`. |
| `is_confident`, `status_code` (`"inconclusive"`) | **TIDAK** | **TIDAK** | Frontend tidak memeriksa `data.is_confident` atau `data.status_code`. |
| `model_consistency.is_binary_consistent` | **TIDAK** | **TIDAK** | Frontend tidak memeriksa apakah Binary SVM konsisten dengan status referensi Top-1. |
| `model_consistency.consistency_status` | **TIDAK** | **TIDAK** | Keempat status (`consistent_confident`, `consistent_low_confidence`, `inconsistent_low_confidence`, `inconsistent_model_disagreement`) diabaikan. |
| `model_consistency.binary_note` / `binary_prediction.note` | **TIDAK** | **TIDAK** | `#res-binary-score` hanya menampilkan string statis `P(Edible): X% · P(Poisonous): Y%` dan membuang `bp.note`. |
| `reference_binary_status` | **TIDAK** | **TIDAK** | Hanya `reference_status_category` yang dibaca untuk pewarnaan kartu `#res-ref-status-card`. |
| `mapping_verified`, `mapping_status` | **TIDAK** | **TIDAK** | Frontend tidak mengecek apakah `data.mapping_verified === false`. |
| `detected_cap_color.primary_area_pct` & `secondary_area_pct` | **TIDAK** | **TIDAK** | Persentase area warna tudung (misal `62.5%` dan `16.8%`) sudah ada di JSON tetapi belum ditampilkan di `#res-color-text-primary` maupun `#img-tbl-color-name`. |
| `safety_disclaimer` | **Ya** | **Ya** (`#res-safety-text`) | Ditampilkan dengan benar di bagian bawah kartu hasil. |

---

## 3. POTENSI BUG & MASALAH INTERPRETASI PENGGUNA

Berdasarkan temuan di atas, terdapat **4 potensi bug visual/interpretasi** pada frontend saat ini:

### Bug 1: Prediksi `inconclusive` (`Confidence < 50%`) Ditampilkan Seolah-olah Teridentifikasi Pasti
- **Lokasi:** `static/js/workspace.js` baris 287–296 & 608–613, serta `static/css/style.css` baris 7557–7565.
- **Bukti:**
  - Ketika pengguna mengunggah gambar dengan confidence rendah di bawah ambang `50.0%` (misalnya `static/img/specimen-amanita.jpg` dengan confidence `17.9%` pada `Boletus satanas`, atau `cantharellus_cibarius/745923629.jpg` dengan confidence `25.5%` pada `Entoloma sinuatum`), badge `#res-species-confidence` tetap berwarna **hijau** (`17.9% Keyakinan`) dan judul utama `#res-species-name` langsung menampilkan `Boletus satanas` tanpa penanda **"Belum Meyakinkan (Inconclusive)"**.
  - Kartu `#res-ref-status-card` juga langsung berubah menjadi merah/oranye (`is-poisonous` / `is-deadly`) mengikuti kandidat `17.9%` tersebut tanpa memberi tahu pengguna bahwa kemiripan visualnya sangat rendah (`< 50%`).

### Bug 2: Kontradiksi antara Prediksi Binary SVM dan Status Referensi Top-1 Ditampilkan Tanpa Peringatan
- **Lokasi:** `static/js/workspace.js` baris 351–362 (`#res-ref-status-card` & `#res-binary-score`).
- **Bukti:**
  - Pada gambar `coprinus_comatus/763635548.jpg`, Multiclass SVM memprediksi `Coprinopsis atramentaria` (`95.4%`) sehingga `#res-ref-status-badge` menampilkan **`"Status Referensi: Beracun jika Bersama Alkohol (Coprine Syndrome)"`** dengan latar oranye (`is-poisonous`), namun tepat 2 baris di bawahnya `#res-binary-score` menampilkan **`"Prediksi Biner: P(Edible): 88.3% · P(Poisonous): 11.7%"`**.
  - Karena `workspace.js` mengabaikan `data.model_consistency` dan `data.binary_prediction.note`, pengguna melihat dua informasi yang saling bertentangan (`Beracun` vs `P(Edible): 88.3%`) tanpa label peringatan perbedaan model (*Model Disagreement Warning*) dan tanpa penjelasan mengapa kedua model berbeda.

### Bug 3: Ketiadaan Penanganan Visual untuk `mapping_verified === false`
- **Lokasi:** `static/js/workspace.js` baris 286–358.
- **Bukti:**
  - Meskipun `vision_classifier.py` sudah mengirimkan `mapping_verified: false` dan `mapping_status: "unmapped_species"` apabila suatu kelas gagal dipetakan, `workspace.js` tidak memeriksa flag tersebut. Jika kondisi ini terjadi, UI tidak menampilkan badge peringatan *"Mapping Referensi Belum Tersedia"* pada kartu status.

### Bug 4: Confidence Tinggi ($\ge 50\%$) Belum Disertai Konteks bahwa Kemiripan Visual Bukan Jaminan Mutlak
- **Lokasi:** `static/js/workspace.js` baris 293–296 & 355–357.
- **Bukti:**
  - Pada kasus *look-alike* seperti `coprinus_comatus/763635548.jpg`, model Multiclass menghasilkan confidence `95.4%` pada spesies yang salah tetapi semorfologi (*Coprinopsis atramentaria*). Tanpa menampilkan `binary_note` dari `model_consistency`, pengguna dapat mengira angka `95.4% Keyakinan` adalah kepastian mutlak meskipun model Biner sedang memberikan sinyal berbeda (`Edible 88.3%`).

---

## 4. REKOMENDASI PERBAIKAN MINIMUM (TANPA REDESIGN UI)

Agar seluruh informasi konsistensi model dan status mapping tampil secara jelas **tanpa mengubah tata letak/desain utama halaman Workspace**, berikut adalah rekomendasi perubahan minimum:

### A. Pembaruan Minimum pada `static/js/workspace.js` (`renderPredictionResult` & `updateExtractedImageTable`)
1. **Bedakan Tampilan Confidence `< 50%` (`!data.is_confident`) vs `>= 50%`:**
   - Pada `#res-species-confidence`:
     - Jika `data.is_confident === false` (`confidence < 50%`), tampilkan teks:  
       `"{conf}% · Belum Meyakinkan"` dan tambahkan class modifier `.is-low-confidence` (warna kuning/amber peringatan, bukan hijau).
     - Jika `data.is_confident === true`, tampilkan:  
       `"{conf}% Keyakinan Visual"` (class default hijau).
   - Pada `#res-species-common` dan `#img-tbl-species-name`:
     - Jika `data.is_confident === false`, tambahkan keterangan singkat `"(Kandidat Terdekat — Belum Konklusif)"` agar pengguna tahu bahwa prediksi di bawah 50% belum meyakinkan.
2. **Tampilkan Status Evaluasi Konsistensi (`data.model_consistency`) pada Kartu Status Referensi (`#res-ref-status-card`):**
   - Baca objek `const mc = data.model_consistency || {};` dan `const bp = data.binary_prediction || {};`.
   - Pada `#res-binary-score`, tampilkan tidak hanya persentase `P(Edible): X% · P(Poisonous): Y%`, tetapi juga label status konsistensinya:
     - `consistent_confident`: `"P(Edible): X% · P(Poisonous): Y% — [Selaras dengan Referensi]"`
     - `consistent_low_confidence`: `"P(Edible): X% · P(Poisonous): Y% — [Searah · Keyakinan Spesies Rendah <50%]"`
     - `inconsistent_low_confidence`: `"P(Edible): X% · P(Poisonous): Y% — [Perhatian: Hasil Belum Konklusif & Model Berbeda]"`
     - `inconsistent_model_disagreement`: `"P(Edible): X% · P(Poisonous): Y% — [Peringatan: Prediksi Biner Berbeda dari Status Referensi]"`
   - Tampilkan pesan penjelasan edukatif `mc.binary_note` (atau `bp.note`) pada elemen catatan konsistensi di dalam `#res-ref-status-card` (atau gabungkan secara rapi ke `#res-ref-status-note` ketika terjadi ketidakkonsistenan / confidence rendah / confidence tinggi *look-alike*).
3. **Tangani `data.mapping_verified === false` Secara Eksplisit:**
   - Jika `data.mapping_verified === false`, paksa `#res-ref-status-card` menggunakan class `is-neutral`, tampilkan `"Status Referensi: Mapping Belum Tersedia"` pada `#res-ref-status-badge`, dan tampilkan pesan fallback dari `data.reference_status_note`.
4. **Tampilkan Persentase Area Warna Tudung (`primary_area_pct` & `secondary_area_pct`):**
   - Pada `#res-color-text-primary` dan `#img-tbl-color-name`, sertakan persentase area apabila tersedia, misalnya:  
     `"Merah Cerah (Bright Red / Scarlet) [62.5%] (Utama) + Putih (White) [16.8%] (Bintik/Sekunder)"`.

### B. Pembaruan Minimum pada `static/css/style.css`
- Tambahkan modifier CSS ringan (sekitar 15–20 baris, tanpa mengubah layout grid/kartu):
  - `.species-conf-badge.is-low-confidence` (warna latar amber `#fef3c7`, border `#fcd34d`, teks `#b45309`).
  - `.ref-binary-meta.is-inconsistent` (warna latar kuning/merah lembut `#fffBEB` / `#fef2f2`, teks `#b45309` / `#b91c1c`, font-weight tebal untuk menonjolkan peringatan ketidakkonsistenan model).

### C. Pembaruan Minimum pada `api/index.py` (Opsional / Kelengkapan Endpoint `/api/extract-color`)
- Tambahkan `'area_percentage': color_res.get('area_percentage')`, `'secondary_area_percentage': color_res.get('secondary_area_percentage')`, dan `'roi_zone': color_res.get('roi_zone')` pada return JSON `/api/extract-color` (baris 101–108) agar konsisten 100% dengan `/api/predict-vision`.

---

## 5. DAFTAR FILE YANG PERLU DIUBAH (JIKA DISETUJUI)

1. **`C:\Users\Fahry\jamoor\static\js\workspace.js`** — Membaca `is_confident`, `status_code`, `model_consistency`, `mapping_verified`, `primary_area_pct`, dan `secondary_area_pct` serta merendernya ke elemen DOM yang sudah ada di `/workspace`.
2. **`C:\Users\Fahry\jamoor\static\css\style.css`** — Menambahkan class modifier `.species-conf-badge.is-low-confidence` dan `.ref-binary-meta.is-inconsistent` untuk indikator visual confidence rendah dan ketidaksepakatan model.
3. **`C:\Users\Fahry\jamoor\api\index.py`** *(Minor)* — Menyertakan `area_percentage` dan `secondary_area_percentage` pada endpoint pendukung `/api/extract-color`.

*(Tidak ada perubahan pada `vision_classifier.py`, `templates/workspace.html`, file model `.joblib`, maupun `species_knowledge_base.json` / `species_status_map.json`).*
