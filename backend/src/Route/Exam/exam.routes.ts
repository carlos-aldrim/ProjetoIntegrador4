import { Router } from "express";
import { ensureAutheticated } from "../../Middlewares/Auth";
import { GabaritoController } from "../../Controller/Exam/GabaritoController";
import { upload } from "../../Config/upload";
import { CorrecaoProvaController } from "../../Controller/Exam/CorrecaoProvaController";

const examRoutes = Router();

examRoutes.post(
  "/criar-gabarito",
  ensureAutheticated,
  GabaritoController.create
);

examRoutes.get(
  "/obter-gabarito/:id",
  ensureAutheticated,
  GabaritoController.getById
);

examRoutes.get(
  "/meus-gabaritos",
  ensureAutheticated,
  GabaritoController.getAllByUser
);

examRoutes.put(
  "/atualizar-gabarito/:id",
  ensureAutheticated,
  GabaritoController.update
);

examRoutes.delete(
  "/deletar-gabarito/:id",
  ensureAutheticated,
  GabaritoController.delete
);

examRoutes.post(
  "/corrigir-prova",
  ensureAutheticated,
  upload.single("image"),
  CorrecaoProvaController.corrigirProva
);

export default examRoutes;
