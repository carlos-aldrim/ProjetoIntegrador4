import React, { useRef, useState } from "react";
import { Button } from "../../components";
import { useUser } from "../../hooks/UseUser";
import { useFormSteps } from "../../hooks/UseFormSteps";
import { Person } from "../../types/person";


export const ProfilePage: React.FC = () => {
  const { user, logout } = useUser();
  const { data } = useFormSteps();

  const person: Person | undefined =
    (user && (user as any).person) || data.person;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);

  const avatar =
    photo ||
    `https://ui-avatars.com/api/?name=${
      person
        ? `${person.firstName}+${person.lastName}`
        : "Usuario"
    }&background=0D8ABC&color=fff`;

  const handlePhotoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
  setPhoto(null);

  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }
};


  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-900 p-6">
      <div className="w-full max-w-5xl bg-gray-800 text-white rounded-xl shadow-lg">
        
        <div className="border-b border-gray-700 px-8 py-5">
          <h2 className="text-xl font-semibold">Meu Perfil</h2>
          <p className="text-sm text-gray-400">Dados do usuário</p>
        </div>

        <div className="flex gap-10 px-8 py-8">

          <div className="w-48 flex flex-col items-center gap-4">
  <img
    src={avatar}
    alt="Avatar"
    className="w-36 h-36 rounded-full object-cover border-4 border-green-500"
  />

  <Button
    text="Alterar foto"
    onClick={() => fileInputRef.current?.click()}
    className="bg-blue-600 hover:bg-blue-700 w-full"
  />

  {photo && (
    <Button
      text="Remover foto"
      onClick={handleRemovePhoto}
      className="bg-gray-600 hover:bg-gray-700 w-full"
    />
  )}

  <input
    type="file"
    accept="image/*"
    ref={fileInputRef}
    onChange={handlePhotoChange}
    className="hidden"
  />
</div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfileField label="Nome">
              {person
                ? `${person.firstName} ${person.lastName}`
                : "-"}
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

        <div className="flex justify-end gap-4 border-t border-gray-700 px-8 py-5">
          <Button
            text="Editar"
            onClick={() => {}}
            className="bg-green-600 hover:bg-green-700"
          />
          <Button
            text="Sair"
            onClick={logout}
            className="bg-red-600 hover:bg-red-700"
          />
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
    <label className="text-sm text-gray-400">{label}</label>
    <div className="mt-1 bg-gray-700 rounded-md px-3 py-2 text-white">
      {children || "-"}
    </div>
  </div>
);
