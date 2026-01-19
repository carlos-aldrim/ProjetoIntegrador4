import { UserService } from "../../Service/User";
import { UserRepository } from "../../Repository/User";
import { prisma } from "../../Config/db/prisma";
import { ConfirmTokenResetController } from "../../Controller/User/ConfirmTokenResetController";

const userRepository = new UserRepository(prisma);
const userService = new UserService(userRepository);

export const confirmTokenResetController = new ConfirmTokenResetController(userService);
