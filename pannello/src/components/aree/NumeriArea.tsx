"use client";

import type { ReactNode } from "react";
import Aggiornato from "@/components/Aggiornato";

export default function NumeriArea({
  cockpit,
  aggAt,
}: {
  cockpit: ReactNode;
  aggAt: number | null;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="t-area">📊 I numeri dell&apos;azienda</h2>
          <p className="t-eti mt-0.5">KPI per categoria — oggi, 7 e 30 giorni.</p>
        </div>
        <Aggiornato at={aggAt} className="mt-1 shrink-0" />
      </div>

      {cockpit}
    </div>
  );
}
