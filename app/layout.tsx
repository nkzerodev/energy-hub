import "@fontsource/inter";
import "./globals.css";

import type { Metadata } from "next";

import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Energy Hub",
  description:
    "Compara Power Stations, calcula autonomía y verifica compatibilidad solar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <Navbar />

        <div className="pt-6 md:pt-24">
          {children}
        </div>
      </body>
    </html>
  );
}