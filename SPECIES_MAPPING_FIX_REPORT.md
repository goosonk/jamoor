# SPECIES MAPPING AUDIT & SYNCHRONIZATION REPORT — SHROOMY

**Tanggal Implementasi:** 24 November 2026  
**Workspace:** `C:\Users\Fahry\jamoor`  
**Acuan Utama:** `model_species_multiclass.joblib` (`39` kelas spesies), `species_knowledge_base.json`, `species_status_map.json`, dan `vision_classifier.py`

---

## 1. RINGKASAN EKSEKUTIF

Audit dan sinkronisasi penuh telah dilakukan terhadap seluruh **39 kelas spesies jamur** pada model Multiclass SVM (`model_species_multiclass.joblib`) terhadap basis pengetahuan ilmiah (`species_knowledge_base.json`), pemetaan status referensi (`species_status_map.json`), serta logika resolusi runtime pada `vision_classifier.py`.

1. **Sinkronisasi 1-ke-1 (`39` Kelas):**
   - `species_status_map.json` kini telah disinkronkan secara eksak dengan 39 kelas `model_species_multiclass.joblib` dalam urutan alfabetis indeks `0..38` (`list(smap.keys()) == list(kb.keys()) == clf._classes`).
   - Entri `Pholiota nameko` (yang tidak masuk ke dalam 39 kelas model karena hanya memiliki 4 foto saat pelatihan) telah dikeluarkan dari mapping runtime `species_status_map.json`.
   - Penamaan kelas indeks ke-11 (`taxon_id = 544554`) telah diselaraskan ke **`Boletus satanas`** pada `species_status_map.json`, sementara `vision_classifier.py` dilengkapi resolusi sinonim taksonomi dua arah (`Boletus satanas` $\leftrightarrow$ `Rubroboletus satanas`).
2. **Audit Kelengkapan `species_knowledge_base.json` (39 Spesies):**
   - Seluruh 39 spesies memiliki data terverifikasi untuk: nama ilmiah, nama umum, 5 atribut karakteristik morfologi (`cap_color`, `cap_shape`, `cap_surface`, `stem_characteristics`, `hymenium_type`), habitat ekologis (`ecological_habitat`), status referensi ilmiah (`reference_status`, `status_category`, `reference_status_note`), serta informasi edukasi (`short_description`, `educational_facts`).
3. **Verifikasi Runtime & Deteksi Ketidakkonsistenan Model (Binary vs Multiclass):**
   - Ditambahkan metode `resolve_species_metadata()` pada `vision_classifier.py` yang memvalidasi silang setiap kelas terhadap `self._classes`, `self._species_kb`, dan `self._species_map`, mencegah kebocoran status dari spesies lain, dan menyediakan pesan fallback aman jika terjadi kegagalan mapping.
   - Ditambahkan metode `evaluate_model_consistency()` pada `vision_classifier.py` yang secara otomatis mendeteksi dan memberikan penjelasan edukatif ketika hasil prediksi **Binary SVM** (`edible` / `poisonous`) tidak konsisten dengan **Status Referensi Top-1 Multiclass SVM**, maupun ketika tingkat keyakinan spesies berada di bawah ambang `50.0%` (`inconclusive`).

---

## 2. LAPORAN AUDIT & PENGUJIAN SELURUH 39 KELAS SPESIES

Seluruh 39 kelas pada `model_species_multiclass.joblib` telah diuji satu per satu melalui fungsi runtime `classifier.resolve_species_metadata(species_name, class_idx)`:

| Indeks | Taxon ID | Nama Kelas Model (`scientific_name`) | Nama Umum (`common_name`) | Kategori KB (`status_category`) | Status Map (`reference_binary_status`) | Status Referensi Ilmiah (`reference_status`) | Kelengkapan Morfologi, Habitat & Edukasi | Status Verifikasi Runtime |
|---|---|---|---|---|---|---|---|---|
| `00` | `61395` | *Agaricus bisporus* | Jamur Kancing / Portobello / Champignon | `edible` | `edible` | Tercatat sebagai jamur pangan (Edible) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |
| `01` | `143563` | *Agaricus campestris* | Field Mushroom / Jamur Padang Rumput | `edible` | `edible` | Tercatat sebagai jamur pangan (Edible) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |
| `02` | `125390` | *Amanita bisporigera* | Eastern Destroying Angel / Malaikat Perusak | `deadly` | `poisonous` | Sangat Beracun / Mematikan (Amatoxin) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |
| `03` | `63271` | *Amanita citrina* | False Death Cap / Jamur Sitrun | `poisonous` | `poisonous` | Beracun / Toksik (Mengandung Bufotenin) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |
| `04` | `48715` | *Amanita muscaria* | Fly Agaric / Jamur Lalat | `poisonous` | `poisonous` | Beracun (Asam Ibotenat & Muscimol) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |
| `05` | `67356` | *Amanita ocreata* | Western Destroying Angel | `deadly` | `poisonous` | Sangat Beracun / Mematikan (Amatoxin) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |
| `06` | `48418` | *Amanita pantherina* | Panther Cap | `deadly` | `poisonous` | Sangat Beracun (Toksin Pantherina) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |
| `07` | `52135` | *Amanita phalloides* | Death Cap / Jamur Topi Kematian | `deadly` | `poisonous` | Sangat Beracun / Mematikan (Amatoxin) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |
| `08` | `58685` | *Amanita virosa* | European Destroying Angel | `deadly` | `poisonous` | Sangat Beracun / Mematikan (Amatoxin) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |
| `09` | `50813` | *Auricularia auricula-judae* | Jamur Kuping Hitam / Wood Ear | `edible` | `edible` | Tercatat sebagai jamur pangan (Edible) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |
| `10` | `48701` | *Boletus edulis* | Porcini / King Bolete | `edible` | `edible` | Tercatat sebagai jamur pangan gourmet (Edible) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |
| `11` | `544554` | *Boletus satanas* | Satan's Bolete (*Rubroboletus satanas*) | `poisonous` | `poisonous` | Beracun (Toksik Saluran Cerna Parah) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |
| `12` | `47347` | *Cantharellus cibarius* | Chanterelle / Jamur Terompet Emas | `edible` | `edible` | Tercatat sebagai jamur pangan gourmet (Edible) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |
| `13` | `117308` | *Chlorophyllum molybdites* | False Parasol / Jamur Spora Hijau | `poisonous` | `poisonous` | Beracun (Pemicu Gangguan Pencernaan Akut) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |
| `14` | `48521` | *Coprinopsis atramentaria* | Inky Cap / Jamur Tinta | `poisonous` | `poisonous` | Beracun jika Bersama Alkohol (Coprine Syndrome) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |
| `15` | `47392` | *Coprinus comatus* | Shaggy Mane / Jamur Surai Singa | `edible` | `edible` | Tercatat sebagai jamur pangan saat muda (Edible) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |
| `16` | `337849` | *Cortinarius orellanus* | Fool's Webcap | `deadly` | `poisonous` | Sangat Beracun / Mematikan (Orellanine) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |
| `17` | `500053` | *Cortinarius rubellus* | Deadly Webcap | `deadly` | `poisonous` | Sangat Beracun / Mematikan (Orellanine) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |
| `18` | `48607` | *Craterellus cornucopioides* | Horn of Plenty / Black Trumpet | `edible` | `edible` | Tercatat sebagai jamur pangan gourmet (Edible) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |
| `19` | `510199` | *Entoloma sinuatum* | Livent Entoloma / Poison Pie | `poisonous` | `poisonous` | Beracun (Toksik Saluran Cerna Akut) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |
| `20` | `67594` | *Flammulina velutipes* | Enoki / Jamur Jarum Liar | `edible` | `edible` | Tercatat sebagai jamur pangan populer (Edible) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |
| `21` | `154735` | *Galerina marginata* | Funeral Bell / Galerina Mematikan | `deadly` | `poisonous` | Sangat Beracun / Mematikan (Amatoxin) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |
| `22` | `53714` | *Grifola frondosa* | Maitake / Hen of the Woods | `edible` | `edible` | Tercatat sebagai jamur pangan & herbal (Edible) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |
| `23` | `49158` | *Hericium erinaceus* | Lion's Mane / Jamur Surai Singa | `edible` | `edible` | Tercatat sebagai jamur pangan & nootropik (Edible) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |
| `24` | `48641` | *Hydnum repandum* | Sweet Tooth / Hedgehog Mushroom | `edible` | `edible` | Tercatat sebagai jamur pangan aman (Edible) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |
| `25` | `48767` | *Hypholoma fasciculare* | Sulphur Tuft | `poisonous` | `poisonous` | Beracun (Toksin Fasciculol) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |
| `26` | `118336` | *Inocybe geophylla* | White Fiber Cap / Earth Fan | `poisonous` | `poisonous` | Beracun (Kandungan Muscarin Tinggi) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |
| `27` | `155197` | *Lactarius deliciosus* | Saffron Milk Cap | `edible` | `edible` | Tercatat sebagai jamur pangan populer (Edible) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |
| `28` | `123351` | *Lentinula edodes* | Shiitake | `edible` | `edible` | Tercatat sebagai jamur pangan & kuliner (Edible) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |
| `29` | `515954` | *Lepiota brunneoincarnata* | Deadly Dapperling | `deadly` | `poisonous` | Sangat Beracun / Mematikan (Amatoxin) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |
| `30` | `63401` | *Macrolepiota procera* | Parasol Mushroom | `edible` | `edible` | Tercatat sebagai jamur pangan populer (Edible) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |
| `31` | `58682` | *Morchella esculenta* | Yellow Morel / Jamur Morel Kuning | `edible` | `edible` | Tercatat sebagai jamur pangan gourmet (Edible setelah dimasak) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |
| `32` | `64021` | *Omphalotus olearius* | Jack-O'Lantern Mushroom | `poisonous` | `poisonous` | Beracun (Toksin Illudin S) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |
| `33` | `205516` | *Pleurotus eryngii* | King Oyster / Jamur Tiram Raja | `edible` | `edible` | Tercatat sebagai jamur pangan gourmet (Edible) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |
| `34` | `48494` | *Pleurotus ostreatus* | Oyster Mushroom / Jamur Tiram Putih | `edible` | `edible` | Tercatat sebagai jamur pangan populer (Edible) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |
| `35` | `118215` | *Tricholoma equestre* | Yellow Knight / Man on Horseback | `poisonous` | `poisonous` | Beracun (Risiko Rhabdomyolysis Fatal) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |
| `36` | `62486` | *Tricholoma matsutake* | Matsutake / Jamur Pinus Jepang | `edible` | `edible` | Tercatat sebagai jamur pangan bernilai tinggi (Edible) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |
| `37` | `335206` | *Tricholoma pardinum* | Tiger Tricholoma | `poisonous` | `poisonous` | Beracun (Toksik Saluran Cerna Akut) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |
| `38` | `179054` | *Volvariella volvacea* | Jamur Merang / Straw Mushroom | `edible` | `edible` | Tercatat sebagai jamur pangan tropis (Edible) | Lengkap (5 morfologi + habitat + edukasi) | **PASS (`verified`)** |

---

## 3. PENGUJIAN RESOLUSI SINONIM & FALLBACK AMAN

1. **Resolusi Sinonim Taksonomi (`Rubroboletus satanas` $\leftrightarrow$ `Boletus satanas`):**
   - Pemanggilan `classifier.resolve_species_metadata("Rubroboletus satanas")` berhasil memetakan secara otomatis ke `kb_matched_key = "Boletus satanas"`, `smap_matched_key = "Boletus satanas"`, `reference_binary_status = "poisonous"`, dan `reference_status = "Beracun (Toksik Saluran Cerna Parah)"`.
2. **Keamanan Fallback untuk Spesies di Luar 39 Kelas Model (`Pholiota nameko`):**
   - Pemanggilan `classifier.resolve_species_metadata("Pholiota nameko")` mengembalikan `mapping_verified = False`, `mapping_status = "unmapped_species"`, dan pesan informasi eksplisit `"Informasi status referensi belum tersedia dalam database"` tanpa membocorkan atau meminjam profil dari spesies lain.

---

## 4. HASIL PENGUJIAN DETEKSI KONSISTENSI BINARY SVM VS MULTICLASS SVM

Pengujian `evaluate_model_consistency()` pada 9 gambar uji menunjukkan bahwa sistem kini mampu mengenali dan mengklasifikasikan 4 kondisi hubungan antara **Binary SVM** dan **Status Referensi Top-1 Multiclass SVM**:

| # | Gambar Uji | Top-1 Multiclass SVM (`Confidence`) | Status Referensi Top-1 (`reference_binary_status`) | Prediksi Binary SVM | `is_binary_consistent` | `consistency_status` |
|---|---|---|---|---|---|---|
| 1 | `amanita_muscaria/764650132.jpg` | `Amanita muscaria` (`98.4%`) | `poisonous` | `poisonous` (`91.4%`) | **`True`** | **`consistent_confident`** |
| 2 | `agaricus_bisporus/354029596.jpg` | `Agaricus bisporus` (`52.0%`) | `edible` | `edible` (`57.8%`) | **`True`** | **`consistent_confident`** |
| 3 | `pleurotus_ostreatus/761203896.jpg` | `Pleurotus eryngii` (`63.8%`) | `edible` | `edible` (`96.0%`) | **`True`** | **`consistent_confident`** |
| 4 | `coprinus_comatus/763635548.jpg` | `Coprinopsis atramentaria` (`95.4%`) | `poisonous` | `edible` (`88.3%`) | **`False`** | **`inconsistent_model_disagreement`** |
| 5 | `amanita_phalloides/755965447.jpg` | `Amanita bisporigera` (`48.3%`) | `poisonous` | `poisonous` (`84.9%`) | **`True`** | **`consistent_low_confidence`** |
| 6 | `chlorophyllum_molybdites/756013654.jpg` | `Amanita ocreata` (`38.0%`) | `poisonous` | `poisonous` (`85.1%`) | **`True`** | **`consistent_low_confidence`** |
| 7 | `static/img/specimen-amanita.jpg` | `Boletus satanas` (`17.9%`) | `poisonous` | `poisonous` (`56.8%`) | **`True`** | **`consistent_low_confidence`** |
| 8 | `cantharellus_cibarius/745923629.jpg` | `Entoloma sinuatum` (`25.5%`) | `poisonous` | `edible` (`75.5%`) | **`False`** | **`inconsistent_low_confidence`** |
| 9 | `volvariella_volvacea/296268195.jpg` | `Volvariella volvacea` (`30.1%`) | `edible` | `poisonous` (`53.4%`) | **`False`** | **`inconsistent_low_confidence`** |

---

## 5. DAFTAR FILE YANG DIUBAH / DIBUAT

1. **`C:\Users\Fahry\jamoor\species_status_map.json`** *(Diubah)* — Disinkronkan menjadi tepat 39 entri sesuai urutan kelas `model_species_multiclass.joblib` (`Pholiota nameko` dihapus, `Boletus satanas` diselaraskan).
2. **`C:\Users\Fahry\jamoor\vision_classifier.py`** *(Diubah)* — Penambahan metode `resolve_species_metadata()`, resolusi sinonim dua arah `SPECIES_SYNONYMS`, metode evaluasi konsistensi `evaluate_model_consistency()`, serta integrasi field `model_consistency` dan `reference_binary_status` pada output inferensi.
3. **`C:\Users\Fahry\jamoor\SPECIES_MAPPING_FIX_REPORT.md`** *(Dibuat)* — Dokumentasi hasil audit, sinkronisasi, dan pengujian seluruh 39 kelas.
