import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../components";
import { UploadExamImage } from "../../components/UploadExamImage/UploadExamImage";
import { useToast } from "../../hooks";
import { api, getAuthorization } from "../../lib/axios";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FileText, ArrowLeft, UploadSimple, CheckCircle, XCircle, WarningCircle, Prohibit } from "phosphor-react";

interface CorrectionFormInputs {
    gabaritoId: string;
    image: File | null;
}

interface Gabarito {
    id: string;
    titulo: string;
    createdAt: string;
}

interface CorrectionResult {
    message: string;
    totalQuestoes: number;
    totalAcertos: number;
    notaFinal: number;
    percentual: number;
    resultadoPorQuestao: Record<string, "correta" | "incorreta" | "em branco" | "anulada">;
}

export const CorrecaoPage: React.FC = () => {
    const { handleToast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [gabaritos, setGabaritos] = useState<Gabarito[]>([]);
    const [correctionResult, setCorrectionResult] = useState<CorrectionResult | null>(null);

    const { handleSubmit, setValue, register, formState: { errors }, reset } = useForm<CorrectionFormInputs>({
        defaultValues: {
            image: null
        }
    });

    useEffect(() => {
        const fetchGabaritos = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    navigate("/");
                    return;
                }
                getAuthorization(token);
                const response = await api.get("/exam/meus-gabaritos");
                setGabaritos(response.data.data);
            } catch (error) {
                console.error("Erro ao buscar gabaritos", error);
                handleToast("Erro ao carregar gabaritos.", "error");
            }
        };

        fetchGabaritos();
    }, [navigate, handleToast]);

    const handleImageSelected = (file: File) => {
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

            if (data.image) {
                formData.append("image", data.image);
            } else {
                handleToast("Por favor, selecione uma imagem da prova.", "warning");
                setLoading(false);
                return;
            }

            const response = await api.post("exam/corrigir-prova", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            handleToast("Prova enviada para correção com sucesso!", "success");
            console.log("Resposta da correção:", response.data);

            setCorrectionResult(response.data.resultado);

        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.log("Erro correção:", error.response?.data);
            }
            handleToast("Erro ao enviar prova.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setCorrectionResult(null);
        reset();
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'correta': return <CheckCircle size={20} className="text-green-500" weight="fill" />;
            case 'incorreta': return <XCircle size={20} className="text-red-500" weight="fill" />;
            case 'em branco': return <WarningCircle size={20} className="text-yellow-500" weight="fill" />;
            case 'anulada': return <Prohibit size={20} className="text-gray-500" weight="fill" />;
            default: return null;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'correta': return 'Acerto';
            case 'incorreta': return 'Erro';
            case 'em branco': return 'Em Branco';
            case 'anulada': return 'Anulada';
            default: return status;
        }
    };

    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-zinc-800 px-4 py-8">
            <div className="w-full max-w-5xl bg-zinc-800 rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2 min-h-[500px]  border-2">

                {/* Left Side - Visual */}
                <div className="bg-[hsl(99,58%,52%)] p-12 flex flex-col items-center justify-center text-center space-y-6 relative">
                    <button
                        onClick={() => navigate('/home')}
                        className="absolute top-6 left-6 text-white/80 hover:text-white transition-colors"
                        title="Voltar para Home"
                    >
                        <ArrowLeft size={24} weight="bold" />
                    </button>

                    <div className="bg-white/20 p-6 rounded-full backdrop-blur-sm shadow-inner">
                        <FileText size={64} weight="fill" className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-white mb-2">Correção de Provas</h1>
                        <p className="text-green-950 font-medium text-lg">
                            Envie suas provas para correção instantânea.
                        </p>
                    </div>
                </div>

                {/* Right Side - Form or Result */}
                <div className="p-8 md:p-12 flex flex-col justify-center max-h-[80vh] overflow-y-auto custom-scrollbar">
                    {correctionResult ? (
                        <div className="space-y-6 animate-fade-in">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-white mb-1">Resultado da Correção</h2>
                                <p className="text-gray-400 text-sm">Confira abaixo o desempenho na prova.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-zinc-700/50 p-4 rounded-xl text-center border border-zinc-600">
                                    <span className="text-gray-400 text-xs uppercase font-bold tracking-wider">Nota Final</span>
                                    <div className="text-4xl font-extrabold text-[hsl(99,58%,52%)] mt-1">{correctionResult.notaFinal}</div>
                                </div>
                                <div className="bg-zinc-700/50 p-4 rounded-xl text-center border border-zinc-600">
                                    <span className="text-gray-400 text-xs uppercase font-bold tracking-wider">Acertos</span>
                                    <div className="text-xl font-bold text-white mt-1">
                                        {correctionResult.totalAcertos} <span className="text-sm text-gray-400 font-normal">/ {correctionResult.totalQuestoes}</span>
                                    </div>
                                    <div className="text-xs text-[hsl(99,58%,52%)] mt-1">{correctionResult.percentual}% de aproveitamento</div>
                                </div>
                            </div>

                            <div className="bg-zinc-700/30 rounded-xl border border-zinc-600 p-4 max-h-60 overflow-y-auto custom-scrollbar">
                                <h3 className="text-white font-semibold mb-3 text-sm">Detalhamento por Questão</h3>
                                <div className="space-y-2">
                                    {Object.entries(correctionResult.resultadoPorQuestao).map(([questao, status]) => (
                                        <div key={questao} className="flex items-center justify-between p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors border border-zinc-700/50">
                                            <span className="text-gray-300 text-sm font-medium">Questão {questao}</span>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-semibold ${status === 'correta' ? 'text-green-400' :
                                                        status === 'incorreta' ? 'text-red-400' :
                                                            status === 'em branco' ? 'text-yellow-400' : 'text-gray-400'
                                                    }`}>
                                                    {getStatusText(status)}
                                                </span>
                                                {getStatusIcon(status)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Button
                                text="Corrigir Outra Prova"
                                onClick={handleReset}
                                className="mt-4"
                            />
                        </div>
                    ) : (
                        <>
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-white mb-2">Detalhes da Correção</h2>
                                <p className="text-gray-400 text-sm">Selecione o gabarito e faça o upload da imagem da prova.</p>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="flex flex-col justify-start w-full">
                                    <label className="font-semibold text-gray-300 text-sm mb-2">Selecione o Gabarito</label>
                                    <select
                                        {...register("gabaritoId", { required: "Selecione um gabarito" })}
                                        className="bg-zinc-700 border border-zinc-600 text-white text-sm rounded-lg focus:ring-[hsl(99,58%,52%)] focus:border-[hsl(99,58%,52%)] block w-full p-3 transition-colors outline-none"
                                    >
                                        <option value="">Selecione...</option>
                                        {gabaritos.map((gabarito) => (
                                            <option key={gabarito.id} value={gabarito.id}>
                                                {gabarito.titulo}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.gabaritoId && <span className="text-red-500 text-sm mt-1">{errors.gabaritoId.message}</span>}
                                </div>

                                <div className="w-full">
                                    <UploadExamImage onImageSelected={handleImageSelected} />
                                </div>

                                <Button
                                    text="Enviar para Correção"
                                    type="submit"
                                    icon={<UploadSimple size={20} weight="bold" />}
                                    isLoading={loading}
                                    className="mt-4"
                                />
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
