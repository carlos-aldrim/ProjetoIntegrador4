import { Request, Response } from "express";
import { AnswerKeyService } from "../../Service/Exam/AnswerKeyService";

export class AnswerKeyController {
  static async create(req: Request, res: Response) {
    try {
      const { title, answers } = req.body;

      // Por enquanto aceita do body ou sessão
      const userId = req.user?.id || req.body.userId;

      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      const answerKey = await AnswerKeyService.create({
        title,
        answers,
        userId,
      });

      return res.status(201).json(answerKey);
    } catch (error: any) {
      return res.status(400).json({
        message: error.message || "Erro ao criar gabarito",
      });
    }
  }
}
