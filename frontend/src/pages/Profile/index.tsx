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
    }&background=0D8ABC&color=fff`;

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
    <div className="w-full min-h-screen flex items-center justify-center bg-zinc-900 p-6">
      <div className="w-full max-w-5xl bg-zinc-800 text-white rounded-xl shadow-lg">
        
        <div className="border-b border-zinc-700 px-8 py-5">
          <h1 className="text-white text-3xl font-extrabold">Meu Perfil</h1>
          <p className="text-sm text-zinc-400">Dados do usuário</p>
        </div>

        <div className="flex gap-10 px-8 py-8">

          <div className="w-48 flex flex-col items-center gap-4">
            <img
              src={avatar}
              alt="Avatar"
              className="w-36 h-36 rounded-full object-cover border-4 border-green-500"
            />

            <div className="w-full">
              <UploadAvatar key={uploadKey} onHandleSelectedAvatar={handleAvatarChange} />

              {photo && (
                <div className="w-full mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (objectUrlRef.current) {
                        URL.revokeObjectURL(objectUrlRef.current);
                        objectUrlRef.current = null;
                      }
                      setPhoto(null);
                      setUploadKey((k) => k + 1);
                    }}
                    className="w-full text-sm px-3 py-2 bg-zinc-600 hover:bg-zinc-500 text-white rounded-md"
                  >
                    Remover foto
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfileField label="Nome">
              {person
                ? `${person.firstName}`
                : "-"}
            </ProfileField>

            <ProfileField label="Sobrenome">
              {person
                ? `${person.lastName}`
                : "-"}
            </ProfileField>

            <ProfileField label="E-mail">
              {user?.mail || "-"}
            </ProfileField>

            <ProfileField label="CPF">
              {person?.cpf}
            </ProfileField>

            <ProfileField label="Telefone">
              {person?.phone}
            </ProfileField>

            <ProfileField label="Data de nascimento">
              {person?.birthDate}
            </ProfileField>

            <ProfileField label="Endereço" className="md:col-span-2">
              {person?.address
                ? `${person.address.addressLine}, ${person.address.addressLineNumber} - ${person.address.city}/${person.address.state}`
                : "-"}
            </ProfileField>
          </div>
        </div>

        <div className="flex justify-end gap-4 border-t border-zinc-700 px-8 py-5">
          <div className="flex-1">
            <Button text="Editar" onClick={() => navigate('/user')} />
          </div>
          <div className="flex-1">
            <Button
              text="Sair"
              onClick={logout}
              className="bg-red-600 hover:bg-red-700"
            />
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