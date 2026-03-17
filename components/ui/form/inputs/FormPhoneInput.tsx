"use client";
import { UseFormRegisterReturn } from "react-hook-form";

type Props = {
  label: string;
  register: UseFormRegisterReturn;
  error?: string;
  placeholder?: string;
};

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);

  const area = digits.slice(0, 3);
  const middle = digits.slice(3, 6);
  const last = digits.slice(6, 10);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${area}) ${middle}`;
  return `(${area}) ${middle}-${last}`;
}

export default function FormPhoneInput({ label, register, error, placeholder }: Props) {
   return (
      <div className="flex flex-col gap-1 flex-1">
         <label>{label}</label>

         <input
            type="tel"
            inputMode="numeric"
            {...register}
            onChange={(e) => {
               const formatted = formatPhone(e.target.value);
               e.target.value = formatted;
               register.onChange(e);
            }}
            className={"border border-gray-300 rounded-md p-1 "}
            placeholder={placeholder || "(123) 456-7890"}
         />

         {error && (
            <p className="text-red-500">{error}</p>
         )}
      </div>
   );
}