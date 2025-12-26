import { Request, Response } from "express";
import { prisma } from "../../Config/db/prisma";
import { AppLogger } from "../../Logger/AppLogger";
import JsonWebToken from "jsonwebtoken";
import { sendSuccessLoginEmail } from "../../Util/Nodemailer";
import { encrypt } from "../../Util/Cryptography";

export class ConfirmTokenUserController {
  async execute(req: Request, res: Response) {
    const { mail, confirmToken }: { mail: string; confirmToken: string } =
      req.body;

    try {
      const verificationRecord = await prisma.verificationToken.findFirst({
        where: {
          user: { mail },
          confirmToken: encrypt(confirmToken),
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!verificationRecord) {
        return res.status(400).send({ message: "Token inválido ou expirado!" });
      }

      const user = await prisma.user.findUnique({
        where: { id: verificationRecord.userId },
      });
      if (!user) {
        return res.status(400).send({ message: "Usuário não encontrado!" });
      }

      const person = await prisma.person.findUnique({
        where: { id: user.personId },
        select: {
          firstName: true,
          lastName: true,
        },
      });
      
      const fullName = person ? `${person.firstName} ${person.lastName}` : "Usuário";      

      await sendSuccessLoginEmail(mail, fullName);

      const jwtToken = JsonWebToken.sign(
        { mail: user.mail },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "8h",
          subject: user.id,
        }
      );

      await prisma.verificationToken.delete({
        where: { id: verificationRecord.id },
      });

      return res
        .send({
          message: "Login confirmado com sucesso!",
          token: jwtToken,
          user,
        })
        .status(200);
    } catch (error) {
      new AppLogger().error(error);
      return res.send({ message: "Erro ao confirmar token" }).status(500);
    }
  }
}
