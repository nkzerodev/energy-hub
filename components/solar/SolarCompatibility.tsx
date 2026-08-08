"use client";

import { useEffect, useMemo, useState } from "react";

import {
  AlertTriangle,
  CheckCircle2,
  Search,
  Share2,
  XCircle,
} from "lucide-react";

import stations from "@/data/powerstations.json";

import {
  checkSolarCompatibility,
  SolarPanel,
} from "@/lib/solar";


type SolarField =
  | "power"
  | "voc"
  | "vmp"
  | "isc"
  | "imp";


export default function SolarCompatibility() {

  const [stationId, setStationId] =
    useState(stations[0]?.id ?? "");

  const [stationSearch, setStationSearch] =
    useState("");

  const [showResults, setShowResults] =
    useState(false);


  const [panel, setPanel] =
    useState<SolarPanel>({
      power: 550,
      voc: 49.77,
      vmp: 41.8,
      isc: 14.1,
      imp: 13.16,
    });


  /*
   * Indica qué campos fueron introducidos
   * manualmente por el usuario.
   *
   * Los demás pueden ser calculados.
   */

  const [calculationMode, setCalculationMode] =
    useState<"power" | "vmp" | "imp">("power");


  const station = stations.find(
    (item) => item.id === stationId
  );


  const filteredStations = useMemo(() => {

    const query =
      stationSearch.toLowerCase().trim();

    if (!query) {
      return stations.slice(0, 6);
    }

    return stations
      .filter((item) =>
        `${item.brand} ${item.model}`
          .toLowerCase()
          .includes(query)
      )
      .slice(0, 8);

  }, [stationSearch]);


  const result = useMemo(() => {

    if (!station) {
      return null;
    }

    return checkSolarCompatibility(
      panel,
      station.solarInput
    );

  }, [station, panel]);


  /*
   * Actualizar un campo manualmente.
   */

  function updateField(
  field: "power" | "voc" | "vmp" | "isc" | "imp",
  value: string
) {

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return;
  }

  setPanel((current) => {

    const next = {
      ...current,
      [field]: number,
    };


    /*
     * Pmax = Vmp × Imp
     */

    if (calculationMode === "power") {

      if (
        field === "vmp" ||
        field === "imp"
      ) {

        next.power = Number(
          (next.vmp * next.imp).toFixed(2)
        );

      }

    }


    /*
     * Vmp = Pmax / Imp
     */

    if (calculationMode === "vmp") {

      if (
        field === "power" ||
        field === "imp"
      ) {

        if (next.imp > 0) {

          next.vmp = Number(
            (next.power / next.imp).toFixed(2)
          );

        }

      }

    }


    /*
     * Imp = Pmax / Vmp
     */

    if (calculationMode === "imp") {

      if (
        field === "power" ||
        field === "vmp"
      ) {

        if (next.vmp > 0) {

          next.imp = Number(
            (next.power / next.vmp).toFixed(2)
          );

        }

      }

    }


    return next;

  });

  }


  function selectStation(id: string) {

    const selected =
      stations.find(
        (item) => item.id === id
      );

    if (!selected) return;

    setStationId(id);

    setStationSearch(
      `${selected.brand} ${selected.model}`
    );

    setShowResults(false);

  }


  const [shareState, setShareState] = useState<"idle" | "copied" | "shared">("idle");

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

      const nextMode = parsed?.calculationMode;
      if (nextMode === "power" || nextMode === "vmp" || nextMode === "imp") {
        setCalculationMode(nextMode);
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
      panel,
      calculationMode,
    };

    const params = new URLSearchParams(window.location.search);
    params.set("config", encodeURIComponent(JSON.stringify(payload)));

    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", nextUrl);
  }, [stationId, panel, calculationMode]);


  async function shareConfiguration() {
    if (typeof window === "undefined") {
      return;
    }

    const payload = {
      stationId,
      panel,
      calculationMode,
    };

    const params = new URLSearchParams();
    params.set("config", encodeURIComponent(JSON.stringify(payload)));

    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Compatibilidad solar",
          text: "Mira esta compatibilidad solar con Power Station",
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

        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">
              Datos del panel
            </h2>

            <p className="mt-1 text-sm leading-relaxed text-zinc-500">
              Introduce los valores que aparecen en la ficha
              técnica del panel. Energy Hub calculará
              automáticamente los valores relacionados cuando
              sea posible.
            </p>
          </div>

          <button
            onClick={shareConfiguration}
            className="
              flex
              shrink-0
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

          <label className="text-sm text-zinc-400">
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
                value={stationSearch}
                onChange={(event) => {

                  setStationSearch(
                    event.target.value
                  );

                  setShowResults(true);

                }}
                onFocus={() =>
                  setShowResults(true)
                }
                placeholder="Buscar Power Station..."
                className="
                  w-full
                  bg-transparent
                  outline-none
                  placeholder:text-zinc-600
                "
              />

            </div>


            {showResults && (

              <>

                <button
                  aria-label="Cerrar resultados"
                  onClick={() =>
                    setShowResults(false)
                  }
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
                  overflow-hidden
                  rounded-2xl
                  border
                  border-white/10
                  bg-zinc-950
                  shadow-2xl
                ">

                  {filteredStations.length > 0 ? (

                    filteredStations.map(
                      (item) => (

                        <button
                          key={item.id}
                          onClick={() =>
                            selectStation(item.id)
                          }
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
                            Solar:{" "}
                            {item.solarInput.maxPower}
                            W
                            {" · "}
                            {item.solarInput.voltageMin}
                            –
                            {item.solarInput.voltageMax}
                            V
                          </p>

                        </button>

                      )
                    )

                  ) : (

                    <div className="
                      p-5
                      text-sm
                      text-zinc-500
                    ">
                      No encontramos esa Power Station.
                    </div>

                  )}

                </div>

              </>

            )}

          </div>

        </div>


        {/* DATOS SOLARES */}
        
        <div className="mt-8">

        <label className="text-sm text-zinc-400">
            Calcular automáticamente
        </label>

        <div className="
            mt-2
            grid
            grid-cols-3
            gap-2
            rounded-2xl
            border
            border-white/10
            bg-black/20
            p-1
        ">

            <button
            onClick={() =>
                setCalculationMode("power")
            }
            className={`
                rounded-xl
                px-3
                py-3
                text-sm
                font-semibold
                transition
                ${
                calculationMode === "power"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }
            `}
            >
            Pmax
            </button>


            <button
            onClick={() =>
                setCalculationMode("vmp")
            }
            className={`
                rounded-xl
                px-3
                py-3
                text-sm
                font-semibold
                transition
                ${
                calculationMode === "vmp"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }
            `}
            >
            Vmp
            </button>


            <button
            onClick={() =>
                setCalculationMode("imp")
            }
            className={`
                rounded-xl
                px-3
                py-3
                text-sm
                font-semibold
                transition
                ${
                calculationMode === "imp"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }
            `}
            >
            Imp
            </button>

        </div>

        <p className="mt-2 text-xs text-zinc-600">
            Los otros dos valores relacionados se introducen
            manualmente.
        </p>

        </div>


        <div className="
          mt-8
          grid
          gap-4
          sm:grid-cols-2
        ">


          <SolarInput
            label="Potencia máxima"
            unit="W"
            value={panel.power}
            calculated={calculationMode === "power"}
            disabled={calculationMode === "power"}
            onChange={(value) =>
                updateField("power", value)
            }
          />


          <SolarInput
            label="Voc"
            unit="V"
            value={panel.voc}
            calculated={false}
            disabled={false}
            onChange={(value) =>
                updateField("voc", value)
            }
          />


          <SolarInput
            label="Vmp"
            unit="V"
            value={panel.vmp}
            calculated={calculationMode === "vmp"}
            disabled={calculationMode === "vmp"}
            onChange={(value) =>
                updateField("vmp", value)
            }
          />


          <SolarInput
            label="Isc"
            unit="A"
            value={panel.isc}
            calculated={false}
            disabled={false}
            onChange={(value) =>
                updateField("isc", value)
            }
          />


          <SolarInput
            label="Imp"
            unit="A"
            value={panel.imp}
            calculated={calculationMode === "imp"}
            disabled={calculationMode === "imp"}
            onChange={(value) =>
                updateField("imp", value)
            }
          />

        </div>


        {/* INFORMACIÓN */}

        <div className="
          mt-6
          rounded-2xl
          border
          border-white/5
          bg-black/20
          p-4
        ">

          <p className="
            text-xs
            font-semibold
            uppercase
            tracking-wider
            text-zinc-500
          ">
            Cálculo automático
          </p>

          <p className="
            mt-2
            text-sm
            leading-relaxed
            text-zinc-400
          ">
            La potencia se calcula mediante
            <span className="mx-1 font-semibold text-zinc-300">
              Pmax = Vmp × Imp
            </span>
            cuando esos valores están disponibles.
          </p>

          <p className="
            mt-2
            text-xs
            text-zinc-600
          ">
            Los valores calculados aparecen marcados
            como automáticos.
          </p>

        </div>

      </div>


      {/* RESULTADO */}

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

            <ResultIcon
              status={result.status}
            />


            <p className="
              mt-5
              text-sm
              text-zinc-500
            ">
              Resultado
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
                Power Station
              </p>

              <p className="
                mt-1
                font-semibold
              ">
                {station?.brand}{" "}
                {station?.model}
              </p>

            </div>

          </>

        )}

        <div className="
          mt-6
          flex
          items-center
          justify-between
        ">

          <button
            onClick={shareConfiguration}
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-blue-600
              px-4
              py-2
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-blue-700
            "
          >
            <Share2 size={18} />

            {shareState === "shared" && "Configuración compartida!"}
            {shareState === "copied" && "Enlace copiado!"}
            {shareState === "idle" && "Compartir configuración"}
          </button>

        </div>

      </div>

    </div>
  );
}


function SolarInput({
  label,
  unit,
  value,
  calculated,
  disabled,
  onChange,
}: {
  label: string;
  unit: string;
  value: number;
  calculated: boolean;
  disabled: boolean;
  onChange: (value: string) => void;
}) {

  return (

    <div>

      <div className="
        flex
        items-center
        justify-between
        gap-2
      ">

        <label className="text-sm text-zinc-400">
          {label}
        </label>


        {calculated && (

          <span className="
            rounded-full
            bg-blue-500/10
            px-2
            py-0.5
            text-[10px]
            font-semibold
            uppercase
            tracking-wider
            text-blue-400
          ">
            Auto
          </span>

        )}

      </div>


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
          disabled={disabled}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className={`
            w-full
            bg-transparent
            px-4
            py-3
            outline-none
            ${disabled ? "cursor-not-allowed text-blue-300" : ""}
            `}
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


function ResultIcon({
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