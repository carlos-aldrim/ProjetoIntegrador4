import { prisma } from "../../prisma";
import { runOMR } from "../../Util/runOMR";

interface RequestDTO {
  answerKeyId: string;
  imagePath: string;
}

export class ExamCorrectionService {
  static async execute({ answerKeyId, imagePath }: RequestDTO) {
    const gabarito = await prisma.answerKey.findUnique({
      where: { id: answerKeyId },
    });

    if (!gabarito) {
      throw new Error("Gabarito não encontrado");
    }

    // 🔥 Aqui entra o Python
    const respostasAluno = await runOMR(imagePath);

    const respostasCorretas: Record<string, string> =
      JSON.parse(gabarito.answers);

    let totalAcertos = 0;
    const resultadoPorQuestao: Record<string, "correta" | "incorreta"> = {};

    for (const questao in respostasCorretas) {
      if (respostasAluno[questao] === respostasCorretas[questao]) {
        totalAcertos++;
        resultadoPorQuestao[questao] = "correta";
      } else {
        resultadoPorQuestao[questao] = "incorreta";
      }
    }

    const totalQuestoes = Object.keys(respostasCorretas).length;

    return {
      totalQuestoes,
      totalAcertos,
      notaFinal: Number(((totalAcertos / totalQuestoes) * 10).toFixed(2)),
      percentual: Number(((totalAcertos / totalQuestoes) * 100).toFixed(2)),
      resultadoPorQuestao,
    };
  }
}
