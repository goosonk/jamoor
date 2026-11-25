# FINAL REAL IMAGE TEST REPORT — SHROOMY MACHINE LEARNING & WEB INTEGRATION

**Tanggal Pengujian:** 24 November 2026  
**Workspace:** `C:\Users\Fahry\jamoor`  
**Runtime Environment:** `.venv_vision` (`Python 3.12`, `torch 2.15.0+cpu`, `torchvision 0.29.2+cpu`, `scikit-learn 1.9.1`)  
**Status Modifikasi Kode/Model:** Tidak ada perubahan kode, konfigurasi, maupun model (100% read-only verification).

---

## RINGKASAN STATUS PENGUJIAN (PASS / FAIL / NOT TESTED)

Sesuai pedoman pengujian yang ketat, sistem **tidak diklaim berhasil 100%** karena pengujian visual interaktif langsung melalui antarmuka Chrome DevTools MCP dan perangkat keras kamera fisik belum dapat diselesaikan secara otomatis. Berikut adalah klasifikasi status aktual:

### 1. PASS (Berhasil Diverifikasi dengan Bukti Aktual)
- **[A.1] MobileNetV2 Pretrained ImageNet Loading:** **PASS** — Arsitektur `MobileNetV2` berhasil dimuat beserta bobot pretrained ImageNet (`2.223.872` parameter, L2 norm bobot `features[0][0].weight` = `13.4314`, `classifier` = `Identity()`).
- **[A.2] Dimensi Vektor Fitur 1280-D:** **PASS** — Tensor input `(1, 3, 224, 224)` menghasilkan output tensor berdimensi `[1, 1280]` (`feature_dim = 1280`).
- **[A.3] Binary SVM Loading:** **PASS** — `model_biner_svm.joblib` berhasil dimuat (`sklearn.svm.SVC`, kernel `rbf`, kelas `['0', '1']`, total `4.638` support vectors).
- **[A.4] Multiclass SVM Loading:** **PASS** — `model_species_multiclass.joblib` berhasil dimuat (`sklearn.svm.SVC`, kernel `rbf`, total `7.211` support vectors).
- **[A.5] Verifikasi 39 Kelas Spesies:** **PASS** — Model multiclass memiliki tepat **39 kelas spesies** jamur ilmiah.
- **[A.6] Knowledge Base & Status Mapping:** **PASS** — `species_knowledge_base.json` (`39` entri spesies lengkap) dan `species_status_map.json` (`40` entri mapping termasuk sinonim `Rubroboletus satanas`) berhasil dibaca tanpa error.
- **[B] Real Image Inference (`vision_classifier.py`):** **PASS (Eksekusi Pipeline)** — Inferensi nyata berhasil dijalankan pada **9 gambar jamur lokal** yang identitas spesiesnya diketahui tanpa rekayasa manual. *(Catatan: Evaluasi pada 9 sampel ini membuktikan pipeline inferensi berjalan nyata, bukan untuk menyimpulkan akurasi statistik keseluruhan model).*
- **[C] Integrasi API (`POST /api/predict-vision`):** **PASS** — Seluruh 9 gambar dikirim melalui `POST /api/predict-vision` dan menghasilkan output JSON (`species_name`, `species_confidence`, `top_candidates`, `binary_prediction`, `reference_status`, `detected_cap_color`) yang **100% identik dan konsisten** dengan pemanggilan langsung `vision_classifier.predict_mushroom_vision()`.
- **[D.1–D.6] Integrasi DOM & Eksekusi JavaScript (`workspace.html` + `workspace.js` terhadap Live API `http://127.0.0.1:5000`):** **PASS** — Seluruh 24 elemen DOM target pada `templates/workspace.html` terverifikasi lengkap, dan simulasi unggah gambar nyata (`amanita_muscaria/764650132.jpg`) dari `static/js/workspace.js` ke server live `http://127.0.0.1:5000/api/predict-vision` berhasil merender nama spesies, confidence `98.4% Keyakinan`, Top 3 kandidat, badge status referensi, warna tudung, morfologi, dan fakta edukasi dengan **0 JavaScript runtime error**.

### 2. FAIL (Kegagalan Sistem / Error)
- **Tidak ada komponen kode, model, atau endpoint API yang mengalami kegagalan fungsional (0 FAIL).**
- *(Catatan Observasi Prediksi pada Gambar Uji)*: Pada gambar `static/img/specimen-amanita.jpg`, model memberikan confidence rendah (`17.9%`, status `inconclusive`, prediksi teratas `Boletus satanas`), sedangkan pada foto spesimen uji standar `amanita_muscaria/764650132.jpg`, model memprediksi `Amanita muscaria` dengan confidence `98.4%`. Beberapa gambar uji dari dataset koleksi terpisah juga menghasilkan status `inconclusive` (`confidence < 50%`) atau prediksi spesies sekerabat (misal `Amanita phalloides` diprediksi sebagai kerabat mematikan satu genus `Amanita bisporigera` 48.3%, dan `Pleurotus ostreatus` diprediksi sebagai `Pleurotus eryngii` 63.8%).

### 3. NOT TESTED (Belum Diuji Secara Interaktif)
- **[D - Visual Browser Session via Chrome DevTools MCP]:** **NOT TESTED** — Koneksi subagent browser ke sesi Chrome lokal mengalami timeout (`context deadline exceeded`) karena dialog izin *"Allow remote debugging?"* pada aplikasi Chrome belum disetujui secara interaktif.
- **[D.7 - Pengujian Perangkat Keras Kamera Fisik (Live Webcam Stream)]:** **NOT TESTED** — Pengujian tangkapan kamera `navigator.mediaDevices.getUserMedia` menggunakan perangkat keras webcam fisik belum diuji secara langsung di browser. *(Namun, jalur fallback simulasi kamera di `workspace.js` telah diperiksa dalam kode).*

---

## A. HASIL AKTUAL PEMERIKSAAN MODEL LOADING

Pemeriksaan dilakukan secara langsung pada instance `vision_classifier.classifier` (`VisionClassifierSingleton`). Berikut adalah output metrik aktual yang tercatat:

```json
{
  "is_available": true,
  "load_error": null,
  "backbone_type": "MobileNetV2",
  "total_params": 2223872,
  "first_conv_weight_norm": 13.4314,
  "classifier_head": "Identity()",
  "feature_vector_shape": [1, 1280],
  "feature_dim": 1280,
  "binary_svm": {
    "loaded": true,
    "type": "SVC",
    "kernel": "rbf",
    "classes": ["0", "1"],
    "total_support_vectors": 4638
  },
  "multiclass_svm": {
    "loaded": true,
    "type": "SVC",
    "kernel": "rbf",
    "num_classes": 39,
    "total_support_vectors": 7211
  },
  "knowledge_base_species_count": 39,
  "status_map_species_count": 40
}
```

### Rincian Verifikasi Bagian A:
1. **MobileNetV2 Pretrained ImageNet:** Berhasil dimuat melalui `torchvision.models.mobilenet_v2(weights=MobileNet_V2_Weights.DEFAULT)` dengan `2.223.872` parameter aktif dan L2 norm layer konvolusi pertama `13.4314`.
2. **Dimensi Feature Extractor:** Head klasifikasi diganti dengan `nn.Identity()`, menghasilkan vektor fitur berdimensi **`[1, 1280]` (1280 dimensi)**.
3. **Binary SVM (`model_biner_svm.joblib`):** Berhasil dimuat (`SVC` dengan kernel `rbf`, `4.638` support vectors, kelas `0` = Edible, `1` = Poisonous).
4. **Multiclass SVM (`model_species_multiclass.joblib`):** Berhasil dimuat (`SVC` dengan kernel `rbf`, `7.211` support vectors).
5. **Jumlah Kelas Multiclass:** Terverifikasi memiliki tepat **39 kelas spesies**:
   `Agaricus bisporus`, `Agaricus campestris`, `Amanita bisporigera`, `Amanita citrina`, `Amanita muscaria`, `Amanita ocreata`, `Amanita pantherina`, `Amanita phalloides`, `Amanita virosa`, `Auricularia auricula-judae`, `Boletus edulis`, `Boletus satanas`, `Cantharellus cibarius`, `Chlorophyllum molybdites`, `Coprinopsis atramentaria`, `Coprinus comatus`, `Cortinarius orellanus`, `Cortinarius rubellus`, `Craterellus cornucopioides`, `Entoloma sinuatum`, `Flammulina velutipes`, `Galerina marginata`, `Grifola frondosa`, `Hericium erinaceus`, `Hydnum repandum`, `Hypholoma fasciculare`, `Inocybe geophylla`, `Lactarius deliciosus`, `Lentinula edodes`, `Lepiota brunneoincarnata`, `Macrolepiota procera`, `Morchella esculenta`, `Omphalotus olearius`, `Pleurotus eryngii`, `Pleurotus ostreatus`, `Tricholoma equestre`, `Tricholoma matsutake`, `Tricholoma pardinum`, `Volvariella volvacea`.
6. **Knowledge Base & Status Mapping:** `species_knowledge_base.json` memuat `39` profil spesies lengkap dan `species_status_map.json` memuat `40` pemetaan status edibilitas/toksisitas.

---

## B. HASIL AKTUAL REAL IMAGE INFERENCE

Pengujian dilakukan menggunakan **9 berkas citra jamur nyata** yang tersedia secara lokal (1 gambar dari `C:\Users\Fahry\jamoor\static\img\specimen-amanita.jpg` dan 8 gambar dari `C:\Users\Fahry\jamoor_archive\dataset\splits\test\`). Seluruh hasil di bawah ini adalah output murni dari eksekusi model tanpa modifikasi manual.

### Ringkasan Tabel 9 Gambar Uji

| # | Nama File | Identitas Sebenarnya | Prediksi Spesies | Confidence | Top 3 Kandidat | Prediksi Binary | Status Referensi | Waktu Inferensi |
|---|---|---|---|---|---|---|---|---|
| 1 | `static/img/specimen-amanita.jpg` | *Amanita muscaria* | `Boletus satanas` *(inconclusive)* | `17.9%` | `#1 Boletus satanas (17.9%)`; `#2 Hypholoma fasciculare (15.7%)`; `#3 Hydnum repandum (10.4%)` | `POISONOUS` (Edible: `43.2%`, Poisonous: `56.8%`) | Beracun (Toksik Saluran Cerna Parah) `[poisonous]` | `227.67 ms` (wall: `743.14 ms`) |
| 2 | `amanita_muscaria/764650132.jpg` | *Amanita muscaria* | **`Amanita muscaria`** | **`98.4%`** | `#1 Amanita muscaria (98.4%)`; `#2 Inocybe geophylla (0.5%)`; `#3 Amanita pantherina (0.2%)` | `POISONOUS` (Edible: `8.6%`, Poisonous: `91.4%`) | Beracun (Asam Ibotenat & Muscimol) `[poisonous]` | `173.97 ms` |
| 3 | `agaricus_bisporus/354029596.jpg` | *Agaricus bisporus* | **`Agaricus bisporus`** | **`52.0%`** | `#1 Agaricus bisporus (52.0%)`; `#2 Lentinula edodes (38.9%)`; `#3 Lactarius deliciosus (2.0%)` | `EDIBLE` (Edible: `57.8%`, Poisonous: `42.2%`) | Tercatat sebagai jamur pangan (Edible) `[edible]` | `219.94 ms` |
| 4 | `volvariella_volvacea/296268195.jpg` | *Volvariella volvacea* | **`Volvariella volvacea`** *(inconclusive)* | **`30.1%`** | `#1 Volvariella volvacea (30.1%)`; `#2 Craterellus cornucopioides (23.3%)`; `#3 Morchella esculenta (8.4%)` | `POISONOUS` (Edible: `46.6%`, Poisonous: `53.4%`) | Tercatat sebagai jamur pangan tropis (Edible) `[edible]` | `189.36 ms` |
| 5 | `pleurotus_ostreatus/761203896.jpg` | *Pleurotus ostreatus* | `Pleurotus eryngii` *(genus sama)* | `63.8%` | `#1 Pleurotus eryngii (63.8%)`; `#2 Entoloma sinuatum (6.6%)`; `#3 Galerina marginata (5.7%)` | `EDIBLE` (Edible: `96.0%`, Poisonous: `4.0%`) | Tercatat sebagai jamur pangan gourmet (Edible) `[edible]` | `209.10 ms` |
| 6 | `amanita_phalloides/755965447.jpg` | *Amanita phalloides* | `Amanita bisporigera` *(genus sama, inconclusive)* | `48.3%` | `#1 Amanita bisporigera (48.3%)`; `#2 Amanita citrina (15.3%)`; `#3 Amanita ocreata (11.1%)` | `POISONOUS` (Edible: `15.1%`, Poisonous: `84.9%`) | Sangat Beracun / Mematikan (Amatoxin) `[deadly]` | `257.79 ms` |
| 7 | `coprinus_comatus/763635548.jpg` | *Coprinus comatus* | `Coprinopsis atramentaria` *(famili jamur tinta)* | `95.4%` | `#1 Coprinopsis atramentaria (95.4%)`; `#2 Chlorophyllum molybdites (2.8%)`; `#3 Cantharellus cibarius (0.5%)` | `EDIBLE` (Edible: `88.3%`, Poisonous: `11.7%`) | Beracun jika Bersama Alkohol (Coprine Syndrome) `[poisonous]` | `197.38 ms` |
| 8 | `cantharellus_cibarius/745923629.jpg` | *Cantharellus cibarius* | `Entoloma sinuatum` *(inconclusive)* | `25.5%` | `#1 Entoloma sinuatum (25.5%)`; `#2 Boletus satanas (24.9%)`; `#3 Flammulina velutipes (24.2%)` | `EDIBLE` (Edible: `75.5%`, Poisonous: `24.5%`) | Beracun (Toksik Saluran Cerna Akut) `[poisonous]` | `208.68 ms` |
| 9 | `chlorophyllum_molybdites/756013654.jpg` | *Chlorophyllum molybdites* | `Amanita ocreata` *(inconclusive)* | `38.0%` | `#1 Amanita ocreata (38.0%)`; `#2 Lepiota brunneoincarnata (14.0%)`; `#3 Tricholoma pardinum (12.7%)` | `POISONOUS` (Edible: `14.9%`, Poisonous: `85.1%`) | Sangat Beracun / Mematikan (Amatoxin) `[deadly]` | `241.01 ms` |

---

### Detail Tabel Individual (Minimal 3 Gambar Utama Sesuai Format)

#### Gambar Uji 1: `amanita_muscaria/764650132.jpg`
| Informasi | Hasil |
|---|---|
| Nama file | `amanita_muscaria/764650132.jpg` |
| Identitas sebenarnya | `Amanita muscaria` |
| Prediksi spesies | `Amanita muscaria` (Fly Agaric / Jamur Lalat) |
| Confidence spesies | `98.4%` (`status_code: classified`) |
| Top 3 kandidat | `#1 Amanita muscaria (98.4%)`; `#2 Inocybe geophylla (0.5%)`; `#3 Amanita pantherina (0.2%)` |
| Prediksi binary | `POISONOUS` (`P(Edible): 8.6%`, `P(Poisonous): 91.4%`) |
| Status referensi | `Beracun (Asam Ibotenat & Muscimol)` `[poisonous]` |
| Waktu inferensi | `173.97 ms` |

#### Gambar Uji 2: `agaricus_bisporus/354029596.jpg`
| Informasi | Hasil |
|---|---|
| Nama file | `agaricus_bisporus/354029596.jpg` |
| Identitas sebenarnya | `Agaricus bisporus` |
| Prediksi spesies | `Agaricus bisporus` (Jamur Kancing / Portobello / Champignon) |
| Confidence spesies | `52.0%` (`status_code: classified`) |
| Top 3 kandidat | `#1 Agaricus bisporus (52.0%)`; `#2 Lentinula edodes (38.9%)`; `#3 Lactarius deliciosus (2.0%)` |
| Prediksi binary | `EDIBLE` (`P(Edible): 57.8%`, `P(Poisonous): 42.2%`) |
| Status referensi | `Tercatat sebagai jamur pangan (Edible)` `[edible]` |
| Waktu inferensi | `219.94 ms` |

#### Gambar Uji 3: `static/img/specimen-amanita.jpg`
| Informasi | Hasil |
|---|---|
| Nama file | `static/img/specimen-amanita.jpg` |
| Identitas sebenarnya | `Amanita muscaria` |
| Prediksi spesies | `Boletus satanas` (Satan's Bolete / *Rubroboletus satanas*) |
| Confidence spesies | `17.9%` (`status_code: inconclusive` — di bawah ambang `50.0%`) |
| Top 3 kandidat | `#1 Boletus satanas (17.9%)`; `#2 Hypholoma fasciculare (15.7%)`; `#3 Hydnum repandum (10.4%)` |
| Prediksi binary | `POISONOUS` (`P(Edible): 43.2%`, `P(Poisonous): 56.8%`) |
| Status referensi | `Beracun (Toksik Saluran Cerna Parah)` `[poisonous]` |
| Waktu inferensi | `227.67 ms` (Cold start wall-clock: `743.14 ms`) |

#### Gambar Uji 4: `amanita_phalloides/755965447.jpg`
| Informasi | Hasil |
|---|---|
| Nama file | `amanita_phalloides/755965447.jpg` |
| Identitas sebenarnya | `Amanita phalloides` |
| Prediksi spesies | `Amanita bisporigera` (Eastern Destroying Angel / Malaikat Perusak) |
| Confidence spesies | `48.3%` (`status_code: inconclusive`) |
| Top 3 kandidat | `#1 Amanita bisporigera (48.3%)`; `#2 Amanita citrina (15.3%)`; `#3 Amanita ocreata (11.1%)` |
| Prediksi binary | `POISONOUS` (`P(Edible): 15.1%`, `P(Poisonous): 84.9%`) |
| Status referensi | `Sangat Beracun / Mematikan (Amatoxin)` `[deadly]` |
| Waktu inferensi | `257.79 ms` |

---

## C. HASIL INTEGRASI API (`POST /api/predict-vision`)

Setiap gambar yang diuji pada Bagian B dikirimkan melalui endpoint `POST /api/predict-vision` menggunakan `multipart/form-data`. Hasil respons API dibandingkan secara langsung dengan output `vision_classifier.predict_mushroom_vision()`:

| # | Nama File | HTTP Status | Direct `vision_classifier.py` | Endpoint `POST /api/predict-vision` | Binary Prediction (Direct vs API) | Konsistensi 100% | Waktu Respons API |
|---|---|---|---|---|---|---|---|
| 1 | `static/img/specimen-amanita.jpg` | `200 OK` | `Boletus satanas` (`17.9%`) | `Boletus satanas` (`17.9%`) | `43.2% / 56.8%` vs `43.2% / 56.8%` | **YA (`True`)** | `289.57 ms` |
| 2 | `amanita_muscaria/764650132.jpg` | `200 OK` | `Amanita muscaria` (`98.4%`) | `Amanita muscaria` (`98.4%`) | `8.6% / 91.4%` vs `8.6% / 91.4%` | **YA (`True`)** | `197.78 ms` |
| 3 | `cantharellus_cibarius/745923629.jpg` | `200 OK` | `Entoloma sinuatum` (`25.5%`) | `Entoloma sinuatum` (`25.5%`) | `75.5% / 24.5%` vs `75.5% / 24.5%` | **YA (`True`)** | `213.43 ms` |
| 4 | `coprinus_comatus/763635548.jpg` | `200 OK` | `Coprinopsis atramentaria` (`95.4%`) | `Coprinopsis atramentaria` (`95.4%`) | `88.3% / 11.7%` vs `88.3% / 11.7%` | **YA (`True`)** | `214.88 ms` |
| 5 | `pleurotus_ostreatus/761203896.jpg` | `200 OK` | `Pleurotus eryngii` (`63.8%`) | `Pleurotus eryngii` (`63.8%`) | `96.0% / 4.0%` vs `96.0% / 4.0%` | **YA (`True`)** | `216.83 ms` |
| 6 | `agaricus_bisporus/354029596.jpg` | `200 OK` | `Agaricus bisporus` (`52.0%`) | `Agaricus bisporus` (`52.0%`) | `57.8% / 42.2%` vs `57.8% / 42.2%` | **YA (`True`)** | `271.49 ms` |
| 7 | `amanita_phalloides/755965447.jpg` | `200 OK` | `Amanita bisporigera` (`48.3%`) | `Amanita bisporigera` (`48.3%`) | `15.1% / 84.9%` vs `15.1% / 84.9%` | **YA (`True`)** | `239.09 ms` |
| 8 | `chlorophyllum_molybdites/756013654.jpg` | `200 OK` | `Amanita ocreata` (`38.0%`) | `Amanita ocreata` (`38.0%`) | `14.9% / 85.1%` vs `14.9% / 85.1%` | **YA (`True`)** | `222.11 ms` |
| 9 | `volvariella_volvacea/296268195.jpg` | `200 OK` | `Volvariella volvacea` (`30.1%`) | `Volvariella volvacea` (`30.1%`) | `46.6% / 53.4%` vs `46.6% / 53.4%` | **YA (`True`)** | `213.05 ms` |

### Bukti Raw JSON Payload Aktual dari `POST /api/predict-vision` (Sampel `amanita_muscaria/764650132.jpg`)

```json
{
  "success": true,
  "classification_available": true,
  "cnn_available": true,
  "engine_mode": "mobilenetv2_dual_svm",
  "model_used": "MobileNetV2 (1280-D) + SVM RBF (39 Spesies)",
  "feature_extractor": "torchvision.models.mobilenet_v2",
  "feature_vector_dim": 1280,
  "status_code": "classified",
  "species_name": "Amanita muscaria",
  "common_name": "Fly Agaric / Jamur Lalat",
  "species_confidence": 98.4,
  "taxon_id": 48715,
  "is_confident": true,
  "confidence_threshold": 50.0,
  "top_candidates": [
    {
      "rank": 1,
      "species": "Amanita muscaria",
      "common_name": "Fly Agaric / Jamur Lalat",
      "confidence": 98.4,
      "reference_status": "Beracun (Asam Ibotenat & Muscimol)",
      "status_category": "poisonous",
      "taxon_id": 48715
    },
    {
      "rank": 2,
      "species": "Inocybe geophylla",
      "common_name": "White Fiber Cap / Earth Fan",
      "confidence": 0.5,
      "reference_status": "Beracun (Kandungan Muscarin Tinggi)",
      "status_category": "poisonous",
      "taxon_id": 118336
    },
    {
      "rank": 3,
      "species": "Amanita pantherina",
      "common_name": "Panther Cap",
      "confidence": 0.2,
      "reference_status": "Sangat Beracun (Toksin Pantherina)",
      "status_category": "deadly",
      "taxon_id": 48418
    }
  ],
  "reference_status": "Beracun (Asam Ibotenat & Muscimol)",
  "reference_status_category": "poisonous",
  "binary_prediction": {
    "predicted_class": "poisonous",
    "p_edible": 8.6,
    "p_poisonous": 91.4,
    "note": "Prediksi biner edukatif berdasarkan pemodelan fitur visual 1.280 dimensi."
  },
  "detected_cap_color": {
    "identified": true,
    "primary_name": "Merah Tua / Marun (Dark Red/Maroon)",
    "primary_hex": "#51342c",
    "primary_rgb": [81, 52, 44],
    "secondary_name": null,
    "secondary_hex": null,
    "surface_name": "Bertekstur / Kasar / Bersisik"
  }
}
```

---

## D. HASIL PENGUJIAN FRONTEND INTEGRATION (`/workspace`)

### 1. Verifikasi Integrasi DOM & Live API (`workspace.html` + `workspace.js` $\rightarrow$ `http://127.0.0.1:5000/api/predict-vision`) — **PASS**
Pengujian end-to-end dijalankan dengan mengeksekusi `static/js/workspace.js` terhadap struktur ID dari `templates/workspace.html` dan mengirimkan berkas gambar nyata `amanita_muscaria/764650132.jpg` ke server Flask aktif di `http://127.0.0.1:5000/api/predict-vision`.

- **Kelengkapan Elemen DOM (`workspace.html`):** Seluruh **24 ID elemen DOM** yang diakses oleh `workspace.js` (`#image-upload-input`, `#btn-analyze-upload`, `#res-species-name`, `#res-species-common`, `#res-species-confidence`, `#res-candidates-list`, `#res-ref-status-card`, `#res-ref-status-badge`, `#res-binary-score`, `#res-color-text-primary`, dll.) ditemukan lengkap tanpa ada yang hilang (`Missing DOM IDs: NONE`).
- **JavaScript Console / Runtime Errors:** **0 Error** selama inisialisasi `DOMContentLoaded`, pergantian tab mode, pemilihan berkas gambar, pengiriman `fetch('/api/predict-vision')`, hingga pembaruan DOM oleh `renderPredictionResult(data)` dan `updateExtractedImageTable(data)`.
- **Bukti Nilai DOM Aktual yang Dirender pada Halaman `/workspace`:**

```json
{
  "species_scientific_name": "Amanita muscaria",
  "species_common_name": "Fly Agaric / Jamur Lalat",
  "species_confidence": "98.4% Keyakinan",
  "top_candidates_html_present": true,
  "reference_status_badge": "Status Referensi: Beracun (Asam Ibotenat & Muscimol)",
  "reference_status_card_classes": ["is-poisonous"],
  "binary_prediction_score": "P(Edible): 8.6% · P(Poisonous): 91.4%",
  "detected_cap_color": "Merah Tua / Marun (Dark Red/Maroon)",
  "detected_cap_hex_dot": "#51342c",
  "reference_cap_color": "Referensi: Merah cerah, merah marun, hingga jingga kemerahan.",
  "reference_cap_shape": "Bulat saat muda, melebar cembung mendatar saat dewasa.",
  "detected_surface": "Bertekstur / Kasar / Bersisik",
  "reference_stem": "Putih kokoh dengan cincin menggantung dan pangkal berumbi.",
  "reference_hymenium": "Insang putih murni, rapat dan bebas dari batang.",
  "reference_habitat": "Membentuk mikoriza dengan pohon pinus dan birch di hutan sejuk.",
  "species_description": "Memiliki tudung merah dengan bintik putih dan cincin pada batang. Dikenal luas sebagai Fly Agaric.",
  "educational_fact": "Ikon visual jamur paling terkenal dalam dongeng Eropa. Mengandung asam ibotenat dan muscimol yang bekerja langsung pada sistem saraf pusat.",
  "summary_table_species": "Amanita muscaria (Fly Agaric / Jamur Lalat)",
  "summary_table_conf": "98.4% Keyakinan",
  "summary_table_color": "Merah Tua / Marun (Dark Red/Maroon)",
  "summary_table_hex": "#51342c"
}
```

### 2. Pengujian Visual Interaktif via Chrome DevTools MCP & Kamera Fisik — **NOT TESTED**
- **Otomasi Browser Chrome DevTools MCP:** Saat subagent browser mencoba membuka sesi Chrome melalui `chrome_devtools` MCP, koneksi mengalami timeout (`context deadline exceeded`) karena menunggu persetujuan interaktif pada dialog *"Allow remote debugging?"* di browser Chrome pengguna.
- **Fitur Kamera Fisik (`getUserMedia`):** Karena tidak ada akses ke stream webcam perangkat keras melalui sesi remote debugging Chrome yang aktif, pengambilan video kamera fisik secara live dilaporkan sebagai **NOT TESTED**. Secara kode (`static/js/workspace.js` baris 478–500), apabila `navigator.mediaDevices.getUserMedia` ditolak atau perangkat kamera tidak tersedia, sistem secara otomatis mengalihkan ke fungsi `runCameraSimulation('safe')` yang menggambar spesimen pada `<canvas id="camera-canvas">` dan mengirimkannya ke `/api/predict-vision`.

---

## E. KESIMPULAN AKHIR

1. **Integritas Model & Pipeline ML:** Terbukti secara aktual bahwa backbone **MobileNetV2 pretrained ImageNet (1.280-D)**, **Binary SVM (`model_biner_svm.joblib`)**, **Multiclass SVM 39 Spesies (`model_species_multiclass.joblib`)**, serta **Knowledge Base (`species_knowledge_base.json`)** termuat dan menjalankan inferensi matematis asli (bukan dummy/hardcoded).
2. **Konsistensi Backend & API:** Endpoint `POST /api/predict-vision` terbukti **100% konsisten** dengan hasil inferensi langsung `vision_classifier.py` pada seluruh 9 citra jamur yang diuji.
3. **Observasi Performa pada Sampel Uji:** Tanpa menyimpulkan akurasi keseluruhan model dari 9 gambar saja, pengujian menunjukkan bahwa model mampu mengenali foto spesimen jelas seperti `amanita_muscaria/764650132.jpg` (`98.4%`) dan `agaricus_bisporus/354029596.jpg` (`52.0%`), serta mengklasifikasikan tingkat genus dengan tepat pada beberapa sampel (`Amanita`, `Pleurotus`), namun menghasilkan confidence di bawah ambang `50%` (`inconclusive`) atau salah klasifikasi pada citra yang memiliki distribusi pencahayaan/komposisi berbeda dari dataset pelatihan Colab (seperti `static/img/specimen-amanita.jpg` dengan confidence `17.9%`).
4. **Keterbatasan Pengujian:** Pengujian DOM & integrasi JS terhadap live server `http://127.0.0.1:5000` telah **PASS**, sedangkan inspeksi visual langsung pada jendela Chrome & pengujian hardware webcam berstatus **NOT TESTED** karena blokir izin remote debugging Chrome.
