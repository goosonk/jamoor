from flask import Flask, render_template, request, jsonify, make_response
import os
import sys
import numpy as np

app = Flask(__name__, template_folder='../templates', static_folder='../static')

# Root path resolving for local & Vercel serverless
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Pastikan virtual environment .venv_vision tersedia untuk dependensi ML
venv_site = os.path.join(project_root, '.venv_vision', 'Lib', 'site-packages')
if os.path.exists(venv_site) and venv_site not in sys.path:
    sys.path.insert(0, venv_site)

@app.after_request
def add_header(response):
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route('/')
def index():
    resp = make_response(render_template('index.html'))
    resp.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    resp.headers['Pragma'] = 'no-cache'
    return resp

@app.route('/workspace')
def workspace():
    resp = make_response(render_template('workspace.html'))
    resp.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    resp.headers['Pragma'] = 'no-cache'
    return resp

@app.route('/api/predict-vision', methods=['POST'])
def predict_vision():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'File gambar tidak ditemukan dalam request'}), 400

        file = request.files['image']
        if not file or file.filename == '':
            return jsonify({'error': 'File gambar kosong atau tidak valid'}), 400

        # Validasi ekstensi berkas
        allowed_extensions = {'.jpg', '.jpeg', '.png', '.webp', '.bmp'}
        _, ext = os.path.splitext(file.filename.lower())
        if ext and ext not in allowed_extensions:
            return jsonify({'error': f'Format file {ext} tidak didukung. Harap gunakan format JPG, PNG, atau WEBP.'}), 400

        import vision_classifier

        result = vision_classifier.predict_mushroom_vision(file)
        if not result.get('success', False) and 'error' in result:
            return jsonify({'error': result['error']}), 400

        return jsonify(result)
    except Exception as e:
        return jsonify({'error': f'Kesalahan pemrosesan inferensi: {str(e)}'}), 500

@app.route('/api/info')
def info():
    return jsonify({
        'model_name': 'CNN MobileNetV2',
        'display_name': 'MobileNetV2 + SVM RBF (Platform Identifikasi Spesies & Edukasi)',
        'architecture': 'Feature Extractor: MobileNetV2 Pretrained (1280-D) | Classifier: SVM RBF (Multiclass 39 Spesies & Biner Edukatif)',
        'feature_extractor': 'torchvision.models.mobilenet_v2 (ImageNet Pretrained)',
        'feature_vector_dim': 1280,
        'classifier_type': 'Support Vector Machine (SVM RBF Kernel)',
        'multiclass_model': 'model_species_multiclass.joblib',
        'binary_model': 'model_biner_svm.joblib',
        'multiclass_detail': '39 Spesies (Identifikasi Utama)',
        'binary_detail': 'Prediksi Biner Edukatif',
        'knowledge_base': 'species_knowledge_base.json',
        'num_species': 39,
        'input_shape': [1, 3, 224, 224],
        'color_mode': 'RGB',
        'normalization': 'ImageNet Standard (mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])',
        'confidence_threshold': 50.0,
        'status': 'active'
    })

@app.route('/api/extract-color', methods=['POST'])
def extract_color():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file uploaded'}), 400
        
        file = request.files['image']
        from PIL import Image
        import vision_classifier

        img = Image.open(file.stream).convert('RGB')
        color_res = vision_classifier.classifier.segment_cap_region(img)

        return jsonify({
            'detected_code': 'e' if 'Merah' in color_res['color_name'] else 'n',
            'detected_name': color_res['color_name'],
            'secondary_name': color_res.get('secondary_color_name'),
            'rgb': color_res['rgb'],
            'hex': color_res['hex'],
            'area_percentage': color_res.get('area_percentage'),
            'secondary_area_percentage': color_res.get('secondary_area_percentage'),
            'roi_zone': color_res.get('roi_zone'),
            'surface_name': color_res['surface_name']
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
