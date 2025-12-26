import { Request, Response } from "express";
import { LoginUserDTO } from "../../DTO/User/LoginUserDTO";
import { prisma } from "../../Config/db/prisma";
import { AppLogger } from "../../Logger/AppLogger";
import { UserRepository } from "../../Repository/User";
import { encrypt } from "../../Util/Cryptography";
import { UserService } from "../../Service/User";
import { sendVerificationTokenEmail } from "../../Util/Nodemailer";
import { generateRandomToken } from "../../Util/TokenGenerator";

export class LoginUserController {
  async execute(req: Request, res: Response) {
    const { mail, password }: LoginUserDTO = req.body;

    const userRepository = new UserRepository(prisma);
    const userService = new UserService(userRepository);

    if (mail && password) {
      const passwordCrypto = encrypt(password);
      const user: any = await userService.Login(mail, passwordCrypto);

      if (user.length === 0) {
        return res.status(400).send({ message: "Usuario ou senha invalidos!" });
      }

      try {
        const verificationToken = generateRandomToken(6);

        const expirationTime = new Date();
        expirationTime.setMinutes(expirationTime.getMinutes() + 10);

        await prisma.verificationToken.create({
          data: {
            userId: user[0].id,
            confirmToken: encrypt(verificationToken),
            expiresAt: expirationTime,
            creationDate: new Date(),
            updateDate: new Date(),
          },
        });

        const person = await prisma.person.findFirst({
          where: {
            user: {
              id: user[0].id,
            },
          },
          select: {
            firstName: true,
            lastName: true,
          },
        });
        
        const fullName = person ? `${person.firstName} ${person.lastName}` : "Usuário";

        await sendVerificationTokenEmail(
          mail,
          fullName,
          verificationToken
        );

        return res
          .send({
            message: "Token de verificação enviado para o e-mail!",
          })
          .status(200);
      } catch (error) {
        new AppLogger().error(error);
        return res.send({ message: "Erro ao realizar login" }).status(401);
      }
    }
  }
}
