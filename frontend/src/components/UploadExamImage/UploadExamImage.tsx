import React, { ChangeEvent, useRef, useState } from "react";
import { ArrowUpTrayIcon } from "@heroicons/react/24/solid";
import { SpinnerLoading } from "../SpinnerLoading";

interface UploadExamImageProps {
    onImageSelected: (file: File) => void;
}

export const UploadExamImage: React.FC<UploadExamImageProps> = ({
    onImageSelected,
}) => {
    const inputFileRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (file) {
            if (!file.type.startsWith("image/")) {
                alert("Por favor, selecione apenas arquivos de imagem.");
                return;
            }

            setIsLoading(true);


            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);

 
            onImageSelected(file);

            setIsLoading(false);
        }
    };

    return (
        <div className="w-full">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="font-semibold text-white text-sm block mb-2">
                            Foto da Prova
                        </span>
                        <button
                            type="button"
                            onClick={() => inputFileRef.current?.click()}
                            className="flex items-center gap-2 uppercase px-4 py-2 bg-[#333] text-white rounded-[4px] text-sm hover:bg-[#444] transition-colors"
                        >
                            Escolher Arquivo
                            <ArrowUpTrayIcon className="h-4 w-4 text-white" />
                        </button>
                    </div>

                    <input
                        type="file"
                        accept="image/*"
                        ref={inputFileRef}
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>

       
                {isLoading && (
                    <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-lg">
                        <SpinnerLoading size="MEDIUM" />
                    </div>
                )}

                {!isLoading && preview && (
                    <div className="relative w-full mt-2 group">
                        <p className="uppercase text-gray-400 text-xs font-semibold mb-1">Preview:</p>
                        <div className="relative w-fit">
                            <img
                                src={preview}
                                alt="Preview da Prova"
                                className="max-h-64 rounded-md border-2 border-zinc-600 shadow-md object-contain"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setPreview(null);
                                    if (inputFileRef.current) inputFileRef.current.value = "";
                                }}
                                className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remover imagem"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
