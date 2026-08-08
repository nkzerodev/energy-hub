export default function Header() {
  return (
    <header className="py-12 text-center">
      <div className="inline-flex items-center gap-3 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-400">
        ⚡ Energy Hub
      </div>

      <h1 className="mt-8 text-5xl font-extrabold tracking-tight">
        Encuentra la Power Station
        <br />
        perfecta para ti.
      </h1>

      <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
        Compara especificaciones, calcula autonomía, verifica compatibilidad
        con paneles solares y encuentra el mejor equipo para tus necesidades.
      </p>
    </header>
  );
}