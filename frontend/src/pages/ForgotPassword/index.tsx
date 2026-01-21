
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "../../components/Button";
import { ControllerTextInput } from "../../components/ControllerTextInput";
import { api } from "../../lib/axios";

interface ForgotPasswordFormInputs {
  mail: string;
}

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { control, handleSubmit, formState } = useForm<ForgotPasswordFormInputs>({
    mode: "onChange",
    defaultValues: { mail: "" },
  });
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: ForgotPasswordFormInputs) => {
    setMessage(null);
    setIsLoading(true);
    try {
      await api.post("/usuario/forgot-password", { mail: data.mail });
      setMessage("Código enviado para seu e-mail!");
      navigate("/confirm-token", { state: { mail: data.mail } });
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message || "Erro ao enviar código. Tente novamente."
      );
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
        <p className="text-white mb-4">Informe seu e-mail para receber o código de redefinição de senha.</p>
        {message && (
          <div className="text-center text-zinc-800 bg-zinc-200 p-2 rounded mb-2">{message}</div>
        )}
        <ControllerTextInput
          control={control}
          name="mail"
          label="E-mail"
          placeholder="Digite seu e-mail"
          autoFocus
          rules={{
            required: "E-mail obrigatório",
            pattern: {
              value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
              message: "E-mail inválido",
            },
          }}
        />
        <Button text="Enviar código" disabled={!formState.isValid || isLoading} isLoading={isLoading} />
      </form>
    </div>
  );
};
