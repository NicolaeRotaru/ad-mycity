#!/usr/bin/env node
// LA SCHEDA DEL CLIENTE DALLA FOTO — 26/11/2026.
//
// Nicola, 26/11: «faccio la foto al negozio … in automatico deve crearsi la scheda del cliente e fare
// tutte le analisi … questa scheda serve al venditore per avere un'idea chiara di quello che ha, non ha,
// di potenziale … Invece nel preventivo ci deve essere già l'anteprima: un piano editoriale già fatto,
// una bozza del sito seguendo gli standard, i punti deboli, forti, e tutto quello che possiamo offrire».
//
// 26/11/2026, più tardi — Nicola: «prima del preventivo si farà la proposta … il preventivo lo si crea
// solo quando si ha l'ok dall'imprenditore … che gli daremo tramite link, e lui basterà accettare».
// «Nella proposta si vedono i prezzi», e «bisogna spiegare la personalizzazione del prodotto in base
// all'abbonamento»; «paga con i contanti per il momento». Quindi DUE MOMENTI:
//   ① la PROPOSTA, subito dalla foto o dal nome: le tre pagine qui sotto, prezzi compresi;
//   ② il PREVENTIVO, solo dopo il sì del titolare: è il link col codice del sito (flusso 20 di n8n),
//     che il titolare apre e accetta. Questo programma lo prepara e basta: `--iscrizione` stampa i
//     dati pubblici da dare al flusso 20.
//
// La sessione che riceve la foto fa la ricerca e scrive UN file di dati (`dati.json`). Questo programma
// lo controlla e ne fa sempre le stesse tre pagine:
//   · scheda.html      → per il venditore, interna: ha / non ha / da migliorare / potenziale / offerta;
//   · proposta.html    → per il cliente: punti forti e deboli, bozza del sito, piano editoriale, cosa
//                        cambia con ogni abbonamento, i prezzi e come si paga;
//   · bozza-sito.html  → la bozza del sito a schermo intero (la stessa che la proposta mostra nel telefono).
//
// I CONTROLLI (se uno fallisce, niente pagine ed exit 1):
//   ① ogni dato ha uno stato vero (confermato · da_confermare · frammento · non_trovato) e, se non è
//     «non_trovato», l'indirizzo https della pagina da cui viene (o "foto", se l'ha letto il venditore
//     sulla foto che ha scattato): niente dati orfani;
//   ② nella bozza del sito niente prezzi (stessa regola del sito: lib/agenzia/bozza-sito-ad.ts);
//   ③ i canoni degli abbonamenti sono quelli del registro dei fatti (sdg.abbonamenti): se Nicola li
//     cambia lì e qui no, il programma si ferma invece di stampare un preventivo vecchio;
//   ④ il piano editoriale ha esattamente i post e i video promessi dall'abbonamento consigliato;
//   ⑤ la personalizzazione: per OGNI abbonamento una frase su misura per questo cliente
//     (`proposta.su_misura.base|business|premium`), tutte e tre diverse;
//   ⑥ come si paga lo dice il registro dei fatti (sdg.pagamento): se manca, niente proposta.
//
// Uso:  node cervello/scheda-cliente.mjs consegne/clienti/<cartella>        (scrive le tre pagine)
//       node cervello/scheda-cliente.mjs consegne/clienti/<cartella> --solo-controlla
//       node cervello/scheda-cliente.mjs consegne/clienti/<cartella> --iscrizione   (dopo il sì: i dati per il flusso 20)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { RADICE_REPO, CARTELLE_MEMORIA } from './casa-memoria.mjs';

// Il registro dei fatti si LEGGE e basta: questo programma scrive solo nella cartella del cliente.
const REGISTRO = path.join(RADICE_REPO, CARTELLE_MEMORIA[0], '90-Memoria-AI', 'registro-fatti.json');

// Le tre fasce come le scrive il sito (mycity, lib/agenzia/preventivo.ts → FASCE, 25/11/2026).
export const FASCE = {
  base: {
    nome: 'Base', centesimi: 30000, post: 8, video: 0,
    inPratica: { sito: 'Una pagina col vostro nome', piano: '8 contenuti al mese, senza video', foto: 'Una sessione all’avvio', analisi: 'Una, all’avvio' },
    perChi: 'Per essere online e vendere da subito, con un aiuto costante ma leggero.',
    servizi: [
      ['Foto e video', 'Una sessione di foto all’avvio: copertina e prodotti principali.'],
      ['Sito web', 'Un sito di una pagina col tuo nome, collegato alla vetrina.'],
      ['Social e Google', '8 post al mese, preparati e pubblicati da noi. Scheda Google Maps creata o sistemata all’avvio.'],
      ['Analisi', 'Un’analisi completa all’avvio: la tua attività, i social, la scheda Google e il sito, con cosa migliorare.'],
      ['Assistenza', 'Su WhatsApp, risposta entro 24 ore lavorative.'],
    ],
  },
  business: {
    nome: 'Business', centesimi: 50000, post: 12, video: 2,
    inPratica: { sito: 'Più pagine col vostro nome', piano: '12 contenuti al mese, di cui 2 video brevi', foto: 'Una sessione di foto ogni tre mesi, più un video al mese', analisi: 'Una ogni mese' },
    perChi: 'Per crescere ogni settimana: più contenuti, più clienti che ti trovano.',
    servizi: [
      ['Foto e video', 'Foto all’avvio e una nuova sessione ogni tre mesi, più un video al mese.'],
      ['Sito web', 'Un sito completo di più pagine, col tuo nome.'],
      ['Social e Google', '12 post al mese, 3 a settimana, con 2 video brevi. Scheda Google Maps sistemata, più le risposte alle recensioni scritte da noi.'],
      ['Analisi', 'L’analisi completa all’avvio e una nuova ogni mese: cosa è cambiato e cosa fare il mese dopo.'],
      ['Assistenza', 'Su WhatsApp, risposta entro 4 ore lavorative.'],
    ],
  },
  premium: {
    nome: 'Premium', centesimi: 99900, post: 20, video: 4,
    inPratica: { sito: 'Più pagine, aggiornato da noi ogni mese', piano: '20 contenuti al mese, 4 sono video, più le storie', foto: 'Foto e video ogni mese', analisi: 'Una ogni settimana, e un incontro al mese' },
    perChi: 'Il servizio completo: foto e video ogni mese, un referente tutto tuo.',
    servizi: [
      ['Foto e video', 'Una sessione di foto e video ogni mese.'],
      ['Sito web', 'Un sito completo, aggiornato da noi ogni mese.'],
      ['Social e Google', '20 post al mese, 4 video brevi e le storie. Scheda Google Maps curata ogni mese: foto nuove, post e risposte alle recensioni.'],
      ['Analisi', 'L’analisi ogni settimana, e un incontro al mese per leggerla insieme.'],
      ['Assistenza', 'Un referente tutto tuo e una visita nel locale ogni mese.'],
    ],
  },
};
// Il 10% sui prodotti venduti tramite MyCity resta anche con l'abbonamento (pricing.commissione, Nicola 26/11/2026).
export const CONDIZIONI = 'Nessun vincolo di durata: disdici quando vuoi, con 30 giorni di preavviso. Il primo mese costa la metà. Su quello che vendete al banco non prendiamo niente; sui prodotti venduti tramite MyCity resta il 10%, che paga la consegna e il servizio.';

const STATI = {
  confermato: 'Confermato',
  da_confermare: 'Da confermare',
  frammento: 'Solo un indizio',
  non_trovato: 'Non trovato',
};
const VIDEO = /reel|video/i;

// ———————————————————————————————————————————————— controlli

/**
 * Un prezzo dentro un testo: «12 €», «€ 5», «9,50», «12.50», «10 euro», «EUR 25». Gli orari no: «22:30»
 * sempre, «7.30» solo con un orario intorno («7.30-22.30», «dalle 7.30», «alle 19.00»). Il collaudo del 26/11
 * ha visto passare «Menu a 12.50» e «EUR 25», perché ogni numero col punto veniva preso per un orario.
 */
export function haPrezzo(t) {
  const s = String(t ?? '')
    .replace(/\b\d{1,2}:\d{2}\b/g, ' ')
    .replace(/\b\d{1,2}\.\d{2}\s*[-–]\s*\d{1,2}[.:]\d{2}\b/g, ' ')
    .replace(/\b(dalle|alle|ore|entro le)\s+\d{1,2}\.\d{2}\b/gi, ' ');
  return /€|\beuro\b|\beur\b|\b\d+,\d{2}\b|\b\d+\.\d{2}\b/i.test(s);
}

/** I canoni scritti nel registro dei fatti (sdg.abbonamenti), in centesimi. */
export function canoniDalRegistro(registro) {
  const fatti = registro?.fatti ?? registro;
  const voce = Array.isArray(fatti) ? fatti.find((f) => f.id === 'sdg.abbonamenti') : fatti?.['sdg.abbonamenti'];
  const v = String(voce?.valore ?? '');
  const m = v.match(/Base\s+(\d+)\s*euro.*?Business\s+(\d+)\s*euro.*?Premium\s+(\d+)\s*euro/i);
  if (!m) return null;
  return { base: +m[1] * 100, business: +m[2] * 100, premium: +m[3] * 100 };
}

/** Come si paga l'abbonamento, scritto nel registro dei fatti (sdg.pagamento), con le parole per il cliente. */
export function pagamentoDalRegistro(registro) {
  const fatti = registro?.fatti ?? registro;
  const voce = Array.isArray(fatti) ? fatti.find((f) => f.id === 'sdg.pagamento') : fatti?.['sdg.pagamento'];
  const v = String(voce?.valore ?? '').trim();
  return v || null;
}

/**
 * I testi della proposta. Fino al 26/11 il blocco si chiamava «preventivo»: si legge ancora, unito a
 * «proposta» (che vince campo per campo). Così chi aggiunge solo `proposta.su_misura` a un dati.json
 * vecchio non perde il piano editoriale.
 */
const proposta = (d) => ({ ...(d?.preventivo ?? {}), ...(d?.proposta ?? {}) });

/**
 * Cosa una fascia NON dà, in parole che una frase su misura non può usare (collaudo del 26/11: «Base
 * con due video al mese e la visita nel locale» passava). Le parole vengono da FASCE[*].servizi.
 */
const NON_DA = {
  base: [/\bvideo\b/i, /\bstorie\b/i, /referente/i, /\bvisit/i, /più pagine/i, /ogni (tre )?mes[ei]/i, /ogni settimana/i, /incontr/i],
  business: [/\bstorie\b/i, /referente/i, /\bvisit/i, /ogni settimana/i, /incontr/i, /foto e video ogni mese/i],
  premium: [],
};

/** I numeri di contenuti e video detti in una frase devono essere quelli della fascia. */
function promesseSbagliate(id, frase) {
  const f = FASCE[id];
  const errori = [];
  for (const re of NON_DA[id] ?? []) if (re.test(frase)) errori.push(`personalizzazione: il ${f.nome} non dà «${frase.match(re)[0]}» (proposta.su_misura.${id})`);
  for (const m of frase.matchAll(/(\d+)\s+(?:contenuti|post)(\s+(?:a|alla|ogni)\s+settimana)?/gi)) {
    const al_mese = Number(m[1]) * (m[2] ? 4 : 1);
    if (al_mese !== f.post) errori.push(`personalizzazione: «${m[0]}» col ${f.nome}, che ne dà ${f.post} al mese (proposta.su_misura.${id})`);
  }
  for (const m of frase.matchAll(/(\d+)\s+video/gi)) {
    if (Number(m[1]) !== f.video) errori.push(`personalizzazione: «${m[0]}» col ${f.nome}, che ne dà ${f.video} al mese (proposta.su_misura.${id})`);
  }
  return errori;
}

export function controlla(d, canoni, pagamento) {
  const errori = [];
  const https = (u) => typeof u === 'string' && /^https:\/\/[^\s]+$/.test(u);
  // La foto scattata dal venditore è una prova di prima mano: vale come fonte (fonte: "foto").
  const provato = (u) => https(u) || u === 'foto';
  for (const k of ['nome', 'tipo', 'citta', 'data', 'consigliato']) if (!d?.[k]) errori.push(`manca «${k}»`);
  if (d?.data && !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(d.data)) errori.push('«data» va scritta AAAA-MM-GG HH:MM (regola dell’orario)');
  if (d?.consigliato && !FASCE[d.consigliato]) errori.push(`abbonamento consigliato sconosciuto: «${d.consigliato}»`);
  // ① niente dati orfani
  for (const c of d?.campi ?? []) {
    if (!STATI[c.stato]) errori.push(`«${c.voce}»: stato «${c.stato}» non ammesso`);
    else if (c.stato !== 'non_trovato' && !provato(c.fonte)) errori.push(`«${c.voce}»: un dato «${c.stato}» vuole la fonte https (o "foto")`);
  }
  for (const s of d?.social ?? []) {
    if (s.stato !== 'non_trovato' && !https(s.fonte)) errori.push(`social «${s.canale}»: senza fonte https`);
  }
  for (const x of d?.fonti ?? []) if (!https(x.url)) errori.push(`fonte «${x.titolo}»: solo indirizzi https`);
  // I colori e i caratteri della bozza finiscono dentro <style>: solo valori semplici, niente che chiuda il blocco.
  const colori = { ...(d?.sito_bozza?.palette ?? {}), sfondo_eroe: d?.sito_bozza?.sfondo_eroe, testo_eroe: d?.sito_bozza?.testo_eroe };
  for (const [k, v] of Object.entries(colori)) if (v != null && !/^#[0-9a-f]{6}$/i.test(v)) errori.push(`bozza del sito: il colore «${k}» va scritto #rrggbb`);
  for (const [k, v] of Object.entries(d?.sito_bozza?.font ?? {})) if (!/^[A-Za-z0-9 ]{2,40}$/.test(String(v))) errori.push(`bozza del sito: il carattere «${k}» ha un nome non ammesso`);
  // ② bozza del sito senza prezzi
  const b = d?.sito_bozza ?? {};
  const testiBozza = [b.sopra_titolo, b.claim, b.azione, b.chi_siamo, b.dove_siamo, b.orari, b.foto_segnaposto, b.contatti?.altro,
    ...(b.cosa_offriamo ?? []).flatMap((x) => [x.titolo, x.testo]),
    ...(b.extra ?? []).flatMap((x) => [x.titolo, x.testo])];
  for (const t of testiBozza) if (haPrezzo(t)) errori.push(`bozza del sito: c’è un prezzo in «${String(t).slice(0, 60)}» (i prezzi li scrive il titolare)`);
  // ③ canoni uguali al registro
  if (!canoni) errori.push('registro dei fatti: non trovo i canoni in sdg.abbonamenti');
  else for (const [id, f] of Object.entries(FASCE)) {
    if (canoni[id] !== f.centesimi) errori.push(`canone ${f.nome}: il registro dice ${canoni[id] / 100} €, il programma ${f.centesimi / 100} €`);
  }
  // ④ piano editoriale = promessa dell'abbonamento consigliato
  const f = FASCE[d?.consigliato];
  const righe = proposta(d).piano?.righe ?? [];
  if (f) {
    const video = righe.filter((r) => VIDEO.test(r.formato)).length;
    if (righe.length !== f.post) errori.push(`piano editoriale: ${righe.length} contenuti, il ${f.nome} ne promette ${f.post}`);
    if (video !== f.video) errori.push(`piano editoriale: ${video} video, il ${f.nome} ne promette ${f.video}`);
  }
  // ⑤ la personalizzazione per abbonamento: una frase su misura per ognuno, e diverse tra loro
  const sm = proposta(d).su_misura ?? {};
  const frasi = Object.keys(FASCE).map((id) => String(sm[id] ?? '').trim());
  const vecchio = d?.preventivo && !d?.proposta ? ' — il blocco «preventivo» dei dati fatti prima del 26/11 ora si chiama «proposta»: rinominalo e aggiungi su_misura' : '';
  Object.entries(FASCE).forEach(([id, fx], i) => {
    if (frasi[i].length < 20) errori.push(`personalizzazione: manca cosa riceve questo cliente col ${fx.nome} (proposta.su_misura.${id})${vecchio}`);
    else errori.push(...promesseSbagliate(id, frasi[i]));
  });
  if (frasi.every((x) => x.length >= 20) && new Set(frasi).size < frasi.length) errori.push('personalizzazione: due abbonamenti hanno la stessa frase, ognuno deve dire cosa cambia');
  // ⑥ come si paga: dal registro dei fatti, mai scritto a memoria
  if (!pagamento) errori.push('registro dei fatti: non trovo come si paga l’abbonamento (sdg.pagamento)');
  return errori;
}

/** Il dominio di un indirizzo, o `null` se non è un indirizzo: un sito che non si legge non parte. */
const host = (u) => {
  const s = /^https?:\/\//i.test(String(u)) ? String(u) : `https://${u}`;
  return URL.canParse(s) ? new URL(s).hostname.replace(/^www\./, '').toLowerCase() || null : null;
};
/** Un recapito di persona dentro un testo: un'email, o un numero di telefono (almeno 8 cifre di fila, anche con spazi). */
const haRecapito = (v) => /@[a-z0-9-]+\.[a-z]{2,}/i.test(v) || (String(v).match(/[\d+][\d .\/-]*\d/g) ?? []).some((x) => x.replace(/\D/g, '').length >= 8);

/**
 * Dopo il sì del titolare: i dati PUBBLICI dell'attività per il flusso 20 di n8n («Iscrivi il cliente in
 * MyCity»), che crea il negozio nascosto e il link col preventivo. Mai dati del titolare: un numero o
 * un'email nel nome, nel tipo o nell'indirizzo ferma tutto. L'indirizzo entra solo se è «confermato» o
 * «da confermare» (non un indizio). Il sito entra solo se è UNO, con la voce «Sito» (o «Sito 1», «Sito
 * ufficiale»), «confermato», e la pagina da cui viene è il sito stesso: mai una pagina di elenco, mai il
 * sito di un vicino. Se i siti confermati sono più d'uno, non ne parte nessuno.
 */
export function datiIscrizione(d) {
  const campi = d?.campi ?? [];
  const indirizzo = campi.find((c) => /^indirizzo$/i.test(c.voce) && ['confermato', 'da_confermare'].includes(c.stato) && c.valore);
  const siti = campi.filter((c) => /^sito(\s+(\d+|ufficiale))?$/i.test(c.voce) && c.stato === 'confermato' && c.valore
    && /^https:\/\//.test(c.fonte ?? '') && host(c.fonte) && host(c.fonte) === host(String(c.valore).split(/\s/)[0]));
  const dati = { nome: String(d.nome).trim(), citta: String(d.citta ?? 'Piacenza').trim(), tipo: String(d.tipo ?? '').slice(0, 80).trim() };
  if (indirizzo && d.indirizzo) dati.indirizzo = String(d.indirizzo).slice(0, 200);
  if (siti.length === 1) dati.sito = `https://${host(siti[0].fonte)}`;
  for (const [k, v] of Object.entries(dati)) {
    if (k !== 'sito' && haRecapito(v)) throw new Error(`iscrizione: in «${k}» c'è un numero o un'email («${v}»): al flusso 20 vanno solo dati pubblici dell'attività, mai recapiti di persone`);
  }
  return dati;
}

// ———————————————————————————————————————————————— pagine

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const euro = (c) => (c / 100).toLocaleString('it-IT', { minimumFractionDigits: c % 100 ? 2 : 0, maximumFractionDigits: 2 }) + ' €';
const lista = (xs, cls = '') => (xs?.length ? `<ul class="${cls}">${xs.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '<p class="vuoto">Niente da dire, per ora.</p>');
const dominio = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };
const fonte = (u) => (u === 'foto' ? '<span class="fonte">foto del venditore</span>' : /^https:\/\//.test(u ?? '') ? `<a class="fonte" href="${esc(u)}" target="_blank" rel="noopener">${esc(dominio(u))}</a>` : '<span class="fonte nessuna">nessuna fonte</span>');

const TOKENS = `
/* Layout: una colonna di lettura larga 64rem, blocchi che si affiancano solo dove il confronto aiuta. */
:root{--panna:#FBF7F0;--carta:#FFFFFF;--inchiostro:#2C2A28;--tenue:#6B625A;--riga:#E7DED2;--cotto:#C0492C;--senape:#E8A33D;--oliva:#5A7C42;--bordeaux:#B82A28;--chip:#F3ECE2;
--display:"Fraunces",Georgia,"Times New Roman",serif;--testo:"Inter",system-ui,-apple-system,"Segoe UI",sans-serif}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--panna:#1E1B19;--carta:#272320;--inchiostro:#F2ECE4;--tenue:#B5AAA0;--riga:#3A342F;--cotto:#E0765A;--senape:#F0B95E;--oliva:#8DB06F;--bordeaux:#E5736E;--chip:#332D29;color-scheme:dark}}
:root[data-theme="dark"]{--panna:#1E1B19;--carta:#272320;--inchiostro:#F2ECE4;--tenue:#B5AAA0;--riga:#3A342F;--cotto:#E0765A;--senape:#F0B95E;--oliva:#8DB06F;--bordeaux:#E5736E;--chip:#332D29;color-scheme:dark}
body{background:var(--panna);color:var(--inchiostro);font:15px/1.6 var(--testo);padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:0 3rem}
.pagina{max-width:64rem;margin:0 auto;display:grid;gap:2.25rem}
h1,h2,h3{font-family:var(--display);font-weight:600;line-height:1.15;text-wrap:balance;margin:0}
h1{font-size:clamp(2rem,6vw,3.1rem)}h2{font-size:1.45rem}h3{font-size:1.05rem}
p{margin:0}ul{margin:0;padding-left:1.15rem;display:grid;gap:.35rem}
a{color:var(--cotto)}a:focus-visible{outline:2px solid var(--senape);outline-offset:2px}
.occhiello{font-size:.74rem;letter-spacing:.09em;text-transform:uppercase;color:var(--tenue);font-weight:600}
.testata{padding-block:2.2rem 0;display:grid;gap:.8rem}
.chips{display:flex;flex-wrap:wrap;gap:.4rem}.chip{background:var(--chip);border-radius:99px;padding:.18rem .7rem;font-size:.8rem}
.chip.forte{background:var(--cotto);color:var(--panna)}
.sezione{display:grid;gap:.9rem}
.riquadro{background:var(--carta);border:1px solid var(--riga);border-radius:14px;padding:1.1rem 1.2rem;display:grid;gap:.6rem;min-width:0}
.griglia{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(15.5rem,1fr))}
.tabella{overflow-x:auto;border:1px solid var(--riga);border-radius:14px;background:var(--carta)}
table{border-collapse:collapse;width:100%;font-size:.92rem}th,td{text-align:left;padding:.6rem .8rem;border-bottom:1px solid var(--riga);vertical-align:top}
th{font-size:.74rem;letter-spacing:.07em;text-transform:uppercase;color:var(--tenue);font-weight:600}tr:last-child td{border-bottom:0}
.stato{display:inline-block;border-radius:99px;padding:.05rem .55rem;font-size:.76rem;white-space:nowrap;border:1px solid currentColor}
.stato.confermato{color:var(--oliva)}.stato.da_confermare{color:var(--senape)}.stato.frammento{color:var(--tenue)}.stato.non_trovato{color:var(--bordeaux)}
.fonte{font-size:.8rem;color:var(--tenue)}.fonte.nessuna{font-style:italic}
.vuoto{color:var(--tenue);font-style:italic}
.nota{font-size:.85rem;color:var(--tenue)}
@media (max-width:560px){.pila thead{display:none}.pila tr{display:grid;gap:.25rem;padding:.7rem .8rem;border-bottom:1px solid var(--riga)}.pila tr:last-child{border-bottom:0}.pila td{border:0;padding:0}}
.misure{display:flex;flex-wrap:wrap;gap:1rem}.misura{display:grid;gap:.1rem}.misura b{font-family:var(--display);font-size:1.7rem;font-variant-numeric:tabular-nums}
@media (prefers-reduced-motion:no-preference){.riquadro{transition:border-color .2s}.riquadro:hover{border-color:var(--senape)}}
`;
const FONT = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap">';
const testa = (titolo, css = '') => `<title>${esc(titolo)}</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n${FONT}\n<style>${TOKENS}${css}</style>\n`;

export function paginaScheda(d) {
  const f = FASCE[d.consigliato];
  const righe = (d.campi ?? []).map((c) => `<tr><td>${esc(c.voce)}</td><td>${c.valore ? esc(c.valore) : '<span class="vuoto">—</span>'}</td><td><span class="stato ${esc(c.stato)}">${esc(STATI[c.stato])}</span></td><td>${fonte(c.fonte)}</td></tr>`).join('');
  const social = (d.social ?? []).map((s) => `<tr><td>${esc(s.canale)}</td><td><span class="stato ${s.stato === 'non_trovato' ? 'non_trovato' : 'da_confermare'}">${esc(s.livello ?? STATI[s.stato])}</span></td><td>${esc(s.giudizio ?? '')}</td><td>${fonte(s.fonte)}</td></tr>`).join('');
  const sito = d.sito ?? {};
  const misure = (sito.numeri ?? []).map((n) => `<div class="misura"><b>${esc(n.valore)}</b><span class="nota">${esc(n.nome)}${n.su ? ` su ${esc(n.su)}` : ''}</span></div>`).join('');
  const offerta = (d.offerta ?? []).map((o) => `<div class="riquadro"><h3>${esc(o.servizio)}</h3><p>${esc(o.perche)}</p></div>`).join('');
  const obiezioni = (d.obiezioni ?? []).map((o) => `<div class="riquadro"><p><b>«${esc(o.obiezione)}»</b></p><p>${esc(o.risposta)}</p></div>`).join('');
  const fonti = (d.fonti ?? []).filter((x) => /^https:\/\//.test(x.url ?? '')).map((x) => `<li><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.titolo)}</a> <span class="fonte">${esc(dominio(x.url))}</span></li>`).join('');
  const css = `.trenta{background:var(--inchiostro);color:var(--panna);border-radius:16px;padding:1.3rem 1.4rem;display:grid;gap:.6rem}.trenta .occhiello{color:var(--senape)}.trenta ul{gap:.45rem}
.colonne{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(16rem,1fr))}.colonne h3{display:flex;gap:.45rem;align-items:center}
.pallino{width:.65rem;height:.65rem;border-radius:50%;display:inline-block}.ha .pallino{background:var(--oliva)}.nonha .pallino{background:var(--bordeaux)}.migliora .pallino{background:var(--senape)}
.interno{border:1px dashed var(--cotto);color:var(--cotto);border-radius:10px;padding:.5rem .8rem;font-size:.85rem}`;
  return `${testa(`Scheda ${d.nome}`, css)}
<div class="pagina">
<header class="testata">
  <p class="interno">Scheda interna per il venditore: non si mostra e non si manda al cliente. La proposta da mostrare è a parte.</p>
  <span class="occhiello">Scheda cliente · ${esc(d.data)}</span>
  <h1>${esc(d.nome)}</h1>
  <p>${esc(d.tipo)} · ${esc(d.indirizzo ?? d.citta)}</p>
  <div class="chips"><span class="chip">${esc(d.stato_mycity ?? 'Non ancora su MyCity')}</span><span class="chip forte">Consigliato: ${esc(f.nome)} · ${euro(f.centesimi)} al mese</span><span class="chip">Primo mese ${euro(f.centesimi / 2)}</span></div>
</header>

<section class="trenta"><span class="occhiello">In 30 secondi, prima di entrare</span>${lista(d.in_30_secondi)}<p><b>Il gancio per aprire:</b> ${esc(d.gancio)}</p></section>

<section class="sezione"><h2>Cosa ha, cosa non ha, cosa va migliorato</h2>
<div class="colonne"><div class="riquadro ha"><h3><span class="pallino"></span>Ha già</h3>${lista(d.ha)}</div>
<div class="riquadro nonha"><h3><span class="pallino"></span>Non ha</h3>${lista(d.non_ha)}</div>
<div class="riquadro migliora"><h3><span class="pallino"></span>Da migliorare</h3>${lista(d.migliorare)}</div></div></section>

<section class="sezione"><h2>I dati dell’attività</h2><p class="nota">Ogni dato dice da dove viene e quanto è sicuro. «Da confermare» vuol dire letto in un elenco o in un giornale, non ancora visto dal titolare.</p>
<div class="tabella"><table class="pila"><thead><tr><th>Voce</th><th>Valore</th><th>Quanto è sicuro</th><th>Fonte</th></tr></thead><tbody>${righe}</tbody></table></div></section>

<section class="sezione"><h2>Reputazione</h2><div class="riquadro"><p>${esc(d.reputazione?.sintesi ?? '')}</p></div>
<div class="colonne"><div class="riquadro"><h3>Cosa piace</h3>${lista(d.reputazione?.positivi)}</div><div class="riquadro"><h3>Cosa non piace</h3>${lista(d.reputazione?.negativi)}</div></div></section>

<section class="sezione"><h2>Sito e social di oggi</h2>
<div class="riquadro"><h3>Sito · livello «${esc(sito.livello ?? 'non visto')}»</h3>${misure ? `<div class="misure">${misure}</div>` : ''}<p>${esc(sito.giudizio ?? '')}</p>${sito.fonte ? `<p class="nota">Misura: ${fonte(sito.fonte)}</p>` : ''}</div>
<div class="tabella"><table class="pila"><thead><tr><th>Canale</th><th>Livello</th><th>Cosa si vede</th><th>Fonte</th></tr></thead><tbody>${social}</tbody></table></div></section>

<section class="sezione"><h2>Potenziale</h2><div class="riquadro">${lista(d.potenziale)}</div></section>
<section class="sezione"><h2>Cosa possiamo offrire, e perché</h2><div class="griglia">${offerta}</div><p class="nota">Abbonamento consigliato: <b>${esc(f.nome)}</b>. ${esc(d.perche_consigliato ?? '')}</p></section>
<section class="sezione"><h2>Domande da fare al titolare</h2><div class="riquadro">${lista(d.domande)}</div></section>
<section class="sezione"><h2>Obiezioni probabili</h2><div class="griglia">${obiezioni}</div></section>
<section class="sezione"><h2>Attenzione</h2><div class="riquadro">${lista(d.attenzione)}</div></section>
<section class="sezione"><h2>Fonti</h2><div class="riquadro"><ul>${fonti}</ul></div></section>
</div>`;
}

export function paginaSito(d, { incorporata = false } = {}) {
  const b = d.sito_bozza ?? {};
  const p = { fondo: '#F7F1E8', testo: '#2B211C', accento: '#9C3D1E', tenue: '#6E6058', carta: '#FFFFFF', ...(b.palette ?? {}) };
  const font = { titoli: 'Fraunces', testo: 'Inter', ...(b.font ?? {}) };
  const famiglie = [...new Set([font.titoli, font.testo])].map((n) => `family=${encodeURIComponent(n).replace(/%20/g, '+')}:wght@400;600`).join('&');
  const offerte = (b.cosa_offriamo ?? []).map((o) => `<article class="voce"><h3>${esc(o.titolo)}</h3><p>${esc(o.testo)}</p></article>`).join('');
  const extra = (b.extra ?? []).map((o) => `<section class="blocco"><h2>${esc(o.titolo)}</h2><p>${esc(o.testo)}</p></section>`).join('');
  const schema = { '@context': 'https://schema.org', '@type': b.schema_tipo ?? 'LocalBusiness', name: d.nome, address: b.contatti?.indirizzo, telephone: b.contatti?.telefono || undefined, openingHours: b.orari_schema || undefined };
  const corpo = `
<div class="nastro">Bozza di MyCity per ${esc(d.nome)} · anteprima non pubblicata · ogni testo è da confermare dal titolare</div>
<header class="eroe"><div class="dentro"><p class="sopra">${esc(b.sopra_titolo ?? d.tipo)}</p><h1>${esc(d.nome)}</h1><p class="claim">${esc(b.claim)}</p>
<div class="azioni"><span class="bottone">${esc(b.azione ?? 'Chiama')}</span>${b.contatti?.telefono ? `<span class="numero">${esc(b.contatti.telefono)}</span>` : ''}</div>
${b.lingue?.length > 1 ? `<p class="lingue">${b.lingue.map((l) => esc(l.toUpperCase())).join(' · ')}</p>` : ''}</div></header>
<main class="dentro">
<section class="blocco"><h2>Chi siamo</h2><p>${esc(b.chi_siamo)}</p></section>
<figure class="foto"><span>${esc(b.foto_segnaposto ?? `Qui una foto del locale, scattata da scattiDG`)}</span></figure>
<section class="blocco"><h2>Cosa offriamo</h2><div class="voci">${offerte}</div></section>
${extra}
<section class="blocco"><h2>Dove siamo e orari</h2><p>${esc(b.dove_siamo)}</p><p class="orari">${esc(b.orari)}</p></section>
<section class="blocco"><h2>Contatti</h2><p>${esc(b.contatti?.indirizzo ?? '')}</p>${b.contatti?.telefono ? `<p>Telefono: ${esc(b.contatti.telefono)}</p>` : ''}${b.contatti?.altro ? `<p>${esc(b.contatti.altro)}</p>` : ''}</section>
</main>
<footer class="dentro piede"><p>${esc(d.nome)} · ${esc(b.contatti?.indirizzo ?? d.citta)}</p><p>Foto: le scatta scattiDG, il partner di MyCity per foto e video. Qui al loro posto ci sono colori pieni.</p></footer>
<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`;
  const css = `*{box-sizing:border-box}body{margin:0;background:${p.fondo};color:${p.testo};font:16px/1.65 "${font.testo}",system-ui,sans-serif}
h1,h2,h3{font-family:"${font.titoli}",Georgia,serif;font-weight:600;line-height:1.1;margin:0;text-wrap:balance}
.dentro{max-width:46rem;margin:0 auto;padding-left:max(18px,env(safe-area-inset-left,0px));padding-right:max(18px,env(safe-area-inset-right,0px))}
.nastro{background:${p.testo};color:${p.fondo};font-size:.75rem;text-align:center;padding:.45rem 1rem;letter-spacing:.02em}
.eroe{background:${b.sfondo_eroe ?? p.accento};color:${b.testo_eroe ?? '#FFFFFF'};padding-block:3.2rem 2.6rem}
.eroe .dentro{display:grid;gap:.8rem}.sopra{font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;opacity:.85;margin:0}
.eroe h1{font-size:clamp(2.4rem,9vw,3.6rem)}.claim{font-size:1.15rem;max-width:30rem;margin:0}
.azioni{display:flex;flex-wrap:wrap;gap:.6rem;align-items:center}.bottone{background:${b.testo_eroe ?? '#FFFFFF'};color:${b.sfondo_eroe ?? p.accento};border-radius:99px;padding:.6rem 1.2rem;font-weight:600}
.numero{font-weight:600;letter-spacing:.02em}.lingue{font-size:.8rem;opacity:.85;margin:0}
main{display:grid;gap:2.2rem;padding-block:2.4rem}.blocco{display:grid;gap:.7rem}.blocco h2{font-size:1.6rem;color:${p.accento}}.blocco p{margin:0}
.voci{display:grid;gap:.8rem;grid-template-columns:repeat(auto-fit,minmax(13rem,1fr))}.voce{background:${p.carta};border-radius:12px;padding:1rem;display:grid;gap:.35rem;border:1px solid ${p.tenue}33}
.voce h3{font-size:1.1rem}.foto{margin:0;aspect-ratio:16/10;max-width:100%;border-radius:14px;background:linear-gradient(135deg,${p.accento},${p.testo});display:flex;align-items:flex-end;padding:1rem}.foto span{color:#fff;font-size:.85rem;opacity:.9}.orari{color:${p.tenue}}.piede{padding-block:1.6rem 2.4rem;border-top:1px solid ${p.tenue}44;font-size:.85rem;color:${p.tenue};display:grid;gap:.3rem}.piede p{margin:0}`;
  const head = `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${esc(d.nome)} · bozza del sito</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?${famiglie}&display=swap"><style>${css}</style>`;
  if (incorporata) return `<!doctype html><html lang="it"><head>${head}</head><body>${corpo}</body></html>`;
  return `<!doctype html>\n<html lang="it">\n<head>${head}</head>\n<body>${corpo}</body>\n</html>\n`;
}

export function paginaProposta(d, pagamento) {
  const pv = proposta(d);
  const consigliato = d.consigliato;
  // La personalizzazione (Nicola, 26/11): cosa cambia, in pratica, per QUESTO cliente con ogni abbonamento.
  const ids = Object.keys(FASCE);
  const cella = (id, testo) => `<td data-l="${esc(FASCE[id].nome)}${id === consigliato ? ' · consigliato' : ''}"${id === consigliato ? ' class="scelta"' : ''}>${esc(testo)}</td>`;
  const riga = (titolo, testoDi) => `<tr><th scope="row">${esc(titolo)}</th>${ids.map((id) => cella(id, testoDi(id))).join('')}</tr>`;
  const cambia = [
    riga('Per voi, in pratica', (id) => pv.su_misura?.[id] ?? ''),
    riga('Il sito', (id) => FASCE[id].inPratica.sito),
    riga('Il piano editoriale', (id) => FASCE[id].inPratica.piano),
    riga('Foto e video', (id) => FASCE[id].inPratica.foto),
    riga('L’analisi', (id) => FASCE[id].inPratica.analisi),
  ].join('');
  const testaCambia = ids.map((id) => `<th scope="col"${id === consigliato ? ' class="scelta"' : ''}>${esc(FASCE[id].nome)}${id === consigliato ? ' · consigliato' : ''}</th>`).join('');
  const fasce = Object.entries(FASCE).map(([id, f]) => `<article class="fascia${id === consigliato ? ' scelta' : ''}">
<div class="cima"><h3>${esc(f.nome)}</h3>${id === consigliato ? '<span class="chip forte">Consigliato per voi</span>' : ''}</div>
<p class="prezzo"><b>${euro(f.centesimi)}</b> al mese</p><p class="nota">Il primo mese ${euro(f.centesimi / 2)}</p><p>${esc(f.perChi)}</p>
<dl>${f.servizi.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl></article>`).join('');
  const confronto = (pv.cosa_facciamo ?? []).map((r) => `<tr><td>${esc(r.tema)}</td><td>${esc(r.oggi)}</td><td>${esc(r.con_noi)}</td></tr>`).join('');
  const piano = (pv.piano?.righe ?? []).map((r) => `<tr><td class="quando">${esc(r.data)}</td><td><span class="formato${VIDEO.test(r.formato) ? ' video' : ''}">${esc(r.formato)}</span></td><td><b>${esc(r.tema)}</b><br><span class="didascalia">${esc(r.testo)}</span></td></tr>`).join('');
  const passi = (pv.primi_30_giorni ?? []).map((r) => `<li><b>${esc(r.quando)}</b> — ${esc(r.cosa)}</li>`).join('');
  const sito = paginaSito(d, { incorporata: true });
  const css = `.saluto{font-size:1.08rem;max-width:44rem}
.duo{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(16rem,1fr))}.forti h3{color:var(--oliva)}.deboli h3{color:var(--cotto)}
.vetrina{display:grid;gap:1.4rem;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);align-items:start}@media (max-width:760px){.vetrina{grid-template-columns:1fr}}
.telefono{justify-self:center;width:min(100%,330px);aspect-ratio:9/18.5;border-radius:38px;padding:12px;background:var(--inchiostro);box-shadow:0 18px 40px #0003;max-width:100%}
.telefono iframe{width:100%;height:100%;border:0;border-radius:28px;background:#fff}
.standard{display:grid;gap:.5rem}.standard li{list-style:none;padding-left:1.4rem;position:relative}.standard li::before{content:"✓";position:absolute;left:0;color:var(--oliva);font-weight:700}.standard ul{padding-left:0}
.formato{display:inline-block;font-size:.76rem;border-radius:99px;padding:.05rem .55rem;background:var(--chip);white-space:nowrap}.formato.video{background:var(--cotto);color:var(--panna)}
.quando{white-space:nowrap;font-variant-numeric:tabular-nums}.didascalia{color:var(--tenue)}
.fasce{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(16.5rem,1fr))}
.fascia{background:var(--carta);border:1px solid var(--riga);border-radius:16px;padding:1.2rem;display:grid;gap:.55rem;align-content:start}
.fascia.scelta{border:2px solid var(--cotto)}.cima{display:flex;justify-content:space-between;gap:.5rem;align-items:center;flex-wrap:wrap}
.prezzo b{font-family:var(--display);font-size:1.9rem}
dl{margin:.3rem 0 0;display:grid;gap:.45rem}dt{font-size:.74rem;letter-spacing:.07em;text-transform:uppercase;color:var(--tenue);font-weight:600}dd{margin:0;font-size:.92rem}
.passi{display:grid;gap:.6rem}.firma{border-top:1px solid var(--riga);padding-top:1rem;font-size:.9rem;color:var(--tenue)}
.cambia th[scope=row]{font-size:.8rem;color:var(--tenue);font-weight:600;white-space:nowrap}.cambia .scelta{background:color-mix(in srgb,var(--cotto) 9%,transparent)}
.cambia thead th.scelta{color:var(--cotto)}.cambia tbody tr:first-child td{font-weight:500}
@media (max-width:560px){.cambia thead{display:none}.cambia tr{display:grid;gap:.35rem;padding:.75rem .8rem;border-bottom:1px solid var(--riga)}.cambia tr:last-child{border-bottom:0}
.cambia th,.cambia td{border:0;padding:0}.cambia td{padding:.15rem .4rem;border-radius:6px}.cambia td::before{content:attr(data-l) ": ";font-weight:600;color:var(--tenue)}}
.paga{border-left:3px solid var(--senape);padding:.55rem .8rem;background:var(--carta);border-radius:0 10px 10px 0}`;
  return `${testa(`Proposta per ${d.nome}`, css)}
<div class="pagina">
<header class="testata"><span class="occhiello">Proposta di MyCity · ${esc(d.data.slice(0, 10).split('-').reverse().join('/'))}</span>
<h1>${esc(d.nome)}, ecco cosa faremmo per voi</h1>
<p class="saluto">${esc(pv.saluto)}</p></header>

<section class="sezione"><h2>Cosa abbiamo visto</h2><p class="nota">Lo abbiamo letto in rete, nei giornali e nelle recensioni pubbliche. Se qualcosa non torna, ce lo dite e lo correggiamo.</p>
<div class="duo"><div class="riquadro forti"><h3>I vostri punti forti</h3>${lista(pv.forti)}</div><div class="riquadro deboli"><h3>Dove perdete clienti oggi</h3>${lista(pv.deboli)}</div></div></section>

<section class="sezione"><h2>Cosa vi manca oggi, e cosa facciamo noi</h2>
<div class="tabella"><table class="pila"><thead><tr><th>Cosa</th><th>Oggi</th><th>Con noi</th></tr></thead><tbody>${confronto}</tbody></table></div></section>

<section class="sezione"><h2>La bozza del vostro sito</h2>
<div class="vetrina"><div class="telefono"><iframe title="Bozza del sito di ${esc(d.nome)}" srcdoc="${esc(sito)}" loading="lazy"></iframe></div>
<div class="riquadro standard"><h3>Gli standard che rispetta</h3><ul>${(pv.standard_sito ?? []).map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
<p class="nota">È una bozza scritta con quello che abbiamo trovato: testi, orari e foto li sistemiamo con voi. <a href="bozza-sito.html" target="_blank" rel="noopener">Apri la bozza a schermo intero</a>.</p></div></div></section>

<section class="sezione"><h2>Il piano editoriale di ${esc(pv.piano?.mese ?? 'questo mese')}</h2>
<p class="nota">${esc(pv.piano?.nota ?? '')}</p>
<div class="tabella"><table class="pila"><thead><tr><th>Quando</th><th>Formato</th><th>Il contenuto</th></tr></thead><tbody>${piano}</tbody></table></div></section>

<section class="sezione"><h2>Cosa cambia con ogni abbonamento</h2>
<p class="nota">La bozza del sito e il piano editoriale che avete visto sopra sono quelli del ${esc(FASCE[consigliato].nome)}, l’abbonamento che vi consigliamo. Con un altro abbonamento cambia quanto facciamo per voi: ecco cosa ricevereste, in pratica.</p>
<div class="tabella"><table class="cambia"><thead><tr><th scope="col"><span class="nota">Cosa</span></th>${testaCambia}</tr></thead><tbody>${cambia}</tbody></table></div></section>

<section class="sezione"><h2>Gli abbonamenti</h2><p class="nota">${esc(CONDIZIONI)}</p><p class="paga">${esc(pagamento)}</p><div class="fasce">${fasce}</div>
<p class="nota">${esc(d.perche_consigliato_cliente ?? '')}</p></section>

<section class="sezione"><h2>I primi 30 giorni</h2><div class="riquadro"><ul class="passi">${passi}</ul></div></section>

<p class="firma">I servizi li realizza SDG Agenzia, il partner di MyCity per foto, video, social e web. Foto e video con scattiDG. Questa proposta è un’anteprima: nulla viene pubblicato senza il vostro sì. Se vi convince, vi mandiamo il preventivo con un link: per partire basta accettarlo.</p>
</div>`;
}

// ———————————————————————————————————————————————— avvio

function principale(argv) {
  const cartella = argv[0];
  if (!cartella) { console.error('Uso: node cervello/scheda-cliente.mjs <cartella con dati.json> [--solo-controlla | --iscrizione]'); return 2; }
  const dati = JSON.parse(fs.readFileSync(path.join(cartella, 'dati.json'), 'utf8'));
  const registro = JSON.parse(fs.readFileSync(REGISTRO, 'utf8'));
  const canoni = canoniDalRegistro(registro);
  const pagamento = pagamentoDalRegistro(registro);
  const errori = controlla(dati, canoni, pagamento);
  if (errori.length) { console.error(`✗ ${dati.nome ?? cartella}: ${errori.length} problemi\n  · ${errori.join('\n  · ')}`); return 1; }
  if (argv.includes('--solo-controlla')) { console.log(`✓ ${dati.nome}: i dati passano i controlli`); return 0; }
  // Dopo il sì del titolare: solo i dati per il flusso 20, niente pagine.
  if (argv.includes('--iscrizione')) {
    try { console.log(JSON.stringify(datiIscrizione(dati), null, 2)); return 0; } catch (e) { console.error(`✗ ${e.message}`); return 1; }
  }
  fs.writeFileSync(path.join(cartella, 'scheda.html'), paginaScheda(dati));
  fs.writeFileSync(path.join(cartella, 'proposta.html'), paginaProposta(dati, pagamento));
  fs.writeFileSync(path.join(cartella, 'bozza-sito.html'), paginaSito(dati));
  const n = (dati.campi ?? []).length; const conf = (dati.campi ?? []).filter((c) => c.stato === 'confermato').length;
  console.log(`✓ ${dati.nome}: scheda, proposta e bozza del sito scritti in ${cartella} · ${n} dati, ${conf} confermati · consigliato ${FASCE[dati.consigliato].nome}`);
  console.log('  Il preventivo nasce solo dopo il sì del titolare: allora --iscrizione dà i dati per il flusso 20.');
  if (fs.existsSync(path.join(cartella, 'preventivo.html'))) console.log('  ⚠ c’è ancora preventivo.html del modello vecchio: la proposta adesso è proposta.html. Toglilo con «git rm preventivo.html»: la storia di git lo conserva.');
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exit(principale(process.argv.slice(2)));
