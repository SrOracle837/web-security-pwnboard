"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/labs", label: "Labs" },
  { href: "/quiz", label: "Quiz" },
  { href: "/learn", label: "Learn" },
  { href: "/skill-tree", label: "Skill Tree" },
  { href: "/achievements", label: "Achievements" },
  { href: "/stats", label: "Stats" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="w-52 bg-surface border-r border-border min-h-screen p-5 flex flex-col gap-0.5 shrink-0">
      <div className="mb-8 px-3">
        <h1 className="text-foreground font-bold text-sm tracking-tight leading-snug">
          Web Security<br />
          <span className="text-accent">Pwnboard</span>
        </h1>
      </div>
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm px-3 py-2 rounded-lg transition-all duration-150 ${
              active
                ? "bg-accent text-white font-medium"
                : "text-muted hover:text-foreground"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
      <div className="mt-auto pt-6 px-3">
        <p className="text-[11px] text-muted/40">PortSwigger Labs</p>
      </div>
    </nav>
  );
}
