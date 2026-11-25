"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

// Il Markdown vero (react-markdown + remark-gfm, e remark-breaks se serve), in un pezzo a parte.
// Non si importa direttamente: passa da `MarkdownPigro`, che lo scarica solo quando un testo
// formattato è davvero a schermo (perf home, 25/11/2026). Stessi plugin e componenti di prima.
const SOLO_GFM = [remarkGfm];
const GFM_E_A_CAPO = [remarkGfm, remarkBreaks];

export type PropsMarkdown = {
  children: string;
  components?: Components;
  /** true = anche remark-breaks (un a capo nel testo diventa un a capo a schermo), come nella chat. */
  aCapo?: boolean;
};

export default function MarkdownPieno({ children, components, aCapo }: PropsMarkdown) {
  return (
    <ReactMarkdown remarkPlugins={aCapo ? GFM_E_A_CAPO : SOLO_GFM} components={components}>
      {children}
    </ReactMarkdown>
  );
}
