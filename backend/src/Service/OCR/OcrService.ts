import Tesseract from "tesseract.js";
import fs from "fs";

export class OcrService {
  static async extrairRespostas(imagePath: string): Promise<Record<string, string>> {
    if (!fs.existsSync(imagePath)) {
      throw new Error("Imagem não encontrada para OCR");
    }

    const { data } = await Tesseract.recognize(imagePath, "eng", {
      logger: () => {}, // silencia logs
    });

    const textoExtraido = data.text;

    return this.converterTextoParaRespostas(textoExtraido);
  }

  /**
   * Converte texto OCR em JSON de respostas
   * Exemplo de texto esperado:
   * 1 A
   * 2 B
   * 3 C
   */
  private static converterTextoParaRespostas(
    texto: string
  ): Record<string, string> {
    const respostas: Record<string, string> = {};

    const linhas = texto.split("\n");

    for (const linha of linhas) {
      const match = linha.match(/^(\d+)\s*[:\-]?\s*([A-E])$/i);

      if (match) {
        const numeroQuestao = match[1];
        const alternativa = match[2].toUpperCase();

        respostas[numeroQuestao] = alternativa;
      }
    }

    return respostas;
  }
}
