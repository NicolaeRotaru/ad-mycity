// Cancello d'onestà sul canale clienti (AR-075) — stesse regole di cervello/onesta-check.mjs.
// Port TS perché il Pannello su Vercel non ha accesso a spawn del cervello.

export type ViolazioneOnesta = {
  tipo: string;
  regola: string;
  esempi: string[];
};

const RE_SEGNAPOSTO = [
  { nome: "segnaposto [ESEMPIO]", re: /\[ESEMPIO\]/gi },
  { nome: "segnaposto [ ... ]", re: /\[[^\]\n]{2,40}\]/g },
  { nome: "segnaposto {{ ... }}", re: /\{\{[^}\n]+\}\}/g },
  { nome: "segnaposto XXX/TODO/TBD", re: /\b(XXX|TODO|TBD|PLACEHOLDER|LOREM)\b/gi },
  { nome: "segnaposto «…»", re: /«\s*…\s*»|<\s*inserire[^>]*>/gi },
];

const RE_SPIA = [
  { nome: "claim 'già N'", re: /\bgià\s+\d[\d.\s]*/gi },
  { nome: "claim vago 'centinaia/migliaia di'", re: /\b(centinaia|migliaia|decine)\s+di\b/gi },
];

const RE_NUMERO = /\b\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?\s?(?:€|euro|%|negozi|famiglie|clienti|ordini|utenti|iscritti|follower)?\b/gi;

// Fonte strutturata o citazione esplicita — niente parole generiche da sole.
const RE_FONTE = /(fonte\s*:|\(fonte|\[dati\]|\[fonte|supabase|stripe|posthog|registro-fatti|registro-realt|\{fonte:)/i;

export function esaminaOnesta(nome: string, testo: string): { file: string; violazioni: ViolazioneOnesta[] } {
  const violazioni: ViolazioneOnesta[] = [];
  const senzaWikilink = testo.replace(/\[\[[^\]]+\]\]/g, "");

  for (const { nome: rn, re } of RE_SEGNAPOSTO) {
    re.lastIndex = 0;
    const m = senzaWikilink.match(re);
    if (m) violazioni.push({ tipo: "segnaposto", regola: rn, esempi: [...new Set(m)].slice(0, 3) });
  }
  for (const { nome: rn, re } of RE_SPIA) {
    re.lastIndex = 0;
    const m = testo.match(re);
    if (m) violazioni.push({ tipo: "claim-non-verificato", regola: rn, esempi: [...new Set(m)].slice(0, 3) });
  }

  RE_NUMERO.lastIndex = 0;
  let mm: RegExpExecArray | null;
  const orfani = new Set<string>();
  while ((mm = RE_NUMERO.exec(testo)) !== null) {
    const raw = mm[0].trim();
    const soloNum = raw.replace(/[^\d]/g, "");
    if (!soloNum) continue;
    if (/^(19|20)\d{2}$/.test(soloNum) && !/[€%]|euro|negozi|famiglie|clienti|ordini/i.test(raw)) continue;
    if (soloNum.length < 2 && !/[€%]/.test(raw)) continue;
    const ctx = testo.slice(Math.max(0, mm.index - 60), mm.index + raw.length + 60);
    if (!RE_FONTE.test(ctx)) orfani.add(raw);
  }
  if (orfani.size) {
    violazioni.push({
      tipo: "numero-senza-fonte",
      regola: "ogni numero deve avere una fonte",
      esempi: [...orfani].slice(0, 5),
    });
  }

  return { file: nome, violazioni };
}

export function riassuntoViolazioni(violazioni: ViolazioneOnesta[]): string {
  return violazioni
    .map((v) => `${v.regola}${v.esempi.length ? `: ${v.esempi.join(", ")}` : ""}`)
    .join(" · ");
}
