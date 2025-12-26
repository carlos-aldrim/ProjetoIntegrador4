import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { addressValidation } from "../../utils";
import { ButtonStepForm } from "../ButtonStepForm";
import { SpinnerLoading } from "../SpinnerLoading";
import { ControllerInputMask } from "../ControllerInputMask";
import { ControllerTextInput } from "../ControllerTextInput";
import { useFormSteps, useGetAdressByViaCep } from "../../hooks";

export const Address: React.FC = () => {
  const { control, handleSubmit, getValues, setValue } = useForm({
    resolver: yupResolver(addressValidation),
  });

  const { goToNextStep, updateFormData, data: info } = useFormSteps();
  const [cep, setCep] = useState("");

  const { data, isLoading, refetch } = useGetAdressByViaCep(cep);

  const onSubmit = (values: any) => {  
    updateFormData({
      person: {
        ...info.person,
        address: {
          ...values
        }
      },
    });
  
    goToNextStep();
  };  

  const handleBlurInputCep = () => {
    const cepValue = getValues("zipCode").replace(/\D/g, "");
    if (cepValue.length === 8) {
      setCep(cepValue);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (cep) {
        refetch();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [cep, refetch]);

  useEffect(() => {
    if (data && data.bairro && data.logradouro && data.localidade && data.uf) {
      setValue("neighborhood", data.bairro);
      setValue("addressLine", data.logradouro);
      setValue("city", data.localidade);
      setValue("state", data.uf);
    }
  }, [data, setValue]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6 w-full h-full justify-center p-8"
    >
      <div className="flex gap-4 w-full items-center justify-between mb-4">
        <ControllerInputMask
          mask="99999-999"
          control={control}
          name="zipCode"
          label="CEP"
          //autoFocus
          placeholder="Seu CEP"
          onBlur={handleBlurInputCep}
        />
        <ControllerTextInput
          control={control}
          name="addressLine"
          label="Rua"
          placeholder="Digite o nome da sua rua"
          rightIcon={
            isLoading && <SpinnerLoading size="SMALL" color="gray-300" />
          }
        />
      </div>

      <div className="flex gap-4 w-full items-center justify-between">
        <ControllerTextInput
          control={control}
          name="addressLineNumber"
          label="Nº da casa"
          placeholder="Digite o número da sua casa"
        />
        <ControllerTextInput
          control={control}
          name="neighborhood"
          label="Bairro"
          placeholder="Digite o nome do seu bairro"
          rightIcon={
            isLoading && <SpinnerLoading size="SMALL" color="gray-300" />
          }
        />
      </div>

      <div className="flex gap-4 w-full items-center justify-between">
        <ControllerTextInput
          control={control}
          name="city"
          label="Cidade"
          placeholder="Digite a cidade"
        />
        <ControllerTextInput
          control={control}
          name="state"
          label="Estado"
          placeholder="Digite o estado"
          rightIcon={
            isLoading && <SpinnerLoading size="SMALL" color="gray-300" />
          }
        />
      </div>

      <div className="flex justify-end items-end mt-10">
        <ButtonStepForm />
      </div>
    </form>
  );
};
