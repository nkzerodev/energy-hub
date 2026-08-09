import { notFound } from "next/navigation";

import StationHero from "@/components/station/StationHero";
import StationSpecifications from "@/components/station/StationSpecifications";
import { fetchPowerStations } from "@/lib/powerStations";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function generateStaticParams() {
  const stations = await fetchPowerStations();

  return stations.map((station) => ({
    id: station.id,
  }));
}

export const dynamicParams = false;

export default async function StationPage({ params }: Props) {
  const { id } = await params;
  const stations = await fetchPowerStations();
  const station = stations.find((item) => item.id === id);

  if (!station) {
    notFound();
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <StationHero station={station} />
        <StationSpecifications station={station} />
      </div>
    </main>
  );
}