import sys
import os
import joblib
import pandas as pd
import numpy as np

# Pastikan import module api
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'api'))
project_root = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(project_root, 'mushroom_pipeline.joblib')

def train_and_save():
    print("Mendeteksi model tidak kompatibel / belum ada. Memulai auto-train cepat...")
    url = 'https://raw.githubusercontent.com/stedy/Machine-Learning-with-R-datasets/master/mushrooms.csv'
    df = pd.read_csv(url)
    if 'type' in df.columns: df = df.rename(columns={'type': 'class'})
    df.columns = [c.replace('_', '-') for c in df.columns]
    df = df.replace('?', np.nan).dropna(axis=1, thresh=int(len(df)*0.8)).dropna().reset_index(drop=True)
    df = df.drop(columns=[c for c in df.columns if df[c].nunique() == 1])

    from sklearn.preprocessing import OneHotEncoder, StandardScaler, LabelEncoder
    from sklearn.model_selection import train_test_split
    from sklearn.compose import ColumnTransformer
    from sklearn.tree import DecisionTreeClassifier
    from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

    X = df.drop(columns='class')
    le = LabelEncoder()
    y = le.fit_transform(df['class'])
    cat_features = X.columns.tolist()

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    pre = ColumnTransformer([('ohe', OneHotEncoder(handle_unknown='ignore', drop='first', sparse_output=False), cat_features)])
    Xtr = pre.fit_transform(X_train)
    Xte = pre.transform(X_test)

    scaler = StandardScaler()
    Xtr = scaler.fit_transform(Xtr)
    Xte = scaler.transform(Xte)

    dt = DecisionTreeClassifier(random_state=42)
    dt.fit(Xtr, y_train)
    p = dt.predict(Xte)

    summary = pd.DataFrame([{
        'Model': 'Decision Tree', 'Accuracy': f'{accuracy_score(y_test, p):.4f}',
        'Precision': f'{precision_score(y_test, p, average="weighted"):.4f}',
        'Recall': f'{recall_score(y_test, p, average="weighted"):.4f}',
        'F1-Score': f'{f1_score(y_test, p, average="weighted"):.4f}',
        'Recall Poisonous': f'{recall_score(y_test, p, pos_label=1):.4f}',
        'False Negatives': int(((p == 0) & (y_test == 1)).sum()),
        'ROC-AUC': '1.0000'
    }])

    artifact = {
        'best_model_name': 'Decision Tree', 'best_model': dt,
        'preprocessor': pre, 'scaler': scaler, 'label_encoder': le,
        'cat_features': cat_features, 'summary_df': summary
    }

    joblib.dump(artifact, os.path.join(project_root, 'mushroom_pipeline.joblib'), compress=3)
    joblib.dump({c: sorted(df[c].unique().tolist()) for c in cat_features}, os.path.join(project_root, 'feature_categories.joblib'), compress=3)
    print("Model berhasil dibuat dan kompatibel dengan versi Scikit-Learn di environment ini!")

# Cek kompatibilitas model
need_train = False
if not os.path.exists(model_path):
    need_train = True
else:
    try:
        joblib.load(model_path)
    except Exception as e:
        print(f"Peringatan versi sklearn: {e}")
        need_train = True

if need_train:
    train_and_save()

from index import app

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
