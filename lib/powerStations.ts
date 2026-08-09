import { assertSupabaseClient } from "@/lib/supabase";
import type { PowerStation } from "@/types/powerstation";

export type PowerStationRow = {
  id: string;
  brand: string;
  model: string;
  description?: string | null;
  image?: string | null;
  capacity?: number | null;
  battery?: string | null;
  cycles?: number | null;
  inverter?: number | null;
  surge?: number | null;
  weight?: number | null;
  rating?: number | null;
  solar_input?: Record<string, number | string | boolean | null> | null;
  ac_output?: Record<string, number | string | boolean | null> | null;
  dc_output?: Record<string, number | string | boolean | null> | null;
  charging?: Record<string, number | string | boolean | null> | null;
  features?: Record<string, boolean | number | string | null> | null;
  created_at?: string | null;
  updated_at?: string | null;
};

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizePowerStation(row: PowerStationRow): PowerStation {
  const solarInput = (row.solar_input ?? {}) as Record<string, unknown>;
  const acOutput = (row.ac_output ?? {}) as Record<string, unknown>;
  const dcOutput = (row.dc_output ?? {}) as Record<string, unknown>;
  const charging = (row.charging ?? {}) as Record<string, unknown>;
  const features = (row.features ?? {}) as Record<string, unknown>;

  return {
    id: row.id,
    brand: row.brand,
    model: row.model,
    description: row.description ?? "",
    image: row.image ?? undefined,
    capacity: toNumber(row.capacity),
    battery: row.battery ?? "",
    cycles: toNumber(row.cycles),
    inverter: toNumber(row.inverter),
    surge: toNumber(row.surge),
    weight: toNumber(row.weight),
    rating: toNumber(row.rating),
    solarInput: {
      maxPower: toNumber(solarInput.maxPower),
      voltageMin: toNumber(solarInput.voltageMin),
      voltageMax: toNumber(solarInput.voltageMax),
      currentMax: toNumber(solarInput.currentMax),
      maxVoc: toNumber(solarInput.maxVoc, 0),
    },
    acOutput: {
      voltage: toNumber(acOutput.voltage),
      frequency: toNumber(acOutput.frequency),
      outlets: toNumber(acOutput.outlets),
    },
    dcOutput: {
      usbA: toNumber(dcOutput.usbA),
      usbC: toNumber(dcOutput.usbC),
      carPort: toNumber(dcOutput.carPort),
    },
    charging: {
      acPower: toNumber(charging.acPower),
      acTime: toNumber(charging.acTime),
      solarTime: toNumber(charging.solarTime),
    },
    features: {
      ups: Boolean(features.ups),
      app: Boolean(features.app),
      wifi: Boolean(features.wifi),
      bluetooth: Boolean(features.bluetooth),
    },
  };
}

export async function fetchPowerStations(): Promise<PowerStation[]> {
  const client = assertSupabaseClient();

  const { data, error } = await client
    .from("power_stations")
    .select("*")
    .order("brand", { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as PowerStationRow[]).map(normalizePowerStation);
}

export async function getPowerStations() {
  return fetchPowerStations();
}

export async function createPowerStation(input: Partial<PowerStation>) {
  const client = assertSupabaseClient();

  const row = {
    id: input.id ?? "",
    brand: input.brand ?? "",
    model: input.model ?? "",
    description: input.description ?? "",
    image: input.image ?? null,
    capacity: input.capacity ?? null,
    battery: input.battery ?? null,
    cycles: input.cycles ?? null,
    inverter: input.inverter ?? null,
    surge: input.surge ?? null,
    weight: input.weight ?? null,
    rating: input.rating ?? null,
    solar_input: input.solarInput ?? {},
    ac_output: input.acOutput ?? {},
    dc_output: input.dcOutput ?? {},
    charging: input.charging ?? {},
    features: input.features ?? {},
  };

  const { data, error } = await client
    .from("power_stations")
    .insert(row)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return normalizePowerStation(data as PowerStationRow);
}

export async function updatePowerStation(id: string, updates: Partial<PowerStation>) {
  const client = assertSupabaseClient();

  const payload = {
    id,
    brand: updates.brand ?? undefined,
    model: updates.model ?? undefined,
    description: updates.description ?? undefined,
    image: updates.image ?? undefined,
    capacity: updates.capacity ?? undefined,
    battery: updates.battery ?? undefined,
    cycles: updates.cycles ?? undefined,
    inverter: updates.inverter ?? undefined,
    surge: updates.surge ?? undefined,
    weight: updates.weight ?? undefined,
    rating: updates.rating ?? undefined,
    solar_input: updates.solarInput ?? undefined,
    ac_output: updates.acOutput ?? undefined,
    dc_output: updates.dcOutput ?? undefined,
    charging: updates.charging ?? undefined,
    features: updates.features ?? undefined,
  };

  const { data, error } = await client
    .from("power_stations")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return normalizePowerStation(data as PowerStationRow);
}

export async function deletePowerStation(id: string) {
  const client = assertSupabaseClient();

  const { error } = await client.from("power_stations").delete().eq("id", id);

  if (error) {
    throw error;
  }
}
