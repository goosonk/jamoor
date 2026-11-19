# SHROOMY — DRY-RUN DATASET AUDIT REPORT (v2.2)
*Waktu Audit: 2026-11-20 00:16:12*
*Mode Operasi: DRY RUN (Penyaringan Metadata iNaturalist Research Grade)*

| Spesies | Foto ditemukan | Lisensi diterima | Resolusi lolos | Duplikat | Blur ditolak | Foto layak | Status Target |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | :---: |
| *Agaricus bisporus* | 570 | 444 | 422 | 0 | 0 | **422** | Memenuhi target |
| *Pleurotus ostreatus* | 679 | 529 | 529 | 0 | 0 | **529** | Memenuhi target |
| *Volvariella volvacea* | 525 | 411 | 410 | 0 | 0 | **410** | Memenuhi target |
| *Cantharellus cibarius* | 514 | 433 | 433 | 0 | 0 | **433** | Memenuhi target |
| *Coprinus comatus* | 579 | 469 | 469 | 0 | 0 | **469** | Memenuhi target |
| *Amanita muscaria* | 638 | 542 | 542 | 0 | 0 | **542** | Memenuhi target |
| *Amanita phalloides* | 689 | 560 | 560 | 0 | 0 | **560** | Memenuhi target |
| *Chlorophyllum molybdites* | 737 | 587 | 587 | 0 | 0 | **587** | Memenuhi target |
| *Omphalotus illudens* | 670 | 521 | 519 | 0 | 0 | **519** | Memenuhi target |
| *Gyromitra esculenta* | 532 | 421 | 419 | 0 | 0 | **419** | Memenuhi target |

### Catatan Evaluasi Teknis:
1. **Pemeriksaan Blur**: Kolom 'Blur ditolak' bernilai 0 pada dry-run karena perhitungan variansi Laplacian ($\sigma^2_{\text{Laplace}} < 100$) mensyaratkan data piksel gambar mentah.
2. **Lisensi Individual**: Hanya foto berlisensi CC0, CC-BY, CC-BY-SA, CC-BY-NC, dan CC-BY-NC-SA yang diloloskan.
3. **Resolusi**: Seluruh foto yang lolos memiliki lebar dan tinggi $\ge 500\text{ px}$.
