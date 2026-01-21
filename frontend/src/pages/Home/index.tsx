import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks';
import { Button } from '../../components';
import { SignOut, PencilSimple, FileText, User, FilePlus } from 'phosphor-react';

export const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useUser();

    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-zinc-800 px-4 py-8">
            <div className="w-full max-w-5xl bg-zinc-800 rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2 border-2 min-h-[500px]">
             
                <div className="bg-[hsl(99,58%,52%)] p-12 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="bg-white/20 p-6 rounded-full backdrop-blur-sm shadow-inner">
                        <User size={64} weight="fill" className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold text-white mb-2">Bem-vindo!</h1>
                        <p className="text-green-950 font-medium text-lg">
                            Seu painel de controle pessoal.
                        </p>
                    </div>
                    <p className="text-white/90 text-sm max-w-xs leading-relaxed">
                        Gerencie seu perfil e faça a correção de suas provas de forma simples, rápida e eficiente.
                    </p>
                </div>

              
                <div className="p-8 md:p-12 flex flex-col justify-center space-y-8">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white">O que deseja fazer?</h2>
                        <p className="text-gray-400 text-sm">Selecione uma opção abaixo para continuar:</p>
                    </div>

                    <div className="space-y-4">
                        <Button
                            text="Editar Perfil"
                            icon={<PencilSimple size={20} weight="bold" />}
                            onClick={() => navigate('/user')}
                            className="bg-zinc-700 hover:bg-zinc-600 focus:ring-zinc-500 border border-zinc-600"
                        />
                        <Button
                            text="Visualizar perfil"
                            icon={<User size={20} weight="bold" />}
                            onClick={() => navigate('/')}
                            className="bg-zinc-700 hover:bg-zinc-600 focus:ring-zinc-500 border border-zinc-600"
                        />
                        <Button
                            text="Adicionar Gabarito"
                            icon={<FilePlus size={20} weight="bold" />}
                            onClick={() => navigate('/')}
                            className="bg-zinc-700 hover:bg-zinc-600 focus:ring-zinc-500 border border-zinc-600"
                        />
                        <Button
                            text="Corrigir Prova"
                            icon={<FileText size={20} weight="bold" />}
                            onClick={() => navigate('/corrigir-prova')}
                        />
                    </div>

                    <div className="pt-6 mt-auto border-t border-zinc-700">
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-500 font-semibold rounded-md hover:bg-red-500 hover:text-white transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        >
                            <SignOut size={20} weight="bold" />
                            <span>Sair da Conta</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
