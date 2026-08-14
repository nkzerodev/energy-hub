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

// NOTE:
// `dynamicParams: true` cannot be used with `output: "export"` (static export).
// Static exports pre-render routes returned by `generateStaticParams` at build time.
// New stations added after deployment will not have a generated page until
// the site is rebuilt and redeployed. If you need runtime-generated pages,
// consider deploying to a platform that supports Next.js server rendering
// (or remove `output: "export"` in `next.config.ts`).

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