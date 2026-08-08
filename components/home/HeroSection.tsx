"use client";

import Link from "next/link";
import { ArrowRight, BatteryCharging, Calculator, Database, Scale, Sun } from "lucide-react";

const features = [
	{
		title: "Explora Power Stations",
		description:
			"Consulta modelos, capacidades, entrada solar y especificaciones clave en un solo lugar.",
		icon: Database,
		href: "/catalogo",
	},
	{
		title: "Compara opciones",
		description:
			"Mira varias estaciones lado a lado para elegir la mejor según tus necesidades.",
		icon: Scale,
		href: "/comparar",
	},
	{
		title: "Calcula autonomía",
		description:
			"Añade tus dispositivos y descubre cuánto tiempo podría durar una Power Station.",
		icon: Calculator,
		href: "/calculadoras",
	},
	{
		title: "Compatibilidad solar",
		description:
			"Comprueba si un panel solar encaja con la Power Station que tienes en mente.",
		icon: Sun,
		href: "/solar",
	},
];

const contactEmail = "neekisamezero+energy-hub@gmail.com";

const contactSubject = encodeURIComponent("Sugerencia para Energy Hub");
const contactBody = encodeURIComponent(
	"Hola,\n\nQuiero compartir una sugerencia o comentario sobre la web:\n\n"
);

export default function HeroSection() {
	return (
		<section className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
			<div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl sm:p-10">
				<p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
					Energy Hub
				</p>

				<h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
					Tu guía práctica para elegir la mejor Power Station
				</h1>

				<p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-400">
					Aquí puedes entender mejor cómo funcionan estas estaciones, comparar
					opciones reales y calcular cuánto durarían con los dispositivos que usas
					cada día.
				</p>

				<div className="mt-8 flex flex-wrap gap-3">
					<Link
						href="/catalogo"
						className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500"
					>
						Explorar catálogo
						<ArrowRight size={18} />
					</Link>

					<Link
						href="/calculadoras"
						className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-zinc-300 transition hover:bg-white/10"
					>
						Probar calculadora
					</Link>

					<a
						href={`mailto:${contactEmail}?subject=${contactSubject}&body=${contactBody}`}
						className="inline-flex items-center gap-2 rounded-2xl border border-blue-500/30 bg-blue-500/10 px-5 py-3 font-semibold text-blue-400 transition hover:bg-blue-500/20"
					>
						Enviar sugerencia
					</a>
				</div>
			</div>

			<div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-blue-500/10 via-white/5 to-transparent p-8 backdrop-blur-xl">
				<div className="flex items-center gap-3">
					<div className="rounded-2xl bg-blue-500/10 p-3 text-blue-400">
						<BatteryCharging size={24} />
					</div>
					<div>
						<p className="text-sm font-semibold uppercase tracking-[0.25em] text-zinc-500">
							¿Para qué sirve?
						</p>
						<h2 className="text-2xl font-bold text-white">
							Planifica mejor tu energía
						</h2>
					</div>
				</div>

				<div className="mt-8 space-y-4">
					{features.map((feature) => {
						const Icon = feature.icon;

						return (
							<Link
								key={feature.title}
								href={feature.href}
								className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-blue-500/40 hover:bg-blue-500/10"
							>
								<div className="rounded-xl bg-blue-500/10 p-2 text-blue-400">
									<Icon size={18} />
								</div>
								<div>
									<p className="font-semibold text-white">{feature.title}</p>
									<p className="mt-1 text-sm leading-6 text-zinc-400">
										{feature.description}
									</p>
								</div>
							</Link>
						);
					})}
				</div>
			</div>

			<div className="mt-8 rounded-2xl bg-white/5 p-6 text-center">
				<p className="text-sm text-zinc-400">
					¿Tienes sugerencias o comentarios?
				</p>
				<Link
					href={`mailto:${contactEmail}?subject=${contactSubject}&body=${contactBody}`}
					className="mt-2 inline-block rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
				>
					Contáctanos
				</Link>
			</div>
		</section>
	);
}
