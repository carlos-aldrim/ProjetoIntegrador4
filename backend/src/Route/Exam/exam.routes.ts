import { Router } from "express";
import { AnswerKeyController } from "../../Controller/Exam/AnswerKeyController";
import { upload } from "../../Config/upload";
import { ExamCorrectionController } from "../../Controller/Exam/ExamCorrectionController";

const examRoutes = Router();

examRoutes.post("/answer-keys", AnswerKeyController.create);

examRoutes.post(
  "/correct",
  upload.single("image"),
  ExamCorrectionController.handle
);

export default examRoutes;
