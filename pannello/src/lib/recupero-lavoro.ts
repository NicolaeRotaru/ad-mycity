// 🛟 CHI SI PUÒ RIMETTERE IN CODA — la decisione, in un posto solo.
//
// PERCHÉ ESISTE (AR-624). Il worker, al riavvio, tratta un'azione reale interrotta come intoccabile:
// la chiude in errore con «riapprova dal Pannello» e non la ri-accoda MAI, perché potrebbe essere già
// partita (email inviata, payout fatto) senza essere ancora marcata fatta — e rieseguirla vuol dire
// mandarla due volte. È la regola AR-026, ed è scritta in tre posti che la rispettano:
// `retry-policy.mjs`, `sentinella-lavori.mjs`, `worker.sh`.
//
// Poi esistevano DUE PORTE LATERALI che facevano l'opposto: il bottone «recupera i lavori bloccati»
// del Pannello e lo script `cervello/vps/recupera-lavori-orfani.sh`. Prendevano OGNI lavoro
// «in_corso» — senza guardare il tipo, il proprietario, l'età, né se un worker lo stesse ancora
// eseguendo — e lo rimettevano in attesa. Un'azione reale interrotta tornava prendibile e il primo
// claim la rieseguiva, senza che Nicola l'avesse rifirmata.
//
// LA RADICE, ed è la regola generale del cantiere: il freno stava DENTRO il comando principale
// invece che sul DATO. Ogni canale nuovo che scrive nello stesso posto eredita zero cancelli, perché
// non c'è niente da ereditare. Qui la decisione diventa una cosa sola, che entrambe le porte
// chiamano — e `cervello/lib-recupero.sh` ne è la copia per la shell, tenuta allineata a questa da
// `cervello/test/recupero-due-porte.test.mjs`, che passa la stessa tabella di casi in tutte e due e
// pretende lo stesso verdetto. Due copie che non possono divergere in silenzio.

/** I tipi di lavoro che toccano il mondo reale: soldi, email, invii. Mai riaccodabili da soli. */
export const TIPI_AZIONE_REALE = ["esegui-azione", "proposta"] as const;

/** Oltre questi minuti senza aggiornamenti, un lavoro con un proprietario si considera abbandonato. */
export const SOGLIA_VIVO_MIN = 60;

export type LavoroDaRecuperare = {
  id?: string;
  tipo?: string | null;
  worker_owner?: string | null;
  updated_at?: string | null;
};

export type EsitoRecupero = {
  azione: "riaccoda" | "lascia" | "riapprova";
  perche: string;
};

/** Minuti passati da `updated_at`. Una data assente o illeggibile vale «vecchissimo»: non è una scusa per lasciarlo bloccato per sempre. */
export function etaMinuti(updatedAt: string | null | undefined, adesso: number): number {
  const t = updatedAt ? Date.parse(updatedAt) : NaN;
  if (!Number.isFinite(t)) return Number.POSITIVE_INFINITY;
  return Math.max(0, (adesso - t) / 60000);
}

/**
 * Cosa fare di un lavoro rimasto «in_corso». Tre esiti, in quest'ordine — l'ordine è la sicurezza:
 *
 *  1. `riapprova` — è un'azione reale (soldi/email/invii). Non si tocca: potrebbe essere già partita.
 *     La sola ripartenza lecita è la firma di Nicola dal Pannello.
 *  2. `lascia`    — ha un proprietario e si è mosso da poco: un worker lo sta eseguendo ADESSO.
 *     Riaccodarlo significa farlo eseguire due volte e far perdere l'esito di quello vivo (la sua
 *     scrittura è filtrata su stato=in_corso, e lo stato non sarebbe più quello).
 *  3. `riaccoda`  — nessuno lo sta eseguendo e non tocca il mondo reale: torna in coda.
 */
export function decidiRecupero(
  lavoro: LavoroDaRecuperare,
  ctx: { adesso: number; sogliaVivoMin?: number },
): EsitoRecupero {
  const soglia = ctx.sogliaVivoMin ?? SOGLIA_VIVO_MIN;
  const tipo = String(lavoro.tipo || "");

  if ((TIPI_AZIONE_REALE as readonly string[]).includes(tipo)) {
    return {
      azione: "riapprova",
      perche: `azione reale «${tipo}» interrotta: potrebbe essere già partita, rieseguirla sarebbe un doppio invio — riapprovala dal Pannello`,
    };
  }

  const owner = String(lavoro.worker_owner || "").trim();
  const eta = etaMinuti(lavoro.updated_at, ctx.adesso);
  if (owner && eta < soglia) {
    return {
      azione: "lascia",
      perche: `lo sta eseguendo un worker (${owner}, ultimo segno ${Math.round(eta)} min fa): riaccodarlo lo farebbe girare due volte`,
    };
  }

  return {
    azione: "riaccoda",
    perche: owner
      ? `fermo da ${Math.round(eta)} min oltre la soglia di ${soglia}: il worker che lo teneva non c'è più`
      : "nessun worker lo rivendica",
  };
}
