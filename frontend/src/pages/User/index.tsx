import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, ControllerTextInput, UploadAvatar } from "../../components";
import { useToast } from "../../hooks";
import { api, getAuthorization } from "../../lib/axios";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserCircle, ArrowLeft, FloppyDisk, IdentificationBadge, Lock } from "phosphor-react";

interface UserFormInputs {
    mail: string;
    isActive: boolean;
    image: string;
    person: {
        firstName: string;
        phone: string;
    }
}

export const UserPage: React.FC = () => {
    const { handleToast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const { control, handleSubmit, setValue, watch } = useForm<UserFormInputs>({
        defaultValues: {
            isActive: true,
            person: {
                firstName: "",
                phone: ""
            }
        }
    });

    const userImage = watch("image");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");

                if (!token) {
                    handleToast("Você precisa estar logado.", "warning");
                    navigate("/");
                    return;
                }

                getAuthorization(token);

                const { data } = await api.get("/usuario/my");
                console.log("Dados recebidos da API:", data);
                const user = Array.isArray(data) ? data[0] : data;

                if (user) {
                    setValue("mail", user.mail);
                    setValue("image", user.image);
                    setValue("isActive", user.isActive ?? true);
                    setValue("person.firstName", user.person?.firstName || user.firstName || "");
                    setValue("person.phone", user.person?.phone || user.phone || "");
                }
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 400) {
                    handleToast("Sessão expirada ou inválida. Faça login novamente.", "error");
                    localStorage.removeItem("token");
                    navigate("/");
                } else {
                    console.error("Erro ao carregar dados do usuário.", error);
                    handleToast("Erro ao carregar perfil.", "error");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [setValue, navigate, handleToast]);

    const onSubmit = async (data: UserFormInputs) => {
        try {
            setLoading(true);

            const payload = {
                ...data,
                isActive: data.isActive ?? true
            };

            await api.post("/usuario/update-user", payload);
            handleToast("Usuário atualizado com sucesso!", "success");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.group("Erro Update User");
                console.error("Status:", error.response?.status);
                console.error("Data:", error.response?.data);
                console.groupEnd();
            }
            handleToast("Erro ao atualizar perfil.", "error");

        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = (file: any) => {
        setValue("image", file);
    };

    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-zinc-800 px-4 py-8 ">
            <div className="w-full max-w-5xl bg-zinc-800 rounded-2xl shadow-2xl overflow-hidden border-2 grid md:grid-cols-2 min-h-[600px]">

                <div className="bg-[hsl(99,58%,52%)] p-12 flex flex-col items-center justify-center text-center space-y-6 relative">
                    <button
                        onClick={() => navigate('/home')}
                        className="absolute top-6 left-6 text-white/80 hover:text-white transition-colors"
                        title="Voltar para Home"
                    >
                        <ArrowLeft size={24} weight="bold" />
                    </button>

                    <div className="bg-white/20 p-1 rounded-full backdrop-blur-sm shadow-xl w-36 h-36 flex items-center justify-center relative">
                        {userImage ? (
                            <img src={userImage} alt="Profile" className="w-full h-full rounded-full object-cover shadow-sm" />
                        ) : (
                            <IdentificationBadge size={64} weight="fill" className="text-white/90" />
                        )}
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-white mb-2">Editar Perfil</h1>
                        <p className="text-green-950 font-medium text-lg">
                            Mantenha seus dados sempre atualizados.
                        </p>
                    </div>
                </div>

                
                <div className="p-8 md:p-12 flex flex-col justify-center">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-white mb-2">Seus Dados</h2>
                        <p className="text-gray-400 text-sm">Edite as informações do seu perfil abaixo.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="w-full flex justify-center mb-4">
                            <UploadAvatar onHandleSelectedAvatar={handleAvatarChange} />
                        </div>

                        <ControllerTextInput
                            control={control}
                            name="mail"
                            label="E-mail"
                            placeholder="seu@email.com"
                            readOnly
                            className="opacity-60 cursor-not-allowed"
                            rightIcon={<Lock size={20} className="text-gray-400" />}
                        />

                        <ControllerTextInput
                            control={control}
                            name="person.firstName"
                            label="Nome"
                            placeholder="Seu nome"
                        />


                        <ControllerTextInput
                            control={control}
                            name="person.phone"
                            label="Telefone"
                            placeholder="(00) 00000-0000"
                        />



                        <Button
                            text="Salvar Alterações"
                            type="submit"
                            icon={<FloppyDisk size={20} weight="bold" />}
                            isLoading={loading}
                            className="mt-6"
                        />
                    </form>
                </div>
            </div>
        </div>
    );
};
