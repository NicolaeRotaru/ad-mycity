"use client";

/** Formatta il testo di RITMO.md per la card Plancia: sezioni, elenchi, dettagli tecnici collassati. */
export function RitmoTesto({ testo }: { testo: string }) {
  const sezioni = parseSezioni(testo.trim());
  if (!sezioni.length) {
    return <p className="t-corpo leading-relaxed whitespace-pre-wrap">{testo}</p>;
  }

  return (
    <div className="space-y-3.5">
      {sezioni.map((s, i) => (
        <div key={i}>
          {s.titolo && (
            <p className="text-[12px] font-semibold text-foreground/90 mb-1.5">{s.titolo}</p>
          )}
          {s.collassabile ? (
            <details className="text-[12px] text-muted-foreground">
              <summary className="cursor-pointer select-none hover:text-foreground/80">
                Mostra dettagli tecnici
              </summary>
              <ul className="mt-1.5 space-y-1 list-disc pl-4 leading-relaxed">
                {s.righe.map((r, j) => (
                  <li key={j}>{r.testo}</li>
                ))}
              </ul>
            </details>
          ) : s.numerata ? (
            <ol className="t-corpo space-y-1.5 list-decimal pl-4 marker:text-muted-foreground leading-relaxed">
              {s.righe.map((r, j) => (
                <li key={j}>{r.testo}</li>
              ))}
            </ol>
          ) : s.righe.length ? (
            <ul className="t-corpo space-y-1.5 list-disc pl-4 marker:text-muted-foreground leading-relaxed">
              {s.righe.map((r, j) => (
                <li key={j}>
                  {r.etichetta ? (
                    <>
                      <span className="font-medium text-foreground/85">{r.etichetta}: </span>
                      {r.testo}
                    </>
                  ) : (
                    r.testo
                  )}
                </li>
              ))}
            </ul>
          ) : s.paragrafo ? (
            <p className="t-corpo leading-relaxed">{s.paragrafo}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

type Riga = { testo: string; etichetta?: string };

type Sezione = {
  titolo?: string;
  righe: Riga[];
  paragrafo?: string;
  numerata?: boolean;
  collassabile?: boolean;
};

function parseRiga(trimmed: string): Riga | null {
  const labeled = trimmed.match(/^[-•]\s+\*\*(.+?)\*\*:?\s*(.*)$/);
  if (labeled) {
    return { etichetta: labeled[1].replace(/\*\*/g, ""), testo: pulisciTesto(labeled[2]) };
  }
  const inline = trimmed.match(/^\*\*(.+?)\*\*:?\s+(.+)$/);
  if (inline) {
    return { etichetta: inline[1].replace(/\*\*/g, ""), testo: pulisciTesto(inline[2]) };
  }
  const bullet = trimmed.match(/^[-•]\s+(.+)$/);
  if (bullet) return { testo: pulisciTesto(bullet[1]) };
  return { testo: pulisciTesto(trimmed) };
}

/** Toglie markdown pesante ma lascia il senso leggibile. */
function pulisciTesto(s: string): string {
  return s
    .replace(/\*\*/g, "")
    .replace(/@\w+(-\w+)*/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function parseSezioni(testo: string): Sezione[] {
  const out: Sezione[] = [];
  let cur: Sezione | null = null;

  const flush = () => {
    if (!cur) return;
    if (cur.righe.length === 1 && !cur.titolo && !cur.numerata && !cur.righe[0].etichetta) {
      cur.paragrafo = cur.righe[0].testo;
      cur.righe = [];
    }
    out.push(cur);
    cur = null;
  };

  for (const raw of testo.split("\n")) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    const header = trimmed.match(/^\*\*(.+)\*\*$/);
    if (header) {
      flush();
      const titolo = header[1].replace(/\*\*/g, "");
      cur = {
        titolo,
        righe: [],
        collassabile: /dettagli tecnici/i.test(titolo),
      };
      continue;
    }

    const numbered = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (numbered) {
      if (!cur) cur = { righe: [], numerata: true };
      cur.numerata = true;
      cur.righe.push({ testo: pulisciTesto(numbered[1]) });
      continue;
    }

    const riga = parseRiga(trimmed);
    if (!riga) continue;
    if (!cur) cur = { righe: [] };
    cur.righe.push(riga);
  }

  flush();
  return out;
}
