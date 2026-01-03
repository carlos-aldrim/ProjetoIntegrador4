import { prisma } from "../../prisma";
import { CreateAnswerKeyDTO } from "../../DTO/Exam/CreateAnswerKeyDTO";

export class AnswerKeyService {
  static async create(data: CreateAnswerKeyDTO) {
    if (!data.title || !data.answers) {
      throw new Error("Título e respostas são obrigatórios");
    }

    return prisma.answerKey.create({
      data: {
        title: data.title,
        answers: JSON.stringify(data.answers),
        userId: data.userId,
      },
    });
  }
}
