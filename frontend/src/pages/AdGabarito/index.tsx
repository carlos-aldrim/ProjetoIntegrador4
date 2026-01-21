import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components';
import { useToast } from '../../hooks';
import { api, getAuthorization } from '../../lib/axios';
import { ArrowLeft, Check, Plus, Trash, CaretDown, CaretUp } from 'phosphor-react';
import axios from 'axios';

interface AdGabaritoFormInputs {
    titulo: string;
    quantidade_questoes: number;
    alternativas: string;
    respostas: {
        questao: number;
        resposta: string;
    }[];
}

interface Gabarito {
    id: string;
    titulo: string;
    configuracao: {
        quantidade_questoes: number;
        alternativas: string[];
    };
    respostas: Record<string, string>;
    createdAt: string;
}

export const AdGabaritoPage: React.FC = () => {
    const navigate = useNavigate();
    const { handleToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [numQuestions, setNumQuestions] = useState<number>(10);
    const [alternatives, setAlternatives] = useState<string[]>(['A', 'B', 'C', 'D', 'E']);
    const [gabaritos, setGabaritos] = useState<Gabarito[]>([]);
    const [expandedGabarito, setExpandedGabarito] = useState<string | null>(null);

    const { control, register, handleSubmit, watch, setValue, formState: { errors } } = useForm<AdGabaritoFormInputs>({
        defaultValues: {
            titulo: '',
            quantidade_questoes: 10,
            alternativas: 'A, B, C, D, E',
            respostas: Array.from({ length: 10 }).map((_, i) => ({ questao: i + 1, resposta: '' }))
        }
    });

    const { fields, replace } = useFieldArray({
        control,
        name: "respostas"
    });

    const fetchGabaritos = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                getAuthorization(token);
                // Ensure the backend returns the data in the expected format
                const response = await api.get('/exam/meus-gabaritos');
                setGabaritos(response.data.data);
            }
        } catch (error) {
            console.error("Erro ao buscar gabaritos", error);
        }
    };

    useEffect(() => {
        fetchGabaritos();
    }, []);

    const toggleExpand = (id: string) => {
        setExpandedGabarito(expandedGabarito === id ? null : id);
    };

    const handleNumQuestionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        setNumQuestions(val);
        setValue("quantidade_questoes", val);

        // Update fields array
        if (!isNaN(val) && val > 0) {
            const currentAnswers = watch("respostas");
            const newAnswers = Array.from({ length: val }).map((_, i) => ({
                questao: i + 1,
                resposta: currentAnswers[i]?.resposta || ''
            }));
            replace(newAnswers);
        }
    };

    const handleAlternativesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setValue("alternativas", val);
        const split = val.split(',').map(s => s.trim()).filter(s => s !== '');
        setAlternatives(split);
    };

    const onSubmit = async (data: AdGabaritoFormInputs) => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }
            getAuthorization(token);

            const respostasObject: Record<string, string> = {};
            data.respostas.forEach(r => {
                if (r.resposta) {
                    respostasObject[r.questao.toString()] = r.resposta;
                }
            });

            // Validate if all questions are answered
            if (Object.keys(respostasObject).length !== data.quantidade_questoes) {
                handleToast("Por favor, preencha o gabarito de todas as questões.", "error");
                setIsLoading(false);
                return;
            }

            const payload = {
                titulo: data.titulo,
                configuracao: {
                    quantidade_questoes: data.quantidade_questoes,
                    alternativas: alternatives
                },
                respostas: respostasObject
            };

            await api.post('/exam/criar-gabarito', payload);
            handleToast("Gabarito criado com sucesso!", "success");
            fetchGabaritos();
            // navigate('/home'); // Optional: stay on page to see the new item

        } catch (error) {
            console.error(error);
            if (axios.isAxiosError(error) && error.response) {
                handleToast(error.response.data.message || "Erro ao criar gabarito.", "error");
            } else {
                handleToast("Erro desconhecido ao criar gabarito.", "error");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-start bg-zinc-800 px-4 py-8 gap-8">
            <div className="w-full max-w-4xl bg-zinc-800 rounded-2xl shadow-2xl overflow-hidden border-2">

             
                <div className="bg-[hsl(99,58%,52%)] p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/home')}
                            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
                        >
                            <ArrowLeft size={24} weight="bold" />
                        </button>
                        <h1 className="text-2xl font-bold text-white">Novo Gabarito</h1>
                    </div>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                     
                        <div className="grid md:grid-cols-2 gap-6 p-6 bg-zinc-700/30 rounded-xl border border-zinc-600">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Título da Prova</label>
                                <input
                                    {...register("titulo", { required: "Título é obrigatório" })}
                                    className="w-full bg-zinc-800 border border-zinc-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-[hsl(99,58%,52%)] focus:border-transparent outline-none transition-all"
                                    placeholder="Ex: Prova de Matemática - 1º Bimestre"
                                />
                                {errors.titulo && <span className="text-red-400 text-xs">{errors.titulo.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Quantidade de Questões</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={numQuestions}
                                    onChange={handleNumQuestionsChange}
                                    className="w-full bg-zinc-800 border border-zinc-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-[hsl(99,58%,52%)] focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-medium text-gray-300">Alternativas (separadas por vírgula)</label>
                                <input
                                    {...register("alternativas")}
                                    onChange={handleAlternativesChange}
                                    className="w-full bg-zinc-800 border border-zinc-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-[hsl(99,58%,52%)] focus:border-transparent outline-none transition-all"
                                    placeholder="Ex: A, B, C, D, E"
                                />
                                <p className="text-xs text-gray-500">Padrão: A, B, C, D, E</p>
                            </div>
                        </div>

                     
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white border-b border-zinc-700 pb-2">Respostas do Gabarito</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="bg-zinc-700/50 p-4 rounded-lg border border-zinc-600 flex flex-col items-center gap-3">
                                        <span className="font-bold text-white bg-zinc-600 w-8 h-8 flex items-center justify-center rounded-full text-sm">
                                            {index + 1}
                                        </span>

                                        <div className="flex flex-wrap gap-2 justify-center">
                                            {alternatives.map((opt) => (
                                                <label key={opt} className="cursor-pointer group relative">
                                                    <input
                                                        type="radio"
                                                        value={opt}
                                                        {...register(`respostas.${index}.resposta` as const, { required: true })}
                                                        className="peer sr-only"
                                                    />
                                                    <div className="w-8 h-8 flex items-center justify-center rounded-md border border-zinc-500 text-gray-400 peer-checked:bg-[hsl(99,58%,52%)] peer-checked:text-white peer-checked:border-[hsl(99,58%,52%)] hover:bg-zinc-600 transition-all font-medium text-sm">
                                                        {opt}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-zinc-700 flex justify-end">
                            <Button
                                text="Salvar Gabarito"
                                type="submit"
                                isLoading={isLoading}
                                icon={<Check size={20} weight="bold" />}
                                className="md:w-auto w-full"
                            />
                        </div>
                    </form>
                </div>
            </div>

        
            <div className="w-full max-w-4xl bg-zinc-800 rounded-2xl shadow-2xl overflow-hidden border-2">
                <div className="bg-zinc-700 p-6">
                    <h2 className="text-xl font-bold text-white">Gabaritos Cadastrados</h2>
                </div>

                <div className="p-6 space-y-4">
                    {gabaritos.length === 0 ? (
                        <p className="text-gray-400 text-center py-4">Nenhum gabarito cadastrado.</p>
                    ) : (
                        gabaritos.map((gabarito) => (
                            <div key={gabarito.id} className="bg-zinc-700/30 border border-zinc-600 rounded-xl overflow-hidden">
                                <button
                                    onClick={() => toggleExpand(gabarito.id)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-zinc-700/50 transition-colors"
                                >
                                    <div className="flex flex-col items-start">
                                        <span className="text-white font-semibold text-lg">{gabarito.titulo}</span>
                                        <span className="text-sm text-gray-400">
                                            {gabarito.configuracao.quantidade_questoes} Questões • {new Date(gabarito.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="text-gray-400">
                                        {expandedGabarito === gabarito.id ? <CaretUp size={20} /> : <CaretDown size={20} />}
                                    </div>
                                </button>

                                {expandedGabarito === gabarito.id && (
                                    <div className="p-4 border-t border-zinc-600 bg-zinc-800/50">
                                        <h4 className="text-sm font-semibold text-gray-300 mb-3">Respostas:</h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                                            {Object.entries(gabarito.respostas)
                                                .sort((a, b) => Number(a[0]) - Number(b[0]))
                                                .map(([questao, resposta]) => (
                                                    <div key={questao} className="flex items-center gap-2 p-2 rounded bg-zinc-700/50 border border-zinc-600/50">
                                                        <span className="text-xs text-gray-400">Q{questao}</span>
                                                        <span className="text-sm font-bold text-[hsl(99,58%,52%)]">{resposta}</span>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
