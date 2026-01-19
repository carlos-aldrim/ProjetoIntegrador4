import { UserService } from "../../Service/User";
import { UserRepository } from "../../Repository/User";
import { prisma } from "../../Config/db/prisma";
import { ForgotPasswordController } from "../../Controller/User/ForgotPasswordController";

const userRepository = new UserRepository(prisma);
const userService = new UserService(userRepository);

export const forgotPasswordController = new ForgotPasswordController(userService);
