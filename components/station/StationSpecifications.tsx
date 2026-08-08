import {
  BatteryCharging,
  Zap,
  Sun,
  Plug,
  Usb,
  Clock,
  ShieldCheck,
  Smartphone,
  Wifi,
  Bluetooth,
} from "lucide-react";

import { PowerStation } from "@/types/powerstation";

interface Props {
  station: PowerStation;
}

export default function StationSpecifications({ station }: Props) {
  return (
    <section className="mt-8">

      <h2 className="text-3xl font-bold">
        Especificaciones
      </h2>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">

        <SpecificationGroup title="Batería">

          <Spec
            icon={<BatteryCharging />}
            label="Capacidad"
            value={`${station.capacity} Wh`}
          />

          <Spec
            icon={<BatteryCharging />}
            label="Tipo"
            value={station.battery}
          />

          <Spec
            icon={<ShieldCheck />}
            label="Ciclos"
            value={`≈ ${station.cycles}`}
          />

        </SpecificationGroup>


        <SpecificationGroup title="Salida AC">

          <Spec
            icon={<Zap />}
            label="Potencia continua"
            value={`${station.inverter} W`}
          />

          <Spec
            icon={<Zap />}
            label="Potencia pico"
            value={`${station.surge} W`}
          />

          <Spec
            icon={<Plug />}
            label="Tomacorrientes"
            value={`${station.acOutput.outlets}`}
          />

          <Spec
            icon={<Zap />}
            label="Salida"
            value={`${station.acOutput.voltage} V / ${station.acOutput.frequency} Hz`}
          />

        </SpecificationGroup>


        <SpecificationGroup title="Entrada solar">

          <Spec
            icon={<Sun />}
            label="Potencia máxima"
            value={`${station.solarInput.maxPower} W`}
          />

          <Spec
            icon={<Zap />}
            label="Voltaje"
            value={`${station.solarInput.voltageMin}–${station.solarInput.voltageMax} V`}
          />

          <Spec
            icon={<Zap />}
            label="Corriente máxima"
            value={`${station.solarInput.currentMax} A`}
          />

        </SpecificationGroup>


        <SpecificationGroup title="Carga">

          <Spec
            icon={<Zap />}
            label="Potencia AC"
            value={`${station.charging.acPower} W`}
          />

          <Spec
            icon={<Clock />}
            label="Tiempo AC"
            value={`≈ ${station.charging.acTime} h`}
          />

          <Spec
            icon={<Sun />}
            label="Tiempo solar"
            value={`≈ ${station.charging.solarTime} h`}
          />

        </SpecificationGroup>


        <SpecificationGroup title="Puertos">

          <Spec
            icon={<Usb />}
            label="USB-A"
            value={`${station.dcOutput.usbA}`}
          />

          <Spec
            icon={<Usb />}
            label="USB-C"
            value={`${station.dcOutput.usbC}`}
          />

          <Spec
            icon={<Plug />}
            label="Puerto de coche"
            value={`${station.dcOutput.carPort}`}
          />

        </SpecificationGroup>


        <SpecificationGroup title="Funciones">

          <Feature
            icon={<ShieldCheck />}
            label="UPS"
            enabled={station.features.ups}
          />

          <Feature
            icon={<Smartphone />}
            label="Aplicación móvil"
            enabled={station.features.app}
          />

          <Feature
            icon={<Wifi />}
            label="Wi-Fi"
            enabled={station.features.wifi}
          />

          <Feature
            icon={<Bluetooth />}
            label="Bluetooth"
            enabled={station.features.bluetooth}
          />

        </SpecificationGroup>

      </div>

    </section>
  );
}


function SpecificationGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">

      <h3 className="text-xl font-semibold">
        {title}
      </h3>

      <div className="mt-5 divide-y divide-white/5">
        {children}
      </div>

    </div>
  );
}


function Spec({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">

      <div className="flex items-center gap-3">

        <div className="text-blue-400">
          {icon}
        </div>

        <span className="text-zinc-400">
          {label}
        </span>

      </div>

      <strong className="text-right">
        {value}
      </strong>

    </div>
  );
}


function Feature({
  icon,
  label,
  enabled,
}: {
  icon: React.ReactNode;
  label: string;
  enabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-4">

      <div className="flex items-center gap-3">

        <div className="text-blue-400">
          {icon}
        </div>

        <span className="text-zinc-400">
          {label}
        </span>

      </div>

      <span
        className={
          enabled
            ? "font-semibold text-emerald-400"
            : "font-semibold text-red-400"
        }
      >
        {enabled ? "Sí" : "No"}
      </span>

    </div>
  );
}