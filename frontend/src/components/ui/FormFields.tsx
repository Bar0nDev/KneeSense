// Shared reusable form primitives for register forms

export function Field({
  label,
  type,
  placeholder,
}: {
  label?: string;
  type: string;
  placeholder: string;
}) {
  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-semibold text-[#455858]">{label}</label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-[#C7C7C7] bg-[#f0fafa] px-4 py-3.5 text-sm outline-none transition-all placeholder:text-[#455858]/50 focus:border-[#30C3B1] focus:ring-2 focus:ring-[#30C3B1]/20"
      />
    </div>
  );
}

export function SelectField({
  label,
  placeholder,
  options,
}: {
  label?: string;
  placeholder?: string;
  options: string[];
}) {
  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">{label}</label>
      )}
      <select className="w-full appearance-none rounded-2xl border border-[#C7C7C7] bg-[#f0fafa]  px-4 py-3.5 text-sm  outline-none transition-all focus:border-[#30C3B1] focus:ring-2 focus:ring-[#30C3B1]/20">
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o} value={o.toLowerCase().replace(/\s+/g, "_")}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}