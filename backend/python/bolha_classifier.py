import os
import numpy as np
import joblib
from sklearn.linear_model import LogisticRegression

# ============================================================
# CAMINHO ABSOLUTO DO MODELO (RESOLVE ERRO DE EXECUÇÃO VIA NODE)
# ============================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "bolha_model.pkl")

# ============================================================
# FEATURE EXTRACTION
# ============================================================
def extrair_features(roi):
    return np.array([
        np.mean(roi),
        np.std(roi),
        np.count_nonzero(roi) / roi.size
    ])

# ============================================================
# TREINAMENTO DO MODELO
# ============================================================
def treinar_modelo(X, y):
    clf = LogisticRegression()
    clf.fit(X, y)
    joblib.dump(clf, MODEL_PATH)

# ============================================================
# CARREGAMENTO DO MODELO
# ============================================================
def carregar_modelo():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"Modelo de classificação não encontrado em: {MODEL_PATH}"
        )
    return joblib.load(MODEL_PATH)

# ============================================================
# CLASSIFICAÇÃO DA BOLHA
# ============================================================
def bolha_marcada(roi, clf):
    features = extrair_features(roi).reshape(1, -1)
    return clf.predict(features)[0] == 1
