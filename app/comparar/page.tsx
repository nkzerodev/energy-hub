"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, X, Check, Share2 } from "lucide-react";

import stations from "@/data/powerstations.json";

type Station = (typeof stations)[number];

export default function CompararPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    stations.slice(0, 2).map((station) => station.id)
  );

  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [shareState, setShareState] = useState<"idle" | "copied" | "shared">("idle");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const idsParam = params.get("ids");

    if (!idsParam) {
      return;
    }

    const parsedIds = idsParam
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    const validIds = parsedIds.filter((id) =>
      stations.some((station) => station.id === id)
    );

    if (validIds.length > 0) {
      setSelectedIds(validIds.slice(0, 4));
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);

    if (selectedIds.length > 0) {
      params.set("ids", selectedIds.join(","));
    } else {
      params.delete("ids");
    }

    const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.replaceState({}, "", nextUrl);
  }, [selectedIds]);

  const selectedStations = useMemo(() => {
    return selectedIds
      .map((id) => stations.find((station) => station.id === id))
      .filter(Boolean) as Station[];
  }, [selectedIds]);

  const filteredStations = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return stations;
    }

    return stations.filter((station) =>
      `${station.brand} ${station.model}`
        .toLowerCase()
        .includes(query)
    );
  }, [search]);

  function addStation(id: string) {
    if (selectedIds.includes(id)) {
      return;
    }

    if (selectedIds.length >= 4) {
      return;
    }

    setSelectedIds((current) => [...current, id]);
    setSearch("");
    setShowSearch(false);
  }

  function removeStation(id: string) {
    setSelectedIds((current) =>
      current.filter((stationId) => stationId !== id)
    );
  }

  async function shareComparison() {
    if (typeof window === "undefined") {
      return;
    }

    const url = `${window.location.origin}${window.location.pathname}?ids=${selectedIds.join(",")}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Comparación de Power Stations",
          text: "Mira esta comparación de Power Stations",
          url,
        });
        setShareState("shared");
      } else {
        await navigator.clipboard.writeText(url);
        setShareState("copied");
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setShareState("copied");
      } catch {
        setShareState("idle");
      }
    }

    window.setTimeout(() => setShareState("idle"), 1800);
  }

  return (
    <main className="min-h-screen px-6 pb-32 pt-10">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <header>
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            Energy Hub
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Comparar Power Stations
          </h1>

          <p className="mt-4 max-w-2xl text-zinc-400">
            Compara las especificaciones de varias estaciones
            de energía y descubre cuál se adapta mejor a tus
            necesidades.
          </p>
        </header>


        {/* SELECTOR */}

        <section className="mt-10">

          <div className="flex flex-wrap items-center justify-between gap-4">

            <div>
              <p className="text-sm font-semibold">
                Power Stations seleccionadas
              </p>

              <p className="mt-1 text-xs text-zinc-600">
                Máximo 4 estaciones
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={shareComparison}
                className="
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-white/10
                  bg-white/5
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  transition
                  hover:bg-white/10
                "
              >
                <Share2 size={17} />
                {shareState === "copied"
                  ? "Enlace copiado"
                  : shareState === "shared"
                    ? "Compartido"
                    : "Compartir comparación"}
              </button>

              <button
                onClick={() => setShowSearch((current) => !current)}
                disabled={selectedIds.length >= 4}
                className="
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-blue-600
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  transition
                  hover:bg-blue-500
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                <Plus size={17} />
                Añadir Power Station
              </button>
            </div>

          </div>


          {/* SEARCH */}

          {showSearch && (
            <div className="relative mt-4">

              <div className="
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-white/10
                bg-white/5
                px-4
                py-3
              ">

                <Search
                  size={19}
                  className="text-zinc-500"
                />

                <input
                  autoFocus
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Buscar EcoFlow, Bluetti, OUPES..."
                  className="
                    w-full
                    bg-transparent
                    outline-none
                    placeholder:text-zinc-600
                  "
                />

              </div>


              <div className="
                absolute
                left-0
                right-0
                top-full
                z-20
                mt-2
                max-h-80
                overflow-y-auto
                rounded-2xl
                border
                border-white/10
                bg-zinc-950
                shadow-2xl
              ">

                {filteredStations
                  .slice(0, 10)
                  .map((station) => {

                    const alreadySelected =
                      selectedIds.includes(station.id);

                    return (
                      <button
                        key={station.id}
                        disabled={alreadySelected}
                        onClick={() =>
                          addStation(station.id)
                        }
                        className="
                          flex
                          w-full
                          items-center
                          justify-between
                          px-4
                          py-4
                          text-left
                          transition
                          hover:bg-white/5
                          disabled:cursor-not-allowed
                          disabled:opacity-40
                        "
                      >

                        <div>
                          <p className="font-semibold">
                            {station.brand} {station.model}
                          </p>

                          <p className="
                            mt-1
                            text-xs
                            text-zinc-600
                          ">
                            Capacidad: {station.capacity} Wh
                          </p>
                        </div>


                        {alreadySelected && (
                          <Check
                            size={18}
                            className="text-blue-400"
                          />
                        )}

                      </button>
                    );

                  })}

              </div>

            </div>
          )}

        </section>


        {/* COMPARACIÓN */}

        <section className="mt-8">

          <div className="
            overflow-x-auto
            rounded-3xl
            border
            border-white/10
            bg-white/[0.03]
            backdrop-blur-xl
          ">

            <div className="min-w-[800px]">

              {/* HEADER DE TABLA */}

              <div
                className="grid border-b border-white/10"
                style={{
                  gridTemplateColumns:
                    `220px repeat(${selectedStations.length}, minmax(220px, 1fr))`,
                }}
              >

                <div className="
                  p-6
                  text-sm
                  font-semibold
                  text-zinc-500
                ">
                  Especificación
                </div>


                {selectedStations.map((station) => (

                  <div
                    key={station.id}
                    className="
                      border-l
                      border-white/10
                      p-6
                    "
                  >

                    <div className="
                      flex
                      items-start
                      justify-between
                      gap-3
                    ">

                      <div>

                        <p className="
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wider
                          text-blue-400
                        ">
                          {station.brand}
                        </p>

                        <h2 className="
                          mt-1
                          text-lg
                          font-bold
                        ">
                          {station.model}
                        </h2>

                      </div>


                      <button
                        onClick={() =>
                          removeStation(station.id)
                        }
                        className="
                          rounded-lg
                          p-1.5
                          text-zinc-600
                          transition
                          hover:bg-white/5
                          hover:text-zinc-300
                        "
                      >
                        <X size={17} />
                      </button>

                    </div>

                  </div>

                ))}

              </div>


              <ComparisonRow
                label="Capacidad"
                stations={selectedStations}
                getValue={(station) =>
                  `${station.capacity} Wh`
                }
                highlight="max"
              />


              <ComparisonRow
                label="Potencia solar máxima"
                stations={selectedStations}
                getValue={(station) =>
                  `${station.solarInput.maxPower} W`
                }
                highlight="max"
              />


              <ComparisonRow
                label="Voltaje solar"
                stations={selectedStations}
                getValue={(station) =>
                  `${station.solarInput.voltageMin}–${station.solarInput.voltageMax} V`
                }
              />


              <ComparisonRow
                label="Corriente solar máxima"
                stations={selectedStations}
                getValue={(station) =>
                  `${station.solarInput.currentMax} A`
                }
                highlight="max"
              />


              <ComparisonRow
                label="Entrada solar"
                stations={selectedStations}
                getValue={(station) =>
                  station.solarInput
                    ? "Disponible"
                    : "No disponible"
                }
              />

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}


function ComparisonRow({
  label,
  stations,
  getValue,
  highlight,
}: {
  label: string;
  stations: Station[];
  getValue: (station: Station) => string;
  highlight?: "max" | "min";
}) {

  const numericValues = stations.map((station) => {

    const value = getValue(station)
      .replace(/[^\d.]/g, "");

    return Number(value);

  });


  const target =
    highlight === "max"
      ? Math.max(...numericValues)
      : highlight === "min"
        ? Math.min(...numericValues)
        : null;


  return (
    <div
      className="
        grid
        border-b
        border-white/5
        last:border-b-0
      "
      style={{
        gridTemplateColumns:
          `220px repeat(${stations.length}, minmax(220px, 1fr))`,
      }}
    >

      <div className="
        flex
        items-center
        p-5
        text-sm
        text-zinc-500
      ">
        {label}
      </div>


      {stations.map((station) => {

        const value = getValue(station);

        const numeric = Number(
          value.replace(/[^\d.]/g, "")
        );

        const isWinner =
          highlight !== undefined &&
          numeric === target &&
          !Number.isNaN(numeric);


        return (
          <div
            key={station.id}
            className="
              flex
              items-center
              border-l
              border-white/5
              p-5
            "
          >

            <span className={`
              text-sm
              ${
                isWinner
                  ? "font-bold text-emerald-400"
                  : "text-zinc-300"
              }
            `}>
              {value}
            </span>


            {isWinner && (
              <span className="
                ml-2
                rounded-full
                bg-emerald-500/10
                px-2
                py-0.5
                text-[10px]
                font-semibold
                uppercase
                tracking-wider
                text-emerald-400
              ">
                Mejor
              </span>
            )}

          </div>
        );

      })}

    </div>
  );
}