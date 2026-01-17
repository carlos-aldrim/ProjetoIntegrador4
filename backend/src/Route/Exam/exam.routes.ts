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

examRoutes.post(
  "/corrigir-prova",
  ensureAutheticated,
  upload.single("image"),
  CorrecaoProvaController.corrigirProva
);

export default examRoutes;
