# SHROOMY — DATASET ACQUISITION REPORT (PHASE 2)
*Waktu Akuisisi: 2026-11-20 00:39:44*
*Total Citra Valid: 3416 / 3400 (1964.43 MB)*

## 1. Ringkasan Pengunduhan per Spesies

| Spesies | Folder | Target | Baru | Ada | Total Valid | Gagal | Korup | Ukuran (MB) | Status |
| :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :---: |
| *Agaricus bisporus* | `agaricus_bisporus` | 300 | 0 | 300 | **300** | 0 | 0 | 98.32 MB | Tercapai |
| *Pleurotus ostreatus* | `pleurotus_ostreatus` | 350 | 11 | 346 | **357** | 0 | 0 | 201.18 MB | Tercapai |
| *Volvariella volvacea* | `volvariella_volvacea` | 300 | 10 | 299 | **309** | 0 | 0 | 102.87 MB | Tercapai |
| *Cantharellus cibarius* | `cantharellus_cibarius` | 350 | 0 | 350 | **350** | 0 | 0 | 199.38 MB | Tercapai |
| *Coprinus comatus* | `coprinus_comatus` | 350 | 2 | 348 | **350** | 0 | 0 | 212.52 MB | Tercapai |
| *Amanita muscaria* | `amanita_muscaria` | 350 | 0 | 350 | **350** | 0 | 0 | 240.76 MB | Tercapai |
| *Amanita phalloides* | `amanita_phalloides` | 350 | 2 | 348 | **350** | 0 | 0 | 194.7 MB | Tercapai |
| *Chlorophyllum molybdites* | `chlorophyllum_molybdites` | 350 | 0 | 350 | **350** | 0 | 0 | 258.79 MB | Tercapai |
| *Omphalotus illudens* | `omphalotus_illudens` | 350 | 0 | 350 | **350** | 0 | 0 | 241.64 MB | Tercapai |
| *Gyromitra esculenta* | `gyromitra_esculenta` | 350 | 0 | 350 | **350** | 0 | 0 | 214.27 MB | Tercapai |
| **TOTAL** | — | **3400** | **25** | **3391** | **3416** | **0** | **0** | **1964.43 MB** | **Lengkap** |

## 2. Verifikasi Integritas Data

1. **Validasi Pillow**: Seluruh citra bertanda `downloaded_verified` telah lulus uji `Image.open().verify()` dan pemeriksaan dimensi piksel.
2. **Integritas Hash**: Seluruh citra dihitung nilai digest kriptografis SHA-256 untuk mendeteksi kolisi duplikasi biner.
3. **Penyimpanan Modular**: Gambar tersimpan pada `dataset/raw/{folder_name}/{photo_id}.jpg` dengan penamaan id unik iNaturalist.
4. **Pelacakan Metadata**: Informasi lisensi, kontributor, dan geolokasi tersimpan utuh di `dataset/manifests/acquisition_manifest.csv`.
