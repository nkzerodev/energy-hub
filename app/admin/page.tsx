"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import { fetchPowerStations, deletePowerStation, createPowerStation, updatePowerStation } from "@/lib/powerStations";
import type { PowerStation } from "@/types/powerstation";

const emptyForm = {
  id: "",
  brand: "",
  model: "",
  description: "",
  image: "",
  capacity: 0,
  battery: "",
  cycles: 0,
  inverter: 0,
  surge: 0,
  weight: 0,
  rating: 0,
  solarInput: {
    maxPower: 0,
    voltageMin: 0,
    voltageMax: 0,
    currentMax: 0,
    maxVoc: 0,
  },
  acOutput: {
    voltage: 0,
    frequency: 0,
    outlets: 0,
  },
  dcOutput: {
    usbA: 0,
    usbC: 0,
    carPort: 0,
  },
  charging: {
    acPower: 0,
    acTime: 0,
    solarTime: 0,
  },
  features: {
    ups: false,
    app: false,
    wifi: false,
    bluetooth: false,
  },
};

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rebuildLoading, setRebuildLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [stations, setStations] = useState<PowerStation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!supabase) return;

    void supabase.auth.getSession().then(({ data }) => setLoggedIn(Boolean(data.session)));

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(Boolean(session));
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    void loadStations();
  }, [loggedIn]);

  async function loadStations() {
    try {
      const data = await fetchPowerStations();
      setStations(data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudieron cargar las estaciones";
      setError(message);
    }
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setError("Añade tus variables de entorno de Supabase antes de entrar al panel.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        throw authError;
      }

      setLoggedIn(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setLoggedIn(false);
    setSelectedId(null);
    setForm(emptyForm);
  }

  function handleFormChange<K extends keyof typeof emptyForm>(field: K, value: (typeof emptyForm)[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleNestedFormChange<T extends "solarInput" | "acOutput" | "dcOutput" | "charging" | "features", K extends keyof (typeof emptyForm)[T]>(
    group: T,
    field: K,
    value: (typeof emptyForm)[T][K]
  ) {
    setForm((current) => ({
      ...current,
      [group]: {
        ...(current[group] as Record<string, unknown>),
        [field]: value,
      },
    }));
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setError("Falta la configuración de Supabase.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const payload: Partial<PowerStation> = {
        id: form.id.trim(),
        brand: form.brand.trim(),
        model: form.model.trim(),
        description: form.description.trim(),
        image: form.image.trim() || undefined,
        capacity: Number(form.capacity),
        battery: form.battery.trim(),
        cycles: Number(form.cycles),
        inverter: Number(form.inverter),
        surge: Number(form.surge),
        weight: Number(form.weight),
        rating: Number(form.rating),
        solarInput: {
          maxPower: Number(form.solarInput.maxPower),
          voltageMin: Number(form.solarInput.voltageMin),
          voltageMax: Number(form.solarInput.voltageMax),
          currentMax: Number(form.solarInput.currentMax),
          maxVoc: Number(form.solarInput.maxVoc),
        },
        acOutput: {
          voltage: Number(form.acOutput.voltage),
          frequency: Number(form.acOutput.frequency),
          outlets: Number(form.acOutput.outlets),
        },
        dcOutput: {
          usbA: Number(form.dcOutput.usbA),
          usbC: Number(form.dcOutput.usbC),
          carPort: Number(form.dcOutput.carPort),
        },
        charging: {
          acPower: Number(form.charging.acPower),
          acTime: Number(form.charging.acTime),
          solarTime: Number(form.charging.solarTime),
        },
        features: {
          ups: Boolean(form.features.ups),
          app: Boolean(form.features.app),
          wifi: Boolean(form.features.wifi),
          bluetooth: Boolean(form.features.bluetooth),
        },
      };

      if (!payload.id || !payload.brand || !payload.model) {
        throw new Error("Faltan id, marca o modelo.");
      }

      if (selectedId) {
        await updatePowerStation(selectedId, payload);
        setSuccess("Power Station actualizada correctamente.");
      } else {
        await createPowerStation(payload);
        setSuccess("Power Station creada correctamente.");
      }

      setSelectedId(null);
      setForm(emptyForm);
      await loadStations();
      void triggerRebuild();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la Power Station");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      setError(null);
      await deletePowerStation(id);
      setSuccess("Power Station eliminada.");
      if (selectedId === id) {
        setSelectedId(null);
        setForm(emptyForm);
      }
      await loadStations();
      void triggerRebuild();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo borrar la Power Station");
    }
  }

  async function triggerRebuild() {
    if (!supabase) return;

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;

      await fetch("/api/rebuild", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (e) {
      // ignore rebuild errors in UI
    }
  }

  function startEdit(station: PowerStation) {
    setSelectedId(station.id);
    setForm({
      id: station.id,
      brand: station.brand,
      model: station.model,
      description: station.description,
      image: station.image ?? "",
      capacity: station.capacity,
      battery: station.battery,
      cycles: station.cycles,
      inverter: station.inverter,
      surge: station.surge,
      weight: station.weight,
      rating: station.rating,
      solarInput: {
        maxPower: station.solarInput.maxPower,
        voltageMin: station.solarInput.voltageMin,
        voltageMax: station.solarInput.voltageMax,
        currentMax: station.solarInput.currentMax,
        maxVoc: station.solarInput.maxVoc ?? 0,
      },
      acOutput: {
        voltage: station.acOutput.voltage,
        frequency: station.acOutput.frequency,
        outlets: station.acOutput.outlets,
      },
      dcOutput: {
        usbA: station.dcOutput.usbA,
        usbC: station.dcOutput.usbC,
        carPort: station.dcOutput.carPort,
      },
      charging: {
        acPower: station.charging.acPower,
        acTime: station.charging.acTime,
        solarTime: station.charging.solarTime,
      },
      features: {
        ups: station.features.ups,
        app: station.features.app,
        wifi: station.features.wifi,
        bluetooth: station.features.bluetooth,
      },
    });
  }

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-10">
      <h1 className="text-3xl font-black">Panel admin</h1>
      <p className="mt-2 text-zinc-400">Gestiona las Power Stations desde Supabase.</p>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          {success}
        </div>
      )}

      {!loggedIn ? (
        <form onSubmit={handleLogin} className="mt-8 max-w-md space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div>
            <label className="mb-2 block text-sm text-zinc-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              placeholder="admin@tuweb.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-60">
            {loading ? "Entrando..." : "Entrar al panel"}
          </button>
        </form>
      ) : (
        <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Power Stations</h2>
              <div className="flex gap-2">
                <button onClick={() => void loadStations()} className="rounded-xl border border-white/10 px-3 py-2 text-sm hover:bg-white/5">Recargar</button>
                <button onClick={async () => { setRebuildLoading(true); await triggerRebuild(); setRebuildLoading(false); }} className="rounded-xl border border-white/10 px-3 py-2 text-sm hover:bg-white/5">{rebuildLoading ? "Rebuilding..." : "Rebuild"}</button>
                <button onClick={handleLogout} className="rounded-xl border border-white/10 px-3 py-2 text-sm hover:bg-white/5">Cerrar sesión</button>
              </div>
            </div>

            <div className="space-y-3">
              {stations.length === 0 ? (
                <p className="text-sm text-zinc-500">Todavía no hay Power Stations.</p>
              ) : (
                stations.map((station) => (
                  <div key={station.id} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <div>
                      <p className="font-semibold">{station.brand} {station.model}</p>
                      <p className="text-sm text-zinc-400">{station.capacity} Wh</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(station)} className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5">Editar</button>
                      <button onClick={() => void handleDelete(station.id)} className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200 hover:bg-red-500/20">Borrar</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">{selectedId ? "Editar" : "Crear"} Power Station</h2>
              <button onClick={() => { setSelectedId(null); setForm(emptyForm); }} className="rounded-xl border border-white/10 px-3 py-2 text-sm hover:bg-white/5">Nuevo</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-400">ID interno</label>
                  <input value={form.id} onChange={(event) => handleFormChange("id", event.target.value)} placeholder="Ej: bluetti-ac180" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-400">Marca</label>
                  <input value={form.brand} onChange={(event) => handleFormChange("brand", event.target.value)} placeholder="Ej: Bluetti" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-400">Modelo</label>
                  <input value={form.model} onChange={(event) => handleFormChange("model", event.target.value)} placeholder="Ej: AC180" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-400">URL de imagen</label>
                  <input value={form.image} onChange={(event) => handleFormChange("image", event.target.value)} placeholder="Ej: https://.../ac180.png" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-400">Descripción</label>
                <textarea value={form.description} onChange={(event) => handleFormChange("description", event.target.value)} placeholder="Describe la estación, su uso principal, ventajas y público objetivo." className="min-h-24 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-400">Capacidad (Wh)</label>
                  <input type="number" value={form.capacity} onChange={(event) => handleFormChange("capacity", Number(event.target.value))} placeholder="1440" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-400">Batería</label>
                  <input value={form.battery} onChange={(event) => handleFormChange("battery", event.target.value)} placeholder="Ej: 1.152Wh / 4.8V" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-400">Ciclos</label>
                  <input type="number" value={form.cycles} onChange={(event) => handleFormChange("cycles", Number(event.target.value))} placeholder="3000" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-400">Potencia del inversor (W)</label>
                  <input type="number" value={form.inverter} onChange={(event) => handleFormChange("inverter", Number(event.target.value))} placeholder="1800" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-400">Pico de salida (W)</label>
                  <input type="number" value={form.surge} onChange={(event) => handleFormChange("surge", Number(event.target.value))} placeholder="2700" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-400">Peso (kg)</label>
                  <input type="number" value={form.weight} onChange={(event) => handleFormChange("weight", Number(event.target.value))} placeholder="16.5" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-400">Rating / valoración</label>
                  <input type="number" value={form.rating} onChange={(event) => handleFormChange("rating", Number(event.target.value))} placeholder="4.8" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none" />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="mb-3 font-semibold">Entrada solar</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-zinc-400">Potencia máx. solar (W)</label>
                    <input type="number" value={form.solarInput.maxPower} onChange={(event) => handleNestedFormChange("solarInput", "maxPower", Number(event.target.value))} placeholder="500" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-zinc-400">Voltaje mínimo (V)</label>
                    <input type="number" value={form.solarInput.voltageMin} onChange={(event) => handleNestedFormChange("solarInput", "voltageMin", Number(event.target.value))} placeholder="12" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-zinc-400">Voltaje máximo (V)</label>
                    <input type="number" value={form.solarInput.voltageMax} onChange={(event) => handleNestedFormChange("solarInput", "voltageMax", Number(event.target.value))} placeholder="60" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-zinc-400">Corriente máx. (A)</label>
                    <input type="number" value={form.solarInput.currentMax} onChange={(event) => handleNestedFormChange("solarInput", "currentMax", Number(event.target.value))} placeholder="13" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-zinc-400">VOC máximo (V)</label>
                    <input type="number" value={form.solarInput.maxVoc} onChange={(event) => handleNestedFormChange("solarInput", "maxVoc", Number(event.target.value))} placeholder="145" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-zinc-400">AC voltage</label>
                  <input type="number" value={form.acOutput.voltage} onChange={(event) => handleNestedFormChange("acOutput", "voltage", Number(event.target.value))} placeholder="230" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-zinc-400">AC frequency</label>
                  <input type="number" value={form.acOutput.frequency} onChange={(event) => handleNestedFormChange("acOutput", "frequency", Number(event.target.value))} placeholder="50" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-zinc-400">Salidas AC</label>
                  <input type="number" value={form.acOutput.outlets} onChange={(event) => handleNestedFormChange("acOutput", "outlets", Number(event.target.value))} placeholder="4" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-zinc-400">USB-A</label>
                  <input type="number" value={form.dcOutput.usbA} onChange={(event) => handleNestedFormChange("dcOutput", "usbA", Number(event.target.value))} placeholder="2" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-zinc-400">USB-C</label>
                  <input type="number" value={form.dcOutput.usbC} onChange={(event) => handleNestedFormChange("dcOutput", "usbC", Number(event.target.value))} placeholder="2" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-zinc-400">Car port</label>
                  <input type="number" value={form.dcOutput.carPort} onChange={(event) => handleNestedFormChange("dcOutput", "carPort", Number(event.target.value))} placeholder="1" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-zinc-400">Carga AC (W)</label>
                  <input type="number" value={form.charging.acPower} onChange={(event) => handleNestedFormChange("charging", "acPower", Number(event.target.value))} placeholder="1440" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-zinc-400">Tiempo AC (h)</label>
                  <input type="number" value={form.charging.acTime} onChange={(event) => handleNestedFormChange("charging", "acTime", Number(event.target.value))} placeholder="1.2" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-zinc-400">Tiempo solar (h)</label>
                  <input type="number" value={form.charging.solarTime} onChange={(event) => handleNestedFormChange("charging", "solarTime", Number(event.target.value))} placeholder="2.5" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none" />
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">Funciones</p>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2"><input type="checkbox" checked={form.features.ups} onChange={(event) => handleNestedFormChange("features", "ups", event.target.checked)} /> UPS</label>
                  <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2"><input type="checkbox" checked={form.features.app} onChange={(event) => handleNestedFormChange("features", "app", event.target.checked)} /> App</label>
                  <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2"><input type="checkbox" checked={form.features.wifi} onChange={(event) => handleNestedFormChange("features", "wifi", event.target.checked)} /> WiFi</label>
                  <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2"><input type="checkbox" checked={form.features.bluetooth} onChange={(event) => handleNestedFormChange("features", "bluetooth", event.target.checked)} /> Bluetooth</label>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-60">
                {loading ? "Guardando..." : selectedId ? "Guardar cambios" : "Crear Power Station"}
              </button>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
