import { prisma } from "../../prisma";
import { runOMR } from "../../Util/runOMR";

interface CorrecaoProvaDTO {
  gabaritoId: string;
  imagePath: string;
  userId: string;
}

export class CorrecaoProvaService {
  static async execute({
    gabaritoId,
    imagePath,
    userId,
  }: CorrecaoProvaDTO) {
    // ============================
    // VALIDAÇÃO DE AUTENTICAÇÃO
    // ============================
    if (!userId) {
      throw new Error("Usuário não autenticado.");
    }

    // ============================
    // BUSCA DO GABARITO
    // ============================
    const gabarito = await prisma.gabarito.findUnique({
      where: { id: gabaritoId },
    });

    if (!gabarito) {
      throw new Error("Gabarito não encontrado.");
    }

    // (opcional, mas recomendado)
    if (gabarito.usuarioId !== userId) {
      throw new Error("Você não tem permissão para usar este gabarito.");
    }

    // ============================
    // DADOS DO GABARITO
    // ============================
    const configuracao = JSON.parse(gabarito.configuracao);

    const respostasCorretas: Record<string, string> =
      JSON.parse(gabarito.respostas);

    const quantidadeQuestoes: number =
      configuracao.quantidade_questoes ??
      Object.keys(respostasCorretas).length;

    const alternativas: string[] = configuracao.alternativas;

    if (!Array.isArray(alternativas) || alternativas.length === 0) {
      throw new Error("Configuração de alternativas inválida.");
    }

    // ============================
    // EXECUÇÃO DO OMR
    // ============================
    const respostasAluno = await runOMR(imagePath, {
      quantidadeQuestoes: quantidadeQuestoes,
      alternativas,
    });

    // ============================
    // CORREÇÃO
    // ============================
    let totalAcertos = 0;

    const resultadoPorQuestao: Record<
      string,
      "correta" | "incorreta" | "em branco" | "anulada"
    > = {};

    for (let i = 1; i <= quantidadeQuestoes; i++) {
      const questao = String(i);

      const respostaAluno = respostasAluno[questao];
      const respostaCorreta = respostasCorretas[questao];

      if (!respostaAluno || respostaAluno === "branco") {
        resultadoPorQuestao[questao] = "em branco";
        continue;
      }

      if (respostaAluno === "anulada") {
        resultadoPorQuestao[questao] = "anulada";
        continue;
      }

      if (respostaAluno === respostaCorreta) {
        totalAcertos++;
        resultadoPorQuestao[questao] = "correta";
      } else {
        resultadoPorQuestao[questao] = "incorreta";
      }
    }

    // ============================
    // RESULTADO FINAL
    // ============================
    const notaFinal = Number(
      ((totalAcertos / quantidadeQuestoes) * 10).toFixed(2)
    );

    const percentual = Number(
      ((totalAcertos / quantidadeQuestoes) * 100).toFixed(2)
    );

    return {
      message: "Prova corrigida com sucesso.",
      totalQuestoes: quantidadeQuestoes,
      totalAcertos,
      notaFinal,
      percentual,
      resultadoPorQuestao,
    };
  }
}
