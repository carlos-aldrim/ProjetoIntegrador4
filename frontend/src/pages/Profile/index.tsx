import React, { useState, useRef, useEffect } from "react";
import { Button, UploadAvatar } from "../../components";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../hooks/UseUser";
import { useFormSteps } from "../../hooks/UseFormSteps";
import { useToast } from "../../hooks";
import { api, getAuthorization } from "../../lib/axios";
import axios from "axios";
import { Person } from "../../types/person";


export const ProfilePage: React.FC = () => {
  const { user, logout } = useUser();
  const { data } = useFormSteps();

  const person: Person | undefined =
    (user && (user as any).person) || data.person;

  const [photo, setPhoto] = useState<string | null>(null);
  const [uploadKey, setUploadKey] = useState(0);
  const [fetchedUser, setFetchedUser] = useState<any | null>(null);
  const { handleToast } = useToast();

  const objectUrlRef = useRef<string | null>(null);
  const navigate = useNavigate();

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
        const u = Array.isArray(data) ? data[0] : data;
        if (u) {
          setFetchedUser(u);
          if (u.image) {
            setPhoto(u.image);
          }
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
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  const displayedPerson: Person | undefined =
    (fetchedUser && fetchedUser.person) || person;

  const avatar =
    photo ||
    `https://ui-avatars.com/api/?name=${
      person
        ? `${person.firstName}+${person.lastName}`
        : "Usuario"
    }&background=FFFFFF33&color=fff`;

  const handleAvatarChange = (file: any) => {
    if (Array.isArray(file)) {
      if (file.length === 0) {
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
          objectUrlRef.current = null;
        }
        setPhoto(null);
       
        setUploadKey((k) => k + 1);
        return;
      }

      const first = file[0];
      if (first instanceof File) {
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
        }
        const url = URL.createObjectURL(first);
        objectUrlRef.current = url;
        setPhoto(url);
        return;
      }
    }

    if (typeof file === "string" && file) {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setPhoto(file);
      return;
    }
    setPhoto(null);
  };


  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-zinc-800 px-4 py-8">
      <div className="w-full max-w-5xl bg-zinc-800 rounded-2xl shadow-2xl overflow-hidden border-2 grid md:grid-cols-2 min-h-[600px]">

        <div className="bg-[hsl(99,58%,52%)] p-12 flex flex-col items-center justify-center text-center space-y-6 relative">
          <div className="bg-white/20 p-1 rounded-full backdrop-blur-sm shadow-xl w-36 h-36 flex items-center justify-center relative">
            <img src={avatar} alt="Avatar" className="w-full h-full rounded-full object-cover shadow-sm" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">Meu Perfil</h1>
            <p className="text-green-950 font-medium text-lg">Dados do usuário</p>
          </div>
        </div>

        <div className="p-8 md:p-12 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Informações</h2>
            <p className="text-gray-400 text-sm mb-6">Visualize os dados cadastrados da sua conta.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProfileField label="Nome">{person ? person.firstName : "-"}</ProfileField>
              <ProfileField label="Sobrenome">{person ? person.lastName : "-"}</ProfileField>
              <ProfileField label="E-mail">{user?.mail || "-"}</ProfileField>
              <ProfileField label="CPF">{person?.cpf || "-"}</ProfileField>
              <ProfileField label="Telefone">{person?.phone || "-"}</ProfileField>
              <ProfileField label="Data de nascimento">{person?.birthDate || "-"}</ProfileField>
              <ProfileField label="Endereço" className="md:col-span-2">
                {person?.address
                  ? `${person.address.addressLine}, ${person.address.addressLineNumber} - ${person.address.city}/${person.address.state}`
                  : "-"}
              </ProfileField>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <div className="flex-1">
              <Button text="Editar" onClick={() => navigate('/user')} />
            </div>
            <div className="flex-1">
              <Button text="Sair" onClick={logout} className="bg-red-600 hover:bg-red-700" />
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
    <label className="text-sm text-zinc-400">{label}</label>
    <div className="mt-1 bg-zinc-700 rounded-md px-3 py-2 text-white">
      {children || "-"}
    </div>
  </div>
);