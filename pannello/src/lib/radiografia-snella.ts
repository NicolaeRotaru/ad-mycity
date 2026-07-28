// La metà più grossa che il lotto 20 aveva lasciato scoperta, e l'aveva detto.
//
// Nella PR #589 avevo scritto: «sulla stessa rotta viaggia `auto-radiografia.json`, ancora inoltrato
// intero. È la metà più grossa del problema e merita il suo lotto». Questo è quel lotto.
//
// Misurato il 28/7:
//
//   · `auto-radiografia.json` = **614.805 byte**, riscaricati ogni 30 secondi insieme al cantiere
//   · `dimensioni` = 533.107 byte (87% del file), e dentro **`findings` = 531.074 byte**
//   · dei 170 findings, **109 sono chiusi** e pesano 338.175 byte
//
// E i chiusi **non li disegna nessuno**: il componente li filtra via
// (`RadiografiaDiSe.tsx:278` → `.filter((f) => f.stato !== "chiuso")`). Viaggiano da mesi per essere
// scartati all'arrivo.
//
// ── Verificato, non assunto ─────────────────────────────────────────────────
//
// Su AR-250 il difetto giurava che i difetti chiusi «non sono a video» e invece lo erano: seguirlo
// alla lettera avrebbe svuotato una sezione che Nicola usa. Qui ho guardato il componente prima di
// decidere, e la risposta è l'opposto: i findings **aperti** sono disegnati (riga 278), i **chiusi**
// no. Quindi gli aperti si mandano — con i soli campi del type `Finding` — e i chiusi solo come
// numero, perché il numero serve («61 aperti su 170») e il contenuto no.
//
// Nessuna dipendenza: si esegue in un test senza React, senza rete, senza disco.

/** I campi che la scheda LEGGE di un finding. Ricavati dal type `Finding` del componente. */
export const CAMPI_FINDING = [
  "titolo",
  "dove",
  "severita",
  "descrizione",
  "impatto",
  "causa_radice",
  "fix",
  "impatto_crescita",
  "genera",
  "stato",
] as const;

/** Le chiavi di primo livello che la scheda legge, dal type `Radiografia`. */
export const CAMPI_RADIOGRAFIA = [
  "data",
  "tipo",
  "voto_salute_architettura",
  "trend",
  "sintesi",
  "dimensioni",
  "pre_mortem",
  "benchmark_vs_migliori",
  "proposte_nuovi_pezzi",
  "domande_per_nicola",
  "sonda",
  "salute_marketplace",
  "meta",
] as const;

type Qualsiasi = Record<string, unknown>;

function soloCampi(o: Qualsiasi, campi: readonly string[]): Qualsiasi {
  const out: Qualsiasi = {};
  for (const k of campi) if (o?.[k] != null) out[k] = o[k];
  return out;
}

export function eChiusoFinding(f: Qualsiasi): boolean {
  return String(f?.stato ?? "") === "chiuso";
}

/**
 * Compone la radiografia invece di inoltrarla.
 *
 * Dei findings chiusi resta **il conteggio**, non il contenuto: la scheda mostra «N aperti» e i
 * chiusi li filtra via prima di disegnarli. Il numero però va mandato — senza, «61 findings» e «61
 * su 170» diventerebbero la stessa frase, e la seconda dice una cosa che la prima nasconde.
 *
 * ⚠️ Va chiamata DOPO `calcolaLive`, che conta sui dati interi: invertire l'ordine farebbe contare i
 * findings su una radiografia già sfoltita, e il totale scenderebbe da solo. È lo stesso ordine che
 * il lotto 20 ha dovuto rispettare sul cantiere.
 */
export function radiografiaSnella(
  radiografia: Qualsiasi | null | undefined,
): (Qualsiasi & { findings_chiusi_non_inviati: number }) | null {
  if (!radiografia) return null;
  const out = soloCampi(radiografia, CAMPI_RADIOGRAFIA);
  let chiusiTolti = 0;

  // Se `dimensioni` non è una lista NON si inoltra com'è: il componente ci fa sopra un `.map`, e
  // una stringa che arriva lì fa sparire l'intera schermata. Una lista vuota dichiarata è meglio di
  // una pagina che si spegne (è la lezione di AR-256, lotto 11).
  if (out.dimensioni != null && !Array.isArray(out.dimensioni)) {
    out.dimensioni = [];
  } else if (Array.isArray(out.dimensioni)) {
    out.dimensioni = (out.dimensioni as Qualsiasi[]).filter(Boolean).map((d) => {
      const tutti = Array.isArray(d?.findings) ? (d.findings as Qualsiasi[]).filter(Boolean) : [];
      const aperti = tutti.filter((f) => !eChiusoFinding(f));
      chiusiTolti += tutti.length - aperti.length;
      return {
        ...soloCampi(d, ["key", "voto", "stato", "sintesi"]),
        findings: aperti.map((f) => soloCampi(f, CAMPI_FINDING)),
        // Per dimensione: quanti ne sono stati chiusi. È un dato che la scheda può mostrare e che
        // altrimenti si perderebbe togliendo i chiusi — «0 aperti» e «0 aperti, 12 chiusi» non
        // raccontano la stessa storia.
        findings_chiusi: tutti.length - aperti.length,
      };
    });
  }

  return { ...out, findings_chiusi_non_inviati: chiusiTolti };
}
