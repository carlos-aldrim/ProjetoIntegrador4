import { yupResolver } from "@hookform/resolvers/yup";
import { Eye, EyeClosed } from "phosphor-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useUser } from "../../hooks/UseUser";
import { signInSchemaValidator } from "../../utils";
import { Button } from "../Button";
import { ControllerTextInput } from "..";

interface LoginFormInputs {
  mail: string;
  password: string;
}

export const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useUser();

  const { control, handleSubmit } = useForm<LoginFormInputs>({
    resolver: yupResolver(signInSchemaValidator),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    await login(data.mail, data.password);
  };

  return (
    <div className="bg-zinc-800 p-6 w-full shadow-[0_2px_22px_-4px_rgba(0, 0, 0, 0.2)] max-md:mx-auto">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-8">
          <h3 className="text-white text-3xl font-extrabold">Entrar</h3>
          <p className="text-white text-sm mt-4 leading-relaxed">
            Faça login em sua conta e explore um mundo de possibilidades. Sua
            jornada começa aqui.
          </p>
        </div>

        <ControllerTextInput
          control={control}
          name="mail"
          label="E-mail"
          placeholder="Digite seu email"
          autoFocus
        />

        <ControllerTextInput
          control={control}
          name="password"
          label="Senha"
          isPassword
          type={!showPassword ? "password" : "text"}
          placeholder="Digite sua senha"
          onClickRightIcon={() => setShowPassword((prevState) => !prevState)}
          rightIcon={
            !showPassword ? (
              <Eye className="ml-2 text-white" size={24} />
            ) : (
              <EyeClosed className="ml-2 text-white" size={24} />
            )
          }
        />

		<div className="text-sm">
		  <Link
			to="/forgot-password"
			className="text-[hsl(99,58%,52%)] hover:underline font-semibold"
		  >
			Esqueceu sua senha?
		  </Link>
		</div>

        <Button text="Fazer login" className="mt-4" isLoading={loading} />
      </form>

      <span className="text-center block mt-4 font-normal text-gray-300">
        Ainda não tem uma conta?&nbsp;
        <Link className="hover:underline text-white" to="/signup">
          Crie uma agora.
        </Link>
      </span>
    </div>
  );
};
