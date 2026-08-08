"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  BatteryCharging,
  Heart,
  Share2,
  Sun,
  Zap,
  Weight,
  Star
} from "lucide-react";

import { PowerStation } from "@/types/powerstation";
import { isFavoriteStation, toggleFavoriteStation } from "@/lib/favorites";


interface Props {
  station: PowerStation;
}


export default function StationHero({ station }: Props) {

  const [shareState, setShareState] = useState<"idle" | "copied" | "shared">("idle");
  const [isFavorite, setIsFavorite] = useState(false);


  useEffect(() => {

    setIsFavorite(isFavoriteStation(station.id));

  }, [station.id]);


  async function shareStation() {
    if (typeof window === "undefined") {
      return;
    }

    const url = `${window.location.origin}${window.location.pathname}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${station.brand} ${station.model}`,
          text: `Mira esta Power Station: ${station.brand} ${station.model}`,
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


  function toggleFavorite() {
    const nextState = toggleFavoriteStation(station.id);
    setIsFavorite(nextState);
  }


  return (

    <section className="
      overflow-hidden
      rounded-3xl
      border
      border-white/10
      bg-white/5
      p-8
      backdrop-blur-xl
    ">

      <div className="flex flex-col gap-8 md:flex-row">

        <div className="
          flex
          h-72
          w-full
          items-center
          justify-center
          rounded-3xl
          bg-gradient-to-br
          from-zinc-900
          to-black
          md:w-1/3
        ">

          <Image
            src={station.image ?? "/images/powerstations/placeholder.svg"}
            alt={`${station.brand} ${station.model}`}
            width={800}
            height={520}
            className="h-full w-full object-cover rounded-3xl"
          />

        </div>


        <div className="flex-1">


          <p className="text-blue-400">
            {station.brand}
          </p>


          <h1 className="
            mt-2
            text-5xl
            font-black
          ">
            {station.model}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={shareStation}
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
                  : "Compartir"}
            </button>

            <button
              onClick={toggleFavorite}
              className={`
                flex
                items-center
                justify-center
                rounded-xl
                border
                px-4
                py-2.5
                transition
                ${
                  isFavorite
                    ? "border-red-500/30 bg-red-500/10 text-red-400"
                    : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10"
                }
              `}
              aria-label={isFavorite ? "Eliminar de favoritos" : "Añadir a favoritos"}
            >
              <Heart size={18} className={isFavorite ? "fill-current" : ""} />
            </button>
          </div>


          <p className="
            mt-5
            text-zinc-400
          ">
            {station.description}
          </p>


          <div className="
            mt-6
            flex
            items-center
            gap-2
            text-yellow-400
          ">

            <Star fill="currentColor"/>

            <span className="font-bold">
              {station.rating}/10
            </span>

          </div>


        </div>

      </div>



      <div className="
        mt-10
        grid
        gap-4
        sm:grid-cols-2
        lg:grid-cols-4
      ">


        <Spec
          icon={<BatteryCharging/>}
          title="Capacidad"
          value={`${station.capacity} Wh`}
        />


        <Spec
          icon={<Zap/>}
          title="Inversor"
          value={`${station.inverter} W`}
        />


        <Spec
          icon={<Sun/>}
          title="Solar"
          value={`${station.solarInput.maxPower} W`}
        />


        <Spec
          icon={<Weight/>}
          title="Peso"
          value={`${station.weight} kg`}
        />


      </div>


      <div className="
        mt-8
        flex
        items-center
        justify-between
        border-t
        border-white/10
        pt-8
      ">


        <div className="flex items-center gap-3">


          <button
            onClick={shareStation}
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              bg-black/20
              text-zinc-400
              transition
              hover:bg-black/30
            "
            aria-label="Compartir estación"
          >


            {shareState === "copied" ? (

              <div className="flex items-center gap-1">

                <span className="text-sm font-medium">
                  Enlace copiado
                </span>

              </div>

            ) : (

              <Share2 className="h-5 w-5"/>

            )}

          </button>


        </div>


      </div>


    </section>

  );

}



function Spec({
  icon,
  title,
  value
}:{
  icon:React.ReactNode;
  title:string;
  value:string;
}) {


return (

<div className="
rounded-2xl
border
border-white/10
bg-black/20
p-5
">


<div className="text-blue-400">

{icon}

</div>


<p className="mt-3 text-sm text-zinc-500">
{title}
</p>


<p className="mt-1 text-xl font-bold">
{value}
</p>


</div>

);

}