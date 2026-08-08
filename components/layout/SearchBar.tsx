"use client";

import { Search } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: Props) {
  return (
    <div className="mx-auto mt-10 max-w-3xl">
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl">
        <Search className="text-zinc-500" size={22} />

        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Buscar Bluetti, EcoFlow, AC180..."
          className="w-full bg-transparent text-white placeholder:text-zinc-500 outline-none"
        />
      </div>
    </div>
  );
}