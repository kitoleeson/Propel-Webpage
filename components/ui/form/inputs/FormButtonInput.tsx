"use client";

type Props = {
  label: string;
  onClick: () => void;
  format?: string;
  error?: string;
  divFormat?: string;
};

export default function FormPhoneInput({ label, onClick, format, error, divFormat }: Props) {
   return (
      <div className={`flex flex-col gap-1 flex-1 ${divFormat}`}>
         <button type='button' onClick={onClick} className={`self-start border border-gray-300 rounded-md py-1 px-3 hover:bg-stone-100 ${format}`}>{label}</button>
         {error && (
            <p className="text-red-500">{error}</p>
         )}
      </div>
   );
}