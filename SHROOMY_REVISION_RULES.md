# SHROOMY — ATURAN PERMANEN RUANG LINGKUP REVISI

Dokumen ini adalah pedoman permanen dan mutlak bagi seluruh coding agent, developer, dan kontributor yang mengembangkan proyek Shroomy.

---

## 12 Aturan Wajib Pengembangan & Revisi

1. **Identifikasi Halaman Sasaran Sebelum Mengedit**:
   - Periksa dan tentukan secara spesifik halaman mana yang diminta pengguna untuk diperbaiki sebelum menyentuh file kode apapun (`/` landing page atau `/workspace` workspace AI).
   
2. **Identifikasi Section & Komponen Target**:
   - Batasi pemetaan pada komponen atau section spesifik yang disebutkan dalam brief pengguna.

3. **Batasi Perubahan Hanya pada Target Tersebut**:
   - Jangan pernah melakukan perubahan pada section, komponen, atau halaman yang tidak diminta.

4. **Lindungi Halaman Lain dari Perubahan Langsung Maupun Tidak Langsung**:
   - Jika revisi ditujukan untuk `/workspace`, dilarang keras mengedit `templates/index.html`.
   - Jika revisi ditujukan untuk Landing Page, dilarang keras mengedit `templates/workspace.html`.

5. **Dilarang Melakukan Global CSS Override untuk Masalah Lokal**:
   - Jangan menambahkan selector global (seperti `body`, `.card`, `.modal`, `.button`, dsb.) dengan `!important` di stylesheet bersama (`style.css`) jika masalah hanya terjadi pada satu halaman.
   - Gunakan page-specific scoping seperti `.workspace-page-body .target-component` atau file styling terisolasi.

6. **Jangan Menambah Fitur atau Elemen yang Tidak Diminta**:
   - Dilarang berinisiatif menambahkan tombol, navigasi, indikator scroll, floating widget, atau visual baru tanpa persetujuan eksplisit pengguna.

7. **Jangan Menghapus atau Mengganti Fungsi yang Sudah Berjalan**:
   - Alur kerja, pipeline Machine Learning, routing Flask, modal multi-tahap, dan kalkulasi ilmiah UCI yang sudah aktif dilarang dihapus atau disederhanakan secara sepihak.

8. **Jangan Mengubah Struktur & Urutan Section Tanpa Persetujuan**:
   - Pertahankan hierarki, tata letak, dan flow informasi yang telah disetujui sebelumnya.

9. **Pertahankan Seluruh Hasil Revisi Sebelumnya yang Telah Disetujui**:
   - Seluruh approval visual, estetika Apple Liquid Glass, rasio typography, dan palet warna yang sudah disetujui wajib dipertahankan.

10. **Lakukan Regression Testing Terhadap Halaman Non-Target**:
    - Setiap selesai melakukan perubahan pada satu halaman, jalankan uji regresi visual & fungsional pada halaman lain untuk memastikan 100% tidak ada efek samping / kerusakan.

11. **Minta Persetujuan Sebelum Memperluas Ruang Lingkup**:
    - Apabila suatu perbaikan membutuhkan perubahan arsitektur di luar brief, jelaskan kepada pengguna dan minta persetujuan terlebih dahulu.

12. **Revisi Visual Bukan Izin Mengubah Fungsionalitas**:
    - Penyesuaian padding, warna, animasi, atau estetika kaca tidak boleh merusak fungsionalitas JavaScript, form submit, streaming kamera, atau response API.
