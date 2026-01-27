import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components';
import { useToast } from '../../hooks';
import { api, getAuthorization } from '../../lib/axios';
import { ArrowLeft, Check, Trash, CaretDown, CaretUp, PencilSimple } from 'phosphor-react';
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
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [gabaritoToDelete, setGabaritoToDelete] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [editingGabaritoId, setEditingGabaritoId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { control, register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<AdGabaritoFormInputs>({
        defaultValues: {
            titulo: '',
            quantidade_questoes: 10,
            alternativas: 'A, B, C, D, E',
            respostas: Array.from({ length: 10 }).map((_, i) => ({ questao: i + 1, resposta: '' }))
        }
    });
    // Função para iniciar edição de um gabarito
    const handleEditClick = (gabarito: Gabarito) => {
        setEditMode(true);
        setEditingGabaritoId(gabarito.id);
        setNumQuestions(gabarito.configuracao.quantidade_questoes);
        setAlternatives(gabarito.configuracao.alternativas);
        // Preencher o formulário com os dados do gabarito
        reset({
            titulo: gabarito.titulo,
            quantidade_questoes: gabarito.configuracao.quantidade_questoes,
            alternativas: gabarito.configuracao.alternativas.join(', '),
            respostas: Array.from({ length: gabarito.configuracao.quantidade_questoes }).map((_, i) => ({
                questao: i + 1,
                resposta: gabarito.respostas[(i + 1).toString()] || ''
            }))
        });
    };

    // Função para cancelar edição
    const handleCancelEdit = () => {
        setEditMode(false);
        setEditingGabaritoId(null);
        setNumQuestions(10);
        setAlternatives(['A', 'B', 'C', 'D', 'E']);
        reset({
            titulo: '',
            quantidade_questoes: 10,
            alternativas: 'A, B, C, D, E',
            respostas: Array.from({ length: 10 }).map((_, i) => ({ questao: i + 1, resposta: '' }))
        });
    };

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

    const handleDeleteClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setGabaritoToDelete(id);
        setShowDeletePopup(true);
    };

    const handleDeleteConfirm = async () => {
        if (!gabaritoToDelete) return;
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('token');
            if (token) {
                getAuthorization(token);
                await api.delete(`/exam/deletar-gabarito/${gabaritoToDelete}`);
                handleToast("Gabarito excluído com sucesso!", "success");
                fetchGabaritos();
            }
        } catch (error) {
            console.error("Erro ao excluir gabarito", error);
            handleToast("Erro ao excluir gabarito.", "error");
        } finally {
            setIsDeleting(false);
            setShowDeletePopup(false);
            setGabaritoToDelete(null);
        }
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

            if (editMode && editingGabaritoId) {
                // Atualizar gabarito existente
                await api.put(`/exam/atualizar-gabarito/${editingGabaritoId}`, payload);
                handleToast("Gabarito atualizado com sucesso!", "success");
                handleCancelEdit();
            } else {
                // Criar novo gabarito
                await api.post('/exam/criar-gabarito', payload);
                handleToast("Gabarito criado com sucesso!", "success");
            }
            fetchGabaritos();
        } catch (error) {
            console.error(error);
            if (axios.isAxiosError(error) && error.response) {
                handleToast(error.response.data.message || (editMode ? "Erro ao atualizar gabarito." : "Erro ao criar gabarito."), "error");
            } else {
                handleToast(editMode ? "Erro desconhecido ao atualizar gabarito." : "Erro desconhecido ao criar gabarito.", "error");
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
                        <h1 className="text-2xl font-bold text-white">{editMode ? 'Editar Gabarito' : 'Novo Gabarito'}</h1>
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

                                        <div className="flex flex-wrap gap-2">
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

                        <div className="pt-4 border-t border-zinc-700 flex justify-end gap-2">
                            {editMode && (
                                <Button
                                    text="Cancelar"
                                    type="button"
                                    isLoading={isLoading}
                                    icon={undefined}
                                    className="md:w-auto w-full bg-zinc-600 hover:bg-zinc-700"
                                    onClick={handleCancelEdit}
                                />
                            )}
                            <Button
                                text={editMode ? "Atualizar Gabarito" : "Salvar Gabarito"}
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
                                <div className="flex items-center justify-between w-full p-4 hover:bg-zinc-700/50 transition-colors">
                                    <button
                                        onClick={() => toggleExpand(gabarito.id)}
                                        className="flex-1 flex items-center justify-between mr-4 text-left group"
                                    >
                                        <div className="flex flex-col items-start">
                                            <span className="text-white font-semibold text-lg group-hover:text-[hsl(99,58%,52%)] transition-colors">{gabarito.titulo}</span>
                                            <span className="text-sm text-gray-400">
                                                {gabarito.configuracao.quantidade_questoes} Questões • {new Date(gabarito.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="text-gray-400">
                                            {expandedGabarito === gabarito.id ? <CaretUp size={20} /> : <CaretDown size={20} />}
                                        </div>
                                    </button>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditClick(gabarito)}
                                            className="text-gray-400 hover:text-yellow-500 p-2 hover:bg-yellow-500/10 rounded-lg transition-all"
                                            title="Editar Gabarito"
                                        >
                                            <PencilSimple size={20} weight="bold" />
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteClick(gabarito.id, e)}
                                            className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-all"
                                            title="Excluir Gabarito"
                                        >
                                            <Trash size={20} weight="bold" />
                                        </button>
                                    </div>
                                </div>

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
            {/* Modal de confirmação de exclusão */}
            {showDeletePopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-zinc-800 p-8 rounded-lg shadow-lg text-center w-full max-w-sm">
                        <h2 className="text-xl font-bold mb-4 text-white">Deseja excluir este gabarito?</h2>
                        <div className="flex justify-center gap-4 mt-4">
                            <button
                                className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800"
                                disabled={isDeleting}
                                onClick={handleDeleteConfirm}
                            >Sim</button>
                            <button
                                className="px-4 py-2 bg-zinc-600 text-white rounded hover:bg-zinc-700"
                                onClick={() => { setShowDeletePopup(false); setGabaritoToDelete(null); }}
                                disabled={isDeleting}
                            >Não</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
