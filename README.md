# Jamur Aman — Klasifikasi Jamur Beracun vs Layak Konsumsi

Aplikasi web demo untuk tugas PJBL Machine Learning 2026 (Kelompok 4).
Model Decision Tree memprediksi status kelayakan konsumsi jamur berdasarkan 20 ciri morfologi dari dataset UCI Mushroom Classification.

## Isi repo

- `api/index.py` — aplikasi Flask (route `/`, `/predict`, `/api/info`, `/api/extract-color`)
- `app.py` — entry point lokal, menjalankan app dan auto-retrain kalau file model tidak kompatibel
- `retrain.py` — melatih ulang model dari dataset dan menyimpan artifact
- `mushroom_pipeline.joblib` — model + preprocessor + scaler + label encoder (5,4 KB, compressed)
- `feature_categories.joblib` — daftar pilihan dropdown per fitur
- `templates/index.html` — seluruh UI (tanpa framework CSS, satu file)
- `static/img/` — foto anggota tim (opsional, nama `anggota-1.jpg` dst)
- `vercel.json` — konfigurasi deploy serverless

## Menjalankan lokal

```bash
pip install -r requirements.txt
python app.py
# buka http://localhost:5000
```

## Hasil model (data uji 20%)

| Model | Akurasi | Recall racun | FN |
|---|---|---|---|
| Decision Tree | 1,0000 | 1,0000 | 0 |
| Logistic Regression | 1,0000 | 1,0000 | 0 |
| KNN | 0,9988 | 0,9974 | 2 |

Decision Tree dipilih: daun murni, tanpa false negative, dan aturannya bisa dibaca (aroma 0,62 · memar 0,17).

## Catatan

Prediksi model ini bukan alat identifikasi lapangan. Dataset bersifat akademik.
