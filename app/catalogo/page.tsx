import Catalog from "@/components/catalog/Catalog";

export default function Catalogo() {
  return (
    <main className="min-h-screen px-6 pb-32 pt-10">

      <div className="mx-auto max-w-7xl">

        <header>
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            Energy Hub
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Catálogo
          </h1>

          <p className="mt-4 max-w-2xl text-zinc-400">
            Explora las Power Stations disponibles en nuestra base de datos.
          </p>
        </header>

        <div className="mt-10">
          <Catalog />
        </div>

      </div>

    </main>
  );
}