import { Request, Response } from "express";
import { CorrecaoProvaService } from "../../Service/Exam/CorrecaoProvaService";

export class CorrecaoProvaController {
  static async corrigirProva(req: Request, res: Response) {
    try {
      // ============================
      // AUTENTICAÇÃO
      // ============================
      if (!req.user_id) {
        return res.status(401).json({
          message: "Usuário não autenticado.",
        });
      }

      const { gabaritoId } = req.body;
      const image = req.file;

      // ============================
      // VALIDAÇÕES DE ENTRADA
      // ============================
      if (!gabaritoId) {
        return res.status(400).json({
          message: "O campo 'gabaritoId' é obrigatório.",
        });
      }

      if (typeof gabaritoId !== "string") {
        return res.status(400).json({
          message: "O campo 'gabaritoId' deve ser uma string.",
        });
      }

      if (!image) {
        return res.status(400).json({
          message: "Imagem da prova não enviada.",
        });
      }

      if (!image.mimetype.startsWith("image/")) {
        return res.status(400).json({
          message: "O arquivo enviado deve ser uma imagem válida.",
        });
      }

      // ============================
      // EXECUÇÃO
      // ============================
      const resultado = await CorrecaoProvaService.execute({
        gabaritoId,
        imagePath: image.path,
        userId: req.user_id,
      });

      // ============================
      // RESPONSE
      // ============================
      return res.status(200).json({
        message: "Prova corrigida com sucesso.",
        resultado,
      });
    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        message: error.message || "Erro interno ao corrigir a prova.",
      });
    }
  }
}
