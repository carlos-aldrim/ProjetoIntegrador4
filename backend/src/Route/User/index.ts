import { confirmTokenResetController } from "../../Controller/User/confirmTokenResetFactory";
import { forgotPasswordController } from "../../Controller/User/forgotPasswordFactory";
import { Router } from "express";

import { CreateUserController } from "../../Controller/User/CreateUserController";
import { CurrentUserController } from "../../Controller/User/CurrentUserController";
import { DeleteUserController } from "../../Controller/User/DeleteUserController";
import { LoginUserController } from "../../Controller/User/LoginUserController";
import { UpdateUserController } from "../../Controller/User/UpdateUserController";
import { ConfirmTokenUserController } from "../../Controller/User/ConfirmTokenUserController";
import { ResetPasswordController } from "../../Controller/User/ResetPasswordController";

import { ensureAutheticated } from "../../Middlewares/Auth";
import { userService } from "../../Service/User/userService";

export const userRoutes = Router();

const createUserController = new CreateUserController();
const loginUserController = new LoginUserController();
const updateUserController = new UpdateUserController();
const deleteUserController = new DeleteUserController();
const currentUserController = new CurrentUserController();
const confirmTokenUserController = new ConfirmTokenUserController();
const resetPasswordController = new ResetPasswordController(userService);

userRoutes.post("/new-user", createUserController.execute);
userRoutes.post("/login", loginUserController.execute);
userRoutes.post("/confirm-token", confirmTokenUserController.execute);
userRoutes.post("/update-user", ensureAutheticated, updateUserController.execute);
userRoutes.get("/delete-user", ensureAutheticated, deleteUserController.execute);
userRoutes.get("/my", ensureAutheticated, currentUserController.execute);

userRoutes.post("/forgot-password", (req, res) => forgotPasswordController.execute(req, res));
userRoutes.post("/confirm-token-reset", (req, res) => confirmTokenResetController.execute(req, res));
userRoutes.post("/reset-password", (req, res) => resetPasswordController.execute(req, res));