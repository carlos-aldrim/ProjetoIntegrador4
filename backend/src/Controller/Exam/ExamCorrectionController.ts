import { Request, Response } from "express";
import { ExamCorrectionService } from "../../Service/Exam/ExamCorrectionService";

export class ExamCorrectionController {
  static async handle(req: Request, res: Response) {
    const { answerKeyId } = req.body;
    const image = req.file;

    if (!image) {
      return res.status(400).json({ error: "Imagem não enviada" });
    }

    const result = await ExamCorrectionService.execute({
      answerKeyId,
      imagePath: image.path,
    });

    return res.json(result);
  }
}
