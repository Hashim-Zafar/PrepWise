import { Controller } from "react-hook-form";
import { FieldValues, Path, Control } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  lable: string;
  placeholder?: string;
  type?: "text" | "email" | "password";
}
function FormField<T extends FieldValues>({
  control,
  name,
  lable,
  placeholder,
  type = "text",
}: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="lable">{lable}</FormLabel>
          <FormControl>
            <Input
              className="input"
              placeholder={placeholder}
              {...field}
              type={type}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default FormField;
