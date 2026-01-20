import { UserService } from "./index";
import { UserRepository } from "../../Repository/User";
import { PrismaClient } from "@prisma/client";

export const userService = new UserService(new UserRepository(new PrismaClient()));
