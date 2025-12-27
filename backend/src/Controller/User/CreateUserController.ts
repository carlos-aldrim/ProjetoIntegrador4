import { Request, Response } from "express";
import { SaveUserDTO } from "../../DTO/User/SaveUserDTO";
import { prisma } from "../../Config/db/prisma";
import { UserRepository } from "../../Repository/User";
import { UserService } from "../../Service/User";

export class CreateUserController {
  async execute(req: Request, res: Response) {
    const userRepository = new UserRepository(prisma);
    const userService = new UserService(userRepository);

    const { mail, password, image, person }: SaveUserDTO = req.body;
    const isUserExists = await userService.FindByEmail(mail);

    if (isUserExists?.length > 0) {
      return res.status(400).send({ message: "Email já cadastrado!" });
    }

    const isCpfExists = await userService.FindByCpf(person.cpf);

    if (isCpfExists.length > 0) {
      return res.status(400).send({ message: "CPF já cadastrado!" });
    }

    const user = await userService.Save({ mail, password, image, person });

    if (user) {
      return res
        .status(201)
        .send({ message: "Usuário cadastrado com sucesso!" });
    }

    return res.status(400).send({ message: "Erro ao cadastrar usuário!" });
  }
}
