import { Request, Response } from "express";
import { GabaritoService } from "../../Service/Exam/GabaritoService";

export class GabaritoController {
  static async create(req: Request, res: Response) {
    try {
      if (!req.user_id) {
        return res.status(401).json({
          message: "Usuário não autenticado.",
        });
      }

      const { titulo, configuracao, respostas } = req.body;

      // ============================
      // VALIDAÇÕES DE ENTRADA
      // ============================
      if (!titulo) {
        return res.status(400).json({
          message: "O campo 'titulo' é obrigatório.",
        });
      }

      if (!configuracao) {
        return res.status(400).json({
          message: "O campo 'configuracao' é obrigatório.",
        });
      }

      if (!respostas) {
        return res.status(400).json({
          message: "O campo 'respostas' é obrigatório.",
        });
      }

      if (typeof configuracao !== "object") {
        return res.status(400).json({
          message: "O campo 'configuracao' deve ser um objeto.",
        });
      }

      if (typeof respostas !== "object") {
        return res.status(400).json({
          message: "O campo 'respostas' deve ser um objeto.",
        });
      }

      const gabarito = await GabaritoService.create({
        titulo,
        configuracao,
        respostas,
        userId: req.user_id,
      });

      return res.status(201).json({
        message: "Gabarito criado com sucesso.",
        gabarito: {
          id: gabarito.id,
          titulo: gabarito.titulo,
          createdAt: gabarito.createdAt,
        },
      });
    } catch (error: any) {
      return res.status(400).json({
        message: error.message || "Erro ao criar gabarito.",
      });
    }
  }
}
