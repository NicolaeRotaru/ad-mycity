"use client";

import { lazy, Suspense } from "react";
import type { PropsMarkdown } from "@/components/MarkdownPieno";

// Velocità (perf home, 25/11/2026): react-markdown e i suoi plugin (~130 ms di processore su un
// telefono medio solo per caricarli) stavano nel pezzo della home, importati da riquadri che il
// testo formattato lo mostrano solo dopo un clic (la lettera dell'AD, le caselle «parla», la chat).
// Qui si scaricano la prima volta che un testo formattato va davvero a schermo. Nell'attesa, che
// dura solo la prima volta, il testo si legge lo stesso, semplice: mai un riquadro vuoto.
const MarkdownPieno = lazy(() => import("@/components/MarkdownPieno"));

export default function MarkdownPigro(props: PropsMarkdown) {
  return (
    <Suspense fallback={<span className="whitespace-pre-wrap">{props.children}</span>}>
      <MarkdownPieno {...props} />
    </Suspense>
  );
}
