import numpy as np
import joblib
from sklearn.linear_model import LogisticRegression

MODEL_PATH = "bolha_model.pkl"

def extrair_features(roi):
    return np.array([
        np.mean(roi),
        np.std(roi),
        np.count_nonzero(roi) / roi.size
    ])

def treinar_modelo(X, y):
    clf = LogisticRegression()
    clf.fit(X, y)
    joblib.dump(clf, MODEL_PATH)

def carregar_modelo():
    return joblib.load(MODEL_PATH)

def bolha_marcada(roi, clf):
    features = extrair_features(roi).reshape(1, -1)
    return clf.predict(features)[0] == 1
