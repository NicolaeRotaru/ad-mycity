#!/usr/bin/env node
// ✋📄 IL MATERIALE IN MANO — una card che chiede a Nicola di incollare qualcosa deve PORTARLO con sé.
//
// PERCHÉ ESISTE (Nicola, 4/8: «non mi ha dato nessun blocco, perché?»).
//
// Gli avevo consegnato quattro freni nuovi che solo lui può accendere, incollando una configurazione
// nel file che io non posso toccare. Ho scritto quella configurazione in una consegna, ho accodato
// una card che diceva «apri il file X e incolla il blocco», e in chat ho citato il percorso. Poi ho
// scritto «cosa devi fare: incolla il blocco». Il blocco, davanti a lui, non è mai arrivato.
//
// La forma è vecchia e questa macchina la conosce sotto un altro nome: AR-474, «quando finisco scrivo
// il verdetto dove è comodo per me, non dove lo legge Nicola». Lì era il VERDETTO senza lettore, qui
// è il MATERIALE senza mano. La regola di consegna dice: salva il contenuto in `consegne/` e accoda
// l'azione. È giusta per le azioni che esegue la MACCHINA — il contenuto aspetta in un file, al via
// parte da solo. Non regge per le azioni che può eseguire solo LUI: lì la card non è un promemoria,
// è il posto dove il materiale deve stare, perché la mano che agisce è la sua.
//
// E non è un caso isolato: la card #permessi-senza-jolly del 29/7 ha la stessa identica forma —
// «sostituisci le due righe con l'elenco che ti ho già preparato… È in consegne/sicurezza/…, pronto
// da incollare». Due card, due mesi diversi, stesso difetto: il lavoro è fatto e resta fermo perché
// per usarlo bisogna andarselo a cercare.
//
// COSA CONTROLLA. Le card APERTE della coda che chiedono a Nicola un gesto di copia (incolla,
// sostituisci, copia, aggiungi la riga) devono contenere il materiale dentro la card: un blocco
// recintato ```…``` . Se il materiale sta solo in un file citato, la card è un puntatore.
//
// IL TETTO, e senza questo il guardiano sarebbe inutile il giorno dopo. Le card vecchie con questa
// forma esistono già: un cancello che parte rosso su tutte viene spento entro la settimana
// (stampo-metro.mjs). Quindi si misura il numero di partenza e si pretende che SCENDA: una card
// puntatore in più non si consegna, una in meno abbassa il tetto.
//
// COSA NON CONTROLLA, e va detto: non sa se il materiale dentro la card sia GIUSTO o completo — sa
// che c'è. Un blocco recintato con dentro la cosa sbagliata passa questo controllo e lo prende
// Nicola in faccia. Non giudica le card già fatte (FATTO/SUPERATA/chiusa): lì il gesto è passato.
//
// Uso:
//   node cervello/materiale-in-mano.mjs            # verdetto leggibile
//   node cervello/materiale-in-mano.mjs --json
//   node cervello/materiale-in-mano.mjs --aggiorna-tetto   # dopo aver riparato una card
//
// Uscita (contratto guardiani, AR-322): 0 = a posto · 1 = il debito è cresciuto · 2 = non ho misurato
//
// 🟢 Sola lettura, tranne con `--aggiorna-tetto` (che scrive solo il numero in questo stesso file).

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = dirname(QUI);
const CODA = "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md";
const TETTO = "cervello/materiale-in-mano-tetto.json";

/**
 * I gesti di copia: verbi che chiedono a Nicola di prendere QUALCOSA e metterlo da un'altra parte.
 *
 * Non «apri» e non «lancia»: aprire un file e lanciare un comando non richiedono materiale — il
 * comando È già la cosa, ed è corto. Il difetto nasce quando il gesto è «riporta questo contenuto
 * là», perché lì il contenuto deve essere davanti a chi lo riporta.
 */
export const GESTI_DI_COPIA = /\b(incoll\w*|sostituisc\w*|copia|copiare|riporta il|aggiungi (?:la|le|questa) rig\w+)\b/i;

/** Il materiale dentro la card: un blocco recintato. Tre apici, la forma con cui si scrive «questo
 *  è testo da prendere così com'è». */
export const MATERIALE = /```/;

/** Le card già chiuse: lì il gesto è passato, e riaprirle sarebbe rumore su lavoro finito. */
export const CHIUSA = /(^|\s)(✅|❌|~~|FATTO\b|SUPERATA\b|RISOLTA\b)/;

// ─────────────────────────────────────────────────────────────────────────────
// IL CUORE — puro: riceve il testo e torna le card che chiedono senza dare.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Spezza la coda in card. Il taglio è il commento-slug `<!-- nome -->`, che è il modo con cui questo
 * file separa le voci da sempre: dedurlo dai `###` sbaglierebbe sulle card che hanno sottotitoli.
 */
export function cardDellaCoda(testo = "") {
  const pezzi = String(testo).split(/^<!--\s*([a-z0-9-]+)\s*-->\s*$/im);
  const fuori = [];
  for (let i = 1; i < pezzi.length; i += 2) {
    fuori.push({ slug: pezzi[i], testo: pezzi[i + 1] || "" });
  }
  return fuori;
}

/**
 * Le card che chiedono un gesto di copia senza portare il materiale.
 *
 * Il titolo della card entra nel verdetto: senza, chi legge il rosso deve andare a cercare QUALE
 * card — cioè lo stesso difetto che questo guardiano cura, un piano più sotto.
 */
export function cardSenzaMateriale(card = []) {
  const fuori = [];
  for (const c of card) {
    const testo = String(c.testo || "");
    if (!testo.trim()) continue;
    const primaRiga = (testo.split("\n").find((r) => r.trim().startsWith("###")) || "").trim();
    if (CHIUSA.test(primaRiga)) continue;
    if (!GESTI_DI_COPIA.test(testo)) continue;
    if (MATERIALE.test(testo)) continue;
    fuori.push({ slug: c.slug, titolo: primaRiga.replace(/^#+\s*/, "").slice(0, 90) });
  }
  return fuori;
}

/** Il debito è cresciuto? Assoluto e scende, come il tetto delle malattie. */
export function tettoSforato(quante = 0, tetto = 0) {
  const t = Number.isFinite(Number(tetto)) ? Number(tetto) : 0;
  return { sforato: quante > t, quante, tetto: t, scende: quante < t };
}

// ─────────────────────────────────────────────────────────────────────────────
// LO STRATO I/O
// ─────────────────────────────────────────────────────────────────────────────

function main() {
  const argv = process.argv.slice(2);
  const json = argv.includes("--json");

  const percorso = join(REPO, CODA);
  if (!existsSync(percorso)) {
    console.error(`⚪ ${CODA} non c'è: non ho potuto misurare niente, e cieco non è verde.`);
    process.exit(2);
  }
  let testo;
  try {
    testo = readFileSync(percorso, "utf8");
  } catch (e) {
    console.error(`⚪ non ho potuto leggere ${CODA} (${e.message}): controllo NON eseguito.`);
    process.exit(2);
  }

  let tetto = 0;
  try {
    tetto = Number(JSON.parse(readFileSync(join(REPO, TETTO), "utf8")).tetto) || 0;
  } catch {
    // Nessun tetto scritto: parte da zero, cioè al primo giro dichiara tutto il debito che trova.
    // È il verso giusto in cui sbagliare — un tetto assente non deve assolvere.
  }

  const fuori = cardSenzaMateriale(cardDellaCoda(testo));
  const v = tettoSforato(fuori.length, tetto);

  if (argv.includes("--aggiorna-tetto")) {
    writeFileSync(join(REPO, TETTO), `${JSON.stringify({ tetto: fuori.length, misurato: new Date().toISOString().slice(0, 16).replace("T", " "), _perche: "Card che chiedono a Nicola un gesto di copia senza portare il materiale. Scende e non risale (AR-524)." }, null, 2)}\n`);
    console.log(`✋📄 tetto aggiornato a ${fuori.length}.`);
    process.exit(0);
  }

  if (json) {
    console.log(JSON.stringify({ ...v, card: fuori }, null, 2));
    process.exit(v.sforato ? 1 : 0);
  }

  if (!fuori.length) {
    console.log("✋📄 ogni card che chiede a Nicola di incollare qualcosa porta il materiale con sé.");
    process.exit(0);
  }

  console.log(`✋📄 MATERIALE IN MANO — ${fuori.length} card chiedono un gesto di copia senza portare il materiale (tetto ${v.tetto}):`);
  for (const c of fuori) console.log(`   · #${c.slug} — ${c.titolo}`);
  if (v.sforato) {
    console.log(`\n❌ il debito è cresciuto: ${fuori.length} contro un tetto di ${v.tetto}.`);
    console.log("   Chi legge la card deve poter fare il gesto SENZA aprire un altro file: metti il blocco dentro la card.");
    process.exit(1);
  }
  if (v.scende) console.log(`\n   Il tetto scende: portalo a ${fuori.length} con --aggiorna-tetto.`);
  process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
