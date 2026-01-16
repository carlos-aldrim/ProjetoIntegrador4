import { Router } from "express";
import { ensureAutheticated } from "../../Middlewares/Auth";
import { GabaritoController } from "../../Controller/Exam/GabaritoController";
import { upload } from "../../Config/upload";
import { ExamCorrectionController } from "../../Controller/Exam/ExamCorrectionController";

const examRoutes = Router();

examRoutes.post(
  "/create-gabarito",
  ensureAutheticated,
  GabaritoController.create
);

examRoutes.post(
  "/correct",
  upload.single("image"),
  ExamCorrectionController.handle
);

export default examRoutes;
