import { Request, Response } from "express";
import { UserService } from "../../Service/User";
import { encrypt } from "../../Util/Cryptography";

export class ResetPasswordController {
  constructor(private userService: UserService) {}

  async execute(req: Request, res: Response) {
    const { mail, password } = req.body;
    if (!mail || !password) {
      return res.status(400).json({ message: "E-mail e senha são obrigatórios." });
    }
    try {
      const passwordCrypto = encrypt(password);
      const user = await this.userService.FindByEmail(mail);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado." });
      }
      await this.userService.UpdatePassword(mail, passwordCrypto);
      return res.status(200).json({ message: "Senha redefinida com sucesso!" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || "Erro ao redefinir senha." });
    }
  }
}
