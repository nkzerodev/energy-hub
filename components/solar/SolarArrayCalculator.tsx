"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Minus,
  Search,
  Share2,
} from "lucide-react";

import stations from "@/data/powerstations.json";

import {
  checkSolarCompatibility,
  SolarPanel,
} from "@/lib/solar";


type ConnectionMode = "series" | "parallel";


export default function SolarArrayCalculator() {

  const [stationId, setStationId] =
    useState(stations[0]?.id ?? "");
  
  const [stationSearch, setStationSearch] =
    useState("");

  const [showStations, setShowStations] =
    useState(false);

  const [connectionMode, setConnectionMode] =
    useState<ConnectionMode>("series");

  const [panelCount, setPanelCount] =
    useState(1);


  const [panel, setPanel] =
    useState<SolarPanel>({
      power: 550,
      voc: 49.77,
      vmp: 41.8,
      isc: 14.1,
      imp: 13.16,
    });


  const [shareState, setShareState] = useState<"idle" | "copied" | "shared">("idle");


  const station = stations.find(
    (item) => item.id === stationId
  );


  const array = useMemo(() => {

    const count = Math.max(
      1,
      panelCount
    );


    if (connectionMode === "series") {

      return {
        power: panel.power * count,

        voc: panel.voc * count,

        vmp: panel.vmp * count,

        isc: panel.isc,

        imp: panel.imp,
      };

    }


    return {
      power: panel.power * count,

      voc: panel.voc,

      vmp: panel.vmp,

      isc: panel.isc * count,

      imp: panel.imp * count,
    };

  }, [
    panel,
    panelCount,
    connectionMode,
  ]);


  const result = useMemo(() => {

    if (!station) {
      return null;
    }


    return checkSolarCompatibility(
      array,
      station.solarInput
    );

  }, [array, station]);


  function updatePanel(
    field: keyof SolarPanel,
    value: string
  ) {

    const number =
      Number(value);

    if (!Number.isFinite(number)) {
      return;
    }


    setPanel((current) => ({
      ...current,
      [field]: number,
    }));

  }


  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const config = params.get("config");

    if (!config) {
      return;
    }

    try {
      const parsed = JSON.parse(decodeURIComponent(config));

      if (typeof parsed?.stationId === "string") {
        const exists = stations.some((item) => item.id === parsed.stationId);
        if (exists) {
          setStationId(parsed.stationId);
        }
      }

      if (typeof parsed?.connectionMode === "string" && (parsed.connectionMode === "series" || parsed.connectionMode === "parallel")) {
        setConnectionMode(parsed.connectionMode);
      }

      const nextPanelCount = Number(parsed?.panelCount);
      if (Number.isFinite(nextPanelCount) && nextPanelCount > 0) {
        setPanelCount(Math.max(1, Math.floor(nextPanelCount)));
      }

      if (parsed?.panel && typeof parsed.panel === "object") {
        const nextPanel: SolarPanel = {
          power: Number(parsed.panel.power),
          voc: Number(parsed.panel.voc),
          vmp: Number(parsed.panel.vmp),
          isc: Number(parsed.panel.isc),
          imp: Number(parsed.panel.imp),
        };

        if (Object.values(nextPanel).every((value) => Number.isFinite(value))) {
          setPanel(nextPanel);
        }
      }
    } catch {
      // Ignore invalid config
    }
  }, []);


  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const payload = {
      stationId,
      connectionMode,
      panelCount,
      panel,
    };

    const params = new URLSearchParams(window.location.search);
    params.set("config", encodeURIComponent(JSON.stringify(payload)));

    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", nextUrl);
  }, [stationId, connectionMode, panelCount, panel]);


  async function shareConfiguration() {
    if (typeof window === "undefined") {
      return;
    }

    const payload = {
      stationId,
      connectionMode,
      panelCount,
      panel,
    };

    const params = new URLSearchParams();
    params.set("config", encodeURIComponent(JSON.stringify(payload)));

    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Configurador solar",
          text: "Mira esta configuración solar para Power Station",
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

    <div className="
      grid
      gap-6
      lg:grid-cols-[1fr_380px]
    ">


      {/* CONFIGURACIÓN */}

      <div className="
        rounded-3xl
        border
        border-white/10
        bg-white/5
        p-6
        backdrop-blur-xl
      ">

        <h2 className="text-xl font-bold">
          Configuración solar
        </h2>

        <p className="
          mt-1
          text-sm
          leading-relaxed
          text-zinc-500
        ">
          Calcula qué ocurre cuando conectas varios
          paneles solares entre sí.
        </p>

        <div className="mt-4 flex justify-end">
          <button
            onClick={shareConfiguration}
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
        </div>


        {/* POWER STATION */}

        <div className="mt-8">

          <label className="
            text-sm
            text-zinc-400
          ">
            Power Station
          </label>

          <div className="relative mt-2">

            <div className="
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-white/10
                bg-black/20
                px-4
                py-3
            ">

                <Search
                size={19}
                className="shrink-0 text-zinc-500"
                />

                <input
                value={
                    stationSearch ||
                    `${station?.brand ?? ""} ${station?.model ?? ""}`
                }
                onChange={(event) => {
                    setStationSearch(event.target.value);
                    setShowStations(true);
                }}
                onFocus={() => setShowStations(true)}
                placeholder="Buscar Power Station..."
                className="
                    w-full
                    bg-transparent
                    outline-none
                    placeholder:text-zinc-600
                "
                />

            </div>


            {showStations && (

                <>

                <button
                    aria-label="Cerrar búsqueda"
                    onClick={() => setShowStations(false)}
                    className="
                    fixed
                    inset-0
                    z-10
                    cursor-default
                    "
                />

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

                    {stations
                    .filter((item) => {

                        const query =
                        stationSearch
                            .toLowerCase()
                            .trim();

                        if (!query) return true;

                        return `${item.brand} ${item.model}`
                        .toLowerCase()
                        .includes(query);

                    })
                    .slice(0, 10)
                    .map((item) => (

                        <button
                        key={item.id}
                        onClick={() => {

                            setStationId(item.id);

                            setStationSearch(
                            `${item.brand} ${item.model}`
                            );

                            setShowStations(false);

                        }}
                        className="
                            w-full
                            px-4
                            py-4
                            text-left
                            transition
                            hover:bg-white/5
                        "
                        >

                        <p className="font-semibold">
                            {item.brand} {item.model}
                        </p>

                        <p className="
                            mt-1
                            text-sm
                            text-zinc-500
                        ">
                            Solar: {item.solarInput.maxPower} W
                            {" · "}
                            {item.solarInput.voltageMin}–
                            {item.solarInput.voltageMax} V
                        </p>

                        </button>

                    ))}

                </div>

                </>

            )}

          </div>

        </div>


        {/* CANTIDAD */}

        <div className="mt-8">

          <label className="
            text-sm
            text-zinc-400
          ">
            Cantidad de paneles
          </label>


          <div className="
            mt-2
            flex
            items-center
            justify-between
            rounded-2xl
            border
            border-white/10
            bg-black/20
            p-2
          ">

            <button
              onClick={() =>
                setPanelCount(
                  Math.max(
                    1,
                    panelCount - 1
                  )
                )
              }
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-white/5
                text-zinc-400
                transition
                hover:bg-white/10
                hover:text-white
              "
            >
              <Minus size={18} />
            </button>


            <div className="text-center">

              <p className="
                text-2xl
                font-black
              ">
                {panelCount}
              </p>

              <p className="
                text-xs
                text-zinc-600
              ">
                panel{panelCount !== 1 ? "es" : ""}
              </p>

            </div>


            <button
              onClick={() =>
                setPanelCount(
                  panelCount + 1
                )
              }
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-white/5
                text-zinc-400
                transition
                hover:bg-white/10
                hover:text-white
              "
            >
              <Plus size={18} />
            </button>

          </div>

        </div>


        {/* CONEXIÓN */}

        <div className="mt-8">

          <label className="
            text-sm
            text-zinc-400
          ">
            Conexión
          </label>


          <div className="
            mt-2
            grid
            grid-cols-2
            gap-2
            rounded-2xl
            border
            border-white/10
            bg-black/20
            p-1
          ">

            <button
              onClick={() =>
                setConnectionMode("series")
              }
              className={`
                rounded-xl
                px-4
                py-3
                text-sm
                font-semibold
                transition
                ${
                  connectionMode === "series"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }
              `}
            >
              Serie
            </button>


            <button
              onClick={() =>
                setConnectionMode("parallel")
              }
              className={`
                rounded-xl
                px-4
                py-3
                text-sm
                font-semibold
                transition
                ${
                  connectionMode === "parallel"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }
              `}
            >
              Paralelo
            </button>

          </div>

        </div>


        {/* DATOS DEL PANEL */}

        <div className="mt-8">

          <div className="
            flex
            items-center
            justify-between
          ">

            <h3 className="
              font-semibold
            ">
              Datos de un panel
            </h3>

            <span className="
              text-xs
              text-zinc-600
            ">
              Valores individuales
            </span>

          </div>


          <div className="
            mt-4
            grid
            gap-4
            sm:grid-cols-2
          ">

            <SolarField
              label="Pmax"
              unit="W"
              value={panel.power}
              onChange={(value) =>
                updatePanel(
                  "power",
                  value
                )
              }
            />


            <SolarField
              label="Voc"
              unit="V"
              value={panel.voc}
              onChange={(value) =>
                updatePanel(
                  "voc",
                  value
                )
              }
            />


            <SolarField
              label="Vmp"
              unit="V"
              value={panel.vmp}
              onChange={(value) =>
                updatePanel(
                  "vmp",
                  value
                )
              }
            />


            <SolarField
              label="Isc"
              unit="A"
              value={panel.isc}
              onChange={(value) =>
                updatePanel(
                  "isc",
                  value
                )
              }
            />


            <SolarField
              label="Imp"
              unit="A"
              value={panel.imp}
              onChange={(value) =>
                updatePanel(
                  "imp",
                  value
                )
              }
            />

          </div>

        </div>


        {/* RESULTADO DEL ARRAY */}

        <div className="
          mt-8
          rounded-2xl
          border
          border-blue-500/10
          bg-blue-500/5
          p-5
        ">

          <p className="
            text-xs
            font-semibold
            uppercase
            tracking-wider
            text-blue-400
          ">
            Resultado del conjunto
          </p>


          <div className="
            mt-4
            grid
            grid-cols-2
            gap-4
            sm:grid-cols-3
          ">

            <ArrayValue
              label="Potencia"
              value={`${array.power.toFixed(2)} W`}
            />

            <ArrayValue
              label="Voc"
              value={`${array.voc.toFixed(2)} V`}
            />

            <ArrayValue
              label="Vmp"
              value={`${array.vmp.toFixed(2)} V`}
            />

            <ArrayValue
              label="Isc"
              value={`${array.isc.toFixed(2)} A`}
            />

            <ArrayValue
              label="Imp"
              value={`${array.imp.toFixed(2)} A`}
            />

          </div>

        </div>

      </div>


      {/* COMPATIBILIDAD */}

      <div className="
        h-fit
        rounded-3xl
        border
        border-white/10
        bg-white/5
        p-6
        backdrop-blur-xl
        lg:sticky
        lg:top-24
      ">

        {!result ? (

          <p className="text-zinc-500">
            Selecciona una Power Station.
          </p>

        ) : (

          <>

            <StatusIcon
              status={result.status}
            />


            <p className="
              mt-5
              text-sm
              text-zinc-500
            ">
              Compatibilidad
            </p>


            <h2 className="
              mt-1
              text-3xl
              font-black
            ">
              {result.title}
            </h2>


            <div className="
              mt-6
              space-y-3
            ">

              {result.messages.map(
                (message, index) => (

                  <div
                    key={index}
                    className="
                      rounded-2xl
                      border
                      border-white/5
                      bg-black/20
                      p-4
                      text-sm
                      leading-relaxed
                      text-zinc-400
                    "
                  >
                    {message}
                  </div>

                )
              )}

            </div>


            <div className="
              mt-6
              border-t
              border-white/10
              pt-5
            ">

              <p className="
                text-sm
                text-zinc-500
              ">
                Configuración
              </p>

              <p className="
                mt-1
                font-semibold
              ">
                {panelCount} panel
                {panelCount !== 1 ? "es" : ""}
                {" · "}
                {connectionMode === "series"
                  ? "Serie"
                  : "Paralelo"}
              </p>

            </div>

          </>

        )}

      </div>

    </div>
  );
}


function SolarField({
  label,
  unit,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (value: string) => void;
}) {

  return (

    <div>

      <label className="
        text-sm
        text-zinc-400
      ">
        {label}
      </label>


      <div className="
        mt-2
        flex
        items-center
        rounded-xl
        border
        border-white/10
        bg-black/20
      ">

        <input
          type="number"
          step="any"
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className="
            w-full
            bg-transparent
            px-4
            py-3
            outline-none
          "
        />

        <span className="
          pr-4
          text-zinc-500
        ">
          {unit}
        </span>

      </div>

    </div>

  );
}


function ArrayValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {

  return (

    <div>

      <p className="
        text-xs
        text-zinc-600
      ">
        {label}
      </p>

      <p className="
        mt-1
        font-semibold
        text-zinc-200
      ">
        {value}
      </p>

    </div>

  );
}


function StatusIcon({
  status,
}: {
  status:
    | "compatible"
    | "warning"
    | "limited"
    | "incompatible";
}) {

  if (status === "compatible") {

    return (
      <div className="
        flex
        h-16
        w-16
        items-center
        justify-center
        rounded-2xl
        bg-emerald-500/10
        text-emerald-400
      ">
        <CheckCircle2 size={32} />
      </div>
    );

  }


  if (status === "limited") {

    return (
      <div className="
        flex
        h-16
        w-16
        items-center
        justify-center
        rounded-2xl
        bg-orange-500/10
        text-orange-400
      ">
        <AlertTriangle size={32} />
      </div>
    );

  }


  if (status === "warning") {

    return (
      <div className="
        flex
        h-16
        w-16
        items-center
        justify-center
        rounded-2xl
        bg-yellow-500/10
        text-yellow-400
      ">
        <AlertTriangle size={32} />
      </div>
    );

  }


  return (
    <div className="
      flex
      h-16
      w-16
      items-center
      justify-center
      rounded-2xl
      bg-red-500/10
      text-red-400
    ">
      <XCircle size={32} />
    </div>
  );
}