# SHROOMY — FINAL DATASET AUDIT REPORT (PHASE 3)
*Waktu Audit: 2026-11-20 01:07:00*  
*Status: Audit Final Pra-Training — Lulus 100% Tanpa Catatan Kritis*  
*Integritas Data: 3.032 Citra Terkurasi, 0 Kebocoran Observasi, 0 Citra Rusak*

---

## 1. EXECUTIVE SUMMARY

Laporan ini menyajikan hasil audit teknis mendalam terhadap dataset hasil Phase 3 Shroomy (MycoLab AI). Seluruh 3.032 berkas citra pada partisi `dataset/splits/` telah diverifikasi secara individual terhadap `curated_manifest.csv`, `rejected_manifest.csv`, serta pemeriksaan keterbacaan biner menggunakan Pillow.

### Ringkasan Status Audit:
1. **Aturan Ambang Batas Resolusi**: Kode pada `curate_dataset.py` secara tegas menerapkan `width < 300 or height < 300` (**salah satu dimensi kurang dari 300 px**). Data riil pada `rejected_manifest.csv` membuktikan 191 citra berukuran $75 \times 75\text{ px}$ (kedua dimensi mini) dan 2 citra berukuran $500 \times 281\text{ px}$ serta $281 \times 500\text{ px}$ (salah satu dimensi mini).
2. **Kesesuaian Manifest vs. Disk**: Total 3.032 baris pada `curated_manifest.csv` tepat berbanding 1:1 dengan 3.032 berkas fisik di `dataset/curated/` dan 3.032 berkas fisik di `dataset/splits/` (**0 selisih / mismatch**).
3. **Keterwakilan Kelas**: Seluruh **10 kelas spesies hadir 100% pada ketiga partisi** (Train, Validation, dan Testing).
4. **Bebas Kebocoran Observasi**: Pengujian iris himpunan (*set intersection*) `observation_id` antar partisi menghasilkan **tepat 0 kebocoran** (Train $\cap$ Val = $\emptyset$, Train $\cap$ Test = $\emptyset$, Val $\cap$ Test = $\emptyset$).
5. **Keterbacaan Citra**: Seluruh 3.032 citra diuji coba buka menggunakan Pillow `Image.open().verify()`: **0 file korup, 0 format cacat, 100% citra terverifikasi berformat JPEG/PNG dalam ruang warna RGB**.

---

## 2. AUDIT ATURAN RESOLUSI & REKONSILIASI LAPORAN

### 2.1 Pemeriksaan Kode `curate_dataset.py`
Pada berkas `curate_dataset.py` (baris 214–217):
```python
elif it["width_actual"] < MIN_DIMENSION or it["height_actual"] < MIN_DIMENSION:
    res_pids.add(it["photo_id"])
    it["rejection_reason"] = f"low_resolution: {it['width_actual']}x{it['height_actual']} < {MIN_DIMENSION}px"
    rejected_records.append(it)
```
- Variabel konstanta: `MIN_DIMENSION = 300`.
- Operator logika: `or` (disjungsi).
- **Kesimpulan Teknis**: Aturan yang benar-benar diterapkan adalah **menolak gambar jika salah satu dimensinya (lebar ATAU tinggi) kurang dari 300 piksel**.

### 2.2 Distribusi Riil Citra Ditolak pada `rejected_manifest.csv`
Audit terhadap seluruh 193 entri berkategori `low_resolution` pada [rejected_manifest.csv](file:///c:/Users/Fahry/jamoor/dataset/manifests/rejected_manifest.csv) mencatat distribusi dimensi fisik berikut:

| Dimensi Aktual (px) | Jumlah Citra | Kondisi Lebar (<300) | Kondisi Tinggi (<300) | Karakteristik Citra |
| :---: | ---: | :---: | :---: | :--- |
| **$75 \times 75$** | **191** | True | True | Thumbnail iNaturalist square (resolusi terlalu rendah untuk input CNN $224 \times 224$) |
| **$500 \times 281$** | **1** | False | True | Citra ultra-widescreen (tinggi 281 px < 300 px) |
| **$281 \times 500$** | **1** | True | False | Citra vertikal sempit (lebar 281 px < 300 px) |
| **TOTAL** | **193** | — | — | **100% Sesuai Aturan Kode** |

> [!NOTE]
> **Rekonsiliasi Teks Laporan**:
> Penjelasan pada [curation_report.md](file:///c:/Users/Fahry/jamoor/dataset/reports/curation_report.md) bagian Metodologi telah diselaraskan secara eksplisit untuk menegaskan bahwa batas minimum berlaku jika salah satu dimensi $< 300\text{ px}$, yang didominasi oleh 191 thumbnail $75 \times 75\text{ px}$ dan 2 citra berdimensi sempit.

---

## 3. VERIFIKASI KESESUAIAN MANIFEST VS. DISK FISIK

Setiap subfolder pada direktori `dataset/splits/` dihitung secara independen dan dicocokkan terhadap baris [curated_manifest.csv](file:///c:/Users/Fahry/jamoor/dataset/manifests/curated_manifest.csv):

| Partisi Split | Subfolder Spesies | Target Folder Nama | Jumlah Manifest | File Aktual di Disk | Status Verifikasi |
| :---: | :--- | :--- | ---: | ---: | :---: |
| **train** | *Agaricus bisporus* | `agaricus_bisporus` | 138 | 138 | **SESUAI** |
| **train** | *Amanita muscaria* | `amanita_muscaria` | 236 | 236 | **SESUAI** |
| **train** | *Amanita phalloides* | `amanita_phalloides` | 227 | 227 | **SESUAI** |
| **train** | *Cantharellus cibarius* | `cantharellus_cibarius` | 211 | 211 | **SESUAI** |
| **train** | *Chlorophyllum molybdites* | `chlorophyllum_molybdites` | 237 | 237 | **SESUAI** |
| **train** | *Coprinus comatus* | `coprinus_comatus` | 237 | 237 | **SESUAI** |
| **train** | *Gyromitra esculenta* | `gyromitra_esculenta` | 239 | 239 | **SESUAI** |
| **train** | *Omphalotus illudens* | `omphalotus_illudens` | 230 | 230 | **SESUAI** |
| **train** | *Pleurotus ostreatus* | `pleurotus_ostreatus` | 234 | 234 | **SESUAI** |
| **train** | *Volvariella volvacea* | `volvariella_volvacea` | 134 | 134 | **SESUAI** |
| *Subtotal Train* | *10 Spesies* | — | **2.123** | **2.123** | **100% SESUAI** |
| **val** | *Agaricus bisporus* | `agaricus_bisporus` | 30 | 30 | **SESUAI** |
| **val** | *Amanita muscaria* | `amanita_muscaria` | 51 | 51 | **SESUAI** |
| **val** | *Amanita phalloides* | `amanita_phalloides` | 49 | 49 | **SESUAI** |
| **val** | *Cantharellus cibarius* | `cantharellus_cibarius` | 45 | 45 | **SESUAI** |
| **val** | *Chlorophyllum molybdites* | `chlorophyllum_molybdites` | 51 | 51 | **SESUAI** |
| **val** | *Coprinus comatus* | `coprinus_comatus` | 51 | 51 | **SESUAI** |
| **val** | *Gyromitra esculenta* | `gyromitra_esculenta` | 51 | 51 | **SESUAI** |
| **val** | *Omphalotus illudens* | `omphalotus_illudens` | 49 | 49 | **SESUAI** |
| **val** | *Pleurotus ostreatus* | `pleurotus_ostreatus` | 50 | 50 | **SESUAI** |
| **val** | *Volvariella volvacea* | `volvariella_volvacea` | 29 | 29 | **SESUAI** |
| *Subtotal Val* | *10 Spesies* | — | **456** | **456** | **100% SESUAI** |
| **test** | *Agaricus bisporus* | `agaricus_bisporus` | 29 | 29 | **SESUAI** |
| **test** | *Amanita muscaria* | `amanita_muscaria` | 50 | 50 | **SESUAI** |
| **test** | *Amanita phalloides* | `amanita_phalloides` | 48 | 48 | **SESUAI** |
| **test** | *Cantharellus cibarius* | `cantharellus_cibarius` | 46 | 46 | **SESUAI** |
| **test** | *Chlorophyllum molybdites* | `chlorophyllum_molybdites` | 51 | 51 | **SESUAI** |
| **test** | *Coprinus comatus* | `coprinus_comatus` | 50 | 50 | **SESUAI** |
| **test** | *Gyromitra esculenta* | `gyromitra_esculenta` | 51 | 51 | **SESUAI** |
| **test** | *Omphalotus illudens* | `omphalotus_illudens` | 50 | 50 | **SESUAI** |
| **test** | *Pleurotus ostreatus* | `pleurotus_ostreatus` | 50 | 50 | **SESUAI** |
| **test** | *Volvariella volvacea* | `volvariella_volvacea` | 28 | 28 | **SESUAI** |
| *Subtotal Test* | *10 Spesies* | — | **453** | **453** | **100% SESUAI** |
| **TOTAL KESELURUHAN** | — | — | **3.032** | **3.032** | **0 MISMATCH** |

---

## 4. VERIFIKASI KETERWAKILAN 10 KELAS PADA SETIAP PARTISI

Pengujian keberadaan kelas menunjukkan bahwa tidak ada partisi yang kehilangan satu pun kelas target (*zero-sample classes*):
- **Training Set (70.02%)**: **10 / 10 Kelas Hadir**. Rentang jumlah citra: $134$ (*Volvariella volvacea*) hingga $239$ (*Gyromitra esculenta*).
- **Validation Set (15.04%)**: **10 / 10 Kelas Hadir**. Rentang jumlah citra: $29$ (*Volvariella volvacea*) hingga $51$ (*Amanita muscaria*, *Coprinus comatus*, *Gyromitra esculenta*, *Chlorophyllum molybdites*).
- **Testing Set (14.94%)**: **10 / 10 Kelas Hadir**. Rentang jumlah citra: $28$ (*Volvariella volvacea*) hingga $51$ (*Chlorophyllum molybdites*, *Gyromitra esculenta*).

---

## 5. VERIFIKASI KEBOCORAN OBSERVASI (*OBSERVATION_ID LEAKAGE*)

Pengelompokan citra berbasis `observation_id` dievaluasi melalui operasi irisan himpunan id observasi unik:
- **Jumlah Observasi Unik Partisi Train**: **1.016 observasi**
- **Jumlah Observasi Unik Partisi Validation**: **207 observasi**
- **Jumlah Observasi Unik Partisi Testing**: **210 observasi**

### Hasil Evaluasi Irisan Himpunan:
$$\text{Obs}_{\text{Train}} \cap \text{Obs}_{\text{Val}} = \emptyset \quad (\text{Ukuran Irisan} = 0)$$
$$\text{Obs}_{\text{Train}} \cap \text{Obs}_{\text{Test}} = \emptyset \quad (\text{Ukuran Irisan} = 0)$$
$$\text{Obs}_{\text{Val}} \cap \text{Obs}_{\text{Test}} = \emptyset \quad (\text{Ukuran Irisan} = 0)$$

> **Hasil**: **TERKONFIRMASI 100% BEBAS KEBOCORAN OBSERVASI**. Seluruh foto yang berasal dari individu spesimen atau koloni jamur yang sama strictly berada pada satu partisi saja.

---

## 6. VERIFIKASI INTEGRITAS BINER & KETERBACAAN SELURUH CITRA

Skrip audit menjalankan pengujian buka dan verifikasi menggunakan Pillow pada seluruh 3.032 berkas citra di dalam direktori `dataset/splits/`:
- **File Korup / Tidak Lengkap**: **0 file** (0.0%)
- **File Gagal Dekode RGB**: **0 file** (0.0%)
- **File dengan Dimensi Nol**: **0 file** (0.0%)
- **Tingkat Keterbacaan**: **100.0% (3.032 dari 3.032 citra valid penuh)**

---

## 7. KESIMPULAN & STATUS KELAYAKAN TRAINING

```
+---------------------------------------------------------------------------------------------------------+
| HASIL AUDIT FINAL PHASE 3 SHROOMY:                                                                     |
| DATASET TERKURASI DINYATAKAN LULUS UJI KELAYAKAN 100% DAN SIAP DIGUNAKAN UNTUK TRAINING (PHASE 4)       |
+---------------------------------------------------------------------------------------------------------+
| 1. Total Citra Siap Pakai   : 3.032 Citra Terkurasi (10 Spesies)                                        |
| 2. Partisi Training          : 2.123 Citra (70,02%)                                                      |
| 3. Partisi Validation        : 456 Citra (15,04%)                                                        |
| 4. Partisi Testing           : 453 Citra (14,94%)                                                        |
| 5. Kebocoran Data            : 0 Observasi (Bebas Kebocoran)                                             |
| 6. Keterbacaan File          : 3.032 / 3.032 Citra Lolos Validasi Pillow RGB                            |
+---------------------------------------------------------------------------------------------------------+
```

---
*Laporan ini disimpan di `dataset/reports/final_dataset_audit.md` sebagai bukti validasi pra-latih resmi.*
