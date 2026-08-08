import RuntimeCalculator from "@/components/calculator/RuntimeCalculator";

export default function Calculadoras() {
  return (
    <main className="min-h-screen px-6 pb-32 pt-10">

      <div className="mx-auto max-w-7xl">

        <header>

          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            Energy Hub
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Calculadora de autonomía
          </h1>

          <p className="mt-4 max-w-2xl text-zinc-400">
            Selecciona una Power Station, añade los dispositivos que
            quieres alimentar y calcula cuánto tiempo podría funcionar.
          </p>

        </header>

        <div className="mt-10">
          <RuntimeCalculator />
        </div>

      </div>

    </main>
  );
}