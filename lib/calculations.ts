export type OutputType = "AC" | "DC";

export interface Device {
  id: string;
  name: string;
  watts: number;
  quantity: number;
  outputType?: OutputType;
}

export interface RuntimeResult {
  totalLoad: number;
  usableEnergy: number;
  runtimeHours: number;
  runtimeMinutes: number;
}

export function calculateRuntime(
  capacityWh: number,
  devices: Device[],
  batteryStart = 100,
  batteryEnd = 10,
  acEfficiency = 0.85,
  dcEfficiency = 0.92
): RuntimeResult {

  const totalLoad = devices.reduce(
    (total, device) =>
      total + device.watts * device.quantity,
    0
  );

  if (totalLoad <= 0 || capacityWh <= 0) {
    return {
      totalLoad: 0,
      usableEnergy: 0,
      runtimeHours: 0,
      runtimeMinutes: 0,
    };
  }

  const usableBatteryPercentage =
    Math.max(0, batteryStart - batteryEnd) / 100;

  const batteryEnergy =
    capacityWh * usableBatteryPercentage;

  const acLoad = devices
    .filter(
      (device) =>
        !device.outputType ||
        device.outputType === "AC"
    )
    .reduce(
      (total, device) =>
        total + device.watts * device.quantity,
      0
    );

  const dcLoad = devices
    .filter(
      (device) =>
        device.outputType === "DC"
    )
    .reduce(
      (total, device) =>
        total + device.watts * device.quantity,
      0
    );

  const acEnergy =
    acLoad > 0
      ? acLoad / acEfficiency
      : 0;

  const dcEnergy =
    dcLoad > 0
      ? dcLoad / dcEfficiency
      : 0;

  const effectiveLoad = acEnergy + dcEnergy;

  const runtimeHours =
    effectiveLoad > 0
      ? batteryEnergy / effectiveLoad
      : 0;

  const runtimeMinutes = Math.round(
    runtimeHours * 60
  );

  return {
    totalLoad,
    usableEnergy: batteryEnergy,
    runtimeHours,
    runtimeMinutes,
  };
}