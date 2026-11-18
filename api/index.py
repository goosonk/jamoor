from flask import Flask, render_template, request, jsonify, make_response
import joblib
import pandas as pd
import numpy as np
import os

app = Flask(__name__, template_folder='../templates', static_folder='../static')

# Root path resolving for local & Vercel serverless
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)

model_path = os.path.join(project_root, 'mushroom_pipeline.joblib')
categories_path = os.path.join(project_root, 'feature_categories.joblib')

artifact = joblib.load(model_path)
categories = joblib.load(categories_path)

model = artifact['best_model']
preprocessor = artifact['preprocessor']
scaler = artifact['scaler']
label_encoder = artifact['label_encoder']
cat_features = artifact['cat_features']

@app.after_request
def add_header(response):
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route('/')
def index():
    resp = make_response(render_template('index.html', categories=categories, features=cat_features))
    resp.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    resp.headers['Pragma'] = 'no-cache'
    return resp

@app.route('/workspace')
def workspace():
    summary_df = artifact['summary_df']
    resp = make_response(render_template(
        'workspace.html',
        categories=categories,
        features=cat_features,
        model_summary=summary_df.to_dict(orient='records')
    ))
    resp.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    resp.headers['Pragma'] = 'no-cache'
    return resp

@app.route('/api/predict-vision', methods=['POST'])
def predict_vision():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'File gambar tidak ditemukan'}), 400

        file = request.files['image']
        from PIL import Image, ImageStat

        raw_img = Image.open(file.stream).convert('RGB')
        # Standard MobileNetV2 224x224 preprocessing
        img_224 = raw_img.resize((224, 224))
        w, h = img_224.size

        # ROI Center 25% for dominant cap color & texture analysis
        roi_crop = img_224.crop((int(w * 0.25), int(h * 0.25), int(w * 0.75), int(h * 0.75)))
        roi_arr = np.array(roi_crop, dtype=np.float32)
        avg_rgb = roi_arr.mean(axis=(0, 1))
        std_rgb = roi_arr.std(axis=(0, 1)).mean()

        # Full image texture & contrast statistics
        full_arr = np.array(img_224, dtype=np.float32)
        edge_grad = float(np.abs(np.diff(full_arr, axis=0)).mean() + np.abs(np.diff(full_arr, axis=1)).mean())

        palette = {
            'n': ('Brown (Cokelat)', np.array([120, 75, 38])),
            'b': ('Buff (Krem Muda)', np.array([225, 205, 145])),
            'c': ('Cinnamon (Kayu Manis)', np.array([165, 88, 42])),
            'g': ('Gray (Abu-abu)', np.array([130, 130, 130])),
            'r': ('Green (Hijau)', np.array([60, 130, 70])),
            'p': ('Pink (Merah Muda)', np.array([235, 140, 160])),
            'u': ('Purple (Ungu)', np.array([120, 50, 140])),
            'e': ('Red (Merah)', np.array([195, 40, 40])),
            'w': ('White (Putih)', np.array([242, 242, 242])),
            'y': ('Yellow (Kuning)', np.array([235, 205, 50]))
        }

        best_code = 'n'
        min_dist = float('inf')
        for code, (cname, ref_rgb) in palette.items():
            diff = avg_rgb - ref_rgb
            dist = float((2 * diff[0]**2 + 4 * diff[1]**2 + 3 * diff[2]**2)**0.5)
            if dist < min_dist:
                min_dist = dist
                best_code = code

        # Surface texture estimation from ROI variance
        if std_rgb > 42:
            detected_surface = ('y', 'Scaly (Bersisik / Berbintik)')
        elif edge_grad > 22:
            detected_surface = ('f', 'Fibrous (Berserat)')
        else:
            detected_surface = ('s', 'Smooth (Halus / Licin)')

        # Format warna hex untuk UI
        hex_color = "#{:02x}{:02x}{:02x}".format(int(avg_rgb[0]), int(avg_rgb[1]), int(avg_rgb[2]))

        # Coba inferensi native TorchScript MobileNetV2 jika torch terpasang
        vision_pt_path = os.path.join(project_root, 'mushroom_vision_model.pt.zip')
        prob_poisonous = None
        cnn_inferred = False

        try:
            import torch
            if os.path.exists(vision_pt_path):
                ts_model = torch.jit.load(vision_pt_path, map_location='cpu')
                ts_model.eval()
                mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
                std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
                norm_img = ((full_arr / 255.0) - mean) / std
                tensor_in = torch.from_numpy(norm_img.transpose(2, 0, 1)).unsqueeze(0)
                with torch.no_grad():
                    out_probs = ts_model(tensor_in)[0].cpu().numpy()
                prob_poisonous = float(out_probs[1]) * 100.0
                cnn_inferred = True
        except Exception:
            prob_poisonous = None
            cnn_inferred = False

        if cnn_inferred and prob_poisonous is not None:
            prob_edible = round(100.0 - prob_poisonous, 1)
            prob_poisonous = round(prob_poisonous, 1)
            is_poison = prob_poisonous >= 50.0
            conf = prob_poisonous if is_poison else prob_edible

            return jsonify({
                'classification_available': True,
                'cnn_available': True,
                'engine_mode': 'torchscript_cnn',
                'model_used': 'CNN MobileNetV2 (TorchScript Engine)',
                'architecture': 'MobileNetV2 (Input 224×224 RGB)',
                'label': 'poisonous' if is_poison else 'edible',
                'label_full': 'POISONOUS (Beracun)' if is_poison else 'EDIBLE (Aman Dimakan)',
                'confidence': round(conf, 1),
                'probabilities': {
                    'e': prob_edible,
                    'p': prob_poisonous
                },
                'detected_color_code': best_code,
                'detected_color_name': palette[best_code][0],
                'detected_surface_code': detected_surface[0],
                'detected_surface_name': detected_surface[1],
                'rgb': [int(c) for c in avg_rgb],
                'hex': hex_color
            })
        else:
            # Mode ekstraksi warna dan tekstur visual (non-CNN / runtime serverless tanpa PyTorch)
            return jsonify({
                'classification_available': False,
                'cnn_available': False,
                'engine_mode': 'color_texture_extractor',
                'model_used': 'Ekstraksi Warna & Tekstur Citra (Heuristik RGB)',
                'architecture': 'Ekstraksi Fitur Visual ROI (Non-CNN)',
                'label': 'unclassified',
                'label_full': 'Fitur Visual Terdeteksi (Klasifikasi Citra Belum Tersedia di Runtime Ini)',
                'classification_message': 'Klasifikasi citra CNN memerlukan runtime PyTorch. Fitur ekstraksi warna tudung dan tekstur permukaan berhasil diperoleh dan siap disinkronkan ke tabel data morfologi.',
                'confidence': None,
                'probabilities': None,
                'detected_color_code': best_code,
                'detected_color_name': palette[best_code][0],
                'detected_surface_code': detected_surface[0],
                'detected_surface_name': detected_surface[1],
                'rgb': [int(c) for c in avg_rgb],
                'hex': hex_color
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/info')
def info():
    summary_df = artifact['summary_df']
    return jsonify({
        'model_name': artifact['best_model_name'],
        'vision_model': artifact.get('vision_model_file', 'mushroom_vision_model.pt.zip'),
        'summary': summary_df.to_dict(orient='records')
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        input_dict = {}
        for feature in cat_features:
            if feature not in data:
                return jsonify({'error': f'Missing feature: {feature}'}), 400
            input_dict[feature] = data[feature]
        
        input_df = pd.DataFrame([input_dict])
        encoded = preprocessor.transform(input_df)
        scaled = scaler.transform(encoded)
        
        # Pilihan model tabular: 'rf' (Random Forest) atau 'svm' (Support Vector Machine)
        selected_algo = data.get('model_type', 'rf')
        active_model = artifact.get('svm_model', model) if selected_algo == 'svm' else model

        pred_idx = int(active_model.predict(scaled)[0])
        pred_label = label_encoder.inverse_transform([pred_idx])[0]

        if hasattr(active_model, 'predict_proba'):
            proba = active_model.predict_proba(scaled)[0]
            conf = float(proba[pred_idx]) * 100
            score_type = 'estimated_probability'
            score_label = 'Estimasi Probabilitas Random Forest'
            decision_score = None
            is_rf = True
        else:
            decision = float(active_model.decision_function(scaled)[0])
            clipped_dec = float(np.clip(decision, -50.0, 50.0))
            prob_pos = float(1.0 / (1.0 + np.exp(-clipped_dec)))
            proba = np.array([1.0 - prob_pos, prob_pos])
            conf = float(proba[pred_idx]) * 100
            score_type = 'uncalibrated_decision_score'
            score_label = 'Skor Keputusan Sigmoid (Uncalibrated SVM Score)'
            decision_score = round(decision, 4)
            is_rf = False

        conf = float(np.clip(conf, 0.0, 100.0))

        all_probs = {}
        for i, label in enumerate(label_encoder.classes_):
            p_val = float(np.clip(proba[i] * 100, 0.0, 100.0))
            all_probs[label] = round(p_val, 1)

        result = {
            'model_used': 'Support Vector Machine (SVM)' if selected_algo == 'svm' else 'Random Forest',
            'label': 'poisonous' if pred_label == 'p' else 'edible',
            'label_full': 'POISONOUS (Beracun)' if pred_label == 'p' else 'EDIBLE (Aman Dimakan)',
            'confidence': round(conf, 1) if is_rf else None,
            'estimated_score': round(conf, 1),
            'decision_score': decision_score,
            'score_type': score_type,
            'score_label': score_label,
            'probabilities': all_probs if is_rf else None,
            'class_scores': all_probs
        }
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/extract-color', methods=['POST'])
def extract_color():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file uploaded'}), 400
        
        file = request.files['image']
        from PIL import Image

        img = Image.open(file.stream).convert('RGB')
        img = img.resize((64, 64))
        w, h = img.size
        cropped = img.crop((int(w * 0.25), int(h * 0.25), int(w * 0.75), int(h * 0.75)))
        
        arr = np.array(cropped)
        avg_rgb = arr.mean(axis=(0, 1))

        palette = {
            'n': ('brown (cokelat)', np.array([120, 75, 38])),
            'b': ('buff (kuning pucat)', np.array([225, 205, 145])),
            'c': ('cinnamon (kayu manis)', np.array([165, 88, 42])),
            'g': ('gray (abu-abu)', np.array([130, 130, 130])),
            'r': ('green (hijau)', np.array([60, 130, 70])),
            'p': ('pink (merah muda)', np.array([235, 140, 160])),
            'u': ('purple (ungu)', np.array([120, 50, 140])),
            'e': ('red (merah)', np.array([195, 40, 40])),
            'w': ('white (putih)', np.array([242, 242, 242])),
            'y': ('yellow (kuning)', np.array([235, 205, 50]))
        }

        best_code = None
        min_dist = float('inf')
        for code, (cname, ref_rgb) in palette.items():
            diff = avg_rgb - ref_rgb
            dist = (2 * diff[0]**2 + 4 * diff[1]**2 + 3 * diff[2]**2)**0.5
            if dist < min_dist:
                min_dist = dist
                best_code = code

        hex_color = "#{:02x}{:02x}{:02x}".format(int(avg_rgb[0]), int(avg_rgb[1]), int(avg_rgb[2]))
        return jsonify({
            'detected_code': best_code,
            'detected_name': palette[best_code][0],
            'rgb': [int(c) for c in avg_rgb],
            'hex': hex_color
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
