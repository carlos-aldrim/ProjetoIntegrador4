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

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "ID do gabarito é obrigatório." });
      }

      const gabarito = await GabaritoService.getById(id);

      if (!gabarito) {
        return res.status(404).json({ message: "Gabarito não encontrado." });
      }

      if (gabarito.usuarioId !== req.user_id) {
        return res.status(403).json({ message: "Acesso negado." });
      }

      const response = {
        id: gabarito.id,
        titulo: gabarito.titulo,
        configuracao: JSON.parse(gabarito.configuracao),
        respostas: JSON.parse(gabarito.respostas),
        createdAt: gabarito.createdAt,
        updatedAt: gabarito.updatedAt,
      };

      return res.status(200).json({
        message: "Gabarito encontrado com sucesso.",
        data: response,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "Erro ao buscar gabarito.",
      });
    }
  }

  static async getAllByUser(req: Request, res: Response) {
    try {
      const userId = req.user_id;

      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado." });
      }

      const gabaritos = await GabaritoService.getAllByUser(userId);

      const response = gabaritos.map(g => ({
        id: g.id,
        titulo: g.titulo,
        configuracao: JSON.parse(g.configuracao),
        createdAt: g.createdAt,
        updatedAt: g.updatedAt,
      }));

      return res.status(200).json({
        message: "Gabaritos encontrados com sucesso.",
        data: response,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "Erro ao buscar gabaritos do usuário.",
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user_id;
      const { titulo, configuracao, respostas } = req.body;

      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado." });
      }

      if (!id) {
        return res.status(400).json({ message: "ID do gabarito é obrigatório." });
      }

      // Buscar o gabarito existente
      const gabarito = await GabaritoService.getById(id);

      if (!gabarito) {
        return res.status(404).json({ message: "Gabarito não encontrado." });
      }

      if (gabarito.usuarioId !== userId) {
        return res.status(403).json({ message: "Acesso negado." });
      }

      // ============================
      // VALIDAÇÕES SIMILARES AO CREATE
      // ============================

      if (titulo && titulo.trim().length < 3) {
        return res.status(400).json({
          message: "O título deve possuir ao menos 3 caracteres.",
        });
      }

      if (configuracao) {
        const { quantidade_questoes, alternativas } = configuracao;

        if (quantidade_questoes <= 0) {
          return res.status(400).json({
            message: "A quantidade de questões deve ser maior que zero.",
          });
        }

        if (!Array.isArray(alternativas) || alternativas.length === 0) {
          return res.status(400).json({
            message: "É necessário informar ao menos uma alternativa.",
          });
        }

        if (respostas) {
          const questoesRespondidas = Object.keys(respostas);

          if (questoesRespondidas.length !== quantidade_questoes) {
            return res.status(400).json({
              message: `Número de respostas (${questoesRespondidas.length}) diferente da quantidade de questões (${quantidade_questoes}).`,
            });
          }

          for (const [questao, alternativa] of Object.entries(respostas)) {
            const numeroQuestao = Number(questao);

            if (
              Number.isNaN(numeroQuestao) ||
              numeroQuestao < 1 ||
              numeroQuestao > quantidade_questoes
            ) {
              return res.status(400).json({
                message: `Questão inválida: ${questao}.`,
              });
            }

            if (!alternativas.includes(alternativa)) {
              return res.status(400).json({
                message: `Resposta inválida na questão ${questao}. Alternativa '${alternativa}' não permitida.`,
              });
            }
          }
        }
      }

      // Atualizar o gabarito
      const gabaritoAtualizado = await GabaritoService.update(id, {
        titulo,
        configuracao,
        respostas,
      });

      return res.status(200).json({
        message: "Gabarito atualizado com sucesso.",
        data: {
          id: gabaritoAtualizado.id,
          titulo: gabaritoAtualizado.titulo,
          configuracao: JSON.parse(gabaritoAtualizado.configuracao),
          respostas: JSON.parse(gabaritoAtualizado.respostas),
          createdAt: gabaritoAtualizado.createdAt,
          updatedAt: gabaritoAtualizado.updatedAt,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "Erro ao atualizar gabarito.",
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user_id;

      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado." });
      }

      if (!id) {
        return res.status(400).json({ message: "ID do gabarito é obrigatório." });
      }

      // Buscar o gabarito
      const gabarito = await GabaritoService.getById(id);

      if (!gabarito) {
        return res.status(404).json({ message: "Gabarito não encontrado." });
      }

      if (gabarito.usuarioId !== userId) {
        return res.status(403).json({ message: "Acesso negado." });
      }

      // Deletar gabarito
      await GabaritoService.delete(id);

      return res.status(200).json({
        message: "Gabarito deletado com sucesso.",
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "Erro ao deletar gabarito.",
      });
    }
  }
}