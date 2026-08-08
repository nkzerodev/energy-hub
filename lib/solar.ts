export interface SolarPanel {
  name?: string;

  power: number;

  voc: number;
  vmp: number;

  isc: number;
  imp: number;
}

export type CompatibilityStatus =
  | "compatible"
  | "warning"
  | "limited"
  | "incompatible";

export interface SolarCheckResult {
  status: CompatibilityStatus;

  title: string;

  messages: string[];

  powerUtilization: number;
  voltageUtilization: number;
  currentUtilization: number;

  currentExcess: number;
  powerExcess: number;
}


interface SolarLimits {
  maxPower: number;
  voltageMin: number;
  voltageMax: number;
  currentMax: number;
  maxVoc?: number;
}


export function checkSolarCompatibility(
  panel: SolarPanel,
  limits: SolarLimits
): SolarCheckResult {

  const messages: string[] = [];

  let incompatible = false;
  let warning = false;
  let limited = false;


  /*
   * POTENCIA
   */

  const powerUtilization =
    panel.power / limits.maxPower;

  const powerExcess =
    Math.max(
      0,
      panel.power - limits.maxPower
    );


  if (panel.power > limits.maxPower) {

    warning = true;

    messages.push(
      `El panel tiene ${panel.power} W y la Power Station admite ${limits.maxPower} W de entrada solar. La potencia adicional no podrá ser aprovechada completamente.`
    );

  } else if (powerUtilization >= 0.9) {

    warning = true;

    messages.push(
      `El panel utiliza aproximadamente el ${Math.round(powerUtilization * 100)} % de la potencia solar máxima admitida.`
    );

  }


  /*
   * VMP
   */

  const voltageUtilization =
    panel.vmp / limits.voltageMax;


  if (
    panel.vmp < limits.voltageMin ||
    panel.vmp > limits.voltageMax
  ) {

    incompatible = true;

    messages.push(
      `El Vmp de ${panel.vmp} V está fuera del rango de entrada solar de ${limits.voltageMin}–${limits.voltageMax} V.`
    );

  } else if (
    panel.vmp >= limits.voltageMax * 0.9
  ) {

    warning = true;

    messages.push(
      `El Vmp está cerca del límite superior de ${limits.voltageMax} V.`
    );

  }


  /*
   * VOC
   *
   * Este límite sí es crítico.
   */

  if (
    limits.maxVoc !== undefined &&
    panel.voc > limits.maxVoc
  ) {

    incompatible = true;

    messages.push(
      `El Voc de ${panel.voc} V supera el máximo permitido de ${limits.maxVoc} V. No se recomienda conectar este panel.`
    );

  } else if (
    limits.maxVoc !== undefined &&
    panel.voc >= limits.maxVoc * 0.9
  ) {

    warning = true;

    messages.push(
      `El Voc está muy cerca del límite máximo de ${limits.maxVoc} V.`
    );

  }


  /*
   * CORRIENTE
   */

  const currentUtilization =
    panel.imp / limits.currentMax;

  const currentExcess =
    Math.max(
      0,
      panel.imp - limits.currentMax
    );


  if (
    panel.imp > limits.currentMax
  ) {

    limited = true;

    messages.push(
      `El panel puede entregar hasta ${panel.imp} A, mientras que la Power Station admite ${limits.currentMax} A. La entrada quedará limitada aproximadamente a ${limits.currentMax} A.`
    );

    messages.push(
      `Se desaprovecharían aproximadamente ${currentExcess.toFixed(2)} A de capacidad de corriente del panel.`
    );

  } else if (
    currentUtilization >= 0.9
  ) {

    warning = true;

    messages.push(
      `La corriente utiliza aproximadamente el ${Math.round(currentUtilization * 100)} % del límite de entrada.`
    );

  }


  /*
   * RESULTADO FINAL
   */

  if (incompatible) {

    return {
      status: "incompatible",
      title: "No compatible",
      messages,
      powerUtilization,
      voltageUtilization,
      currentUtilization,
      currentExcess,
      powerExcess,
    };

  }


  if (limited) {

    return {
      status: "limited",
      title: "Compatible con limitación",
      messages,
      powerUtilization,
      voltageUtilization,
      currentUtilization,
      currentExcess,
      powerExcess,
    };

  }


  if (warning) {

    return {
      status: "warning",
      title: "Compatible, pero cerca del límite",
      messages,
      powerUtilization,
      voltageUtilization,
      currentUtilization,
      currentExcess,
      powerExcess,
    };

  }


  messages.push(
    "Las especificaciones principales del panel están dentro de los límites de entrada solar."
  );


  return {
    status: "compatible",
    title: "Compatible",
    messages,
    powerUtilization,
    voltageUtilization,
    currentUtilization,
    currentExcess,
    powerExcess,
  };
}