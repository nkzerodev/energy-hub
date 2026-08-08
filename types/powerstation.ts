export interface PowerStation {
  id: string;
  brand: string;
  model: string;
  description: string;
  image?: string;

  capacity: number;
  battery: string;
  cycles: number;

  inverter: number;
  surge: number;

  weight: number;

  rating: number;

  solarInput: {
    maxPower: number;
    voltageMin: number;
    voltageMax: number;
    currentMax: number;
    maxVoc?: number;
  };

  acOutput: {
    voltage: number;
    frequency: number;
    outlets: number;
  };

  dcOutput: {
    usbA: number;
    usbC: number;
    carPort: number;
  };

  charging: {
    acPower: number;
    acTime: number;
    solarTime: number;
  };

  features: {
    ups: boolean;
    app: boolean;
    wifi: boolean;
    bluetooth: boolean;
  };
}