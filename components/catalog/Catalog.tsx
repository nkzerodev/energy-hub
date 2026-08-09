"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import PowerStationCard from "@/components/PowerStationCard";
import { fetchPowerStations } from "@/lib/powerStations";
import type { PowerStation } from "@/types/powerstation";

export default function Catalog() {
  const [stations, setStations] = useState<PowerStation[]>([]);
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("Todas");

  useEffect(() => {
    let active = true;

    fetchPowerStations()
      .then((data) => {
        if (active) setStations(data);
      })
      .catch(() => {
        if (active) setStations([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const brands = [
    "Todas",
    ...Array.from(new Set(stations.map((station) => station.brand))),
  ];

  const filteredStations = useMemo(() => {
    const query = search.toLowerCase().trim();

    return stations.filter((station) => {
      const matchesBrand = brand === "Todas" || station.brand === brand;
      const matchesSearch =
        query === "" ||
        `${station.brand} ${station.model} ${station.capacity} ${station.inverter} ${station.battery}`
          .toLowerCase()
          .includes(query);

      return matchesBrand && matchesSearch;
    });
  }, [search, brand, stations]);


  return (
    <div>

      <div className="
        flex
        flex-col
        gap-4
        lg:flex-row
      ">

        <div className="
          flex
          flex-1
          items-center
          gap-3
          rounded-2xl
          border
          border-white/10
          bg-white/5
          px-5
          py-4
          backdrop-blur-xl
        ">

          <Search
            size={20}
            className="text-zinc-500"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Buscar modelo, marca, capacidad..."
            className="
              w-full
              bg-transparent
              outline-none
              placeholder:text-zinc-500
            "
          />

        </div>


        <div className="
          flex
          items-center
          gap-2
          rounded-2xl
          border
          border-white/10
          bg-white/5
          px-4
        ">

          <SlidersHorizontal
            size={18}
            className="text-zinc-500"
          />

          <select
            value={brand}
            onChange={(event) =>
              setBrand(event.target.value)
            }
            className="
              bg-transparent
              py-4
              outline-none
            "
          >

            {brands.map((item) => (
              <option
                key={item}
                value={item}
                className="bg-zinc-900"
              >
                {item}
              </option>
            ))}

          </select>

        </div>

      </div>


      <div className="
        mt-10
        flex
        items-center
        justify-between
      ">

        <p className="text-sm text-zinc-500">
          {filteredStations.length}{" "}
          {filteredStations.length === 1
            ? "Power Station"
            : "Power Stations"}
        </p>

      </div>


      {filteredStations.length > 0 ? (

        <section className="
          mt-5
          grid
          gap-6
          sm:grid-cols-2
          xl:grid-cols-3
        ">

          {filteredStations.map((station) => (

            <PowerStationCard
              key={station.id}
              station={station}
            />

          ))}

        </section>

      ) : (

        <div className="
          mt-5
          rounded-3xl
          border
          border-white/10
          bg-white/5
          p-12
          text-center
        ">

          <p className="text-xl font-semibold">
            No encontramos ninguna Power Station.
          </p>

          <p className="mt-2 text-zinc-500">
            Prueba con otro modelo, marca o capacidad.
          </p>

        </div>

      )}

    </div>
  );
}