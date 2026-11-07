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

@app.route('/api/info')
def info():
    summary_df = artifact['summary_df']
    return jsonify({
        'model_name': artifact['best_model_name'],
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
        
        pred_idx = model.predict(scaled)[0]
        pred_label = label_encoder.inverse_transform([pred_idx])[0]
        proba = model.predict_proba(scaled)[0]
        prob = proba[pred_idx] * 100

        all_probs = {}
        for i, label in enumerate(label_encoder.classes_):
            all_probs[label] = round(proba[i] * 100, 1)

        # Daun pohon yang dicapai: berapa sampel latih yang jatuh di situ.
        rule_support = None
        if hasattr(model, 'apply') and hasattr(model, 'tree_'):
            leaf = int(model.apply(scaled)[0])
            rule_support = int(model.tree_.n_node_samples[leaf])

        result = {
            'label': 'poisonous' if pred_label == 'p' else 'edible',
            'label_full': 'POISONOUS (Beracun)' if pred_label == 'p' else 'EDIBLE (Aman Dimakan)',
            'confidence': round(prob, 1),
            'probabilities': all_probs,
            'rule_support': rule_support
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
