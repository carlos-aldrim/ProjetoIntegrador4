import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "../../components/Button";
import { ControllerTextInput } from "../../components/ControllerTextInput";
import { api } from "../../lib/axios";
import { useUser } from "../../hooks";
import { ArrowLeft } from "phosphor-react";

interface ResetPasswordFormInputs {
  password: string;
  confirmPassword: string;
}

export const ResetPasswordPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const email = user?.mail || location.state?.mail;
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
    <div className="w-full min-h-screen flex items-center justify-center bg-zinc-800 px-4 py-8">
      <div className="w-full max-w-4xl bg-zinc-800 rounded-2xl shadow-2xl overflow-hidden border-2 flex flex-col">
        <div className="bg-[hsl(99,58%,52%)] p-6 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <ArrowLeft size={24} weight="bold" />
          </button>
          <h1 className="text-2xl font-bold text-white">Redefinir senha</h1>
        </div>
        <div className="p-8 flex flex-col items-center justify-center">
          <form
            className="w-full max-w-md space-y-6"
            onSubmit={handleSubmit(onSubmit)}
          >
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
      </div>
    </div>
  );
};
