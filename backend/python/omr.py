import cv2
import sys
import json
import numpy as np

# =========================
# CONFIGURAÇÕES DA PROVA
# =========================
NUM_QUESTOES = 5
ALTERNATIVAS = ["A", "B", "C", "D", "E"]

AREA_MIN = 600
AREA_MAX = 3000
FILL_THRESHOLD = 0.25  # 25% preenchido

# =========================
# LEITURA DA IMAGEM
# =========================
image_path = sys.argv[1]
image = cv2.imread(image_path)

if image is None:
    print(json.dumps({"error": "Imagem não encontrada"}))
    sys.exit(1)

gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# Melhor para bolhas
_, thresh = cv2.threshold(
    gray, 0, 255,
    cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU
)

# =========================
# DETECTAR CONTORNOS
# =========================
contours, _ = cv2.findContours(
    thresh,
    cv2.RETR_EXTERNAL,
    cv2.CHAIN_APPROX_SIMPLE
)

bolhas = []

for cnt in contours:
    x, y, w, h = cv2.boundingRect(cnt)
    area = cv2.contourArea(cnt)

    aspecto = w / float(h)

    # Filtro para bolhas
    if (
        AREA_MIN < area < AREA_MAX and
        0.8 < aspecto < 1.2 and
        w > 15 and h > 15
    ):
        bolhas.append((x, y, w, h))

# Ordenar por linha e coluna
bolhas = sorted(bolhas, key=lambda b: (b[1], b[0]))

# =========================
# AGRUPAR POR QUESTÃO (LINHAS)
# =========================
linhas = []
TOLERANCIA_Y = 15

for bolha in bolhas:
    x, y, w, h = bolha
    encontrado = False

    for linha in linhas:
        _, y_ref, _, _ = linha[0]
        if abs(y - y_ref) <= TOLERANCIA_Y:
            linha.append(bolha)
            encontrado = True
            break

    if not encontrado:
        linhas.append([bolha])

# =========================
# LEITURA DAS RESPOSTAS
# =========================
respostas = {}

for i, linha in enumerate(linhas[:NUM_QUESTOES]):
    marcadas = []

    linha = sorted(linha, key=lambda b: b[0])  # ordenar por X

    for idx, (x, y, w, h) in enumerate(linha[:len(ALTERNATIVAS)]):
        roi = thresh[y:y+h, x:x+w]
        preenchido = cv2.countNonZero(roi)
        percentual = preenchido / float(w * h)

        if percentual >= FILL_THRESHOLD:
            marcadas.append(ALTERNATIVAS[idx])

    if len(marcadas) == 0:
        respostas[str(i + 1)] = "branco"
    elif len(marcadas) > 1:
        respostas[str(i + 1)] = "anulada"
    else:
        respostas[str(i + 1)] = marcadas[0]

# =========================
# SAÍDA JSON
# =========================
print(json.dumps(respostas, ensure_ascii=False))
