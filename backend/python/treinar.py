import cv2
import numpy as np
from bolha_classifier import treinar_modelo, extrair_features

"""
============================================================
SCRIPT DE TREINAMENTO DO CLASSIFICADOR DE BOLHAS (OMR)
============================================================

Este script cria um conjunto de dados sintético para treinar
um classificador binário:
    0 = bolha vazia
    1 = bolha marcada

⚠️ OBS:
- Em produção, o ideal é extrair ROIs reais das provas.
- Aqui usamos dados sintéticos para simplicidade e estabilidade.
"""

# ============================================================
# CONFIGURAÇÕES
# ============================================================
NUM_EXEMPLOS_VAZIOS = 50
NUM_EXEMPLOS_MARCADOS = 50
TAMANHO_ROI = 20  # 20x20 pixels

# ============================================================
# DATASET
# ============================================================
X = []
y = []

# ------------------------------------------------------------
# BOLHAS VAZIAS
# Pixels escuros / pouco preenchimento
# ------------------------------------------------------------
for _ in range(NUM_EXEMPLOS_VAZIOS):
    roi = np.random.randint(
        0, 80, (TAMANHO_ROI, TAMANHO_ROI), dtype="uint8"
    )

    features = extrair_features(roi)
    X.append(features)
    y.append(0)

# ------------------------------------------------------------
# BOLHAS MARCADAS
# Pixels claros / muito preenchimento
# ------------------------------------------------------------
for _ in range(NUM_EXEMPLOS_MARCADOS):
    roi = np.random.randint(
        170, 255, (TAMANHO_ROI, TAMANHO_ROI), dtype="uint8"
    )

    features = extrair_features(roi)
    X.append(features)
    y.append(1)

# ============================================================
# CONVERSÃO PARA NUMPY
# ============================================================
X = np.array(X)
y = np.array(y)

print(f"[INFO] Dataset gerado: {len(X)} amostras")
print(f"[INFO] Vazias: {np.sum(y == 0)} | Marcadas: {np.sum(y == 1)}")

# ============================================================
# TREINAMENTO
# ============================================================
treinar_modelo(X, y)

print("[OK] Modelo treinado e salvo com sucesso.")
