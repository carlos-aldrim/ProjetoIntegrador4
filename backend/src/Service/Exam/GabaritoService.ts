import { prisma } from "../../prisma";
import { normalizarTitulo } from "../../Util/normalizarTexto";

type CreateGabaritoDTO = {
  titulo: string;
  configuracao: {
    quantidade_questoes: number;
    alternativas: string[];
  };
  respostas: Record<string, string>;
  userId: string;
};

export class GabaritoService {
  static async create(data: CreateGabaritoDTO) {
    const { titulo, configuracao, respostas, userId } = data;

    const { quantidade_questoes, alternativas } = configuracao;

    // ============================
    // VALIDAÇÕES BÁSICAS
    // ============================
    if (!titulo || titulo.trim().length < 3) {
      throw new Error("O título deve possuir ao menos 3 caracteres.");
    }

    if (quantidade_questoes <= 0) {
      throw new Error("A quantidade de questões deve ser maior que zero.");
    }

    if (!Array.isArray(alternativas) || alternativas.length === 0) {
      throw new Error("É necessário informar ao menos uma alternativa.");
    }

    // ============================
    // VALIDAÇÃO DE TÍTULO DUPLICADO
    // ============================
    const tituloNormalizado = normalizarTitulo(titulo);

    const gabaritosExistentes = await prisma.gabarito.findMany({
      where: { usuarioId: userId },
      select: { titulo: true },
    });

    const tituloDuplicado = gabaritosExistentes.some(g =>
      normalizarTitulo(g.titulo) === tituloNormalizado
    );

    if (tituloDuplicado) {
      throw new Error("Já existe um gabarito com esse título.");
    }

    // ============================
    // VALIDAÇÃO DAS RESPOSTAS
    // ============================
    const questoesRespondidas = Object.keys(respostas);

    if (questoesRespondidas.length !== quantidade_questoes) {
      throw new Error(
        `Número de respostas (${questoesRespondidas.length}) diferente da quantidade de questões (${quantidade_questoes}).`
      );
    }

    for (const [questao, alternativa] of Object.entries(respostas)) {
      const numeroQuestao = Number(questao);

      if (
        Number.isNaN(numeroQuestao) ||
        numeroQuestao < 1 ||
        numeroQuestao > quantidade_questoes
      ) {
        throw new Error(`Questão inválida: ${questao}.`);
      }

      if (!alternativas.includes(alternativa)) {
        throw new Error(
          `Resposta inválida na questão ${questao}. Alternativa '${alternativa}' não permitida.`
        );
      }
    }

    // ============================
    // PERSISTÊNCIA
    // ============================
    return prisma.gabarito.create({
      data: {
        titulo: titulo.trim(),
        configuracao: JSON.stringify(configuracao),
        respostas: JSON.stringify(respostas),
        usuarioId: userId,
      },
    });
  }
}
