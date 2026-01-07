import cv2
import sys
import json
import numpy as np

# ============================================================
# CONFIGURAÇÃO GLOBAL
# ============================================================
DEBUG = False  # ⬅️ Troque para False em produção (Postman/API)

# ============================================================
# CONFIGURAÇÕES DA PROVA
# ============================================================
NUM_QUESTOES = 7
ALTERNATIVAS = ["A", "B", "C", "D", "E"]

AREA_MIN = 280
AREA_MAX = 3000

FILL_THRESHOLD = 0.45
DIFERENCA_MINIMA = 0.05   # diferença mínima entre 1ª e 2ª bolha
LIMIAR_MINIMO = 0.30     # abaixo disso considera branco

# ============================================================
# LEITURA DA IMAGEM
# ============================================================
image_path = sys.argv[1]
image = cv2.imread(image_path)

if image is None:
    print(json.dumps({"error": "Imagem não encontrada"}))
    sys.exit(1)

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
# LEITURA DAS RESPOSTAS
# ============================================================
respostas = {}

for i, linha in enumerate(linhas[:NUM_QUESTOES]):

    # Ordena as bolhas da esquerda para a direita (A → E)
    linha = sorted(linha, key=lambda b: b[0])

    valores = []

    # ---------------- SEGURANÇA ----------------
    # Se a linha não tem bolhas suficientes, invalida a questão
    if len(linha) < 3:
        respostas[str(i + 1)] = "invalida"
        if DEBUG:
            print(f"Q{i+1} inválida — bolhas detectadas: {len(linha)}")
        continue
    # -------------------------------------------

    for idx, (x, y, w, h) in enumerate(linha[:len(ALTERNATIVAS)]):

        # Remove a borda da bolha (evita contar o círculo)
        margem = int(w * 0.25)
        roi = thresh[
            y + margem : y + h - margem,
            x + margem : x + w - margem
        ]

        total = roi.shape[0] * roi.shape[1]
        pixels_brancos = cv2.countNonZero(roi)
        percentual = pixels_brancos / float(total)

        valores.append((percentual, ALTERNATIVAS[idx]))

        # ---------------- DEBUG ----------------
        if DEBUG:
            print(f"Q{i+1} {ALTERNATIVAS[idx]} -> preenchido: {percentual:.2f}")
        # --------------------------------------

    # Ordena da mais marcada para a menos marcada
    valores.sort(reverse=True)

    # ============================
    # DECISÃO DA RESPOSTA
    # ============================

    # CASO 1 — nenhuma bolha válida
    if len(valores) == 0:
        respostas[str(i + 1)] = "branco"

    # CASO 2 — apenas uma bolha
    elif len(valores) == 1:
        maior_valor, melhor_alternativa = valores[0]

        if maior_valor < LIMIAR_MINIMO:
            respostas[str(i + 1)] = "branco"
        else:
            respostas[str(i + 1)] = melhor_alternativa

    # CASO 3 — duas ou mais bolhas
    else:
        maior_valor, melhor_alternativa = valores[0]
        segundo_valor = valores[1][0]

        if maior_valor < LIMIAR_MINIMO:
            respostas[str(i + 1)] = "branco"

        #  SÓ ANULA se DUAS bolhas realmente passaram do threshold
        elif (
            maior_valor >= FILL_THRESHOLD and
            segundo_valor >= FILL_THRESHOLD
        ):
            respostas[str(i + 1)] = "anulada"

        else:
            respostas[str(i + 1)] = melhor_alternativa



# ============================================================
# SAÍDA JSON
# ============================================================
print(json.dumps(respostas, ensure_ascii=False))
