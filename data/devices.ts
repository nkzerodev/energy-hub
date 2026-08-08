import { Device } from "@/lib/calculations";

export const defaultDevices: Device[] = [
  {
    id: "tv",
    name: "Televisor",
    watts: 100,
    quantity: 1,
    outputType: "AC",
  },

  {
    id: "fan",
    name: "Ventilador",
    watts: 60,
    quantity: 1,
    outputType: "AC",
  },

  {
    id: "router",
    name: "Router Wi-Fi",
    watts: 15,
    quantity: 1,
    outputType: "DC",
  },

  {
    id: "laptop",
    name: "Laptop",
    watts: 65,
    quantity: 1,
    outputType: "AC",
  },

  {
    id: "pc",
    name: "PC de escritorio",
    watts: 300,
    quantity: 1,
    outputType: "AC",
  },

  {
    id: "phone",
    name: "Cargador de teléfono",
    watts: 15,
    quantity: 1,
    outputType: "DC",
  },

  {
    id: "led",
    name: "Bombilla LED",
    watts: 10,
    quantity: 1,
    outputType: "AC",
  },

  {
    id: "refrigerator",
    name: "Refrigerador",
    watts: 150,
    quantity: 1,
    outputType: "AC",
  },
];