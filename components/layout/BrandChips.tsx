"use client";

import { useEffect, useState } from "react";

import { fetchPowerStations } from "@/lib/powerStations";

interface Props {
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
}

export default function BrandChips({ selectedBrand, onSelectBrand }: Props) {
  const [brands, setBrands] = useState<string[]>(["Todas"]);

  useEffect(() => {
    let active = true;

    fetchPowerStations()
      .then((data) => {
        if (!active) return;
        setBrands(["Todas", ...Array.from(new Set(data.map((station) => station.brand)))]);
      })
      .catch(() => {
        if (active) setBrands(["Todas"]);
      });

    return () => {
      active = false;
    };
  }, []);
  return (
    <div className="mt-10 flex gap-3 overflow-x-auto pb-2">
      {brands.map((brand) => {
        const isActive = selectedBrand === brand;

        return (
          <button
            key={brand}
            onClick={() => onSelectBrand(brand)}
            className={`rounded-full border px-5 py-2 whitespace-nowrap transition ${
              isActive
                ? "border-blue-500/50 bg-blue-500/15 text-blue-400"
                : "border-white/10 bg-white/5 text-zinc-400 hover:border-blue-500 hover:bg-blue-500/10"
            }`}
          >
            {brand}
          </button>
        );
      })}
    </div>
  );
}