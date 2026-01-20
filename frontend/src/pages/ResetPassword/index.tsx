import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "../../components/Button";
import { ControllerTextInput } from "../../components/ControllerTextInput";
import { api } from "../../lib/axios";

interface ResetPasswordFormInputs {
  password: string;
  confirmPassword: string;
}

export const ResetPasswordPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.mail;
  const { control, handleSubmit, formState, watch } = useForm<ResetPasswordFormInputs>({
    mode: "onChange",
    defaultValues: { password: "", confirmPassword: "" },
  });
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: ResetPasswordFormInputs) => {
    setMessage(null);
    setIsLoading(true);
    try {
      await api.post("/usuario/reset-password", { mail: email, password: data.password });
      setMessage("Senha redefinida com sucesso!");
      setTimeout(() => {
        navigate("/");
      }, 2000); // Exibe mensagem por 2 segundos antes de redirecionar
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Erro ao redefinir senha. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center py-6 px-4">
      <form
        className="border border-white bg-zinc-800 p-8 rounded-lg shadow-md w-full max-w-md space-y-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2 className="text-2xl font-bold text-zinc-800 mb-2">Redefinir senha</h2>
        <h3 className="text-white text-3xl font-extrabold mb-4 text-center">Informe sua nova senha abaixo.</h3>
        {message && (
          <div className="text-center text-zinc-800 bg-zinc-200 p-2 rounded mb-2">{message}</div>
        )}
        <ControllerTextInput
          control={control}
          name="password"
          label="Nova senha"
          type="password"
          placeholder="Digite a nova senha"
          rules={{ required: "Senha obrigatória", minLength: { value: 6, message: "Mínimo 6 caracteres" } }}
        />
        <ControllerTextInput
          control={control}
          name="confirmPassword"
          label="Confirme a nova senha"
          type="password"
          placeholder="Confirme a nova senha"
          rules={{
            required: "Confirmação obrigatória",
            validate: (value: string) => value === watch("password") || "Senhas não coincidem"
          }}
        />
        <Button text="Redefinir senha" disabled={!formState.isValid || isLoading} isLoading={isLoading} />
      </form>
    </div>
  );
};
