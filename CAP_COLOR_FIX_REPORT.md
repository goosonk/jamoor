# CAP COLOR DETECTION FIX REPORT — SHROOMY VISION ENGINE

**Tanggal Implementasi:** 24 November 2026  
**Workspace:** `C:\Users\Fahry\jamoor`  
**Acuan Audit:** `MODEL_QUALITY_AUDIT_REPORT.md`

---

## 1. RINGKASAN PERUBAHAN KODE PADA `vision_classifier.py`

Perbaikan dilakukan secara terisolasi pada fungsi **`classify_color_nuanced()`** dan **`segment_cap_region()`** di dalam `vision_classifier.py` tanpa mengubah model MobileNetV2, kedua model SVM (`model_biner_svm.joblib` & `model_species_multiclass.joblib`), pipeline preprocessing inferensi CNN, maupun kode UI/endpoint API.

### A. Perbaikan `classify_color_nuanced(rgb)` (`vision_classifier.py` baris 50–150)
1. **Pemisahan Cokelat Tua/Gelap dari Merah Tua/Marun:**
   - Sebelumnya, aturan `(h >= 345 or h < 24) or is_strongly_red` dengan `v < 0.38` dan `s > 0.30` mengklasifikasikan piksel tanah, daun kering, serpihan kayu, dan bayangan gelap (`RGB=[81, 52, 44]` / `#51342c` dengan `H=13.0°, S=0.46, V=0.32` atau `#543b29` dengan `H=25.1°`) sebagai **`"Merah Tua / Marun (Dark Red/Maroon)"`**.
   - Kini, kategori `"Merah Tua / Marun (Dark Red/Maroon)"` pada kecerahan rendah (`v < 0.40`) hanya diberikan apabila rona berada pada merah/crimson murni (`h >= 342.0°` atau `h < 9.0°`) dengan saturasi `s >= 0.50` dan rasio `r > g * 1.75`. Piksel gelap pada rona hangat `9° <= h < 45°` dikategorikan secara akurat sebagai **`"Cokelat Tua / Gelap (Dark Brown)"`**.
2. **Penghapusan Bias `is_strongly_red` pada Rona Oranye, Kuning, dan Cokelat Pucat:**
   - Sebelumnya, warna kelopak kuning-oranye (`#b66a14`, `H=31.9°`) dikategorikan sebagai `"Merah Cerah"`, dan warna krem-cokelat keabu-abuan (`#7c6b62`, `H=20.8°, S=0.21` atau `#a67f7a`, `H=6.8°, S=0.27`) dikategorikan sebagai `"Merah (Red)"`.
   - Kini, kategori `"Merah Cerah"` dan `"Merah"` dibatasi pada rona merah sejati (`h >= 340°` atau `h < 12°`, atau `12° <= h < 19°` dengan `v >= 0.42`, `s >= 0.50`, `r > g * 1.62`), sedangkan saturasi rendah-sedang (`s < 0.36`) pada rona hangat dikategorikan sebagai **`"Cokelat Kemerahan (Reddish Brown)"`** atau **`"Krem / Buff"`**, dan rona `23° <= h < 36°` dengan saturasi tinggi dikategorikan sebagai **`"Oranye (Orange)"`**.

### B. Perbaikan `segment_cap_region(self, pil_image)` (`vision_classifier.py` baris 254–493)
1. **Evaluasi Multi-Zona ROI Vertikal Secara Adaptif (Dalam Amplop `y: 12%–86%, x: 14%–86%`):**
   - Menggantikan kotak statis `y: 10%–65%` yang memotong tudung di bagian bawah gambar.
   - Menghitung profil *row salience* vertikal (jarak warna terhadap 4 klaster margin tepi $\times$ penguat saturasi $\times$ prior horizontal tengah di luar piksel daun hijau) untuk memilih secara adaptif di antara 4 kandidat zona vertikal:
     - `upper_center` (`y: 14%–62%`): untuk foto jamur tampak samping dengan latar tanah/serasah di bagian bawah.
     - `core_center` (`y: 20%–76%`): untuk foto jamur terpusat di tengah bingkai.
     - `lower_center` (`y: 30%–85%`): untuk foto *top-down* di mana tudung jamur berada di bagian tengah-bawah (seperti `amanita_muscaria/764650132.jpg`).
     - `full_center` (`y: 15%–85%`): untuk spesimen besar yang memenuhi bingkai vertikal.
2. **Penerapan 2D Center-Weighted Spatial Mask (Gaussian):**
   - Setiap piksel di dalam ROI diberi bobot spasial Gaussian 2D $W_{\text{spatial}}(y, x) = \exp\left(-0.5 \left[\left(\frac{y/H - c_y}{\sigma_y}\right)^2 + \left(\frac{x/W - 0.50}{0.24}\right)^2\right]\right)$ yang digunakan baik pada ambang jarak foreground (`weighted_bg_dist`) maupun sebagai `sample_weight` pada `KMeans(n_clusters=4)`.
3. **Reduksi Piksel Bayangan Gelap Secara Adaptif:**
   - Apabila objek foreground memiliki $\ge 30\%$ piksel dengan kecerahan cukup ($V \ge 0.36$), piksel bayangan sela-sela yang sangat gelap ($V < 0.24$) disaring keluar dari masker foreground. Sebaliknya, apabila tudung jamur memang berwarna gelap secara keseluruhan (`bright_ratio < 0.30`), piksel gelap tersebut tetap dipertahankan.
4. **Penggabungan Sub-Cluster Sejenis & Penghapusan Filter `split()[0]`:**
   - Menggunakan `KMeans(n_clusters=4)` diikuti penggabungan (*merging*) sub-cluster yang memiliki nama kategori warna identik (misal bagian tudung merah yang terkena sinar matahari langsung dan bagian tudung merah yang teduh), sehingga persentase area warna tudung utama terakumulasi secara utuh (`62.5%` pada `764650132.jpg`).
   - Menghapus filter `candidate_sec_name.split()[0] != primary_name.split()[0]` dan menggantinya dengan evaluasi seluruh kandidat cluster sekunder (`cluster_info[1:]`) berdasarkan jarak kontras RGB (`rgb_dist > 38.0`), perbedaan kategori warna, dan signifikansi area (`area_pct >= 10.0%`).
5. **Penyertaan Informasi RGB, HEX, Nama Warna, dan Persentase Area:**
   - Mempertahankan seluruh field output lama sekaligus menambahkan `area_percentage` (`primary_area_pct`), `weighted_area_percentage` (`weighted_area_pct`), `secondary_rgb`, `secondary_area_percentage` (`secondary_area_pct`), `roi_zone`, dan rincian `clusters`.

---

## 2. HASIL PENGUJIAN SEBELUM DAN SESUDAH PERBAIKAN (10 CITRA LINTAS SPESIES)

| # | Gambar Uji | Sebelum Perbaikan (Warna Utama, HEX, Sekunder) | Sesudah Perbaikan (Warna Utama, HEX, RGB, Area %, Sekunder & Zona ROI) | Asal Warna Sesudah Perbaikan | Evaluasi Klasifikasi Warna |
|---|---|---|---|---|---|
| **1** | `amanita_muscaria/764650132.jpg` | **Utama:** `Merah Tua / Marun` (`#51342c`)<br>**Sekunder:** `None` | **Utama:** **`Merah Cerah (Bright Red / Scarlet)`** (`#930d22`, `RGB=[147, 13, 34]`, **Area: `62.5%`**, Weighted: `61.9%`)<br>**Sekunder:** **`Putih (White)`** (`#c5babe`, `RGB=[197, 186, 190]`, **Area: `16.8%`**)<br>**Tekstur:** `Scaly / Bintik Putih`<br>**Zona:** `lower_center (y:30%-85%)` | **Tudung Jamur** (Tudung merah cerah `#930d22` + bintik kutil velum putih `#c5babe`) | **Akurat** (Daun kering & bayangan `#51342c` tereliminasi) |
| **2** | `amanita_muscaria/764696884.jpg` | **Utama:** `Merah (Red)` (`#a18379` — abu-abu kecokelatan)<br>**Sekunder:** `Abu-abu Gelap` (`#4d4644`) | **Utama:** **`Merah Cerah (Bright Red / Scarlet)`** (`#e08668`, `RGB=[224, 134, 104]`, **Area: `32.8%`**, Weighted: `37.8%`)<br>**Sekunder:** **`Krem / Buff (Buff/Cream)`** (`#e0c4b7`, `RGB=[224, 196, 183]`, **Area: `14.0%`**)<br>**Tekstur:** `Scaly / Bintik Putih`<br>**Zona:** `core_center (y:20%-76%)` | **Tudung Jamur** (Tudung merah-oranye terang + sisa velum krem-putih di atas tudung) | **Akurat** (Tidak lagi tercampur batu/ranting latar) |
| **3** | `static/img/specimen-amanita.jpg` *(Foto Bunga Matahari)* | **Utama:** `Merah Cerah` (`#b66a14` — salah label)<br>**Sekunder:** `Putih` (`#bec8d4` — langit) | **Utama:** **`Oranye (Orange)`** (`#b76914`, `RGB=[183, 105, 20]`, **Area: `70.7%`**, Weighted: `72.3%`)<br>**Sekunder:** **`Cokelat Tua / Gelap (Dark Brown)`** (`#5b2611`, `RGB=[91, 38, 17]`, **Area: `10.5%`**)<br>**Zona:** `upper_center (y:14%-62%)` | **Mahkota & Cakram Tengah Objek** (Kelopak kuning-oranye `#b76914` + cakram cokelat tua `#5b2611`) | **Akurat** (`#b76914` tidak lagi salah dilabeli Merah Cerah, dan `#5b2611` tidak lagi salah dilabeli Merah Marun) |
| **4** | `agaricus_bisporus/354029596.jpg` | **Utama:** `Hitam / Kehitaman` (`#252625` — tanah hitam)<br>**Sekunder:** `Abu-abu Terang` (`#908179`) | **Utama:** **`Putih (White)`** (`#d2d4da`, `RGB=[210, 212, 218]`, **Area: `34.8%`**, Weighted: `33.7%`)<br>**Sekunder:** **`Cokelat (Brown)`** (`#7b6862`, `RGB=[123, 104, 98]`, **Area: `26.2%`**)<br>**Zona:** `upper_center (y:14%-62%)` | **Badan Buah & Tudung Jamur** (Tangkai/tepi tudung putih `#d2d4da` + permukaan tudung cokelat cremini `#7b6862`) | **Akurat** (Tanah hitam `#252625` berhasil ditekan dari #1 menjadi 9.2%) |
| **5** | `amanita_phalloides/755965447.jpg` | **Utama:** `Merah (Red)` (`#7c6b62` — salah label serasah pinus)<br>**Sekunder:** `Abu-abu Terang` (`#bdb1b9`) | **Utama:** **`Putih (White)`** (`#ccc9d2`, `RGB=[204, 201, 210]`, **Area: `54.5%`**, Weighted: `57.1%`)<br>**Sekunder:** **`Abu-abu Terang (Light Gray)`** (`#877a7d`, `RGB=[135, 122, 125]`, **Area: `45.5%`**)<br>**Zona:** `lower_center (y:30%-85%)` | **Tudung Bawah / Insang & Batang Putih Jamur** (`54.5%` area putih `#ccc9d2`) | **Akurat** (Kesalahan klasifikasi `#7c6b62` sebagai `"Merah"` teratasi) |
| **6** | `cantharellus_cibarius/745923629.jpg` | **Utama:** `Merah (Red)` (`#a67f7a` — salah label)<br>**Sekunder:** `None` | **Utama:** **`Cokelat Kemerahan (Reddish Brown)`** (`#ae817b`, `RGB=[174, 129, 123]`, **Area: `64.9%`**, Weighted: `66.4%`)<br>**Sekunder:** **`Krem / Buff (Buff/Cream)`** (`#e5bcb0`, `RGB=[229, 188, 176]`, **Area: `25.4%`**)<br>**Zona:** `upper_center (y:14%-62%)` | **Tudung Krem-Kekuningan (`#e5bcb0`) & Tangan (`#ae817b`)** *(Catatan: tangan mendominasi >65% frame)* | **Bebas Salah Label Merah** (`#ae817b` tidak lagi dikategorikan sebagai `"Merah (Red)"`) |
| **7** | `chlorophyllum_molybdites/756013654.jpg` | **Utama:** `Kuning / Emas` (`#ae995a` — daun kering)<br>**Sekunder:** `Putih` (`#cdcac0`) | **Utama:** **`Putih (White)`** (`#c9cecf`, `RGB=[201, 206, 207]`, **Area: `34.0%`**, Weighted: `34.8%`)<br>**Sekunder:** **`Cokelat Terang / Kayu Manis (Cinnamon/Tan)`** (`#c8ab67`, `RGB=[200, 171, 103]`, **Area: `39.1%`**)<br>**Zona:** `upper_center (y:14%-62%)` | **Tudung Jamur** (Tudung putih `#c9cecf` dengan umbo dan sisik cokelat kayu manis `#c8ab67`) | **Akurat** (Warna utama kini menangkap permukaan putih tudung jamur) |
| **8** | `coprinus_comatus/763635548.jpg` | **Utama:** `Abu-abu Terang` (`#7b7b71`)<br>**Sekunder:** `Putih` (`#d3cfca`) | **Utama:** **`Abu-abu Terang (Light Gray)`** (`#99968f`, `RGB=[153, 150, 143]`, **Area: `44.6%`**, Weighted: `46.6%`)<br>**Sekunder:** **`Putih (White)`** (`#e4ded6`, `RGB=[228, 222, 214]`, **Area: `28.7%`**)<br>**Zona:** `core_center (y:20%-76%)` | **Tudung Jamur** (Tudung abu-abu berdelikuesensi `#99968f` dan puncak tudung putih `#e4ded6`) | **Akurat** |
| **9** | `pleurotus_ostreatus/761203896.jpg` | **Utama:** `Abu-abu Gelap` (`#4c4341` — celah kulit kayu)<br>**Sekunder:** `None` | **Utama:** **`Cokelat (Brown)`** (`#70625b`, `RGB=[112, 98, 91]`, **Area: `32.3%`**, Weighted: `34.3%`)<br>**Sekunder:** **`Putih (White)`** (`#d3c6c6`, `RGB=[211, 198, 198]`, **Area: `25.9%`**)<br>**Zona:** `upper_center (y:14%-62%)` | **Tudung & Insang Jamur Tiram** (Tudung cokelat keabu-abuan `#70625b` + insang putih `#d3c6c6`) | **Akurat** (Bayangan celah kulit kayu `#463937` berhasil ditekan ke peringkat terakhir) |
| **10** | `volvariella_volvacea/296268195.jpg` | **Utama:** `Merah Tua / Marun` (`#543b29` — salah label)<br>**Sekunder:** `Krem / Buff` (`#b19275`) | **Utama:** **`Krem / Buff (Buff/Cream)`** (`#d6b997`, `RGB=[214, 185, 151]`, **Area: `46.5%`**, Weighted: `48.7%`)<br>**Sekunder:** **`Cokelat Tua / Gelap (Dark Brown)`** (`#5f402b`, `RGB=[95, 64, 43]`, **Area: `30.6%`**)<br>**Zona:** `upper_center (y:14%-62%)` | **Tudung Jamur Merang** (Tudung krem-kecokelatan terang `#d6b997` + puncak umbo cokelat gelap `#5f402b`) | **Akurat** (`#5f402b` tidak lagi salah dilabeli sebagai `"Merah Tua / Marun"`) |

---

## 3. RINCIAN CLUSTER PADA `amanita_muscaria/764650132.jpg` (SEBELUM VS SESUDAH)

### Sebelum Perbaikan (`ROI Statis y: 10%–65%`, `k=3` tanpa Center-Weight):
- **Rank #1 (Terpilih salah):** `Merah Tua / Marun (Dark Red/Maroon)` — `HEX #51342c`, `RGB=[81, 52, 44]`, Area: `44.2%` *(berasal dari daun kering cokelat dan bayangan gelap di bagian atas gambar `y: 10%–40%`)*.
- **Rank #2 (Dibuang oleh `split()[0]`):** `Merah Cerah (Bright Red / Scarlet)` — `HEX #ae0b25`, `RGB=[174, 11, 37]`, Area: `33.0%` *(tudung merah asli, gagal menjadi warna sekunder karena sama-sama diawali kata `"Merah"`)*.
- **Rank #3 (Tidak diperiksa):** `Abu-abu Terang (Light Gray)` — `HEX #aea09d`, `RGB=[174, 160, 157]`, Area: `22.8%` *(bintik putih velum)*.

### Sesudah Perbaikan (`Zona Adaptif lower_center y: 30%–85%`, `2D Gaussian Center-Weight`, `Shadow Filter`, `Merged k=4`):
- **Rank #1 (Warna Utama Terpilih):** **`Merah Cerah (Bright Red / Scarlet)`** — **`HEX #930d22`**, `RGB=[147, 13, 34]`, **Area: `62.5%`** (`Weighted Area: 61.9%`, `Score: 0.6637`) *(berasal murni dari tudung merah *Amanita muscaria*)*.
- **Rank #2 (Warna Sekunder Terpilih):** **`Putih (White)`** — **`HEX #c5babe`**, `RGB=[197, 186, 190]`, **Area: `16.8%`** (`Weighted Area: 17.8%`, `Score: 0.1937`) *(berasal dari bintik-bintik kutil putih velum di atas tudung merah)*.
- **Rank #3 (Sisa Ranting Rumput Kering):** `Cokelat Kemerahan (Reddish Brown)` — `HEX #846466`, `RGB=[132, 100, 102]`, Area: `20.7%` (`Score: 0.1192`).
- **Tekstur Permukaan Terdeteksi:** **`Scaly / Bintik Putih (Sisa Velum / Bintik Kutil)`**.

---

## 4. DAFTAR FILE YANG DIUBAH / DIBUAT

1. **`C:\Users\Fahry\jamoor\vision_classifier.py`** *(Diubah)* — Perbaikan fungsi `classify_color_nuanced()`, perbaikan algoritma `segment_cap_region()`, dan penambahan metadata persentase area warna pada dictionary `detected_cap_color`.
2. **`C:\Users\Fahry\jamoor\CAP_COLOR_FIX_REPORT.md`** *(Dibuat)* — Dokumentasi teknis perbaikan dan hasil pengujian komparatif sebelum vs sesudah.

*(Tidak ada file model, dataset, endpoint API, template HTML, CSS, maupun JavaScript frontend yang diubah).*
