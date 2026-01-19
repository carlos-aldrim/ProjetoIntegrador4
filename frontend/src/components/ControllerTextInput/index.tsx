import { Control, Controller } from "react-hook-form";
import { TextInput } from "../TextInput";
import { TextInputProps } from "../TextInput";

type ControllerTextInputProps = {
  control: Control<any, object>;
  name: string;
  rules?: any;
} & Omit<TextInputProps, "value">;

export const ControllerTextInput: React.FC<ControllerTextInputProps> = ({
  control,
  name,
  rules,
  ...rest
}) => {
  return (
    <>
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field, fieldState: { error } }) => {
          return (
            <div className="relative w-full">
              <TextInput {...field} {...rest} error={error?.message} />
              {error && (
                <div className="flex w-full items-center justify-end absolute mb-10">
                  <span className="text-red-600">{error.message}</span>
                </div>
              )}
            </div>
          );
        }}
      />
    </>
  );
};
