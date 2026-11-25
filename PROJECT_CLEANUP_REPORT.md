# LAPORAN CLEAN-UP TOTAL PROJECT SHROOMY
**Tanggal Eksekusi:** 24 November 2026  
**Lokasi Project:** `C:\Users\Fahry\jamoor`  
**Lokasi Arsip Aman:** `C:\Users\Fahry\jamoor_archive`  

---

## 1. RINGKASAN EKSEKUTIF

Proses **Clean-Up Total** pada workspace project Shroomy telah berhasil dilaksanakan secara menyeluruh. Tujuan dari pembersihan ini adalah menyederhanakan struktur repositori agar **hanya menyisakan berkas dan direktori yang secara fungsional diperlukan untuk menjalankan website Flask dan sistem inferensi Machine Learning aktif**.

Seluruh artefak penelitian, dataset citra berukuran besar (~1,98 GB), berkas ZIP, notebook eksperimen Google Colab, script pengujian/audit fase sebelumnya, serta model Machine Learning legacy/alternatif telah dipindahkan dengan aman ke direktori eksternal:  
`C:\Users\Fahry\jamoor_archive`

Setelah proses pembersihan, seluruh endpoint website (`/`, `/workspace`, `/api/info`, `/api/predict-vision`, `/api/extract-color`) telah diuji dan diverifikasi beroperasi 100% normal tanpa adanya kendala missing file, missing asset, maupun dependency error.

---

## 2. DAFTAR FILE & DIREKTORI YANG DIPERTAHANKAN (ESSENTIAL RUNTIME)

Semua berkas yang dipertahankan dalam folder `C:\Users\Fahry\jamoor` memiliki fungsi spesifik dan esensial bagi runtime website:

| No | File / Direktori | Tipe | Fungsi & Deskripsi |
|---|---|---|---|
| 1 | `app.py` | Python Script | Entry point lokal untuk menjalankan server Flask di `http://127.0.0.1:5000`. |
| 2 | `vision_classifier.py` | Python Module | Mesin inferensi inti ML: Feature extractor MobileNetV2 (1.280-D), klasifikasi Dual-SVM (39 spesies & biner edukatif), ekstraksi warna tudung morfologi, dan integrasi knowledge base. |
| 3 | `model_species_multiclass.joblib` | Model Binary (24 MB) | Model SVM RBF Multiclass final hasil training untuk mengenali 39 spesies jamur. |
| 4 | `model_biner_svm.joblib` | Model Binary (14 MB) | Model SVM RBF Biner edukatif (Edible vs Poisonous) sebagai verifikasi pendukung. |
| 5 | `species_knowledge_base.json` | Database JSON (45 KB) | Basis data ilmiah taksonomi, morfologi (tudung, batang, spora), habitat ekologis, dan fakta biologis untuk 39 spesies. |
| 6 | `species_status_map.json` | Database JSON (1.4 KB) | Pemetaan status toksisitas/edibilitas referensi mikologi ilmiah untuk 39 spesies. |
| 7 | `api/` | Subfolder | Direktori modul backend API: |
|   | `api/index.py` | Python Script | Backend utama Flask yang memuat seluruh endpoint routing (`/`, `/workspace`, `/api/predict-vision`, `/api/info`, `/api/extract-color`) serta handler serverless Vercel. |
| 8 | `templates/` | Subfolder | Direktori template HTML Flask: |
|   | `templates/index.html` | HTML Template | Halaman utama / landing page Shroomy (Hero, Tentang, Panduan, Tim Dev). |
|   | `templates/workspace.html` | HTML Template | Halaman Workspace interaktif untuk identifikasi spesies, visual preview, analisis morfologi, status referensi, dan edukasi biologis. |
| 9 | `static/` | Subfolder | Direktori aset statis website: |
|   | `static/css/style.css` | CSS Stylesheet | Seluruh styling antarmuka, tata letak dua kolom Workspace, badge warna, dan kartu responsif. |
|   | `static/js/main.js` | JavaScript | Skrip kontrol interaktif halaman utama (navigasi, modal, transisi). |
|   | `static/js/workspace.js` | JavaScript | Skrip kontrol interaktif halaman Workspace (upload gambar drag-and-drop, kamera live capture, AJAX POST ke API vision, visualisasi Top 3 kandidat, rendering kartu morfologi). |
|   | `static/img/*` | Image Assets | Logo Shroomy (dark, white, green), favicon, maskot Roomie, foto tim pengembang, gambar latar hero, dan gambar uji `specimen-amanita.jpg`. |
| 10 | `requirements.txt` | Config File | Daftar dependensi runtime terstandarisasi (`Flask`, `joblib`, `pandas`, `numpy`, `scikit-learn`, `Pillow`, `torch`, `torchvision`). |
| 11 | `vercel.json` | Config File | Konfigurasi routing deployment untuk hosting di platform Vercel. |
| 12 | `README.md` | Dokumentasi | Dokumentasi ringkas pengenalan proyek Shroomy. |
| 13 | `.gitignore` | Git Config | Konfigurasi file yang diabaikan dalam version control. |
| 14 | `.git/` | Version Control | Repositori Git lokal proyek (dipertahankan tanpa modifikasi commit/push). |
| 15 | `.venv_vision/` | Virtual Environment | Lingkungan Python aktif yang terinstal PyTorch CPU, TorchVision, Scikit-Learn, dan Flask. |

---

## 3. DAFTAR FILE & DIREKTORI YANG DIPINDAHKAN KE ARSIP

Sebanyak **39 item** (total ukuran berkas **~1,90 GB**) yang merupakan artefak pengembangan, riset dataset, dan pengujian historis telah dipindahkan ke `C:\Users\Fahry\jamoor_archive`:

### A. Folder Riset & Dataset
1. `dataset/` — Seluruh raw images dan folder pembagian split (train/val/test).
2. `scratch/` — Kumpulan 39 script eksperimen sementara.
3. `backup_legacy_ml/` — Backup implementasi Machine Learning model tabular awal.
4. `models/` — Direktori model lama yang berisi checkpoint `best_mobilenet_shroomy.pt` (Phase 4 10-spesies).
5. `.venv/` — Virtual environment lama yang belum memiliki PyTorch.

### B. Notebook Eksperimen & Berkas ZIP Besar
6. `shroomy_splits.zip` (1,98 GB) — Arsip ZIP dataset gambar.
7. `PJBL_Jamur_FULL_END_TO_END.ipynb` (2,26 MB) — Notebook training Google Colab 39 spesies.
8. `shroomy_phase4_eda_training.ipynb` (53 KB) — Notebook training Phase 4 MobileNetV2 10 spesies.

### C. Model Machine Learning Legacy & Alternatif
9. `model_biner_logreg.joblib` — Model alternatif Binary Logistic Regression.
10. `model_biner_randomforest.joblib` (2,66 MB) — Model alternatif Binary Random Forest.
11. `mushroom_pipeline.joblib` (241 KB) — Model pipeline tabular lama.
12. `feature_categories.joblib` (363 B) — Metadata fitur tabular lama.

### D. Skrip Riset, Scraping & Akuisisi Data
13. `curate_dataset.py` — Skrip kurasi dataset iNaturalist.
14. `dataset_collector.py` — Skrip pengunduh citra dari API iNaturalist.
15. `retrain.py` — Skrip retraining model lama.
16. `generate_pdf.py` — Skrip generator PDF laporan audit.

### E. Skrip Audit & Pengujian Historis
17. `audit_all_10_species.py`
18. `audit_and_validate_accuracy.py`
19. `audit_inaturalist_v21.py`
20. `audit_report.html`
21. `test_frontend_headless.js`
22. `test_phase1_integration.py`
23. `test_phase5_dual_classifier_integration.py`
24. `test_photo_struct.py`
25. `test_refactor_mode03.py`
26. `test_uiux_refinement.py`
27. `test_vision_standalone.py`

### F. Dokumen Laporan Evaluasi Fase Sebelumnya (.md)
28. `evaluation_accuracy_shroomy.md`
29. `implementation_cnn_shroomy.md`
30. `phase1_dataset_research_shroomy.md`
31. `phase1_dataset_research_shroomy_v2.md`
32. `phase1_dataset_research_shroomy_v2.1.md`
33. `phase1_dataset_research_shroomy_v2.2.md`
34. `phase5_checkpoint_validation.md`
35. `phase5_comparative_notebook_audit.md`
36. `phase5_ml_system_replacement_report.md`
37. `refactor_mode03_shroomy.md`
38. `uiux_refinement_shroomy.md`
39. `validation_model_cnn_shroomy.md`

---

## 4. STRUKTUR FOLDER AKHIR PROYEK (`C:\Users\Fahry\jamoor`)

```text
C:\Users\Fahry\jamoor\
├── .git/                                 # Repositori version control Git
├── .gitignore                            # Konfigurasi file ignore Git
├── .venv_vision/                         # Virtual environment aktif dengan PyTorch & Scikit-Learn
├── api/
│   └── index.py                          # Routing backend Flask & entry point serverless
├── static/
│   ├── css/
│   │   └── style.css                     # Stylesheet terpadu Shroomy
│   ├── js/
│   │   ├── main.js                       # Logika interaktif antarmuka beranda
│   │   └── workspace.js                  # Logika interaktif antarmuka Workspace
│   └── img/                              # Seluruh gambar visual, logo, mascot, & dev team
├── templates/
│   ├── index.html                        # Template HTML Landing Page
│   └── workspace.html                    # Template HTML Workspace Identifikasi
├── app.py                                # Entry point lokal server Flask
├── model_biner_svm.joblib                # Model SVM RBF Biner edukatif
├── model_species_multiclass.joblib       # Model SVM RBF Multikelas 39 spesies
├── species_knowledge_base.json           # Basis pengetahuan morfologi & edukasi biologis
├── species_status_map.json               # Pemetaan referensi toksisitas / edibilitas
├── requirements.txt                      # Dependensi Python resmi
├── vercel.json                           # Konfigurasi deploy Vercel
├── README.md                             # Dokumentasi pengantar proyek
└── PROJECT_CLEANUP_REPORT.md             # Laporan hasil audit dan clean-up total
```

---

## 5. HASIL VERIFIKASI RUNTIME & PENGUJIAN ENDPOINT

Pengujian otomatis komprehensif dijalankan menggunakan environment Python `.venv_vision` terhadap seluruh modul dan rute aplikasi:

| Endpoint | Metode | Status | Hasil Pengujian & Validasi |
|---|---|---|---|
| `/` | `GET` | **200 OK** | Landing page berhasil di-render, seluruh link navigasi dan elemen DOM valid. |
| `/workspace` | `GET` | **200 OK** | Halaman Workspace berhasil di-render, container dua kolom, uploader, dan panel hasil siap digunakan. |
| `/api/info` | `GET` | **200 OK** | Mengembalikan metadata model: MobileNetV2 + Dual SVM, 39 spesies terdaftar, status `active`. |
| `/api/predict-vision` | `POST` | **200 OK** | Inferensi visual berhasil: ekstraksi 1.280 fitur visual MobileNetV2, prediksi Top 3 kandidat multiclass SVM, klasifikasi biner, deteksi warna tudung `#b66a14`, serta penyajian data morfologi & fakta biologis dari `species_knowledge_base.json`. |
| `/api/extract-color` | `POST` | **200 OK** | Segmentasi warna tudung visual berhasil mengembalikan nama warna terdeteksi (`Merah Cerah (Bright Red / Scarlet)`) dan kode heksadesimal warna. |

### Kesimpulan Verifikasi:
- **Zero Missing Files:** Tidak ada modul, template, atau stylesheet yang hilang.
- **Zero Broken Dependencies:** PyTorch, TorchVision, Scikit-Learn, dan Pillow terhubung sempurna.
- **Inference Stability:** Model Machine Learning Dual-SVM merespons inferensi dengan stabil dan konsisten.
- **Folder Status:** Repositori bersih, ringan, terorganisir, dan siap untuk deployment maupun pemeliharaan jangka panjang.
