import cv2
import sys
import json
import numpy as np

from bolha_classifier import carregar_modelo, bolha_marcada


# ============================================================
# CONFIGURAÇÃO GLOBAL
# ============================================================
DEBUG = True  # ⬅️ Troque para False em produção (Postman/API)

# ============================================================
# CONFIGURAÇÕES DA PROVA
# ============================================================
NUM_QUESTOES = 7
ALTERNATIVAS = ["A", "B", "C", "D", "E"]

AREA_MIN = 280
AREA_MAX = 3000

def score_bolha(roi):
    h, w = roi.shape

    centro = roi[
        int(h*0.3):int(h*0.7),
        int(w*0.3):int(w*0.7)
    ]

    densidade_centro = cv2.countNonZero(centro) / float(centro.size)
    densidade_total = cv2.countNonZero(roi) / float(roi.size)

    # Bolha marcada → centro bem mais escuro que a borda
    return densidade_centro - densidade_total


# ============================================================
# LEITURA DA IMAGEM
# ============================================================
image_path = sys.argv[1]
image = cv2.imread(image_path)

if image is None:
    print(json.dumps({"error": "Imagem não encontrada"}))
    sys.exit(1)

clf = carregar_modelo()

# ---------------- DEBUG ----------------
if DEBUG:
    cv2.imshow("Imagem Original", image)
    cv2.waitKey(0)
# --------------------------------------

# ============================================================
# PRÉ-PROCESSAMENTO
# ============================================================
# Converte para escala de cinza (remove informação de cor)
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# Aplica blur para reduzir ruídos (fundamental para OMR)
blur = cv2.GaussianBlur(gray, (5, 5), 0)

# Binarização: bolhas marcadas ficam brancas (255)
thresh = cv2.adaptiveThreshold(
    blur,
    255,
    cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
    cv2.THRESH_BINARY_INV,
    11,
    2
)

# ============================================================
# AJUSTE CRÍTICO — SEPARAR TEXTO DAS BOLHAS
# ============================================================

# Kernel pequeno para remover conexões finas (números/texto)
kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))

# Open = erosão + dilatação → quebra ligação entre número e bolha
thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=1)

# ---------------- DEBUG ----------------
if DEBUG:
    cv2.imshow("Threshold", thresh)
    cv2.waitKey(0)
# --------------------------------------

# ============================================================
# DETECÇÃO DE CONTORNOS
# ============================================================
contours, _ = cv2.findContours(
    thresh,
    cv2.RETR_EXTERNAL,
    cv2.CHAIN_APPROX_SIMPLE
)

# ---------------- DEBUG ----------------
if DEBUG:
    debug_contours = image.copy()
    cv2.drawContours(debug_contours, contours, -1, (0, 255, 0), 2)
    cv2.imshow("Contornos Detectados", debug_contours)
    cv2.waitKey(0)
# --------------------------------------

# ============================================================
# FILTRAR CONTORNOS QUE SÃO BOLHAS
# ============================================================
bolhas = []

for cnt in contours:
    x, y, w, h = cv2.boundingRect(cnt)
    area = cv2.contourArea(cnt)
    aspecto = w / float(h)

    # Critérios geométricos para identificar bolhas
    if (
        AREA_MIN < area < AREA_MAX and
        0.7 < aspecto < 1.3
    ):
        bolhas.append((x, y, w, h))

# ---------------- DEBUG ----------------
if DEBUG:
    debug_bolhas = image.copy()
    for (x, y, w, h) in bolhas:
        cv2.rectangle(debug_bolhas, (x, y), (x+w, y+h), (0, 0, 255), 2)
    cv2.imshow("Bolhas Filtradas", debug_bolhas)
    cv2.waitKey(0)
# --------------------------------------

# Ordena por linha (Y) e coluna (X)
bolhas = sorted(bolhas, key=lambda b: (b[1], b[0]))

# ============================================================
# AGRUPAR BOLHAS POR QUESTÃO (LINHAS)
# ============================================================
linhas = []
TOLERANCIA_Y = 15

for bolha in bolhas:
    x, y, w, h = bolha
    encontrou_linha = False

    for linha in linhas:
        _, y_ref, _, _ = linha[0]
        if abs(y - y_ref) <= TOLERANCIA_Y:
            linha.append(bolha)
            encontrou_linha = True
            break

    if not encontrou_linha:
        linhas.append([bolha])

# ============================================================
# LEITURA DAS RESPOSTAS (CLASSIFICADOR + DESEMPATE POR FORMA)
# ============================================================
respostas = {}

for i, linha in enumerate(linhas[:NUM_QUESTOES]):

    linha = sorted(linha, key=lambda b: b[0])
    marcadas = []
    scores = []

    for idx, (x, y, w, h) in enumerate(linha[:len(ALTERNATIVAS)]):

        margem = int(w * 0.25)

        # ---------------- ROI REAL (ESCALA DE CINZA) ----------------
        roi_gray = gray[
            y + margem : y + h - margem,
            x + margem : x + w - margem
        ]

        # ---------------- ROI BINÁRIA (SÓ PARA FORMA) ----------------
        roi_thresh = thresh[
            y + margem : y + h - margem,
            x + margem : x + w - margem
        ]

        # ===============================
        # MÉTRICA REAL DE PREENCHIMENTO
        # ===============================
        media = np.mean(roi_gray)
        preenchido = 1.0 - (media / 255.0)

        # Score morfológico continua válido
        score = score_bolha(roi_thresh)
        scores.append((score, ALTERNATIVAS[idx]))

        # ---------------- DECISÃO PRIMÁRIA ----------------
        if preenchido > 0.45:
            marcadas.append(ALTERNATIVAS[idx])

        elif 0.35 < preenchido <= 0.45:
            # zona cinza → IA decide com imagem REAL
            if bolha_marcada(roi_gray, clf):
                marcadas.append(ALTERNATIVAS[idx])

        if DEBUG:
            print(f"Q{i+1} {ALTERNATIVAS[idx]} -> tinta={preenchido:.2f}")

    # ============================
    # DECISÃO FINAL DA QUESTÃO
    # ============================

    if len(marcadas) == 0:
        respostas[str(i + 1)] = "branco"

    elif len(marcadas) == 1:
        respostas[str(i + 1)] = marcadas[0]

    else:
        scores.sort(reverse=True)

        if scores[0][0] - scores[1][0] > 0.05:
            respostas[str(i + 1)] = scores[0][1]
        else:
            respostas[str(i + 1)] = "anulada"


# ============================================================
# SAÍDA JSON
# ============================================================
print(json.dumps(respostas, ensure_ascii=False))
