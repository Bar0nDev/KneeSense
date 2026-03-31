import { InputHTMLAttributes, SelectHTMLAttributes } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string; // New prop
}

export function Field({ label, type, placeholder, error, className = "", ...props }: FieldProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-xs font-medium text-[#455858]">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        {...props}
        className={`w-full rounded-xl border ${
          error ? "border-red-500 bg-red-50/30" : "border-[#C7C7C7] bg-[#f0fafa]"
        } px-4 py-2.5 text-sm outline-none transition-all placeholder:text-[#455858]/50 focus:border-[#30C3B1] focus:ring-2 focus:ring-[#30C3B1]/20 ${className}`}
      />
      {error && <p className="mt-1 text-[10px] font-medium text-red-500 animate-pulse">{error}</p>}
    </div>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: string[];
  placeholder?: string;
  error?: string; 
}

export function SelectField({ label, placeholder, options, error, className = "", ...props }: SelectFieldProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-xs font-medium text-[#455858]">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          {...props}
          className={`w-full appearance-none rounded-xl border ${
            error ? "border-red-500 bg-red-50/30" : "border-[#C7C7C7] bg-[#f0fafa]"
          } px-4 py-2.5 text-sm outline-none transition-all focus:border-[#30C3B1] focus:ring-2 focus:ring-[#30C3B1]/20 ${className}`}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#455858]/50">
          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
      {error && <p className="mt-1 text-[10px] font-medium text-red-500">{error}</p>}
    </div>
  );
}