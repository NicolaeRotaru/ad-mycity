"use client";

import { useEffect, useMemo } from "react";
import { FileText, X } from "lucide-react";

function isImmagine(f: File): boolean {
  if (f.type.startsWith("image/")) return true;
  return /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(f.name);
}

// 📎 Anteprima visibile degli allegati — miniatura sopra la casella di testo (non solo il nome file).
export default function AnteprimaAllegatiChat({
  allegati,
  onTogli,
  disabilitato,
}: {
  allegati: File[];
  onTogli: (i: number) => void;
  disabilitato?: boolean;
}) {
  const urls = useMemo(
    () => allegati.map((f) => (isImmagine(f) ? URL.createObjectURL(f) : "")),
    [allegati],
  );

  useEffect(() => {
    return () => {
      urls.forEach((u) => {
        if (u) URL.revokeObjectURL(u);
      });
    };
  }, [urls]);

  if (allegati.length === 0) return null;

  return (
    <div
      className="flex flex-wrap gap-2 rounded-xl border border-brand/25 bg-brand/[0.04] p-2"
      aria-label={`${allegati.length} allegati pronti`}
    >
      {allegati.map((f, i) => {
        const img = isImmagine(f);
        const url = urls[i];
        return (
          <div key={`${f.name}-${f.size}-${i}`} className="relative shrink-0">
            {img && url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={url}
                alt={f.name}
                className="h-16 w-16 rounded-lg object-cover border border-black/10"
              />
            ) : (
              <div className="h-16 w-16 rounded-lg border border-black/10 bg-black/[0.03] grid place-items-center">
                <FileText size={20} className="text-brand/70" />
              </div>
            )}
            <span className="absolute -bottom-1 left-0 right-0 truncate text-center text-[9px] px-0.5 text-black/55 dark:text-white/55">
              {f.name}
            </span>
            <button
              type="button"
              onClick={() => onTogli(i)}
              disabled={disabilitato}
              className="absolute -top-1.5 -right-1.5 grid place-items-center w-5 h-5 rounded-full bg-black/75 text-white hover:bg-red-600 transition disabled:opacity-40"
              aria-label={`Togli ${f.name}`}
            >
              <X size={11} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
