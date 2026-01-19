import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, ControllerTextInput, UploadAvatar } from "../../components";
import { useToast } from "../../hooks";
import { api, getAuthorization } from "../../lib/axios";
import { useNavigate } from "react-router-dom";
import axios from "axios";


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
    const [showPassword, setShowPassword] = useState(false);


    const { control, handleSubmit, setValue } = useForm<UserFormInputs>({
        defaultValues: {
            isActive: true,
            person: {
                firstName: "",
                phone: ""
            }
        }
    });

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
                    setValue("person.firstName", user.firstName || "");
                    setValue("person.phone", user.phone || "");
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
                console.log("Erro update:", error.response?.data);
            }
           
        } finally {
            setLoading(false);
        }
    };


    const handleAvatarChange = (file: any) => {

        setValue("image", file);
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-zinc-800 p-6 w-full max-w-md shadow-[0_2px_22px_-4px_rgba(0,0,0,0.2)] rounded-lg">

                <h1 className="text-white text-3xl font-extrabold mb-6">Editar Perfil</h1>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">


                    <ControllerTextInput
                        control={control}
                        name="person.firstName"
                        label="Nome"


                    />


                    <ControllerTextInput
                        control={control}
                        name="person.phone"
                        label="Telefone"

                    />


                    <ControllerTextInput
                        control={control}
                        name="mail"
                        label="E-mail"

                    />

                    <div className="w-full">
                        <UploadAvatar onHandleSelectedAvatar={handleAvatarChange} />
                    </div>

                    <Button
                        text="Salvar Alterações"
                        type="submit"
                        isLoading={loading}
                        className="mt-6"
                    />
                </form>
            </div>
        </div>
    );
};