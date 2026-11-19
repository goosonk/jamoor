# SHROOMY — DATASET CURATION & PREPARATION REPORT (PHASE 3)
*Waktu Kurasi: 2026-11-20 00:59:09*
*Total Raw: 3416 citra | Lolos Kurasi: 3032 citra (88.76%) | Ditolak: 384 citra*

## 1. Ringkasan Kurasi Kualitas per Spesies

| Spesies Target | Folder | Raw | Mini (<300px) | Blur (<100) | Near-Dupe (<=6) | **Lolos Kurasi** | Retensi (%) |
| :--- | :--- | ---: | ---: | ---: | ---: | ---: | :---: |
| *Agaricus bisporus* | `agaricus_bisporus` | 300 | 88 | 13 | 2 | **197** | 65.7% |
| *Amanita muscaria* | `amanita_muscaria` | 350 | 0 | 7 | 6 | **337** | 96.3% |
| *Amanita phalloides* | `amanita_phalloides` | 350 | 0 | 26 | 0 | **324** | 92.6% |
| *Cantharellus cibarius* | `cantharellus_cibarius` | 350 | 0 | 48 | 0 | **302** | 86.3% |
| *Chlorophyllum molybdites* | `chlorophyllum_molybdites` | 350 | 2 | 9 | 0 | **339** | 96.9% |
| *Coprinus comatus* | `coprinus_comatus` | 350 | 0 | 11 | 1 | **338** | 96.6% |
| *Gyromitra esculenta* | `gyromitra_esculenta` | 350 | 0 | 9 | 0 | **341** | 97.4% |
| *Omphalotus illudens* | `omphalotus_illudens` | 350 | 0 | 21 | 0 | **329** | 94.0% |
| *Pleurotus ostreatus* | `pleurotus_ostreatus` | 357 | 0 | 23 | 0 | **334** | 93.6% |
| *Volvariella volvacea* | `volvariella_volvacea` | 309 | 103 | 12 | 3 | **191** | 61.8% |
| **TOTAL** | — | **3416** | **193** | **179** | **12** | **3032** | **88.8%** |

## 2. Ringkasan Pembagian Dataset (Group-Stratified Split)

*Pembagian mengelompokkan `observation_id` secara atomik (0% kebocoran observasi antar partisi).*

| Spesies Target | Total Curated | Training (70%) | Validation (15%) | Testing (15%) | Proporsi Train |
| :--- | ---: | ---: | ---: | ---: | :---: |
| *Agaricus bisporus* | 197 | 138 | 30 | 29 | 70.1% |
| *Amanita muscaria* | 337 | 236 | 51 | 50 | 70.0% |
| *Amanita phalloides* | 324 | 227 | 49 | 48 | 70.1% |
| *Cantharellus cibarius* | 302 | 211 | 45 | 46 | 69.9% |
| *Chlorophyllum molybdites* | 339 | 237 | 51 | 51 | 69.9% |
| *Coprinus comatus* | 338 | 237 | 51 | 50 | 70.1% |
| *Gyromitra esculenta* | 341 | 239 | 51 | 51 | 70.1% |
| *Omphalotus illudens* | 329 | 230 | 49 | 50 | 69.9% |
| *Pleurotus ostreatus* | 334 | 234 | 50 | 50 | 70.1% |
| *Volvariella volvacea* | 191 | 134 | 29 | 28 | 70.2% |
| **TOTAL** | **3032** | **2123** (70.02%) | **456** (15.04%) | **453** (14.94%) | **100%** |

## 3. Metodologi & Parameter Kurasi

1. **Penyaringan Resolusi Mini**: Menolak citra yang memiliki salah satu dimensi (lebar atau tinggi) < 300 px (karena tidak layak untuk ekstraksi fitur model input 224x224). Dari 193 citra yang ditolak: 191 citra merupakan thumbnail 75x75 px (kedua dimensi < 300 px), dan 2 citra memiliki salah satu dimensi < 300 px (500x281 px dan 281x500 px).
2. **Penyaringan Blur**: Menggunakan konvolusi variansi operator Laplacian ($\sigma^2_{\text{Laplace}}$) pada citra berskala maksimal 1024 piksel. Batas ambang bawah $\sigma^2_{\text{Laplace}} < 100.0$ menolak 179 citra yang mengalami keburaman gerak (*motion blur*) atau salah fokus ekstrem.
3. **Deduplikasi Perceptual (Near-Duplicate)**: Menggunakan pHash 64-bit berbasis 2D-DCT. Pasangan citra dengan jarak Hamming $\le 6$ diidentifikasi; citra dengan ketajaman lebih tinggi dipertahankan dan kembaran yang lebih buram dieliminasi (12 citra).
4. **Integritas Format**: Seluruh 3.032 citra lolos kurasi terverifikasi utuh didekode dalam ruang warna RGB oleh Pillow tanpa korupsi biner.
5. **Anti-Data Leakage Split**: Dijalankan secara atomik berbasis `observation_id`. Tidak ada satu pun observasi yang fotonya terpecah ke partisi Train, Val, atau Test.
