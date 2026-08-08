"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Database,
  Scale,
  Calculator,
  Heart,
  Sun,
} from "lucide-react";

const links = [
  {
    name: "Inicio",
    href: "/",
    icon: Home,
  },
  {
    name: "Catálogo",
    href: "/catalogo",
    icon: Database,
  },
  {
    name: "Comparar",
    href: "/comparar",
    icon: Scale,
  },
  {
    name: "Calcular",
    href: "/calculadoras",
    icon: Calculator,
  },
  {
    name: "Favoritos",
    href: "/favoritos",
    icon: Heart,
  },
  {
    name: "Solar",
    href: "/solar",
    icon: Sun,
  },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      className="
    fixed
    bottom-4
    left-1/2
    z-50
    flex
    -translate-x-1/2
    items-center
    gap-2
    rounded-3xl
    border
    border-white/10
    bg-black/60
    p-2
    backdrop-blur-xl

    md:bottom-auto
    md:top-6
  "
    >
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`
flex
h-12
w-12
items-center
justify-center
rounded-2xl
transition
md:w-auto
md:gap-2
md:px-4
${
  isActive
    ? "bg-blue-500/10 text-blue-400 ring-1 ring-blue-400/30"
    : "text-zinc-400 hover:bg-white/10 hover:text-white"
}
`}
          >
            <Icon size={20} className={isActive ? "fill-none stroke-current" : ""} />

            <span className={`hidden md:block ${isActive ? "font-semibold" : ""}`}>
              {link.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}