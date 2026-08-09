"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Minus,
  Plus,
  Search,
  Share2,
  Trash2,
  UserPlus,
  Zap,
} from "lucide-react";

import { defaultDevices } from "@/data/devices";
import { fetchPowerStations } from "@/lib/powerStations";
import type { PowerStation } from "@/types/powerstation";

import {
  calculateRuntime,
  Device,
} from "@/lib/calculations";

function buildDeviceId(name: string, fallbackIndex: number) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `custom-${slug || `device-${fallbackIndex + 1}`}`;
}

export default function RuntimeCalculator() {
  const [stations, setStations] = useState<PowerStation[]>([]);

  const [stationId, setStationId] = useState("");

  const [stationSearch, setStationSearch] = useState("");

  const [showStationResults, setShowStationResults] =
    useState(false);

  const [devices, setDevices] = useState<Device[]>([]);

  const [showCustomDevice, setShowCustomDevice] =
    useState(false);

  const [batteryStart, setBatteryStart] =
    useState(100);

  const [batteryEnd, setBatteryEnd] =
    useState(10);

  const [customOutput, setCustomOutput] =
    useState<"AC" | "DC">("AC");

  const [customName, setCustomName] = useState("");

  const [customWatts, setCustomWatts] = useState("");

  const [shareState, setShareState] = useState<"idle" | "copied" | "shared">("idle");

  useEffect(() => {
    let active = true;

    fetchPowerStations()
      .then((data) => {
        if (!active) return;
        setStations(data);

        if (data.length > 0) {
          setStationId((current) => current || data[0].id);
          setStationSearch((current) => current || `${data[0].brand} ${data[0].model}`);
        }

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
            const exists = data.some((item) => item.id === parsed.stationId);
            if (exists) {
              setStationId(parsed.stationId);
              const selected = data.find((item) => item.id === parsed.stationId);
              if (selected) {
                setStationSearch(`${selected.brand} ${selected.model}`);
              }
            }
          }

      const nextBatteryStart = Number(parsed?.batteryStart);
      if (Number.isFinite(nextBatteryStart)) {
        setBatteryStart(Math.min(100, Math.max(1, nextBatteryStart)));
      }

      const nextBatteryEnd = Number(parsed?.batteryEnd);
      if (Number.isFinite(nextBatteryEnd)) {
        setBatteryEnd(Math.min(99, Math.max(0, nextBatteryEnd)));
      }

          const parsedDevices = Array.isArray(parsed?.devices) ? parsed.devices : [];
          const restoredDevices = parsedDevices
            .map((item: Partial<Device> & { outputType?: "AC" | "DC" }, index: number) => {
              const watts = Number(item.watts);
              const quantity = Math.max(1, Number(item.quantity) || 1);

              if (!Number.isFinite(watts) || watts <= 0) {
                return null;
              }

              const defaultDevice = defaultDevices.find((device) => device.id === item.id);

              if (defaultDevice) {
                return {
                  ...defaultDevice,
                  quantity,
                  outputType: item.outputType ?? defaultDevice.outputType ?? "AC",
                } as Device;
              }

              return {
                id: buildDeviceId(String(item.name || `Dispositivo ${index + 1}`), index),
                name: String(item.name || `Dispositivo ${index + 1}`),
                watts,
                quantity,
                outputType: item.outputType ?? "AC",
              } as Device;
            })
            .filter(Boolean) as Device[];

          if (restoredDevices.length > 0) {
            setDevices(restoredDevices);
          }
        } catch {
          // Ignore invalid config
        }
      })
      .catch(() => {
        if (active) setStations([]);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const payload = {
      stationId,
      batteryStart,
      batteryEnd,
      devices: devices.map((device) => ({
        id: device.id,
        name: device.name,
        watts: device.watts,
        quantity: device.quantity,
        outputType: device.outputType ?? "AC",
      })),
    };

    const params = new URLSearchParams(window.location.search);
    params.set("config", encodeURIComponent(JSON.stringify(payload)));

    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", nextUrl);
  }, [stationId, devices, batteryStart, batteryEnd]);


  const station = stations.find(
    (item) => item.id === stationId
  );


  const selectedStationName = station
    ? `${station.brand} ${station.model}`
    : "";


  const filteredStations = useMemo(() => {

    const query = stationSearch
      .toLowerCase()
      .trim();

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

    return calculateRuntime(
      station.capacity,
      devices,
      batteryStart,
      batteryEnd
    );

  }, [station, devices, batteryStart, batteryEnd]);


  function selectStation(id: string) {

    setStationId(id);

    const selected = stations.find(
      (item) => item.id === id
    );

    if (selected) {
      setStationSearch(
        `${selected.brand} ${selected.model}`
      );
    }

    setShowStationResults(false);
  }


  function addDevice(device: Device) {

    setDevices((current) => {

      const existing = current.find(
        (item) => item.id === device.id
      );

      if (existing) {

        return current.map((item) =>
          item.id === device.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );

      }

      return [
        ...current,
        {
          ...device,
          quantity: 1,
        },
      ];

    });

  }


  function changeQuantity(
    id: string,
    amount: number
  ) {

    setDevices((current) =>
      current
        .map((device) =>
          device.id === id
            ? {
                ...device,
                quantity: Math.max(
                  0,
                  device.quantity + amount
                ),
              }
            : device
        )
        .filter(
          (device) => device.quantity > 0
        )
    );

  }


  function removeDevice(id: string) {

    setDevices((current) =>
      current.filter(
        (device) => device.id !== id
      )
    );

  }


  function addCustomDevice() {

    const name = customName.trim();
    const watts = Number(customWatts);

    if (!name || !Number.isFinite(watts) || watts <= 0) {
      return;
    }

    const customDevice: Device = {
      id: buildDeviceId(name, devices.length),
      name,
      watts,
      quantity: 1,
      outputType: customOutput,
    };

    setDevices((current) => [
      ...current,
      customDevice,
    ]);

    setCustomName("");
    setCustomWatts("");
    setShowCustomDevice(false);

  }

  async function shareConfiguration() {
    if (typeof window === "undefined") {
      return;
    }

    const payload = {
      stationId,
      batteryStart,
      batteryEnd,
      devices: devices.map((device) => ({
        id: device.id,
        name: device.name,
        watts: device.watts,
        quantity: device.quantity,
        outputType: device.outputType ?? "AC",
      })),
    };

    const params = new URLSearchParams();
    params.set("config", encodeURIComponent(JSON.stringify(payload)));

    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Calculadora de autonomía",
          text: "Mira esta configuración de autonomía de Power Station",
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

    <div className="space-y-6">

      <div className="flex justify-end">
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
              : "Compartir cálculo"}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">


      {/* CONTENIDO PRINCIPAL */}

      <div className="
        rounded-3xl
        border
        border-white/10
        bg-white/5
        p-6
        backdrop-blur-xl
      ">


        {/* POWER STATION */}

        <div>

          <p className="text-sm text-zinc-500">
            Power Station
          </p>


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
                size={20}
                className="shrink-0 text-zinc-500"
              />


              <input
                type="text"
                value={stationSearch}
                onChange={(event) => {
                  setStationSearch(event.target.value);
                  setShowStationResults(true);
                }}
                onFocus={() =>
                  setShowStationResults(true)
                }
                placeholder="Buscar Power Station..."
                className="
                  w-full
                  bg-transparent
                  outline-none
                  placeholder:text-zinc-500
                "
              />


              {station && (
                <Check
                  size={20}
                  className="shrink-0 text-emerald-400"
                />
              )}

            </div>


            {showStationResults && (

              <>

                <button
                  aria-label="Cerrar resultados"
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() =>
                    setShowStationResults(false)
                  }
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

                    filteredStations.map((item) => (

                      <button
                        key={item.id}
                        onClick={() =>
                          selectStation(item.id)
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
                        "
                      >

                        <div>

                          <p className="font-semibold">
                            {item.brand} {item.model}
                          </p>

                          <p className="mt-1 text-sm text-zinc-500">
                            {item.capacity} Wh · {item.inverter} W
                          </p>

                        </div>


                        {item.id === stationId && (
                          <Check
                            size={18}
                            className="text-blue-400"
                          />
                        )}

                      </button>

                    ))

                  ) : (

                    <div className="p-5 text-sm text-zinc-500">
                      No encontramos esa Power Station.
                    </div>

                  )}

                </div>

              </>

            )}

          </div>


          {station && (

            <div className="
              mt-3
              flex
              items-center
              gap-2
              text-sm
              text-zinc-500
            ">

              <span className="text-emerald-400">
                ●
              </span>

              Seleccionada:

              <strong className="text-zinc-300">
                {selectedStationName}
              </strong>

            </div>

          )}

        </div>


        {/* DISPOSITIVOS */}

        <div className="mt-10">

          <div className="
            flex
            items-center
            justify-between
            gap-4
          ">

            <h2 className="text-xl font-bold">
              Añadir dispositivos
            </h2>


            <button
              onClick={() =>
                setShowCustomDevice(
                  (value) => !value
                )
              }
              className="
                flex
                items-center
                gap-2
                rounded-xl
                border
                border-blue-500/30
                bg-blue-500/10
                px-3
                py-2
                text-sm
                font-medium
                text-blue-400
                transition
                hover:bg-blue-500/20
              "
            >

              <UserPlus size={17} />

              Personalizado

            </button>

          </div>

          {/* BATERÍA UTILIZABLE */}

        <div className="mt-8">

        <h2 className="text-xl font-bold">
            Batería utilizable
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
            Define desde qué porcentaje hasta qué porcentaje
            quieres utilizar la batería.
        </p>

        <div className="
            mt-4
            grid
            gap-4
            sm:grid-cols-2
        ">

            <div>

            <label className="text-sm text-zinc-400">
                Comenzar en
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
                min="1"
                max="100"
                value={batteryStart}
                onChange={(event) =>
                    setBatteryStart(
                    Math.min(
                        100,
                        Math.max(
                        1,
                        Number(event.target.value)
                        )
                    )
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

                <span className="pr-4 text-zinc-500">
                %
                </span>

            </div>

            </div>


            <div>

            <label className="text-sm text-zinc-400">
                Detener en
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
                min="0"
                max="99"
                value={batteryEnd}
                onChange={(event) =>
                    setBatteryEnd(
                    Math.min(
                        99,
                        Math.max(
                        0,
                        Number(event.target.value)
                        )
                    )
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

                <span className="pr-4 text-zinc-500">
                %
                </span>

            </div>

            </div>

        </div>

</div>

          {/* DISPOSITIVO PERSONALIZADO */}

          {showCustomDevice && (

            <div className="
              mt-4
              rounded-2xl
              border
              border-blue-500/20
              bg-blue-500/5
              p-4
            ">

              <p className="text-sm font-semibold">
                Añadir dispositivo personalizado
              </p>


              <div className="
                mt-3
                grid
                gap-3
                sm:grid-cols-[1fr_150px_auto]
              ">

                <input
                  value={customName}
                  onChange={(event) =>
                    setCustomName(event.target.value)
                  }
                  placeholder="Ej. Aire acondicionado"
                  className="
                    rounded-xl
                    border
                    border-white/10
                    bg-black/20
                    px-4
                    py-3
                    outline-none
                    placeholder:text-zinc-600
                    focus:border-blue-500/50
                  "
                />


                <div className="
                  relative
                  flex
                  items-center
                ">

                  <input
                    type="number"
                    min="1"
                    value={customWatts}
                    onChange={(event) =>
                      setCustomWatts(event.target.value)
                    }
                    placeholder="Consumo"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-white/10
                      bg-black/20
                      px-4
                      py-3
                      pr-12
                      outline-none
                      placeholder:text-zinc-600
                      focus:border-blue-500/50
                    "
                  />

                  <span className="
                    pointer-events-none
                    absolute
                    right-4
                    text-sm
                    text-zinc-500
                  ">
                    W
                  </span>

                </div>

                <select
                    value={customOutput}
                    onChange={(event) =>
                        setCustomOutput(
                        event.target.value as "AC" | "DC"
                        )
                    }
                    className="
                        rounded-xl
                        border
                        border-white/10
                        bg-black/20
                        px-4
                        py-3
                        outline-none
                    "
                    >
                    <option value="AC">
                        AC
                    </option>

                    <option value="DC">
                        DC
                    </option>
                </select>

                <button
                  onClick={addCustomDevice}
                  disabled={
                    !customName.trim() ||
                    !customWatts ||
                    Number(customWatts) <= 0
                  }
                  className="
                    rounded-xl
                    bg-blue-600
                    px-5
                    py-3
                    font-semibold
                    transition
                    hover:bg-blue-500
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  Añadir
                </button>

              </div>

            </div>

          )}


          {/* DISPOSITIVOS PREDEFINIDOS */}

          <div className="
            mt-4
            grid
            gap-3
            sm:grid-cols-2
          ">

            {defaultDevices.map((device) => (

              <button
                key={device.id}
                onClick={() =>
                  addDevice(device)
                }
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-black/20
                  p-4
                  text-left
                  transition
                  hover:border-blue-500/40
                  hover:bg-blue-500/5
                "
              >

                <p className="font-semibold">
                  {device.name}
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  {device.watts} W
                </p>

              </button>

            ))}

          </div>

        </div>


        {/* CONSUMO */}

        <div className="mt-10">

          <h2 className="text-xl font-bold">
            Tu consumo
          </h2>


          {devices.length === 0 ? (

            <div className="
              mt-4
              rounded-2xl
              border
              border-dashed
              border-white/10
              p-8
              text-center
            ">

              <Zap
                className="mx-auto text-zinc-700"
                size={28}
              />

              <p className="mt-3 text-zinc-500">
                Añade dispositivos para comenzar.
              </p>

            </div>

          ) : (

            <div className="mt-4 space-y-3">

              {devices.map((device) => (

                <div
                  key={device.id}
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                    rounded-2xl
                    border
                    border-white/10
                    bg-black/20
                    p-4
                  "
                >

                  <div className="min-w-0">

                    <p className="truncate font-medium">
                      {device.name}
                    </p>

                    <p className="text-sm text-zinc-500">
                    {device.watts} W × {device.quantity}

                    <span className="mx-2 text-zinc-700">
                        •
                    </span>

                    {device.outputType ?? "AC"}
                    </p>

                  </div>


                  <div className="
                    flex
                    shrink-0
                    items-center
                    gap-2
                  ">

                    <button
                      onClick={() =>
                        changeQuantity(
                          device.id,
                          -1
                        )
                      }
                      className="
                        rounded-xl
                        border
                        border-white/10
                        p-2
                        hover:bg-white/10
                      "
                    >
                      <Minus size={16} />
                    </button>


                    <span className="w-6 text-center">
                      {device.quantity}
                    </span>


                    <button
                      onClick={() =>
                        changeQuantity(
                          device.id,
                          1
                        )
                      }
                      className="
                        rounded-xl
                        border
                        border-white/10
                        p-2
                        hover:bg-white/10
                      "
                    >
                      <Plus size={16} />
                    </button>


                    <button
                      onClick={() =>
                        removeDevice(device.id)
                      }
                      className="
                        ml-2
                        rounded-xl
                        p-2
                        text-red-400
                        hover:bg-red-500/10
                      "
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>


      {/* RESULTADO */}

      <div className="
        h-fit
        rounded-3xl
        border
        border-blue-500/20
        bg-blue-500/5
        p-6
        backdrop-blur-xl
        lg:sticky
        lg:top-24
      ">

        <div className="flex items-center gap-3">

          <div className="
            rounded-xl
            bg-blue-500/10
            p-3
            text-blue-400
          ">

            <Zap size={22} />

          </div>


          <div>

            <p className="text-sm text-zinc-500">
              Consumo total
            </p>

            <p className="text-2xl font-bold">
              {result?.totalLoad ?? 0} W
            </p>

          </div>

        </div>


        <div className="mt-8">

          <p className="text-sm text-zinc-500">
            Autonomía estimada
          </p>


          <p className="mt-2 text-5xl font-black">

            {result
              ? result.runtimeHours.toFixed(1)
              : "0.0"}

            <span className="
              ml-2
              text-xl
              font-medium
              text-zinc-500
            ">
              horas
            </span>

          </p>


          {result &&
            result.runtimeMinutes > 0 && (

              <p className="mt-2 text-sm text-zinc-500">

                Aproximadamente{" "}

                {Math.floor(
                  result.runtimeMinutes / 60
                )}

                h{" "}

                {result.runtimeMinutes % 60}

                min

              </p>

            )}

        </div>


        <div className="
          mt-8
          border-t
          border-white/10
          pt-5
        ">

          <p className="
            text-xs
            leading-relaxed
            text-zinc-500
          ">
            Estimación basada inicialmente en un
            85 % de eficiencia de conversión.
            El tiempo real puede variar según
            el consumo y las pérdidas del sistema.
          </p>

        </div>

      </div>

    </div>

    </div>
  );
}