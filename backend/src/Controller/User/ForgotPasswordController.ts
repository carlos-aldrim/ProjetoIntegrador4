import { Request, Response } from "express";
import { UserService } from "../../Service/User";
import { generateRandomToken } from "../../Util/TokenGenerator";
import { sendVerificationTokenEmail } from "../../Util/Nodemailer";

export class ForgotPasswordController {
  constructor(private userService: UserService) {}

  async execute(req: Request, res: Response) {
    const { mail } = req.body;
    console.log("[ForgotPassword] E-mail recebido:", mail);
    if (!mail) {
      console.log("[ForgotPassword] E-mail não informado");
      return res.status(400).json({ message: "E-mail é obrigatório." });
    }

    const user = await this.userService.FindByEmail(mail);
    console.log("[ForgotPassword] Resultado FindByEmail:", user);
    if (!user || user.length === 0) {
      console.log("[ForgotPassword] E-mail não encontrado no banco");
      return res.status(404).json({ message: "E-mail não encontrado." });
    }

    const token = generateRandomToken(6);
    console.log("[ForgotPassword] Token gerado:", token);
    try {
      await this.userService.UpdateRecoverPasswordToken(mail, token);
      console.log("[ForgotPassword] Token salvo no banco");
    } catch (err) {
      console.error("[ForgotPassword] Erro ao salvar token:", err);
      return res.status(500).json({ message: "Erro ao salvar token." });
    }

    try {
      await sendVerificationTokenEmail(mail, user[0].name || "usuário", token);
      console.log("[ForgotPassword] E-mail enviado com sucesso");
    } catch (err) {
      console.error("[ForgotPassword] Erro ao enviar e-mail:", err);
      return res.status(500).json({ message: "Erro ao enviar e-mail." });
    }

    return res.status(200).json({ message: "Token enviado para seu e-mail!" });
  }
}
