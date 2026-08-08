"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";

import PowerStationCard from "@/components/PowerStationCard";
import stations from "@/data/powerstations.json";
import { getFavoriteStationIds } from "@/lib/favorites";

export default function FavoritesPage() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    setFavoriteIds(getFavoriteStationIds());
  }, []);

  const favoriteStations = stations.filter((station) =>
    favoriteIds.includes(station.id)
  );

  return (
    <main className="min-h-screen px-6 pb-32 pt-10">
      <div className="mx-auto max-w-7xl">
        <header>
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            Energy Hub
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Favoritos
          </h1>

          <p className="mt-4 max-w-2xl text-zinc-400">
            Guarda las Power Stations que más te interesen y accede a ellas rápidamente.
          </p>
        </header>

        {favoriteStations.length > 0 ? (
          <section className="mt-10 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {favoriteStations.map((station) => (
              <PowerStationCard key={station.id} station={station} />
            ))}
          </section>
        ) : (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
              <Heart size={28} className="fill-current" />
            </div>

            <h2 className="mt-6 text-2xl font-bold">
              Aún no tienes Power Stations favoritas
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-zinc-400">
              Añade tus stations favoritas desde la vista detallada y aparecerán aquí para consultarlas después.
            </p>

            <Link
              href="/catalogo"
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500"
            >
              Explorar catálogo
              <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
