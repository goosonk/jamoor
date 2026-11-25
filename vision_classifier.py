"""
vision_classifier.py - Engine Machine Learning Vision Shroomy (Phase 5)
========================================================================
Platform Identifikasi dan Edukasi Jamur Berbasis Machine Learning:
1. Feature Extractor:
   - Backbone: MobileNetV2 pretrained ImageNet (weights=MobileNet_V2_Weights.DEFAULT)
   - Feature Vector: Vektor representasi visual berdimensi 1.280 (1280-D)
2. Classifiers (SVM RBF):
   - Multiclass SVM (model_species_multiclass.joblib): Mengidentifikasi 39 taksonomi spesies jamur
   - Binary SVM (model_biner_svm.joblib): Evaluasi prediksi biner edukatif
3. Species Knowledge Base (species_knowledge_base.json):
   - Informasi biologis, nama umum, karakteristik morfologi, habitat, dan status referensi ilmiah
4. Ekstraksi Warna & Tekstur Tudung:
   - Segmentasi ROI dinamis berfokus pada area tudung jamur
   - Pemisahan latar belakang (border frame) dan deteksi warna utama & sekunder (misal bintik putih)
"""

import os
import sys
import io
import json
import time
import numpy as np
from PIL import Image

# Pastikan virtual environment .venv_vision dapat diakses bila dijalankan dari runtime luar
project_root = os.path.dirname(os.path.abspath(__file__))
venv_site = os.path.join(project_root, '.venv_vision', 'Lib', 'site-packages')
if os.path.exists(venv_site) and venv_site not in sys.path:
    sys.path.insert(0, venv_site)

# Ambang batas keyakinan minimum untuk hasil yang dianggap meyakinkan
CONFIDENCE_THRESHOLD = 50.0

# Disclaimer medis dan keselamatan wajib
MANDATORY_SAFETY_DISCLAIMER = (
    "PERINGATAN KESELAMATAN: Sistem identifikasi citra ini merupakan alat bantu edukasi "
    "berbasis Machine Learning dan TIDAK BOLEH dijadikan acuan tunggal atau jaminan mutlak "
    "keamanan konsumsi jamur liar. Beberapa spesies jamur beracun memiliki kemiripan morfologi "
    "visual yang sangat tinggi dengan jamur pangan (look-alike). Jangan pernah mengonsumsi jamur liar "
    "tanpa verifikasi langsung oleh ahli mikologi profesional berlisensi."
)

# Pemetaan sinonim taksonomi ilmiah (Boletus satanas <-> Rubroboletus satanas, taxon_id=544554)
SPECIES_SYNONYMS = {
    'Boletus satanas': 'Rubroboletus satanas',
    'Rubroboletus satanas': 'Boletus satanas'
}


def classify_color_nuanced(rgb):
    """
    Klasifikasi nama warna berdasarkan ruang warna HSV dan rasio RGB
    yang disesuaikan dengan spektrum warna mikologi ilmiah.
    Memisahkan secara akurat Cokelat Tua/Gelap dari Merah Tua/Marun,
    serta memisahkan Merah Cerah, Merah Oranye, Oranye, Kuning, Krem, Putih, dan Abu-abu.
    """
    r, g, b = float(rgb[0]), float(rgb[1]), float(rgb[2])
    rn, gn, bn = r / 255.0, g / 255.0, b / 255.0

    maxc = max(rn, gn, bn)
    minc = min(rn, gn, bn)
    v = maxc
    deltac = maxc - minc

    s = 0.0 if maxc < 1e-5 else deltac / maxc

    if deltac < 1e-5:
        h = 0.0
    elif maxc == rn:
        h = 60.0 * (((gn - bn) / deltac) % 6)
    elif maxc == gn:
        h = 60.0 * (((bn - rn) / deltac) + 2)
    else:
        h = 60.0 * (((rn - gn) / deltac) + 4)

    hex_color = f"#{int(np.clip(round(r), 0, 255)):02x}{int(np.clip(round(g), 0, 255)):02x}{int(np.clip(round(b), 0, 255)):02x}"

    # 1. Kecerahan sangat rendah -> Hitam / Kehitaman
    if v < 0.16:
        return "Hitam / Kehitaman (Black/Dark)", hex_color

    # 2. Kejenuhan sangat rendah -> Putih, Abu-abu Terang, Abu-abu Gelap
    if s < 0.18:
        if v > 0.75:
            return "Putih (White)", hex_color
        elif v > 0.44:
            return "Abu-abu Terang (Light Gray)", hex_color
        else:
            return "Abu-abu Gelap (Dark Gray)", hex_color

    # 3. Kejenuhan rendah hingga sedang dengan kecerahan tinggi -> Krem / Buff
    if s < 0.35 and v > 0.62 and (12.0 <= h <= 68.0):
        return "Krem / Buff (Buff/Cream)", hex_color

    # 4. Merah / Merah Cerah / Merah Tua (Marun)
    # Rona merah murni (h >= 340 atau h < 12), atau rona merah-oranye (12 <= h < 19) dengan kecerahan cukup & dominasi merah
    is_true_red_hue = (h >= 340.0) or (h < 12.0) or (12.0 <= h < 19.0 and v >= 0.42 and r > g * 1.62 and s >= 0.50)
    if is_true_red_hue:
        if v < 0.40:
            # Hanya rona merah/crimson murni (h >= 342 atau h < 9) dengan saturasi tinggi yang dikategorikan Merah Tua/Marun
            if (h >= 342.0 or h < 9.0) and s >= 0.50 and (r > g * 1.75):
                return "Merah Tua / Marun (Dark Red/Maroon)", hex_color
            else:
                return "Cokelat Tua / Gelap (Dark Brown)", hex_color
        elif s >= 0.50:
            return "Merah Cerah (Bright Red / Scarlet)", hex_color
        elif s >= 0.36:
            return "Merah (Red)", hex_color
        else:
            return "Cokelat Kemerahan (Reddish Brown)", hex_color

    # 5. Rentang Rona Hangat Merah-Oranye, Oranye, dan Cokelat (12 <= h < 45)
    if 12.0 <= h < 45.0:
        if v < 0.38:
            return "Cokelat Tua / Gelap (Dark Brown)", hex_color
        if s >= 0.45 and v >= 0.48:
            if h < 23.0:
                return "Merah Oranye (Scarlet / Red-Orange)", hex_color
            elif h < 36.0 and s >= 0.55:
                return "Oranye (Orange)", hex_color
            elif h >= 36.0 and s >= 0.55:
                return "Kuning / Emas (Yellow/Golden)", hex_color
        if v < 0.52:
            return "Cokelat (Brown)", hex_color
        else:
            return "Cokelat Terang / Kayu Manis (Cinnamon/Tan)", hex_color

    # 6. Kuning / Emas / Cokelat Zaitun (45 <= h < 68)
    if 45.0 <= h < 68.0:
        if s >= 0.38 and v >= 0.45:
            return "Kuning / Emas (Yellow/Golden)", hex_color
        elif v < 0.45:
            return "Cokelat Zaitun (Olive Brown)", hex_color
        else:
            return "Krem / Buff Kekuningan (Yellowish Buff)", hex_color

    # 7. Hijau / Zaitun
    if 68.0 <= h < 165.0:
        return "Hijau / Zaitun (Olive/Green)", hex_color

    # 8. Biru / Kebiruan
    if 165.0 <= h < 260.0:
        return "Biru / Kebiruan (Blue/Bluish)", hex_color

    # 9. Ungu / Violet
    if 260.0 <= h < 340.0:
        return "Ungu / Violet (Purple/Violet)", hex_color

    return "Cokelat (Brown)", hex_color


class VisionClassifierSingleton:
    """Singleton engine untuk memuat MobileNetV2 feature extractor dan Dual SVM classifier."""
    _instance = None
    _backbone = None
    _binary_clf = None
    _multi_clf = None
    _classes = None
    _taxon_ids = None
    _species_map = None
    _species_kb = None
    _transform = None
    _torch = None
    _init_attempted = False
    _load_error = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(VisionClassifierSingleton, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if not self._init_attempted:
            self._init_attempted = True
            self._load_pipeline()

    def _load_pipeline(self):
        """Memuat seluruh komponen pipeline Machine Learning dan Knowledge Base."""
        try:
            import torch
            import torch.nn as nn
            import torchvision.models as models
            from torchvision.models import MobileNet_V2_Weights
            from torchvision import transforms
            import joblib

            self._torch = torch

            # 1. Feature Extractor MobileNetV2 (1280-D)
            backbone = models.mobilenet_v2(weights=MobileNet_V2_Weights.DEFAULT)
            backbone.classifier = nn.Identity()
            backbone.eval()
            for p in backbone.parameters():
                p.requires_grad = False
            self._backbone = backbone

            # 2. Setup torchvision transforms (sesuai Colab)
            self._transform = transforms.Compose([
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
            ])

            # 3. Muat Model SVM Biner (Edible vs Poisonous)
            bin_path = os.path.join(project_root, 'model_biner_svm.joblib')
            if not os.path.exists(bin_path):
                raise FileNotFoundError(f"Model SVM biner tidak ditemukan: {bin_path}")
            self._binary_clf = joblib.load(bin_path)

            # 4. Muat Model SVM Multiclass (39 Spesies Jamur)
            multi_path = os.path.join(project_root, 'model_species_multiclass.joblib')
            if not os.path.exists(multi_path):
                raise FileNotFoundError(f"Model multiclass tidak ditemukan: {multi_path}")
            multi_data = joblib.load(multi_path)
            self._multi_clf = multi_data['model']
            self._classes = list(multi_data['classes'])
            self._taxon_ids = list(multi_data.get('taxon_ids', []))

            # 5. Muat Status Map Edibilitas Spesies
            map_path = os.path.join(project_root, 'species_status_map.json')
            if os.path.exists(map_path):
                with open(map_path, 'r', encoding='utf-8') as f:
                    self._species_map = json.load(f)
            else:
                self._species_map = {}

            # 6. Muat Species Knowledge Base Edukasi & Biologi
            kb_path = os.path.join(project_root, 'species_knowledge_base.json')
            if os.path.exists(kb_path):
                with open(kb_path, 'r', encoding='utf-8') as f:
                    self._species_kb = json.load(f)
            else:
                self._species_kb = {}

            self._load_error = None
        except Exception as e:
            self._load_error = str(e)
            self._backbone = None
            self._binary_clf = None
            self._multi_clf = None
            self._species_map = None
            self._species_kb = None

    @property
    def is_available(self):
        return (self._backbone is not None and 
                self._binary_clf is not None and 
                self._multi_clf is not None)

    @property
    def load_error(self):
        return self._load_error

    def resolve_species_metadata(self, species_name, class_idx=None):
        """
        Mengambil informasi spesies secara deterministik dan terverifikasi dari
        species_knowledge_base.json dan species_status_map.json berdasarkan nama kelas model.
        - Mendukung resolusi sinonim taksonomi ilmiah (Boletus satanas <-> Rubroboletus satanas).
        - Memastikan tidak ada pertukaran status antar-spesies.
        - Menangani kegagalan mapping dengan pesan fallback yang aman dan eksplisit.
        """
        raw_name = str(species_name).strip() if species_name else ''
        synonym_name = SPECIES_SYNONYMS.get(raw_name)

        kb_dict = self._species_kb if isinstance(self._species_kb, dict) else {}
        smap_dict = self._species_map if isinstance(self._species_map, dict) else {}

        # Cari entri di Knowledge Base (nama langsung atau sinonim taksonomi yang sah)
        kb_entry = kb_dict.get(raw_name)
        kb_matched_key = raw_name if kb_entry is not None else None
        if kb_entry is None and synonym_name and synonym_name in kb_dict:
            kb_entry = kb_dict.get(synonym_name)
            kb_matched_key = synonym_name

        # Cari entri di Status Map (nama langsung atau sinonim taksonomi yang sah)
        smap_status = smap_dict.get(raw_name)
        smap_matched_key = raw_name if smap_status is not None else None
        if smap_status is None and synonym_name and synonym_name in smap_dict:
            smap_status = smap_dict.get(synonym_name)
            smap_matched_key = synonym_name

        # Verifikasi kesesuaian kelas terhadap 39 kelas model
        in_model_classes = False
        if self._classes:
            if class_idx is not None and 0 <= int(class_idx) < len(self._classes):
                in_model_classes = (str(self._classes[int(class_idx)]) == raw_name)
            else:
                in_model_classes = (raw_name in self._classes) or (synonym_name in self._classes if synonym_name else False)

        default_morphology = {
            'cap_color': 'Informasi warna tudung belum tersedia dalam database referensi',
            'cap_shape': 'Informasi bentuk tudung belum tersedia dalam database referensi',
            'cap_surface': 'Informasi permukaan belum tersedia dalam database referensi',
            'stem_characteristics': 'Informasi batang belum tersedia dalam database referensi',
            'hymenium_type': 'Informasi lapisan spora belum tersedia dalam database referensi'
        }

        if not isinstance(kb_entry, dict) or not kb_entry:
            return {
                'species_name': raw_name or 'Spesies Tidak Diketahui',
                'scientific_name': raw_name or 'Spesies Tidak Diketahui',
                'common_name': 'Nama umum belum tersedia dalam referensi',
                'reference_status': 'Informasi status referensi belum tersedia dalam database',
                'status_category': smap_status if smap_status in ('edible', 'poisonous', 'deadly') else 'unknown',
                'reference_binary_status': smap_status if smap_status in ('edible', 'poisonous') else 'unknown',
                'reference_status_note': (
                    f"PERHATIAN: Data profil referensi untuk spesies '{raw_name}' belum tersedia secara lengkap. "
                    "Jangan gunakan hasil ini sebagai acuan keamanan konsumsi."
                ),
                'morphology': default_morphology,
                'ecological_habitat': 'Informasi habitat belum tersedia dalam database referensi',
                'educational_facts': 'Catatan edukasi belum tersedia dalam database referensi.',
                'short_description': 'Deskripsi biologis spesies belum tersedia dalam database referensi.',
                'kb_matched_key': None,
                'smap_matched_key': smap_matched_key,
                'mapping_verified': False,
                'mapping_status': 'unmapped_species'
            }

        raw_morph = kb_entry.get('morphology') if isinstance(kb_entry.get('morphology'), dict) else {}
        morphology = {
            'cap_color': raw_morph.get('cap_color') or default_morphology['cap_color'],
            'cap_shape': raw_morph.get('cap_shape') or default_morphology['cap_shape'],
            'cap_surface': raw_morph.get('cap_surface') or default_morphology['cap_surface'],
            'stem_characteristics': raw_morph.get('stem_characteristics') or default_morphology['stem_characteristics'],
            'hymenium_type': raw_morph.get('hymenium_type') or default_morphology['hymenium_type']
        }

        status_category = kb_entry.get('status_category', 'unknown')
        kb_binary_equiv = 'poisonous' if status_category in ('poisonous', 'deadly') else (
            'edible' if status_category == 'edible' else 'unknown'
        )
        reference_binary_status = smap_status if smap_status in ('edible', 'poisonous') else kb_binary_equiv

        # Pastikan konsistensi antara status_category di Knowledge Base dan species_status_map.json
        status_sources_agree = (
            smap_status is not None and
            kb_binary_equiv in ('edible', 'poisonous') and
            smap_status == kb_binary_equiv
        )
        mapping_verified = bool(in_model_classes and kb_matched_key is not None and status_sources_agree)
        mapping_status = 'verified' if mapping_verified else (
            'verified_with_synonym' if (kb_matched_key is not None and status_sources_agree) else 'incomplete_mapping'
        )

        return {
            'species_name': raw_name,
            'scientific_name': kb_entry.get('scientific_name') or raw_name,
            'common_name': kb_entry.get('common_name') or 'Nama umum belum tersedia dalam referensi',
            'reference_status': kb_entry.get('reference_status') or 'Informasi status belum tersedia',
            'status_category': status_category,
            'reference_binary_status': reference_binary_status,
            'reference_status_note': kb_entry.get('reference_status_note') or (
                'Status bersumber dari referensi literatur mikologi ilmiah, bukan hasil pengujian klinis atau jaminan konsumsi.'
            ),
            'morphology': morphology,
            'ecological_habitat': kb_entry.get('ecological_habitat') or default_morphology['cap_color'].replace('warna tudung', 'habitat'),
            'educational_facts': kb_entry.get('educational_facts') or 'Catatan edukasi belum tersedia dalam database referensi.',
            'short_description': kb_entry.get('short_description') or 'Deskripsi biologis spesies belum tersedia dalam database referensi.',
            'kb_matched_key': kb_matched_key,
            'smap_matched_key': smap_matched_key,
            'mapping_verified': mapping_verified,
            'mapping_status': mapping_status
        }

    def evaluate_model_consistency(self, binary_predicted_class, p_edible_pct, p_poisonous_pct,
                                   top_species, top_conf_pct, is_confident, species_meta):
        """
        Mengevaluasi konsistensi antara hasil prediksi Binary SVM (Edible/Poisonous)
        dan status referensi ilmiah dari spesies Top-1 Multiclass SVM (39 kelas).
        Kedua model dilatih secara terpisah, sehingga sistem mendeteksi apabila terjadi perbedaan.
        """
        ref_bin = species_meta.get('reference_binary_status', 'unknown')
        ref_cat = species_meta.get('status_category', 'unknown')
        ref_status_text = species_meta.get('reference_status', 'Informasi status belum tersedia')

        if ref_bin in ('edible', 'poisonous'):
            is_binary_consistent = (binary_predicted_class == ref_bin)
        else:
            is_binary_consistent = False

        if is_binary_consistent and is_confident:
            consistency_status = 'consistent_confident'
            binary_note = (
                f"Konsisten: Prediksi biner edukatif ({binary_predicted_class.upper()}) selaras dengan "
                f"status referensi literatur untuk {top_species} ({ref_status_text}). "
                "Informasi ini bersifat edukatif, bukan jaminan keamanan konsumsi."
            )
        elif is_binary_consistent and not is_confident:
            consistency_status = 'consistent_low_confidence'
            binary_note = (
                f"Prediksi biner edukatif ({binary_predicted_class.upper()}) searah dengan status referensi kandidat teratas "
                f"{top_species}, namun tingkat keyakinan identifikasi spesies masih rendah ({top_conf_pct}% < {CONFIDENCE_THRESHOLD}%)."
            )
        elif not is_binary_consistent and not is_confident:
            consistency_status = 'inconsistent_low_confidence'
            binary_note = (
                f"PERHATIAN KETIDAKPASTIAN: Tingkat keyakinan spesies rendah ({top_conf_pct}% < {CONFIDENCE_THRESHOLD}%) "
                f"dan hasil model Biner ({binary_predicted_class.upper()}: Edible {p_edible_pct}% / Poisonous {p_poisonous_pct}%) "
                f"berbeda dari status referensi kandidat #1 {top_species} ({ref_bin.upper()}). Hasil belum konklusif."
            )
        else:
            consistency_status = 'inconsistent_model_disagreement'
            binary_note = (
                f"PERINGATAN PERBEDAAN MODEL: Model Multiclass mengidentifikasi {top_species} ({top_conf_pct}%) "
                f"yang tercatat berstatus '{ref_status_text}' ({ref_bin.upper()}), sedangkan model Biner terpisah "
                f"memprediksi {binary_predicted_class.upper()} (Edible {p_edible_pct}% / Poisonous {p_poisonous_pct}%). "
                "Utamakan kewaspadaan referensi ilmiah dan jangan mengonsumsi jamur liar."
            )

        return {
            'is_binary_consistent': is_binary_consistent,
            'consistency_status': consistency_status,
            'binary_predicted_class': binary_predicted_class,
            'reference_binary_status': ref_bin,
            'reference_status_category': ref_cat,
            'multiclass_confident': is_confident,
            'multiclass_confidence_pct': top_conf_pct,
            'binary_note': binary_note
        }

    def segment_cap_region(self, pil_image):
        """
        Segmentasi fokus area tudung jamur dan ekstraksi warna & tekstur permukaan:
        - Evaluasi multi-zona ROI vertikal secara adaptif (Upper-Center 14%-62%, Core-Center 20%-76%,
          Lower-Center 30%-85%, Full-Center 15%-85%) agar tidak terpaku pada satu rentang statis.
        - Penerapan 2D Center-Weighted Spatial Mask (Gaussian) agar fokus pada objek jamur.
        - Eliminasi warna latar belakang dari sampel frame border (8% margin) dan dedaunan hijau.
        - Reduksi pengaruh bayangan gelap ekstrem secara adaptif tanpa menghilangkan warna tudung yang memang gelap.
        - Evaluasi seluruh kandidat cluster K-Means (k=4 dengan penggabungan sub-cluster sejenis)
          tanpa ketergantungan pada filter kata pertama split()[0].
        """
        try:
            from sklearn.cluster import KMeans, MiniBatchKMeans

            # Ukuran kerja 200x200 untuk kecepatan dan reduksi noise
            work_size = 200
            rgb_img = pil_image.convert('RGB').resize((work_size, work_size), Image.Resampling.BILINEAR)
            arr = np.array(rgb_img, dtype=np.float32)
            h, w, _ = arr.shape

            # 1. Kumpulkan sampel latar belakang dari margin tepi luar (8% frame)
            m = max(4, int(work_size * 0.08))
            border_pixels = np.vstack([
                arr[:m, :, :].reshape(-1, 3),
                arr[-m:, :, :].reshape(-1, 3),
                arr[:, :m, :].reshape(-1, 3),
                arr[:, -m:, :].reshape(-1, 3)
            ])

            # Cluster warna lingkungan latar belakang
            bg_kmeans = MiniBatchKMeans(n_clusters=4, random_state=42, n_init=3)
            bg_kmeans.fit(border_pixels)
            bg_centers = bg_kmeans.cluster_centers_

            # 2. Evaluasi multi-zona ROI vertikal secara adaptif di dalam amplop y: 12% - 86%, x: 14% - 86%
            env_y0, env_y1 = int(h * 0.12), int(h * 0.86)
            env_x0, env_x1 = int(w * 0.14), int(w * 0.86)
            env_roi = arr[env_y0:env_y1, env_x0:env_x1]
            eh, ew, _ = env_roi.shape

            env_flat = env_roi.reshape(-1, 3)
            env_bg_dist = np.min(
                np.linalg.norm(env_flat[:, None, :] - bg_centers[None, :, :], axis=2),
                axis=1
            ).reshape(eh, ew)
            er, eg, eb = env_roi[:, :, 0], env_roi[:, :, 1], env_roi[:, :, 2]
            env_green = (eg > er * 1.10) & (eg > eb * 1.12) & (eg > 35.0)
            env_max = np.max(env_roi, axis=2) / 255.0
            env_min = np.min(env_roi, axis=2) / 255.0
            env_sat = np.divide(env_max - env_min, env_max, out=np.zeros_like(env_max), where=env_max > 1e-5)

            xx_env = np.linspace(-1.0, 1.0, ew, dtype=np.float32)[None, :]
            horiz_prior = np.exp(-0.5 * (xx_env / 0.55) ** 2)
            row_salience = np.where(
                ~env_green & (env_max >= 0.20),
                env_bg_dist * (1.0 + 0.6 * env_sat) * horiz_prior,
                0.0
            ).mean(axis=1)

            candidate_zones = [
                ("upper_center", 0.14, 0.62),
                ("core_center",  0.20, 0.76),
                ("lower_center", 0.30, 0.85),
                ("full_center",  0.15, 0.85),
            ]
            best_zone_name = "full_center"
            best_y0_frac, best_y1_frac = 0.15, 0.85
            best_zone_score = -1.0
            for zname, yf0, yf1 in candidate_zones:
                zy0 = max(0, int((yf0 - 0.12) * h))
                zy1 = min(eh, int((yf1 - 0.12) * h))
                if zy1 > zy0:
                    z_score = float(row_salience[zy0:zy1].mean())
                    if z_score > best_zone_score:
                        best_zone_score = z_score
                        best_zone_name = zname
                        best_y0_frac, best_y1_frac = yf0, yf1

            y0, y1 = int(h * best_y0_frac), int(h * best_y1_frac)
            x0, x1 = int(w * 0.14), int(w * 0.86)
            roi = arr[y0:y1, x0:x1]
            roi_pixels = roi.reshape(-1, 3)

            # 3. Terapkan 2D Center-Weighted Spatial Mask (Gaussian) pada zona ROI terpilih
            yy, xx = np.mgrid[y0:y1, x0:x1]
            cy_zone = 0.5 * (best_y0_frac + best_y1_frac)
            sigma_y = 0.52 * (best_y1_frac - best_y0_frac)
            ny = (yy / float(h) - cy_zone) / max(0.18, sigma_y)
            nx = (xx / float(w) - 0.50) / 0.24
            spatial_weights = np.exp(-0.5 * (ny ** 2 + nx ** 2)).astype(np.float32).reshape(-1)

            # Jarak piksel ROI terhadap cluster background
            dists_to_bg = np.min(np.linalg.norm(roi_pixels[:, None, :] - bg_centers[None, :, :], axis=2), axis=1)

            # Filter dedaunan hijau terang latar belakang
            r, g, b = roi_pixels[:, 0], roi_pixels[:, 1], roi_pixels[:, 2]
            is_green_leaf = (g > r * 1.10) & (g > b * 1.12) & (g > 35.0)

            # Masking piksel foreground tudung dengan bobot spasial pusat
            weighted_bg_dist = dists_to_bg * (0.65 + 0.55 * spatial_weights)
            fg_mask = (weighted_bg_dist > 28.0) & (~is_green_leaf)

            if fg_mask.sum() < (len(roi_pixels) * 0.12):
                fg_mask = (dists_to_bg > 18.0) & (~is_green_leaf)
            if fg_mask.sum() < (len(roi_pixels) * 0.05):
                fg_mask = ~is_green_leaf

            # 4. Kurangi pengaruh piksel bayangan yang terlalu gelap tanpa menghilangkan tudung yang memang gelap
            v_all = np.max(roi_pixels, axis=1) / 255.0
            fg_v = v_all[fg_mask]
            if len(fg_v) > 100:
                bright_ratio = float(np.mean(fg_v >= 0.36))
                if bright_ratio >= 0.30:
                    non_shadow_mask = fg_mask & (v_all >= 0.24)
                    if non_shadow_mask.sum() >= 80:
                        fg_mask = non_shadow_mask

            fg_pixels = roi_pixels[fg_mask]
            fg_weights = spatial_weights[fg_mask]

            if len(fg_pixels) < 50:
                return {
                    'identified': False,
                    'color_name': 'Warna tudung belum dapat diidentifikasi secara meyakinkan',
                    'secondary_color_name': None,
                    'hex': '#888888',
                    'secondary_hex': None,
                    'rgb': [136, 136, 136],
                    'secondary_rgb': None,
                    'area_percentage': 0.0,
                    'weighted_area_percentage': 0.0,
                    'secondary_area_percentage': None,
                    'roi_zone': f"{best_zone_name} (y:{int(best_y0_frac*100)}%-{int(best_y1_frac*100)}%)",
                    'clusters': [],
                    'surface_name': 'Informasi permukaan belum tersedia',
                    'is_confident_color': False
                }

            # 5. K-Means clustering (k=4) + penggabungan sub-cluster dengan kategori warna yang sama
            n_clusters = 4 if len(fg_pixels) >= 200 else 3
            kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=5)
            labels = kmeans.fit_predict(fg_pixels, sample_weight=fg_weights)
            centers = kmeans.cluster_centers_
            counts = np.bincount(labels, minlength=n_clusters)

            merged_groups = {}
            for k in range(n_clusters):
                if counts[k] == 0:
                    continue
                c_rgb = centers[k]
                c_name, _ = classify_color_nuanced(c_rgb)
                mask_k = (labels == k)
                cnt_k = int(counts[k])
                w_sum_k = float(fg_weights[mask_k].sum())
                if c_name not in merged_groups:
                    merged_groups[c_name] = {
                        'count': cnt_k,
                        'w_sum': w_sum_k,
                        'rgb_sum': c_rgb * cnt_k,
                        'spatial_vals': [fg_weights[mask_k]]
                    }
                else:
                    merged_groups[c_name]['count'] += cnt_k
                    merged_groups[c_name]['w_sum'] += w_sum_k
                    merged_groups[c_name]['rgb_sum'] += c_rgb * cnt_k
                    merged_groups[c_name]['spatial_vals'].append(fg_weights[mask_k])

            total_fg = float(len(fg_pixels))
            total_w = float(fg_weights.sum() + 1e-8)

            has_vibrant_cap_cluster = False
            for cname, gdata in merged_groups.items():
                if (gdata['count'] / total_fg) >= 0.10:
                    avg_rgb = gdata['rgb_sum'] / float(gdata['count'])
                    cm_max = max(avg_rgb) / 255.0
                    cm_min = min(avg_rgb) / 255.0
                    cm_sat = (cm_max - cm_min) / cm_max if cm_max > 1e-5 else 0.0
                    if cm_sat >= 0.45 and cm_max >= 0.45:
                        has_vibrant_cap_cluster = True
                        break

            cluster_info = []
            for idx, (cname, gdata) in enumerate(merged_groups.items()):
                c_rgb = gdata['rgb_sum'] / float(gdata['count'])
                c_name, c_hex = classify_color_nuanced(c_rgb)
                c_max = max(c_rgb) / 255.0
                c_min = min(c_rgb) / 255.0
                c_sat = (c_max - c_min) / c_max if c_max > 1e-5 else 0.0
                c_bg_dist = float(np.min(np.linalg.norm(c_rgb[None, :] - bg_centers, axis=1)))
                all_sp = np.concatenate(gdata['spatial_vals'])
                mean_spatial = float(all_sp.mean())
                area_prop = gdata['count'] / total_fg
                w_prop = gdata['w_sum'] / total_w

                shadow_or_drab_factor = 1.0
                if c_max < 0.35 and c_sat < 0.50:
                    shadow_or_drab_factor = 0.50
                elif has_vibrant_cap_cluster and c_sat < 0.32 and c_max < 0.68:
                    shadow_or_drab_factor = 0.55

                bg_distinct_factor = float(np.clip(c_bg_dist / 45.0, 0.75, 1.20))
                score = w_prop * (0.68 + 0.32 * mean_spatial) * bg_distinct_factor * shadow_or_drab_factor

                cluster_info.append({
                    'cluster_id': idx,
                    'rgb': [int(round(x)) for x in c_rgb],
                    'raw_rgb': c_rgb,
                    'hex': c_hex,
                    'name': c_name,
                    'count': int(gdata['count']),
                    'area_pct': round(float(area_prop) * 100.0, 1),
                    'weighted_pct': round(float(w_prop) * 100.0, 1),
                    'mean_spatial': round(mean_spatial, 3),
                    'bg_dist': round(c_bg_dist, 1),
                    'v': round(c_max, 2),
                    's': round(c_sat, 2),
                    'score': round(float(score), 4)
                })

            cluster_info.sort(key=lambda x: x['score'], reverse=True)
            primary = cluster_info[0]
            primary_name = primary['name']
            primary_hex = primary['hex']
            top_rgb = primary['rgb']

            # 6. Pemilihan warna sekunder tanpa ketergantungan split()[0]
            best_sec = None
            best_sec_score = -1.0
            for cand in cluster_info[1:]:
                if cand['area_pct'] < 10.0:
                    continue
                rgb_dist = float(np.linalg.norm(primary['raw_rgb'] - cand['raw_rgb']))
                if rgb_dist <= 38.0:
                    continue
                if cand['name'] == primary_name:
                    continue
                if cand['v'] < 0.40 and cand['s'] < 0.38 and primary['v'] > 0.50:
                    continue

                contrast_factor = min(1.85, rgb_dist / 80.0)
                sec_score = cand['score'] * contrast_factor
                if sec_score > best_sec_score:
                    best_sec_score = sec_score
                    best_sec = cand

            sec_name = best_sec['name'] if best_sec else None
            sec_hex = best_sec['hex'] if best_sec else None
            sec_rgb = best_sec['rgb'] if best_sec else None
            sec_area_pct = best_sec['area_pct'] if best_sec else None

            # Estimasi tekstur permukaan
            fg_std = float(np.std(fg_pixels, axis=0).mean())
            if sec_name is not None and ('Putih' in sec_name or 'Krem' in sec_name):
                surface_desc = 'Scaly / Bintik Putih (Sisa Velum / Bintik Kutil)'
            elif sec_name is not None and ('Cokelat' in sec_name or 'Hitam' in sec_name):
                surface_desc = 'Scaly / Sisik Berbintik Gelap'
            elif fg_std > 35:
                surface_desc = 'Bertekstur / Kasar / Bersisik'
            elif fg_std > 20:
                surface_desc = 'Fibrous / Berserat Halus'
            else:
                surface_desc = 'Smooth / Halus Rata'

            public_clusters = [
                {
                    'name': c['name'],
                    'hex': c['hex'],
                    'rgb': c['rgb'],
                    'area_pct': c['area_pct'],
                    'weighted_pct': c['weighted_pct'],
                    'score': c['score']
                }
                for c in cluster_info
            ]

            return {
                'identified': True,
                'color_name': primary_name,
                'secondary_color_name': sec_name,
                'hex': primary_hex,
                'secondary_hex': sec_hex,
                'rgb': top_rgb,
                'secondary_rgb': sec_rgb,
                'area_percentage': primary['area_pct'],
                'weighted_area_percentage': primary['weighted_pct'],
                'secondary_area_percentage': sec_area_pct,
                'roi_zone': f"{best_zone_name} (y:{int(best_y0_frac*100)}%-{int(best_y1_frac*100)}%)",
                'clusters': public_clusters,
                'surface_name': surface_desc,
                'is_confident_color': True,
                'fg_pixels': int(len(fg_pixels))
            }
        except Exception:
            return {
                'identified': False,
                'color_name': 'Warna tudung belum dapat diidentifikasi secara meyakinkan',
                'secondary_color_name': None,
                'hex': '#888888',
                'secondary_hex': None,
                'rgb': [136, 136, 136],
                'secondary_rgb': None,
                'area_percentage': 0.0,
                'weighted_area_percentage': 0.0,
                'secondary_area_percentage': None,
                'roi_zone': 'fallback',
                'clusters': [],
                'surface_name': 'Informasi permukaan belum tersedia',
                'is_confident_color': False
            }

    def predict(self, image_input):
        """
        Menjalankan inferensi identifikasi spesies menggunakan pipeline MobileNetV2 + Dual SVM:
        1. Ekstraksi 1.280 fitur visual MobileNetV2.
        2. Multiclass SVM mengidentifikasi spesies jamur (39 kelas).
        3. Integrasi data biologi & edukasi dari Species Knowledge Base.
        4. Ekstraksi warna & tekstur tudung jamur terfokus.
        5. Prediksi biner SVM sebagai informasi edukatif pendukung.
        """
        if not self.is_available:
            return {
                'success': False,
                'error': f'Model Machine Learning tidak dapat dimuat: {self._load_error}'
            }

        # Parsing input citra
        pil_img = None
        try:
            if isinstance(image_input, Image.Image):
                pil_img = image_input
            elif isinstance(image_input, (bytes, bytearray)):
                pil_img = Image.open(io.BytesIO(image_input))
            elif hasattr(image_input, 'read'):
                pil_img = Image.open(image_input)
            elif isinstance(image_input, str) and os.path.exists(image_input):
                pil_img = Image.open(image_input)
            else:
                return {
                    'success': False,
                    'error': 'Format input citra tidak valid atau berkas tidak ditemukan'
                }
        except Exception as e:
            return {
                'success': False,
                'error': f'Gagal membaca berkas citra: {str(e)}'
            }

        # Ekstraksi warna tudung dan tekstur
        color_data = self.segment_cap_region(pil_img)

        # Preprocessing tensor untuk MobileNetV2
        try:
            rgb_img = pil_img.convert('RGB')
            tensor_in = self._transform(rgb_img).unsqueeze(0)
        except Exception as e:
            return {
                'success': False,
                'error': f'Gagal melakukan preprocessing citra: {str(e)}'
            }

        # Inferensi Machine Learning
        try:
            t0 = time.perf_counter()

            # 1. Ekstraksi 1.280 fitur visual dari backbone MobileNetV2
            with self._torch.no_grad():
                feat = self._backbone(tensor_in).cpu().numpy()

            # 2. Klasifikasi Multikelas SVM (39 Spesies)
            p_multi = self._multi_clf.predict_proba(feat)[0]
            top_idx = int(np.argmax(p_multi))
            top_species = str(self._classes[top_idx])
            top_conf_pct = round(float(p_multi[top_idx]) * 100.0, 1)
            top_taxon_id = int(self._taxon_ids[top_idx]) if top_idx < len(self._taxon_ids) else None

            # 3. Klasifikasi Biner SVM (Informasi Edukatif Pendukung)
            p_bin = self._binary_clf.predict_proba(feat)[0]
            p_edible = float(p_bin[0])
            p_poisonous = float(p_bin[1])
            p_edible_pct = round(p_edible * 100.0, 1)
            p_poisonous_pct = round(p_poisonous * 100.0, 1)
            binary_predicted_class = 'poisonous' if p_poisonous >= p_edible else 'edible'

            # 4. Lookup Terverifikasi dari Knowledge Base & Status Map Spesies
            species_meta = self.resolve_species_metadata(top_species, top_idx)
            common_name = species_meta['common_name']
            reference_status = species_meta['reference_status']
            status_category = species_meta['status_category']
            reference_binary_status = species_meta['reference_binary_status']
            reference_note = species_meta['reference_status_note']
            morphology = species_meta['morphology']
            ecological_habitat = species_meta['ecological_habitat']
            educational_facts = species_meta['educational_facts']
            short_description = species_meta['short_description']
            mapping_verified = species_meta['mapping_verified']
            mapping_status = species_meta['mapping_status']

            # 5. Susun Top 3 Kandidat Spesies (Multiclass SVM)
            top_3_idx = np.argsort(p_multi)[::-1][:3]
            top_candidates = []
            for rank_idx, idx in enumerate(top_3_idx, 1):
                sp_name = str(self._classes[idx])
                sp_meta = self.resolve_species_metadata(sp_name, int(idx))
                sp_conf = round(float(p_multi[idx]) * 100.0, 1)
                tid = int(self._taxon_ids[idx]) if idx < len(self._taxon_ids) else None
                top_candidates.append({
                    'rank': rank_idx,
                    'species': sp_name,
                    'species_name': sp_name,
                    'common_name': sp_meta['common_name'],
                    'confidence': sp_conf,
                    'confidence_pct': sp_conf,
                    'reference_status': sp_meta['reference_status'],
                    'status_category': sp_meta['status_category'],
                    'reference_binary_status': sp_meta['reference_binary_status'],
                    'mapping_verified': sp_meta['mapping_verified'],
                    'taxon_id': tid
                })

            is_confident = top_conf_pct >= CONFIDENCE_THRESHOLD
            status_code = 'classified' if is_confident else 'inconclusive'

            # 6. Evaluasi Konsistensi Binary SVM vs Multiclass Top-1 Reference Status
            consistency_info = self.evaluate_model_consistency(
                binary_predicted_class=binary_predicted_class,
                p_edible_pct=p_edible_pct,
                p_poisonous_pct=p_poisonous_pct,
                top_species=top_species,
                top_conf_pct=top_conf_pct,
                is_confident=is_confident,
                species_meta=species_meta
            )

            latency_ms = round((time.perf_counter() - t0) * 1000, 2)

            # Format teks deteksi warna untuk UI
            detected_color_full = color_data['color_name']
            if color_data.get('secondary_color_name'):
                detected_color_full += f" (Utama) + {color_data['secondary_color_name']} (Sekunder)"

            response_data = {
                'success': True,
                'classification_available': True,
                'cnn_available': True,
                'engine_mode': 'mobilenetv2_dual_svm',
                'model_used': 'MobileNetV2 (1280-D) + SVM RBF (39 Spesies)',
                'architecture': 'Feature Extractor: MobileNetV2 (Pretrained ImageNet) | Classifier: SVM RBF (Multiclass 39 Spesies & Biner)',
                'feature_extractor': 'torchvision.models.mobilenet_v2',
                'feature_vector_dim': 1280,
                'status_code': status_code,

                # Identitas Spesies Utama
                'species_name': top_species,
                'common_name': common_name,
                'species_confidence': top_conf_pct,
                'taxon_id': top_taxon_id,
                'is_confident': is_confident,
                'confidence_threshold': CONFIDENCE_THRESHOLD,

                # Top 3 Kandidat
                'top_candidates': top_candidates,

                # Status Referensi Ilmiah (Bukan vonis kelayakan konsumsi)
                'reference_status': reference_status,
                'reference_status_category': status_category,
                'status_category': status_category,
                'reference_binary_status': reference_binary_status,
                'reference_status_note': reference_note,
                'reference_note': reference_note,

                # Karakteristik Morfologi Referensi & Deteksi Visual
                'morphology': morphology,
                'ecological_habitat': ecological_habitat,
                'short_description': short_description,
                'educational_facts': educational_facts,

                # Hasil Deteksi Citra Visual Terfokus
                'detected_cap_color': {
                    'identified': color_data['identified'],
                    'primary_name': color_data['color_name'],
                    'primary_hex': color_data['hex'],
                    'primary_rgb': color_data['rgb'],
                    'primary_area_pct': color_data.get('area_percentage', 0.0),
                    'weighted_area_pct': color_data.get('weighted_area_percentage', 0.0),
                    'secondary_name': color_data.get('secondary_color_name'),
                    'secondary_hex': color_data.get('secondary_hex'),
                    'secondary_rgb': color_data.get('secondary_rgb'),
                    'secondary_area_pct': color_data.get('secondary_area_percentage'),
                    'roi_zone': color_data.get('roi_zone'),
                    'clusters': color_data.get('clusters', []),
                    'surface_name': color_data['surface_name']
                },

                # Prediksi Biner Edukatif & Evaluasi Konsistensi Antar-Model
                'binary_prediction': {
                    'predicted_class': binary_predicted_class,
                    'p_edible': p_edible_pct,
                    'p_poisonous': p_poisonous_pct,
                    'is_consistent_with_reference': consistency_info['is_binary_consistent'],
                    'consistency_status': consistency_info['consistency_status'],
                    'note': consistency_info['binary_note']
                },
                'model_consistency': consistency_info,

                # Backward compatibility untuk komponen UI lama & pengujian
                'label': status_category,
                'label_full': f"{top_species} ({common_name}) — Status Referensi: {reference_status}",
                'confidence': top_conf_pct,
                'probabilities': {
                    'index_0': p_edible_pct,
                    'index_1': p_poisonous_pct,
                    'e': p_edible_pct,
                    'p': p_poisonous_pct
                },
                'mapping_verified': mapping_verified,
                'mapping_status': mapping_status,
                'detected_color_code': 'e' if 'Merah' in color_data['color_name'] else 'n',
                'detected_color_name': detected_color_full,
                'detected_surface_code': 'y' if 'Scaly' in color_data['surface_name'] else 's',
                'detected_surface_name': color_data['surface_name'],
                'rgb': color_data['rgb'],
                'hex': color_data['hex'],
                'latency_ms': latency_ms,
                'safety_disclaimer': MANDATORY_SAFETY_DISCLAIMER
            }

            return response_data

        except Exception as e:
            return {
                'success': False,
                'error': f'Terjadi kesalahan saat inferensi pipeline Machine Learning: {str(e)}'
            }


# Instansiasi singleton modul
classifier = VisionClassifierSingleton()


def predict_mushroom_vision(image_input):
    """Fungsi helper publik untuk memanggil inferensi singleton."""
    return classifier.predict(image_input)
