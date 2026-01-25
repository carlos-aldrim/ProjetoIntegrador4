import React, { useState, useEffect } from "react";
import { Button } from "../../components";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../hooks/UseUser";
import { useFormSteps } from "../../hooks/UseFormSteps";
import { useToast } from "../../hooks";
import { api, getAuthorization } from "../../lib/axios";
import axios from "axios";
import { Person } from "../../types/person";
import { ArrowLeft, SignOut, PencilSimple } from "phosphor-react";


export const ProfilePage: React.FC = () => {
  const { user, logout } = useUser();
  const { data } = useFormSteps();
  const person: Person | undefined = (user && (user as any).person) || data.person;
  const [fetchedUser, setFetchedUser] = useState<any | null>(null);
  const { handleToast } = useToast();
  const navigate = useNavigate();
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          handleToast("Você precisa estar logado.", "warning");
          navigate("/");
          return;
        }
        getAuthorization(token);
        const { data } = await api.get("/usuario/my");
        if (data && Array.isArray(data) && data.length > 0) {
          setFetchedUser(data[0]);
        } else if (data && !Array.isArray(data)) {
          setFetchedUser(data);
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
      }
    };
    fetchProfile();
  }, [handleToast, navigate]);

  const displayedPerson: Person | undefined = (fetchedUser && fetchedUser.person) || person;
  const avatar = fetchedUser?.image || (user as any)?.image ||
    `https://ui-avatars.com/api/?name=${displayedPerson
      ? `${displayedPerson.firstName}+${displayedPerson.lastName}`
      : "Usuario"
    }&background=0D8ABC&color=fff`;

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-zinc-800 px-4 py-8">
      <div className="w-full max-w-4xl bg-zinc-800 rounded-2xl shadow-2xl overflow-hidden border-2">

        {/* Header */}
        <div className="bg-[hsl(99,58%,52%)] p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/home')}
              className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
            >
              <ArrowLeft size={24} weight="bold" />
            </button>
            <h1 className="text-2xl font-bold text-white">Meu Perfil</h1>
          </div>
        </div>

        <div className="p-8">
          <div className="grid md:grid-cols-[250px_1fr] gap-8">


            <div className="flex flex-col items-center pt-8 md:pt-24 gap-6">
              <div className="relative group">
                <img
                  src={avatar}
                  alt="Avatar"
                  className="w-40 h-40 rounded-full object-cover border-4 border-[hsl(99,58%,52%)] shadow-xl"
                />
              </div>
            </div>


            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProfileField label="Nome">
                  {fetchedUser?.firstName || person?.firstName || "-"}
                </ProfileField>

                <ProfileField label="Sobrenome">
                  {fetchedUser?.lastName || person?.lastName || "-"}
                </ProfileField>

                <ProfileField label="E-mail">
                  {fetchedUser?.mail || user?.mail || "-"}
                </ProfileField>

                <ProfileField label="CPF">
                  {fetchedUser?.cpf || person?.cpf || "-"}
                </ProfileField>

                <ProfileField label="Telefone">
                  {fetchedUser?.phone || person?.phone || "-"}
                </ProfileField>

                <ProfileField label="Data de nascimento">
                  {fetchedUser?.birthDate ? new Date(fetchedUser.birthDate).toLocaleDateString() : (person?.birthDate || "-")}
                </ProfileField>

                <ProfileField label="Endereço" className="md:col-span-2">
                  {fetchedUser?.addressLine
                    ? `${fetchedUser.addressLine}, ${fetchedUser.addressLineNumber} - ${fetchedUser.city}/${fetchedUser.state}`
                    : (person?.address ? `${person.address.addressLine}, ${person.address.addressLineNumber} - ${person.address.city}/${person.address.state}` : "-")}
                </ProfileField>
              </div>

              <div className="pt-6 border-t border-zinc-700 flex flex-wrap gap-4 justify-end">
                <Button
                  text="Editar Perfil"
                  icon={<PencilSimple size={16} weight="bold" />}
                  onClick={() => navigate('/user')}
                  className="w-32 h-9 px-3 py-2 text-sm font-semibold"
                />
                <Button
                  text="Sair"
                  icon={<SignOut size={16} weight="bold" />}
                  onClick={logout}
                  className="w-32 h-9 px-3 py-2 text-sm font-semibold bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                />
                <Button
                  text="Deletar conta"
                  onClick={() => setShowDeletePopup(true)}
                  className="w-32 h-9 px-3 py-2 text-sm font-semibold bg-red-700/80 text-white hover:bg-red-800"
                />
              </div>
                  {showDeletePopup && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                      <div className="bg-zinc-800 p-8 rounded-lg shadow-lg text-center w-full max-w-sm">
                        <h2 className="text-xl font-bold mb-4 text-white">Deseja deletar conta?</h2>
                        <div className="flex justify-center gap-4 mt-4">
                          <button
                            className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800"
                            disabled={isDeleting}
                            onClick={async () => {
                              setIsDeleting(true);
                              try {
                                const token = localStorage.getItem("token") || "";
                                getAuthorization(token);
                                await api.get("/usuario/delete-user");
                                localStorage.removeItem("token");
                                handleToast("Conta deletada com sucesso!", "success");
                                navigate("/");
                              } catch (err) {
                                handleToast("Erro ao deletar conta.", "error");
                              } finally {
                                setIsDeleting(false);
                                setShowDeletePopup(false);
                              }
                            }}
                          >Sim</button>
                          <button
                            className="px-4 py-2 bg-zinc-600 text-white rounded hover:bg-zinc-700"
                            onClick={() => setShowDeletePopup(false)}
                            disabled={isDeleting}
                          >Não</button>
                        </div>
                      </div>
                    </div>
                  )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileField = ({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={className}>
    <label className="text-sm font-medium text-gray-400 block mb-1">{label}</label>
    <div className="w-full bg-zinc-700/50 border border-zinc-600 rounded-lg px-4 py-3 text-white font-medium opacity-70 cursor-not-allowed">
      {children || "-"}
    </div>
  </div>
);