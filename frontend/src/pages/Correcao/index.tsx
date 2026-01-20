import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button, ControllerTextInput, UploadAvatar } from "../../components";
import { useToast } from "../../hooks";
import { api, getAuthorization } from "../../lib/axios";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface CorrectionFormInputs {
    gabaritoId: string;
    image: File[];
}

export const CorrecaoPage: React.FC = () => {
    const { handleToast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const { control, handleSubmit, setValue, register } = useForm<CorrectionFormInputs>();

    const handleAvatarChange = (file: any) => {
        setValue("image", file);
    };

    const onSubmit = async (data: CorrectionFormInputs) => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            if (!token) {
                handleToast("Você precisa estar logado.", "warning");
                navigate("/");
                return;
            }

            getAuthorization(token);

            const formData = new FormData();
            formData.append("gabaritoId", data.gabaritoId);


            if (data.image && data.image.length > 0) {

                formData.append("image", data.image[0]);
            } else {
                handleToast("Por favor, selecione uma imagem da prova.", "warning");
                setLoading(false);
                return;
            }

            const response = await api.post("/corrigir-prova", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            handleToast("Prova enviada para correção com sucesso!", "success");
            console.log("Resposta da correção:", response.data);

        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.log("Erro correção:", error.response?.data);
            }
            handleToast("Erro ao enviar prova.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-zinc-800 p-6 w-full max-w-md shadow-[0_2px_22px_-4px_rgba(0,0,0,0.2)] rounded-lg">

                <h1 className="text-white text-3xl font-extrabold mb-6">Corrigir Prova</h1>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    <ControllerTextInput
                        control={control}
                        name="gabaritoId"
                        label="ID do Gabarito"
                        placeholder="Digite o ID do gabarito"
                    />

                    <div className="w-full">
                        <p className="text-white mb-2">Imagem da Prova</p>
                        <UploadAvatar onHandleSelectedAvatar={handleAvatarChange} />
                    </div>

                    <Button
                        text="Enviar para Correção"
                        type="submit"
                        isLoading={loading}
                        className="mt-6"
                    />
                </form>
            </div>
        </div>
    );
};
