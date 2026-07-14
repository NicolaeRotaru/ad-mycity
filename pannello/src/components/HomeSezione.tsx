"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

/** Sezione home pieghevole: header compatto + contenuto espandibile (nulla si perde). */
export default function HomeSezione({
  icon,
  titolo,
  riassunto,
  badge,
  defaultOpen = false,
  children,
  className = "",
}: {
  icon: ReactNode;
  titolo: string;
  riassunto?: string;
  badge?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={`card overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 p-3 text-left hover:bg-black/[0.02] transition"
        aria-expanded={open}
      >
        <span className="sez-ico w-7 h-7">{icon}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="t-sez text-[15px]">{titolo}</span>
            {badge}
          </div>
          {!open && riassunto && <p className="t-eti mt-0.5 line-clamp-2">{riassunto}</p>}
        </div>
        <ChevronDown size={16} className={`shrink-0 text-black/35 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-3 pb-3 pt-0 border-t border-black/[0.06]">{children}</div>}
    </section>
  );
}
