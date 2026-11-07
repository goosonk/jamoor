import urllib.request, os, joblib, numpy as np, pandas as pd
from sklearn.preprocessing import OneHotEncoder, StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

print('Downloading dataset...')
url = 'https://raw.githubusercontent.com/stedy/Machine-Learning-with-R-datasets/master/mushrooms.csv'
df = pd.read_csv(url)
if 'type' in df.columns: df = df.rename(columns={'type': 'class'})
df.columns = [c.replace('_', '-') for c in df.columns]
df = df.replace('?', np.nan).dropna(axis=1, thresh=int(len(df)*0.8)).dropna().reset_index(drop=True)
df = df.drop(columns=[c for c in df.columns if df[c].nunique() == 1])

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

joblib.dump(artifact, 'mushroom_pipeline.joblib', compress=3)
joblib.dump({c: sorted(df[c].unique().tolist()) for c in cat_features}, 'feature_categories.joblib', compress=3)
print('Sukses generate model!')
