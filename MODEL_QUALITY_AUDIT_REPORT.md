# MODEL QUALITY AUDIT REPORT — SHROOMY MACHINE LEARNING SYSTEM

**Tanggal Audit:** 24 November 2026  
**Workspace:** `C:\Users\Fahry\jamoor`  
**Acuan Evaluasi:** `FINAL_REAL_IMAGE_TEST_REPORT.md` & `PJBL_Jamur_FULL_END_TO_END.ipynb`  
**Status Modifikasi:** Read-only Audit (Tidak ada perubahan kode, model, dataset, atau konfigurasi).

---

## RINGKASAN EKSEKUTIF

Audit mendalam telah dilakukan terhadap 4 aspek utama kualitas sistem Machine Learning Shroomy: **(1) Class Mapping**, **(2) Preprocessing & Feature Extraction**, **(3) Pola Kesalahan Prediksi pada 9 Gambar Uji**, dan **(4) Algoritma Deteksi Warna Tudung (`segment_cap_region`)**.

### Temuan Utama yang Berhasil Dibuktikan:
1. **Tidak Ada Pertukaran Indeks Kelas (`classes_`) maupun Bug Preprocessing:** Urutan 39 kelas antara `model_species_multiclass.joblib`, `vision_classifier.py`, dan `species_knowledge_base.json` **100% sinkron** (urut abjad `0..38`). Pipeline preprocessing (`RGB` $\rightarrow$ `Resize(224,224)` $\rightarrow$ `ToTensor()` $\rightarrow$ `Normalize(ImageNet)`) dan ekstraksi fitur `MobileNetV2` (`1280-D` tanpa `StandardScaler`) di `vision_classifier.py` **identik secara matematis** dengan notebook pelatihan `PJBL_Jamur_FULL_END_TO_END.ipynb`.
2. **Penyebab `species_status_map.json` Memiliki 40 Entri sedangkan Model 39 Kelas:** Terbukti dari Cell 9, Cell 27, dan Cell 37 pada notebook pelatihan bahwa:
   - Spesies ke-40 yaitu **`Pholiota nameko`** hanya memiliki **4 foto** di iNaturalist sehingga **dibuang saat training multiclass** (`MIN_PER_CLASS = 100` pada Cell 27), namun tetap ikut diekspor ke `species_status_map.json` pada Cell 37.
   - Spesies indeks ke-11 (`taxon_id = 544554`) disimpan di model dengan nama query **`Boletus satanas`**, tetapi di `species_status_map.json` disimpan dengan nama taksonomi baru iNaturalist **`Rubroboletus satanas`**.
3. **Penyebab Utama Pola Kesalahan Prediksi pada 9 Gambar Uji:**
   - **Temuan Kritis Gambar #1 (`static/img/specimen-amanita.jpg`):** Inspeksi visual membuktikan bahwa berkas `static/img/specimen-amanita.jpg` **bukan gambar jamur *Amanita muscaria***, melainkan foto **bunga matahari (*Helianthus annuus*) berwarna kuning dengan latar langit biru**. Karena model tidak memiliki *Out-of-Distribution (OOD) / Non-Mushroom Gate*, gambar bunga matahari tetap diproses oleh SVM dan menghasilkan distribusi probabilitas datar (`entropy = 0.793`, confidence tertinggi `17.9%` pada `Boletus satanas`) yang secara tepat ditandai **`inconclusive`** (`< 50%`).
   - **Keterbatasan Arsitektur Frozen Backbone (`Acc = 67.98%`):** Pada notebook pelatihan (Cell 30–31), backbone MobileNetV2 dibekukan (*frozen*, tanpa fine-tuning pada domain jamur) dan menghasilkan akurasi test set **67.98%** (`Macro F1 = 67.94%`) untuk 39 kelas serta **79.81%** untuk klasifikasi biner.
   - **Dominasi Objek Non-Jamur & Sudut Pengambilan Citra:** Karena tidak ada *bounding-box cropper* jamur sebelum `Resize(224,224)` dan `AdaptiveAvgPool2d`, citra yang didominasi telapak tangan manusia (`cantharellus_cibarius/745923629.jpg`, >65% area adalah tangan) atau kulit batang pohon (`pleurotus_ostreatus/761203896.jpg`, ~80% area adalah kulit kayu) menggeser vektor fitur 1280-D. Selain itu, pengambilan foto dari bawah yang menyembunyikan warna tudung (`amanita_phalloides/755965447.jpg`) membuat seluruh Top-5 prediksi (`88.6%` total probabilitas) jatuh ke klaster spesies *Amanita* putih (*A. bisporigera*, *A. citrina*, *A. ocreata*, *A. phalloides*, *A. virosa*).
   - **Independensi Model Biner vs Multiclass:** Model Biner SVM (dilatih pada 6.400 citra gabungan Kaggle + iNaturalist) dan Multiclass SVM (dilatih pada 7.695 citra iNaturalist saja) berjalan secara independen tanpa kopling probabilitas, sehingga dapat menghasilkan prediksi biner yang berbeda dari status referensi spesies Top-1 ketika salah satu model salah klasifikasi atau `inconclusive`.
4. **Penyebab Tudung Merah *Amanita muscaria* (`764650132.jpg`) Menghasilkan HEX `#51342c`:**
   - Terbukti melalui penelusuran piksel dan klaster KMeans (`k=3`) bahwa warna merah cerah tudung sebenarnya **berhasil ditemukan pada Cluster 0 (Rank #2)** dengan nilai **`RGB=[174, 11, 37]` (`HEX #ae0b25`, `33.0%` / `3.599` piksel, label `"Merah Cerah (Bright Red / Scarlet)"`)**.
   - Namun, kotak ROI statis (`y: 10%–65%`) memotong bagian bawah tudung jamur (yang berada di `y: 37%–90%`) dan justru menangkap area **daun kering cokelat, tanah, serta bayangan gelap di bagian atas gambar** sebanyak **`4.827` piksel (`44.2%`, Cluster 2, `RGB=[81, 52, 44]`, `HEX #51342c`)**.
   - Lebih lanjut, fungsi `classify_color_nuanced()` salah melabeli warna cokelat gelap tanah/bayangan `#51342c` (`H=13.0°`, `S=0.46`, `V=0.32`) sebagai **`"Merah Tua / Marun"`**, dan aturan deduplikasi kata pertama (`candidate_sec_name.split()[0] != primary_name.split()[0]` $\rightarrow$ `"Merah" == "Merah"`) **membuang klaster tudung merah asli `#ae0b25`** dari warna sekunder.

---

## 1. AUDIT CLASS MAPPING

### 1.1 Struktur & Urutan `classes_` pada Multiclass SVM
Pemeriksaan langsung terhadap objek di dalam `model_species_multiclass.joblib` menunjukkan struktur dictionary dengan 3 kunci: `['model', 'classes', 'taxon_ids']`:
- **`multi_data['model']`**: `sklearn.svm._classes.SVC(C=1.0, kernel='rbf', gamma='scale', decision_function_shape='ovr', probability=True, random_state=42)`
- **`multi_clf.classes_`**: Array integer berurutan `[0, 1, 2, ..., 38]` (`39` kelas).
- **`multi_data['classes']`**: List `39` string nama spesies yang **terurut secara alfabetis sempurna** (`classes_list == sorted(classes_list)` bernilai `True`).
- **`multi_data['taxon_ids']`**: List `39` integer ID takson iNaturalist yang berkorespondensi 1-ke-1 dengan `multi_data['classes']`.

Pada notebook pelatihan `PJBL_Jamur_FULL_END_TO_END.ipynb` (**Cell 29**), pengkodean label dilakukan dengan kode berikut:
```python
classes = sorted(kept.keys(), key=lambda t: tid2name.get(t, str(t)))
cls_idx = {t: i for i, t in enumerate(classes)}
names = [tid2name.get(t, str(t)) for t in classes]
```
Dan saat inferensi di `vision_classifier.py` (**baris 203–204 & 428–430**):
```python
self._multi_clf = multi_data['model']
self._classes = list(multi_data['classes'])
...
p_multi = self._multi_clf.predict_proba(feat)[0]
top_idx = int(np.argmax(p_multi))
top_species = str(self._classes[top_idx])
```
**Bukti & Kesimpulan 1.1:** Indeks integer `0..38` pada `multi_clf.classes_` memetakan secara eksak ke `self._classes[0..38]`. **Tidak ada indeks kelas yang tertukar atau bergeser.**

---

### 1.2 Perbandingan `classes_` vs `species_knowledge_base.json` vs `species_status_map.json`

Hasil operasi himpunan (*set difference*) terhadap ketiga sumber data:

| Pemeriksaan Himpunan | Hasil Aktual | Status |
|---|---|---|
| Jumlah kelas pada `model_species_multiclass.joblib` | `39` kelas | Sinkron |
| Jumlah entri pada `species_knowledge_base.json` | `39` entri | Sinkron |
| Jumlah entri pada `species_status_map.json` | `40` entri | Selisih +1 entri |
| Ada di Model (`39`), TIDAK ada di `species_knowledge_base.json` | `set()` (Kosong — 100% tercakup) | **PASS** |
| Ada di `species_knowledge_base.json`, TIDAK ada di Model (`39`) | `set()` (Kosong — 100% identik) | **PASS** |
| Ada di Model (`39`), TIDAK ada di `species_status_map.json` | **`{'Boletus satanas'}`** (Indeks 11) | **Mismatch Sinonim** |
| Ada di `species_status_map.json` (`40`), TIDAK ada di Model (`39`) | **`{'Rubroboletus satanas', 'Pholiota nameko'}`** | **1 Sinonim + 1 Kelas Dibuang** |

---

### 1.3 Penjelasan Mengapa `species_status_map.json` Memiliki 40 Entri Sedangkan Model Memiliki 39 Kelas

Bukti dari kode dan log eksekusi `PJBL_Jamur_FULL_END_TO_END.ipynb` menjelaskan fenomena ini secara tuntas:

1. **Penghapusan Kelas `Pholiota nameko` Saat Training Multiclass (Cell 9 vs Cell 27):**
   - Pada **Cell 9**, daftar awal dirancang sebanyak **40 spesies** (`20` `EDIBLE_SPECIES` + `20` `POISONOUS_SPECIES`). Seluruh 40 spesies berhasil ditemukan ID taksonnya di API iNaturalist (`Total spesies teresolusi: 40/40`).
   - Namun, pada **Cell 27**, diterapkan filter batas minimum jumlah foto `MIN_PER_CLASS = 100`:
     ```text
     Kelas ditemukan        : 40
     Kelas dipakai (>= 100 foto): 39
     Kelas dibuang          : 1
       - Pholiota nameko (4 foto)
     ```
     Karena `Pholiota nameko` hanya berhasil diunduh sebanyak **4 foto**, kelas tersebut dibuang dari dictionary `kept`, sehingga model multiclass hanya dilatih pada **39 kelas** (`9.619` foto).
   - Sebaliknya, pada **Cell 37**, pembuatan `species_status_map.json` melakukan iterasi pada `SPECIES_MAP` awal (40 spesies) tanpa memfilter kelas yang dibuang di `kept`:
     ```python
     status_map = {}
     for lbl in ('edible', 'poisonous'):
         for nm, v in SPECIES_MAP[lbl].items():
             if v: status_map[v['matched']] = lbl
     ```
     Akibatnya, `Pholiota nameko` tetap tertulis di `species_status_map.json` sebagai entri ke-40 yang **tidak pernah digunakan oleh model**.

2. **Perbedaan Penggunaan Kunci `nm` (Nama Pencarian) vs `v['matched']` (Nama Taksonomi iNaturalist) pada `Boletus satanas` / `Rubroboletus satanas`:**
   - Saat mencari `"Boletus satanas"` di API iNaturalist (**Cell 9**), iNaturalist mengembalikan `taxon_id = 544554` dengan nama taksonomi modern yang berlaku (`v['matched']`) yaitu **`"Rubroboletus satanas"`**.
   - Pada **Cell 18 & 29**, daftar nama kelas model (`names`) dibuat menggunakan `tid2name[int(v['taxon_id'])] = nm` (nama pencarian awal: **`"Boletus satanas"`**).
   - Namun pada **Cell 37**, `species_status_map.json` dibuat menggunakan `status_map[v['matched']] = lbl` (nama hasil resolusi iNaturalist: **`"Rubroboletus satanas"`**).
   - **Dampak pada Runtime Website:** Pada `vision_classifier.py` (baris 442–448), informasi `reference_status` dan `status_category` diambil dari `self._species_kb` (`species_knowledge_base.json`), yang **sudah menggunakan kunci `"Boletus satanas"`** sehingga **tidak menimbulkan bug atau *missing status* saat inferensi**. Sementara itu, atribut `self._species_map` (`species_status_map.json`) dimuat pada baris 211 tetapi tidak dipanggil di dalam `predict()`.

---

## 2. AUDIT PREPROCESSING & FEATURE EXTRACTION

Perbandingan baris-per-baris antara `PJBL_Jamur_FULL_END_TO_END.ipynb` (**Cell 20 & Cell 38**) dan `vision_classifier.py` (**baris 178–190 & 411–425**):

| Tahap Pipeline | Notebook `PJBL_Jamur_FULL_END_TO_END.ipynb` | Implementasi `vision_classifier.py` | Status Konsistensi |
|---|---|---|---|
| **1. Pembacaan & Konversi Warna** | `Image.open(path).convert('RGB')` | `pil_img.convert('RGB')` | **100% Identik** |
| **2. Resize & Interpolasi** | `transforms.Resize((224, 224))` (Bilinear default, tanpa center crop) | `transforms.Resize((224, 224))` (Bilinear default, tanpa center crop) | **100% Identik** |
| **3. Konversi Tensor** | `transforms.ToTensor()` (skala `[0.0, 1.0]`, `[C, H, W]`) | `transforms.ToTensor()` (skala `[0.0, 1.0]`, `[C, H, W]`) | **100% Identik** |
| **4. Normalisasi ImageNet** | `transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])` | `transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])` | **100% Identik** |
| **5. Urutan Transformasi** | `Resize` $\rightarrow$ `ToTensor` $\rightarrow$ `Normalize` | `Resize` $\rightarrow$ `ToTensor` $\rightarrow$ `Normalize` | **100% Identik** |
| **6. Backbone & Bobot** | `mobilenet_v2(weights=MobileNet_V2_Weights.DEFAULT)` | `models.mobilenet_v2(weights=MobileNet_V2_Weights.DEFAULT)` | **100% Identik** |
| **7. Modifikasi Head & Mode** | `bb.classifier = nn.Identity(); bb.eval()` | `backbone.classifier = nn.Identity(); backbone.eval()` | **100% Identik** |
| **8. Feature Scaling Sebelum SVM** | **Tidak ada** (`SVC.fit(Xm_tr, ym_tr)` langsung pada vektor raw `1280-D`) | **Tidak ada** (`_multi_clf.predict_proba(feat)` langsung pada vektor raw `1280-D`) | **100% Identik** |
| **9. Versi Scikit-Learn** | `scikit-learn 1.9.1` | `scikit-learn 1.9.1` | **100% Identik** |

**Kesimpulan Bagian 2 (Proven):**  
Fitur 1.280 dimensi yang dimasukkan ke dalam model SVM saat inferensi di website **identik dengan fitur saat training di notebook**. Kesalahan prediksi pada gambar uji **bukan disebabkan oleh ketidakcocokan preprocessing kode backend**.

> **Catatan Metodologis pada Desain Preprocessing Training:** Penggunaan `transforms.Resize((224, 224))` secara langsung (tanpa *aspect-ratio preserving resize + center crop* atau *mushroom object cropping*) mendistorsi rasio aspek citra vertikal (misal `576×1024` dengan rasio `0.56:1` menjadi `1:1`) dan memasukkan seluruh latar belakang gambar ke dalam *Global Average Pooling* MobileNetV2. Namun karena model SVM dilatih dengan cara tersebut, mengubah transformasi saat inferensi tanpa melatih ulang SVM justru akan merusak distribusi fitur.

---

## 3. AUDIT HASIL PREDIKSI PADA 9 GAMBAR UJI

Untuk membuktikan penyebab perilaku prediksi pada ke-9 gambar dalam `FINAL_REAL_IMAGE_TEST_REPORT.md`, kami mengekstrak **peringkat (*rank*) dan probabilitas kelas sebenarnya (*ground-truth*) di antara ke-39 kelas**, menghitung **Normalized Shannon Entropy** ($H / \ln(39) \in [0, 1]$), serta melakukan **inspeksi visual langsung** pada ke-9 berkas gambar.

### 3.1 Tabel Diagnostik Probabilitas Ground-Truth & Karakteristik Visual 9 Gambar

| # | Nama File | Spesies Sebenarnya | Peringkat & Probabilitas Spesies Sebenarnya | Prediksi Top-1 & Confidence | Entropy ($0\text{–}1$) | Temuan Inspeksi Visual Berkas Gambar |
|---|---|---|---|---|---|---|
| **1** | `static/img/specimen-amanita.jpg` | *(Dikira Amanita muscaria dari nama file)* | Rank `#5/39` (`5.96%`) | `Boletus satanas` (`17.9%` - *inconclusive*) | **`0.793`** *(Sangat Datar)* | **BUKAN GAMBAR JAMUR.** Berkas ini ternyata adalah foto **ladang bunga matahari (*Helianthus annuus*) kuning dengan langit biru**. |
| **2** | `amanita_muscaria/764650132.jpg` | *Amanita muscaria* | **Rank `#1/39` (`98.44%`)** | **`Amanita muscaria` (`98.4%`)** | `0.034` *(Sangat Yakin)* | Foto close-up tudung merah cerah berbintik putih khas *A. muscaria* di antara rumput dan ranting kering. |
| **3** | `cantharellus_cibarius/745923629.jpg` | *Cantharellus cibarius* | Rank `#34/39` (`0.11%`) | `Entoloma sinuatum` (`25.5%` - *inconclusive*) | `0.570` *(Tidak Yakin)* | Jamur berukuran sangat kecil (`<10%` area gambar) dipegang di tengah **dua telapak tangan manusia terbuka** (`>65%` area gambar adalah kulit tangan). |
| **4** | `coprinus_comatus/763635548.jpg` | *Coprinus comatus* | Rank `#39/39` (`0.00%`) | `Coprinopsis atramentaria` (`95.4%`) | `0.070` *(Sangat Yakin)* | Jamur *Coprinus comatus* tua dalam **fase delikuesensi (meleleh menjadi tinta hitam keabu-abuan)** di atas rumput hijau, sangat mirip dengan *Coprinopsis atramentaria*. |
| **5** | `pleurotus_ostreatus/761203896.jpg` | *Pleurotus ostreatus* | Rank `#38/39` (`0.07%`) | `Pleurotus eryngii` (`63.8%`) | `0.448` *(Sedang)* | Rumpun jamur tiram abu-abu kecokelatan menempel pada **kulit batang pohon beralur kasar yang mendominasi ~80% area bingkai foto**. |
| **6** | `agaricus_bisporus/354029596.jpg` | *Agaricus bisporus* | **Rank `#1/39` (`51.95%`)** | **`Agaricus bisporus` (`52.0%`)** | `0.320` *(Cukup Yakin)* | Dua spesimen *A. bisporus* varian cokelat (cremini/portobello) di atas tanah; satu memperlihatkan insang merah muda-cokelat & cincin batang putih, satu memperlihatkan tudung cokelat. |
| **7** | `amanita_phalloides/755965447.jpg` | *Amanita phalloides* | **Rank `#4/39` (`7.34%`)** | `Amanita bisporigera` (`48.3%` - *inconclusive*) | `0.482` *(Terbagi di Genus Amanita)* | Jamur dipegang tangan **dari sudut bawah**; hanya terlihat insang putih, batang putih, cincin, dan volva putih. **Permukaan atas tudung hijau-zaitun sama sekali tidak terlihat.** |
| **8** | `chlorophyllum_molybdites/756013654.jpg` | *Chlorophyllum molybdites* | Rank `#15/39` (`0.80%`) | `Amanita ocreata` (`38.0%` - *inconclusive*) | `0.598` *(Tidak Yakin)* | Tudung putih bersisik diambil dari sudut samping-atas di tengah semak daun hijau rapat dan daun kering besar; **insang hijau diagnostik di bawah tudung tidak terlihat**. |
| **9** | `volvariella_volvacea/296268195.jpg` | *Volvariella volvacea* | **Rank `#1/39` (`30.07%`)** | **`Volvariella volvacea` (`30.1%` - *inconclusive*)** | `0.644` *(Ambang Rendah)* | Rumpun jamur merang cokelat keabu-abuan tumbuh di atas **serpihan kayu (*woodchips*) yang memiliki warna dan tekstur nyaris identik dengan tudung jamur** (kamuflase latar). |

---

### 3.2 Analisis Lima Pola Kesalahan Berdasarkan Bukti Empiris

#### A. Pola 1: Salah Spesies tetapi Masih Satu Genus / Kelompok Morfologi Serupa
1. **`amanita_phalloides/755965447.jpg` (*Amanita phalloides* $\rightarrow$ Diprediksi *Amanita bisporigera* `48.3%`):**
   - **Bukti Distribusi Top-5:**
     - `#1 Amanita bisporigera (48.3%)`
     - `#2 Amanita citrina (15.3%)`
     - `#3 Amanita ocreata (11.1%)`
     - `#4 Amanita phalloides (7.3%)`
     - `#5 Amanita virosa (6.6%)`
   - **Penyebab Terbukti:** **88.6% dari seluruh probabilitas model terkonsentrasi pada 5 spesies dalam genus *Amanita*!** Karena foto diambil dari sudut bawah (*underside view*) pada spesimen pucat dan hanya menampilkan struktur bawah berwarna putih murni (insang bebas putih, cincin rok putih, batang putih, dan cawan volva putih di pangkal) tanpa memperlihatkan warna hijau-zaitun pada permukaan atas tudung, citra tersebut secara morfologi visual identik dengan kelompok *White Destroying Angels* (*A. bisporigera*, *A. ocreata*, *A. virosa*). Selain itu, pada notebook pelatihan (**Cell 33**), pasangan *Amanita* putih/pucat memang tercatat dalam Top 10 pasangan paling sering tertukar (`Amanita citrina -> Amanita bisporigera`, `Amanita virosa -> Amanita bisporigera`, `Amanita phalloides -> Amanita citrina`).
2. **`pleurotus_ostreatus/761203896.jpg` (*Pleurotus ostreatus* $\rightarrow$ Diprediksi *Pleurotus eryngii* `63.8%`):**
   - **Penyebab Terbukti:** Kedua spesies berasal dari genus *Pleurotus* (jamur tiram) yang sama-sama memiliki insang dekuren (*decurrent gills*) rapat berwarna krem keputihan dan tudung halus abu-abu kecokelatan. Dalam foto ini, objek jamur hanya menempati ~20% area tengah sementara ~80% sisanya adalah tekstur kulit pohon vertikal yang menyerupai tekstur batang tebal *Pleurotus eryngii*.

#### B. Pola 2: Confidence Tinggi tetapi Prediksi Salah (Look-Alike Fase Delikuesensi)
- **`coprinus_comatus/763635548.jpg` (*Coprinus comatus* $\rightarrow$ Diprediksi *Coprinopsis atramentaria* `95.4%`):**
  - **Penyebab Terbukti:** *Coprinus comatus* (Shaggy Ink Cap) dan *Coprinopsis atramentaria* (Common Ink Cap) sama-sama merupakan kelompok **jamur tinta (*ink caps*)** yang mengalami proses **delikuesensi** (tepi bawah tudung menghitam dan mencair menjadi cairan tinta hitam untuk menyebarkan spora). Pada gambar `763635548.jpg`, kedua tudung utama sudah menghitam pekat dan terkoyak di bagian bawah di atas rumput hijau. Tanpa fine-tuning khusus untuk membedakan sisa sisik putih di puncak tudung *C. comatus* dari tudung bergaris abu-abu *C. atramentaria*, ekstraktor fitur MobileNetV2 memetakan tudung lonceng hitam-abu-abu yang mencair tersebut ke *Coprinopsis atramentaria* dengan keyakinan tinggi (`95.4%`).

#### C. Pola 3: Salah Spesies dan Berbeda Genus
1. **`static/img/specimen-amanita.jpg` (Foto Bunga Matahari $\rightarrow$ `Boletus satanas` `17.9%`):**
   - **Penyebab Terbukti:** Berkas gambar adalah **bunga matahari (*Helianthus annuus*)**, bukan jamur. Karena classifier SVM membagi ruang fitur 1.280 dimensi menjadi 39 wilayah keputusan (*Voronoi / hyperplane regions*) tanpa kelas *"Bukan Jamur"*, setiap input non-jamur pasti jatuh ke salah satu dari 39 kelas namun dengan probabilitas tersebar merata (`17.9%`, `15.7%`, `10.4%`, `6.0%`, `6.0%`).
2. **`cantharellus_cibarius/745923629.jpg` (*Cantharellus cibarius* di Telapak Tangan $\rightarrow$ `Entoloma sinuatum` `25.5%`):**
   - **Penyebab Terbukti:** Proporsi piksel jamur sangat kecil (`<10%`) dibandingkan dua telapak tangan manusia (`>65%`). *Global Average Pooling* pada MobileNetV2 merata-ratakan aktivasi spasial `7×7` dari seluruh gambar, sehingga vektor fitur didominasi warna dan tekstur kulit tangan manusia (krem/merah muda pucat) yang menyerupai warna tudung pucat kekuningan/krem pada *Entoloma sinuatum*.
3. **`chlorophyllum_molybdites/756013654.jpg` (*Chlorophyllum molybdites* $\rightarrow$ `Amanita ocreata` `38.0%`, `#2 Lepiota brunneoincarnata` `14.0%`):**
   - **Penyebab Terbukti:** Dari sudut atas-samping, *Chlorophyllum molybdites* menampilkan tudung putih-krem berbentuk payung dengan umbo kecokelatan tanpa memperlihatkan insang hijau di bawahnya, sehingga secara visual beririsan dengan spesies bertudung putih-krem bersisik seperti *Amanita ocreata* dan *Lepiota brunneoincarnata*.

#### D. Pola 4: Binary Prediction Bertentangan dengan Status Referensi Ilmiah
Terdapat 3 gambar di mana output `binary_prediction` (`model_biner_svm.joblib`) berbeda dari `reference_status` (`species_knowledge_base.json` berdasarkan Top-1 Multiclass SVM):

| Gambar | Spesies Sebenarnya (Status Asli) | Prediksi Binary SVM | Prediksi Top-1 Multiclass SVM (Status Referensi KB) | Analisis Penyebab Kontradiksi |
|---|---|---|---|---|
| `coprinus_comatus/763635548.jpg` | *Coprinus comatus* (**Edible**) | **`EDIBLE` (`88.3%`)** *(Benar terhadap spesies asli)* | *Coprinopsis atramentaria* (`95.4%` $\rightarrow$ KB: **`poisonous`** bersama alkohol) | Binary SVM berhasil mengenali citra sebagai jamur **Edible** (`88.3%`), sedangkan Multiclass SVM tertukar dengan kerabat jamur tinta *C. atramentaria* yang berstatus *poisonous* (sindrom koprin). |
| `cantharellus_cibarius/745923629.jpg` | *Cantharellus cibarius* (**Edible**) | **`EDIBLE` (`75.5%`)** *(Benar terhadap spesies asli)* | *Entoloma sinuatum* (`25.5%` *inconclusive* $\rightarrow$ KB: **`poisonous`**) | Binary SVM memprediksi **Edible** (`75.5%`) dengan benar, sementara Multiclass SVM gagal mencapai konfidensi (`25.5%`) akibat dominasi objek tangan manusia dan kebetulan kandidat tertinggi (`25.5% vs 24.9% vs 24.2%`) adalah spesies beracun. |
| `volvariella_volvacea/296268195.jpg` | *Volvariella volvacea* (**Edible**) | `POISONOUS` (`53.4%`) *(Ambigu ~50:50)* | **`Volvariella volvacea`** (`30.1%` *inconclusive* $\rightarrow$ KB: **`edible`**) | Multiclass SVM berhasil menempatkan *Volvariella volvacea* di peringkat #1 (status KB: **Edible**), tetapi Binary SVM berada tepat di perbatasan keputusan (`46.6% Edible` vs `53.4% Poisonous`) karena kemiripan fitur dengan *Chlorophyllum molybdites* (tercatat di Cell 33 notebook). |

**Penyebab Arsitektural Terbukti:**  
Di dalam `vision_classifier.py`, `reference_status` diambil secara deterministik dari lookup `species_knowledge_base.json` berdasarkan **nama spesies Top-1 Multiclass SVM**, sedangkan `binary_prediction` dihitung secara terpisah oleh **`model_biner_svm.joblib`** (yang dilatih pada dataset gabungan Kaggle + iNaturalist dengan akurasi `79.81%`). Kedua model tidak saling mengkalibrasi.

#### E. Pola 5: Prediksi `inconclusive` (Confidence < 50.0%)
Sebanyak 5 dari 9 gambar menghasilkan `status_code: "inconclusive"` (`confidence < 50.0%`):
- **`static/img/specimen-amanita.jpg` (`17.9%`)**: Bukan gambar jamur (foto bunga matahari).
- **`cantharellus_cibarius/745923629.jpg` (`25.5%`)**: Objek jamur terlalu kecil di dalam genggaman dua tangan manusia.
- **`volvariella_volvacea/296268195.jpg` (`30.1%`)**: Spesies Top-1 sudah benar (*Volvariella volvacea*), tetapi probabilitas terpecah ke 39 kelas akibat latar belakang serpihan kayu (*woodchips*) yang menyaru dengan warna/tekstur jamur.
- **`chlorophyllum_molybdites/756013654.jpg` (`38.0%`)**: Oklusi semak daun hijau dan daun kering besar di latar depan.
- **`amanita_phalloides/755965447.jpg` (`48.3%`)**: Probabilitas terbagi di antara 5 spesies *Amanita* putih (`48.3%`, `15.3%`, `11.1%`, `7.3%`, `6.6%`) karena permukaan atas tudung tidak terlihat.

**Penyebab Matematis Terbukti:**  
Dalam klasifikasi multikelas 39 kelas dengan *Platt scaling / pairwise coupling* (`SVC(probability=True)`), probabilitas terdistribusi ke 39 kelas ($\sum_{k=1}^{39} p_k = 100\%$). Pada model dengan akurasi dasar `67.98%` (frozen backbone), citra dengan latar belakang kompleks atau sudut pandang parsial sering memiliki probabilitas Top-1 di rentang `30%–49%` meskipun kandidat #1 atau genusnya sudah tepat.

---

## 4. AUDIT DETEKSI WARNA (`detected_cap_color`)

### 4.1 Mengapa Tudung Merah *Amanita muscaria* (`764650132.jpg`) Menghasilkan HEX `#51342c`?

Kami menjalankan penelusuran variabel internal langkah-demi-langkah pada fungsi `segment_cap_region()` (`vision_classifier.py` baris 242–356) untuk citra `amanita_muscaria/764650132.jpg` (`576 × 1024` piksel, di-resize ke `200 × 200` piksel):

#### Bukti Output Aktual KMeans & Masking pada `amanita_muscaria/764650132.jpg`:
1. **Sampel Latar Belakang Tepi (`border_pixels`, margin 8% = 16 piksel tepi luar):**
   - `BG Cluster 0`: `RGB = [145.0, 150.2, 119.1]` (`HEX #909677` — Hijau / Zaitun)
   - `BG Cluster 1`: `RGB = [44.8, 43.3, 20.3]` (`HEX #2c2b14` — Hitam / Kehitaman)
   - `BG Cluster 2`: `RGB = [88.5, 101.3, 51.3]` (`HEX #586533` — Hijau / Zaitun)
2. **Kotak ROI Statis (`y: 10%–65%` $\rightarrow$ baris `20..130`, `x: 12%–88%` $\rightarrow$ kolom `24..176`):**
   - Total piksel ROI = `16.720` piksel (`41.8%` dari seluruh gambar).
   - Piksel hijau daun (`is_green_leaf`) yang terfilter = `3.159` piksel (`18.9%`).
   - Piksel yang lolos sebagai foreground (`dists_to_bg > 30.0 & ~is_green_leaf`) = **`10.919` piksel (`65.3%` dari ROI)**.
3. **Hasil 3 Klaster Foreground KMeans (`k=3`) pada `10.919` Piksel:**
   - **Rank #1 (Cluster 2 — Pemenang): `44.2%` (`4.827` piksel)**  
     `RGB = [81, 52, 44]` | **`HEX = #51342c`** | `HSV = (13.0°, S=0.46, V=0.32)`  
     *Asal Piksel:* **Daun kering cokelat di atas tudung, ranting rumput kering yang melintang di atas tudung, serta bayangan tanah gelap di sela-sela rumput.**  
     *Label dari `classify_color_nuanced`:* **`"Merah Tua / Marun (Dark Red/Maroon)"`**
   - **Rank #2 (Cluster 0 — Tudung Merah Asli!): `33.0%` (`3.599` piksel)**  
     `RGB = [174, 11, 37]` | **`HEX = #ae0b25`** | `HSV = (350.5°, S=0.93, V=0.69)`  
     *Asal Piksel:* **Permukaan tudung merah menyala *Amanita muscaria*!**  
     *Label dari `classify_color_nuanced`:* **`"Merah Cerah (Bright Red / Scarlet)"`**
   - **Rank #3 (Cluster 1 — Bintik Putih Velum Asli!): `22.8%` (`2.493` piksel)**  
     `RGB = [174, 160, 157]` | **`HEX = #aea09d`** | `HSV = (10.6°, S=0.10, V=0.68)`  
     *Asal Piksel:* **Bintik-bintik kutil putih (velum) di atas tudung merah & tangkai rumput kering terang.**  
     *Label dari `classify_color_nuanced`:* **`"Abu-abu Terang (Light Gray)"`**

---

### 4.2 Tiga Akar Penyebab Algoritmik yang Terbukti pada `segment_cap_region()`

1. **Kesalahan Posisi & Ukuran Kotak ROI Statis (`y: 10%–65%, x: 12%–88%`):**
   - Pada foto `amanita_muscaria/764650132.jpg`, tudung merah jamur berada di bagian **tengah-bawah (`y: 37%–90%`)**, sedangkan bagian **atas (`y: 10%–40%`)** berisi daun kering cokelat besar dan bayangan rumput.
   - Karena ROI dipatok kaku pada `y: 10%–65%`, sepertiga bagian bawah tudung merah terpotong, sementara daun kering cokelat dan bayangan gelap di bagian atas masuk sepenuhnya ke dalam ROI.
   - Karena tepi gambar (`border_pixels`) berwarna hijau rumput (`G > R`), daun kering cokelat (`RGB=[81, 52, 44]`) memiliki jarak Euclidean $> 30.0$ terhadap warna tepi hijau dan tidak berwarna hijau (`~is_green_leaf`), sehingga **dianggap sebagai foreground tudung jamur** sebanyak `4.827` piksel (`44.2%`), mengalahkan piksel tudung merah asli (`3.599` piksel, `33.0%`).

2. **Klasifikasi Warna Cokelat Gelap / Bayangan (`#51342c`) sebagai `"Merah Tua / Marun"` pada `classify_color_nuanced()`:**
   - Pada `vision_classifier.py` baris 95–98:
     ```python
     is_strongly_red = (r > g * 1.35) and (r > b * 1.45) and (s > 0.40)
     if (h >= 345 or h < 24) or is_strongly_red:
         if v < 0.38 and s > 0.30:
             return "Merah Tua / Marun (Dark Red/Maroon)", hex_color
     ```
   - Piksel tanah/daun kering/bayangan `RGB = [81, 52, 44]` (`#51342c`) memiliki rona jingga-cokelat (`H = 13.0° < 24°`), kejenuhan sedang (`S = 0.46 > 0.30`), dan kecerahan rendah (`V = 0.32 < 0.38`). Dalam ruang warna HSV, rona `8°–24°` dengan kecerahan rendah (`V < 0.38`) dan saturasi `< 0.60` secara visual adalah **Cokelat Tua (*Dark Brown*)**, bukan Merah Marun!

3. **Penghapusan Warna Tudung Merah Asli (`#ae0b25`) Akibat Filter Kata Pertama (`split()[0]`):**
   - Pada `vision_classifier.py` baris 328–331:
     ```python
     candidate_sec_name, candidate_sec_hex = classify_color_nuanced(sec_rgb)
     if candidate_sec_name.split()[0] != primary_name.split()[0]:
         sec_name = candidate_sec_name
         sec_hex = candidate_sec_hex
     ```
   - Karena klaster #1 (`#51342c`, daun kering/bayangan) dilabeli `"Merah Tua / Marun"` (kata pertama: **`"Merah"`**) dan klaster #2 (`#ae0b25`, tudung merah cerah asli) dilabeli `"Merah Cerah"` (kata pertama: **`"Merah"`**), kondisi `candidate_sec_name.split()[0] != primary_name.split()[0]` bernilai **`False`**.
   - Akibatnya, klaster tudung merah cerah `#ae0b25` (`33.0%` piksel) **dibuang seluruhnya**, dan algoritma juga tidak memeriksa klaster #3 (`#aea09d`, bintik putih, `22.8%` piksel) karena hanya mengecek `sorted_idx[1]`!

---

## 5. RINGKASAN TEMUAN, DUGAAN, REKOMENDASI BERPRIORITAS & PENGUJIAN TAMBAHAN

### 5.1 Penyebab yang Berhasil Dibuktikan (Proven Root Causes)
1. **Mapping & Preprocessing Valid:** Urutan kelas `0..38`, file `species_knowledge_base.json`, dan pipeline preprocessing `MobileNetV2 (1280-D)` di `vision_classifier.py` terbukti **100% sesuai** dengan notebook pelatihan.
2. **Selisih 40 vs 39 Kelas:** Terbukti disebabkan oleh terbuangnya `Pholiota nameko` (hanya 4 foto, `< 100`) pada Cell 27 notebook pelatihan, serta perbedaan penamaan sinonim `Boletus satanas` (di model & KB) vs `Rubroboletus satanas` (di `species_status_map.json`).
3. **Berkas `static/img/specimen-amanita.jpg` Bukan Jamur:** Terbukti secara visual bahwa berkas tersebut adalah foto **bunga matahari (*Helianthus annuus*)**, sehingga prediksi `17.9% inconclusive` merupakan respons normal terhadap input *Out-of-Distribution (OOD)*.
4. **Keterbatasan Representasi Frozen MobileNetV2 & Ketidakadaan Object Cropper:** Akurasi dasar model multiclass 39 kelas di test set notebook adalah **67.98%**. Tanpa deteksi/cropping objek jamur, latar belakang dominan (tangan manusia, batang pohon, serpihan kayu) mendominasi *Global Average Pooling*.
5. **Kontradiksi Binary vs Reference Status:** Terbukti karena `model_biner_svm.joblib` dan `model_species_multiclass.joblib` dilatih pada himpunan data yang berbeda (`Kaggle+iNat` vs `iNat-only`) dan dipanggil secara independen tanpa rekonsiliasi probabilitas.
6. **Bug Deteksi Warna `#51342c` pada *Amanita muscaria*:** Terbukti disebabkan oleh kombinasi ROI statis `y: 10%–65%` yang menangkap daun kering/bayangan gelap, aturan HSV `H < 24° & V < 0.38` yang melabeli cokelat gelap sebagai `"Merah Tua / Marun"`, serta filter `split()[0]` yang membuang klaster tudung merah cerah `#ae0b25`.

---

### 5.2 Dugaan yang Masih Perlu Diuji (Hypotheses Requiring Further Testing)
1. **Hipotesis Dampak Center-Crop / Saliency Crop terhadap Akurasi Inferensi:**
   - *Dugaan:* Melakukan *foreground object cropping* (memotong gambar di sekitar objek jamur utama sebelum `Resize(224,224)`) akan meningkatkan confidence dan akurasi pada foto jarak jauh / foto di tangan manusia (seperti `cantharellus_cibarius/745923629.jpg` dan `pleurotus_ostreatus/761203896.jpg`).
   - *Mengapa Perlu Diuji:* Harus diuji apakah pemotongan otomatis meningkatkan akurasi secara konsisten pada test set tanpa mengubah distribusi skala yang dipelajari SVM saat training.
2. **Hipotesis Kalibrasi Probabilitas Gabungan (Ensembling Binary SVM + Multiclass SVM):**
   - *Dugaan:* Menggabungkan probabilitas biner $P_{\text{bin}}(\text{edible})$ dengan jumlah probabilitas multikelas spesies edible $\sum_{c \in \text{Edible}} P_{\text{multi}}(c)$ dapat mendeteksi ketidakpastian dan menghilangkan kontradiksi antara prediksi biner dan status referensi.
   - *Mengapa Perlu Diuji:* Perlu dievaluasi apakah *Weighted Probability Calibration* menurunkan *False Negative* (jamur beracun dikira aman) pada seluruh test set.

---

### 5.3 Rekomendasi Perbaikan Berdasarkan Prioritas

#### Prioritas 1 (Tinggi — Perbaikan Terpisah pada Algoritma Deteksi Warna `segment_cap_region` & Aset Uji)
1. **Perbaikan Algoritma `segment_cap_region()` & `classify_color_nuanced()` (Tanpa Mengubah Model Klasifikasi Spesies):**
   - **Gunakan Gaussian Center-Weighted Mask & Perluas/Sesuaikan ROI:** Ganti kotak kaku `y: 10%–65%` dengan pembobotan spasial elips terpusat (`y: 15%–85%, x: 15%–85%`) dan singkirkan piksel bayangan sangat gelap (`V < 0.25`) serta tanah/daun kering cokelat gelap (`8° <= H <= 30°`, `S < 0.55`, `V < 0.42`) apabila terdapat klaster dengan kromatisitas/saturasi tinggi (`S > 0.65`, `V > 0.45`) seperti tudung merah `#ae0b25`.
   - **Perbaiki Batas Warna Cokelat vs Merah Tua di `classify_color_nuanced()`:**
     - Untuk `v < 0.38`, bedakan antara **Merah Tua / Marun asli** (`h >= 340` atau `h <= 8`, atau `r > g * 1.85` dan `s > 0.55`) dengan **Cokelat Tua / Gelap** (`8 < h < 45` dengan `s < 0.60`).
     - Perbaiki kondisi `is_strongly_red` agar tidak menangkap warna kuning-oranye/amber (`24 <= h < 45` seperti `#b66a14` dengan `H = 31.9°`) sebagai `"Merah Cerah"`.
   - **Perbaiki Pemilihan Warna Sekunder (Iterasi Semua Klaster `k=3`):**
     - Jangan hanya memeriksa `sorted_idx[1]` dan jangan membandingkan hanya kata pertama `split()[0]` (karena `"Merah Cerah"` dan `"Merah Tua"` sama-sama diawali kata `"Merah"`). Lakukan iterasi pada `sorted_idx[1:]` untuk mencari klaster bintik/velum kontras (`prop >= 0.15` dan jarak warna `> 38`) sehingga bintik putih velum (`Cluster 1: #aea09d`, `22.8%`) tetap terdeteksi sebagai warna sekunder.
2. **Ganti File Placeholder `static/img/specimen-amanita.jpg`:**
   - Ganti foto bunga matahari pada `static/img/specimen-amanita.jpg` dengan foto spesimen *Amanita muscaria* asli agar aset contoh di dalam folder `static/img/` sesuai dengan namanya.

#### Prioritas 2 (Menengah — Penyelarasan Konsistensi Output & Penanganan `inconclusive` di Backend/UI)
3. **Sinkronisasi `species_status_map.json`:**
   - Tambahkan entri `"Boletus satanas": "poisonous"` dan hapus entri `"Pholiota nameko"` yang tidak ada di 39 kelas model agar `species_status_map.json` sinkron 100% dengan `model_species_multiclass.joblib`.
4. **Rekonsiliasi Tampilan Saat Prediksi `inconclusive` (`confidence < 50%`) atau Kontradiksi Binary vs Multiclass:**
   - Ketika `is_confident == False` (`species_confidence < 50.0%`), tampilkan peringatan eksplisit pada kartu status referensi bahwa identitas spesies belum meyakinkan (*Inconclusive / Kemiripan Visual Rendah*), sehingga pengguna tidak menganggap status referensi dari kandidat `17.9%` atau `25.5%` sebagai hasil identifikasi pasti.
   - Ketika `binary_prediction` bertentangan dengan `reference_status_category` (misal Binary `EDIBLE` tetapi Top-1 Multiclass `poisonous`), tampilkan indikator peringatan ketidakpastian model (*Model Disagreement Warning*).

#### Prioritas 3 (Jangka Panjang — Peningkatan Arsitektur Model Machine Learning)
5. **Penambahan Detektor Objek Jamur (ROI Cropper) atau OOD Filter:**
   - Menambahkan tahap lokalisasi objek jamur (atau *Center-Saliency Crop*) sebelum `Resize(224,224)` agar latar belakang tangan manusia, kulit pohon, dan dedaunan tidak mendominasi vektor fitur 1280-D, serta menolak citra non-jamur (seperti bunga matahari) sebelum masuk ke SVM.
6. **Fine-Tuning Layer Akhir MobileNetV2 + `StandardScaler` Sebelum SVM:**
   - Melakukan *fine-tuning* pada blok konvolusi terakhir MobileNetV2 (`features[14:]`) khusus pada 39 spesies jamur dan menerapkan `StandardScaler` sebelum `SVC(kernel='rbf')` untuk meningkatkan akurasi multikelas dari baseline `67.98%` ke `>85%`.

---

### 5.4 Pengujian Tambahan yang Diperlukan
1. **Uji Regresi Algoritma Warna (`segment_cap_region`) pada Multi-Spesies:**
   - Menguji perbaikan fungsi `segment_cap_region()` pada minimal 20 citra yang mewakili berbagai spektrum warna tudung: merah berbintik putih (*Amanita muscaria*), kuning keemasan (*Cantharellus cibarius*), putih bersih (*Amanita bisporigera*), cokelat gelap (*Boletus edulis*), dan abu-abu (*Pleurotus ostreatus*) untuk memastikan tidak ada regresi warna.
2. **Evaluasi Per-Kelas (Per-Class Precision/Recall/F1) pada Seluruh 39 Spesies:**
   - Menjalankan evaluasi per kelas pada test set 39 spesies untuk memetakan spesies mana saja yang memiliki *recall* di bawah `60%` dan pasangan spesies mana yang membutuhkan bobot kelas atau kurasi citra tambahan.
3. **Uji Sensitivitas Cropping (Full Frame vs Cropped Mushroom ROI):**
   - Membandingkan confidence dan akurasi model SVM saat ini pada citra gagal (`cantharellus_cibarius/745923629.jpg`, `pleurotus_ostreatus/761203896.jpg`, `chlorophyllum_molybdites/756013654.jpg`) sebelum vs sesudah dipotong (*cropped*) fokus pada badan buah jamur.
