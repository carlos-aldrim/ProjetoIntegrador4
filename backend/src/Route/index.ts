import { Router } from "express";

import { userRoutes } from "./User";

import examRoutes from "./Exam/exam.routes";

export const router = Router();  

router.use("/usuario", userRoutes);

router.use("/exam", examRoutes);
