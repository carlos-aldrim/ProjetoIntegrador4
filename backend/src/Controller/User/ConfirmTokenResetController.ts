import { Request, Response } from "express";
import { UserService } from "../../Service/User";

export class ConfirmTokenResetController {
  constructor(private userService: UserService) {}

  async execute(req: Request, res: Response) {
    const { mail, token } = req.body;
    if (!mail || !token) {
      return res.status(400).json({ message: "E-mail e token são obrigatórios." });
    }

    const user = await this.userService.FindByEmail(mail);
    if (!user || user.length === 0) {
      return res.status(404).json({ message: "E-mail não encontrado." });
    }

    if (user[0].recoverPassword !== token) {
      return res.status(401).json({ message: "Token inválido." });
    }

    return res.status(200).json({ message: "Token válido." });
  }
}
