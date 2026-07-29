#!/usr/bin/env node
// AR-119 — la firma di Nicola vive in un posto che l'esecutore sa scrivere.
//
// Misurato il 28/7, e il difetto va aggiornato rispetto a come è scritto: **metà è già riparata**.
// AR-205 (27/7) ha reso la firma un'autorità sola — Supabase, `impostazioni`, chiave
// `azione:<id>:firma`, valore "nicola …", scritta solo dal clic del Pannello, con "auto …" rifiutato
// e fail-closed su rete giù. Il marcatore nel markdown NON autorizza più niente. Verificato in
// `cervello/consenso-azione.mjs` (`firmaPannello`, e il blocco AR-205 in `consensoInvio`).
//
// Quello che resta, ed è il cuore del titolo del difetto — «nessuna segregazione proponente/
// firmatario» — è questo: **la tabella dove vive la firma la scrive anche il cervello.**
// `git-github.mjs::stampSegnale` e `sentinella-dati.mjs` fanno POST su `impostazioni` con la stessa
// `SUPABASE_SERVICE_KEY` che serve a leggerla. La chiave di servizio scrive tutto: niente, a livello
// di permessi, impedisce a uno script di scrivere `azione:<id>:firma = "nicola 28/7 16:40"` e poi di
// leggerlo come consenso.
//
// Cioè: la separazione fra chi propone e chi firma oggi è una **convenzione fra script educati**, non
// un confine. È la stessa forma di AR-272, AR-169, AR-127: la regola vive nella disciplina di chi
// esegue invece che al confine. E ogni volta che è successo, prima o poi qualcuno l'ha scavalcata
// senza accorgersene.
//
// La cura completa sarebbe una chiave con permessi ristretti (o una RLS che vieta al ruolo del
// cervello di scrivere le chiavi di firma): tocca la configurazione di Supabase, quindi è di Nicola.
// Quello che il codice può fare da solo, e che fa qui, è **mettere il confine dove si scrive**: ogni
// scrittura del cervello su `impostazioni` dichiara quali chiavi tocca, e un guardiano fallisce se
// una di quelle chiavi è una firma.
//
// Nessuna dipendenza e nessun I/O: si esegue su testo passato da fuori.

/** Le chiavi che SOLO il Pannello può scrivere, su clic umano. */
export const CHIAVI_DI_NICOLA = [/^azione:[^:]+:firma$/i, /^firma:/i];

/** Il valore che apre il cancello. Serve al guardiano per riconoscere una firma forgiata nel codice. */
export const VALORE_UMANO = /^\s*nicola\b/i;

/** Una scrittura su `impostazioni` nel codice del cervello. */
const RE_SCRITTURA = /rest\/v1\/impostazioni/;

/**
 * Il metodo di scrittura, nelle DUE lingue in cui questa macchina parla (lotto 33, AR-380).
 *
 * Fino al 29/7 c'era solo la forma JavaScript, e non per svista: quando il guardiano è nato, le due
 * sole scritture note stavano in due `.mjs`, ed è stato tarato su quelle. Da allora è sempre uscito
 * verde — e un guardiano che non trova mai niente non spinge nessuno a chiedersi se stia guardando
 * abbastanza.
 *
 * Ma la domanda giusta non è «quali file sanno fare fetch?»: è «chi ha in mano la chiave con cui si
 * scrive quella tabella?». La risposta include ogni script che carica `cervello/vps/.env` — e
 * infatti `giro.sh` e `vps/watch-main.sh` scrivevano su `impostazioni` con `curl -X POST` senza che
 * li vedesse nessuno. Il perimetro dedotto dagli esempi disponibili invece che dal bene da
 * proteggere: la stessa radice di AR-381 e AR-382.
 */
const RE_METODO_SCRITTURA = /method:\s*"(?:POST|PATCH|PUT)"|-X\s+"?(?:POST|PATCH|PUT)"?|--request\s+"?(?:POST|PATCH|PUT)"?/i;

/**
 * Una chiave costruita da variabile (`"chiave":"$_chiave"`, `chiave: ${nome}`) non è verificabile
 * staticamente: nessuno può dire da qui se quella variabile varrà mai `azione:<id>:firma`. Va
 * rifiutata a priori — «non lo so» non è «va bene».
 */
const RE_CHIAVE_DA_VARIABILE = /^\$|^\$\{|^\{|\$\{/;

/** La riga in cui uno script dichiara quali chiavi tocca (AR-119). */
const RE_DICHIARAZIONE = /CHIAVI_SCRITTE\s*[:=]\s*\[([^\]]*)\]/;

/** È una chiave che solo Nicola può scrivere? */
export function riservataANicola(chiave) {
  const c = String(chiave || "").trim();
  return CHIAVI_DI_NICOLA.some((re) => re.test(c));
}

/**
 * Le chiavi dichiarate da uno script. `null` se non dichiara niente: e «non dichiara» non è
 * «non scrive», quindi va trattato come un difetto, non come un via libera.
 */
export function chiaviDichiarate(testo = "") {
  const m = String(testo || "").match(RE_DICHIARAZIONE);
  if (!m) return null;
  return m[1]
    .split(",")
    .map((s) => s.trim().replace(/^["'`]|["'`]$/g, ""))
    .filter(Boolean);
}

/** Lo script scrive su `impostazioni`? (Leggere non conta: `select=` non è una scrittura.) */
export function scriveImpostazioni(testo = "") {
  const righe = String(testo || "").split("\n");
  return righe.some((r, i) => {
    if (/^\s*(?:\/\/|\*|#)/.test(r)) return false;
    if (!RE_SCRITTURA.test(r)) return false;
    return RE_METODO_SCRITTURA.test(comandoIntorno(righe, i));
  });
}

/**
 * Il comando completo attorno a una riga, non una finestra di N righe a caso.
 *
 * Serve per la shell (AR-380): un `curl` vero è spezzato su cinque righe con `\` a fine riga, e il
 * `-X POST` può stare su una qualsiasi. Ma una finestra fissa leggerebbe anche il comando SUCCESSIVO
 * — e allora una LETTURA (`select=valore&chiave=eq.pausa`) seguita da una scrittura verrebbe contata
 * come scrittura. Qui si sale e si scende finché la continuazione `\` regge: né più né meno del
 * comando vero. Per il JavaScript, dove il `method:` sta dentro l'oggetto poche righe sotto, si
 * tiene la finestra corta di prima.
 */
function comandoIntorno(righe, i) {
  let a = i;
  while (a > 0 && /\\\s*$/.test(righe[a - 1])) a--;
  let b = i;
  while (b < righe.length - 1 && /\\\s*$/.test(righe[b])) b++;
  const continuato = b > i || a < i;
  if (continuato) return righe.slice(a, b + 1).join("\n");
  return righe.slice(i, i + 6).join("\n"); // forma JavaScript: l'oggetto fetch poche righe sotto
}

/**
 * I difetti di uno script rispetto al confine della firma.
 *   · scrive senza dichiarare cosa scrive     → `scrittura_non_dichiarata`
 *   · dichiara una chiave che è una firma      → `firma_scritta_dal_cervello` (il difetto vero)
 *   · contiene una firma umana scritta a mano  → `firma_forgiata`
 */
export function difettiFirma(testo = "", nome = "?") {
  const d = [];
  const t = String(testo || "");
  if (scriveImpostazioni(t)) {
    const chiavi = chiaviDichiarate(t);
    if (chiavi == null) d.push({ file: nome, difetto: "scrittura_non_dichiarata" });
    else
      for (const c of chiavi) {
        if (riservataANicola(c)) d.push({ file: nome, difetto: "firma_scritta_dal_cervello", chiave: c });
        // AR-380: una chiave che è una variabile non si può verificare da fuori. Accettarla sarebbe
        // dichiarare sicuro ciò che nessuno ha letto.
        else if (RE_CHIAVE_DA_VARIABILE.test(c)) d.push({ file: nome, difetto: "chiave_non_verificabile", chiave: c });
      }
  }
  // Una firma umana costruita dentro il codice del cervello è un permesso che si autoconcede — ma
  // SOLO se quello script ha anche una strada per scriverla. Senza questa condizione il controllo
  // accusava `round3-memoria.mjs`, che la frase «azione:<id>:firma = "nicola <data ora>"» ce l'ha
  // dentro una nota di memoria che DESCRIVE il contratto: prosa in una stringa, non una scrittura.
  // Un metro che accusa chi documenta la regola insegna a non documentarla più.
  if (scriveImpostazioni(t)) {
    for (const riga of t.split("\n")) {
      if (/^\s*(?:\/\/|\*|#)/.test(riga)) continue; // in un commento è documentazione, non codice
      if (/:firma`?["'\s,)]/.test(riga) && /["'`]\s*nicola\b/i.test(riga)) {
        d.push({ file: nome, difetto: "firma_forgiata" });
        break;
      }
    }
  }
  return d;
}

/** Contratto dei guardiani (AR-322): 0 confine rispettato · 1 violato · 2 non ho potuto leggere. */
export function codiceUscita({ cieco = 0, violazioni = 0 } = {}) {
  if (cieco > 0) return 2;
  return violazioni > 0 ? 1 : 0;
}
