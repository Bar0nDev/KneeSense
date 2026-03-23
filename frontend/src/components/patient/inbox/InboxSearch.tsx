"use client";

import { HiOutlineSearch } from "react-icons/hi";

interface InboxSearchProps {
  value: string;
  onChange: (val: string) => void;
}

export default function InboxSearch({ value, onChange }: InboxSearchProps) {
  return (
    <div className="relative flex-1 w-full">
      <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input
        type="text"
        placeholder="Search your conversations..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#30C3B1]/20 focus:border-[#30C3B1] transition-all"
      />
    </div>
  );
}