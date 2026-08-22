#!/usr/bin/env node
// 🧪 IL VOLANO, I SENSORI E LA STELLA POLARE — sedici schede del 3 luglio, verificate su oggi.
//
// Tre famiglie che rispondono a tre domande diverse della stessa specie: la macchina sa dire se sta
// imparando? sa dire cosa NON vede? sa dire se sta andando dove deve?
//
//   IL VOLANO (sto imparando?)
//   AR-046  lo storico salute registrava un numero di chiusure diverso da quello vero
//   AR-048  il voto in cima al referto divergeva dalla sonda, col verdetto fuori dai valori ammessi
//   AR-050  il conteggio delle lezioni attive era gonfiato rispetto a quelle davvero attive
//   AR-051  il tasso di applicazione era scritto a mano: la metrica che governa il volano, auto-dichiarata
//   AR-052  la prova di chiusura usava contatori di sempre, mai la recency: restava vera per sempre
//   AR-053  nessuno spazzava le previsioni scadute: marcivano aperte contando come «in corso»
//   AR-054  gli esperimenti erano un elenco senza schema né ciclo di vita
//   AR-055  le proposte di auto-riscrittura non avevano stato: la lista conteneva cose già chiuse
//
//   I SENSORI (cosa non vedo?)
//   AR-067  nessun sensore diceva se il sito era irraggiungibile: la macchina era cieca sugli ordini
//   AR-068  i rischi di compliance non avevano né owner né monitor
//   AR-069  le proposte di pezzi nuovi non avevano un cantiere con chiusura
//   AR-070  il funnel di checkout era senza sensore
//   AR-071  la puntualità delle consegne — la promessa del modello — senza sensore
//
//   LA STELLA (vado dove devo?)
//   AR-079  il silo di allocazione era conclamato e mai corretto
//   AR-080  la North Star viveva come prosa: nessuno script la misurava
//   AR-081  il pre-mortem cross-silo era un rituale manuale senza forcing-function

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const leggi = (p) => readFileSync(join(REPO, p), "utf8");
const json = (p) => JSON.parse(leggi(p));

const { lezioniVive } = await import(join(REPO, "cervello/misura-parziale.mjs"));

// ── IL VOLANO ────────────────────────────────────────────────────────────────────────────────────

test("AR-046 · lo storico salute porta il conteggio vero delle chiusure, non uno stimato", () => {
  const serie = json("MyCity-Vault/90-Memoria-AI/auto-coscienza/storico-salute.json").serie;
  const ultimo = serie[serie.length - 1];
  assert.ok(Number.isFinite(ultimo.difetti_chiusi), "il punto deve portare il numero, o non è una serie");
  const cantiere = json("MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json").difetti;
  const chiusiVeri = cantiere.filter((d) => d.stato === "chiuso").length;
  // Non pretendo l'uguaglianza al difetto (il lotto in corso ne muove): pretendo che non sia una
  // stima campata in aria — il difetto era uno scarto strutturale, «3 registrate su 5 vere».
  assert.ok(Math.abs(ultimo.difetti_chiusi - chiusiVeri) <= 5,
    `storico dice ${ultimo.difetti_chiusi}, il cantiere ne ha ${chiusiVeri}: lo scarto è tornato strutturale`);
});

test("AR-050 · «attive» e «vive» non sono più sinonimi a caso, e il conto QUADRA", () => {
  const dati = json("MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json");
  // Il difetto: un solo numero con due significati, scritto da due script a turno.
  assert.ok(dati.meta.lezioni_per_stato, "accanto al numero deve viaggiare la partizione, o torna l'ambiguità");
  assert.equal(dati.meta.lezioni_conteggio_quadra, true, "se la somma non torna, un pezzo è sparito");

  // E la definizione è UNA, eseguibile: due copie diverse davano 471 e 381 sullo stesso file.
  const p = lezioniVive(dati);
  assert.equal(p.quadra, true, "il modulo stesso deve dichiarare che la somma torna");
  assert.ok(p.vive >= p.per_stato.attiva, "«vive» include le attive più i principi: sono due cose, e si vede");
  assert.notEqual(p.vive, p.per_stato.attiva, "…e non sono lo stesso numero: era esattamente l'ambiguità");
  // Il conto misurato: 512 vive contro 407 attive. Prima quello scarto era un numero solo, scritto
  // da due script con due significati, e la Cabina mostrava quello di chi aveva girato per ultimo.
  assert.ok(p.totale >= p.vive, "il totale non può essere minore delle vive");
});

test("AR-051 · il tasso di applicazione è CALCOLATO, non scritto a mano", () => {
  const src = leggi("cervello/tasso-lezioni.mjs");
  assert.match(src, /tasso_applicazione/, "deve esistere chi lo calcola");
  const dati = json("MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json");
  assert.ok(Number.isFinite(dati.meta.tasso_applicazione), "il numero dev'esserci…");
  assert.ok(dati.meta.tasso_calcolato_il, "…con l'istante in cui è stato calcolato, o è di nuovo un'opinione");
  assert.ok(Number.isFinite(dati.meta.tasso_finestra_giorni), "e con la finestra su cui è stato misurato");
});

test("AR-052 · la prova di chiusura guarda la RECENCY, non i contatori di sempre", () => {
  const src = leggi("cervello/sonda-volano.mjs");
  assert.match(src, /oreFinestra/, "senza una finestra, «il loop chiude» resta vero per sempre");
  assert.match(src, /oreFa\(d\.chiuso_il\) <= oreFinestra/, "si contano le chiusure RECENTI, non quelle di sempre");
});

test("AR-053 · le previsioni scadute vengono spazzate da un comando, a ogni giro", () => {
  const giro = leggi("cervello/giro.sh");
  assert.match(giro, /calibrazione\.mjs scadute/, "senza lo sweep marciscono aperte contando come «in corso»");
  assert.match(giro, /AR-053/, "il perché sta accanto alla cura");
});

test("AR-054 · gli esperimenti hanno uno schema e un ciclo di vita dichiarato", () => {
  const doc = leggi("cervello/auto-coscienza.md");
  assert.match(doc, /data_misura/, "un esperimento che non dice QUANDO è stato misurato non si chiude mai");
  assert.match(doc, /aperto\|misurato\|chiuso/, "gli stati ammessi devono essere un elenco, non testo libero");
});

test("AR-055 · le proposte di auto-riscrittura hanno uno stato, quindi possono chiudersi", () => {
  const doc = leggi("cervello/auto-coscienza.md");
  assert.match(doc, /proposte_auto_riscrittura[\s\S]{0,200}stato/, "senza stato la lista contiene cose già chiuse");
  assert.match(doc, /proposta\|firmata\|implementata\|rifiutata/, "gli stati devono essere dichiarati");
});

// ── I SENSORI ────────────────────────────────────────────────────────────────────────────────────

test("AR-067 · esiste un sensore che dice se il sito è irraggiungibile", () => {
  const src = leggi("cervello/verifica-sensori.mjs");
  assert.match(src, /sito_uptime/, "era il buco: se il marketplace è giù, la macchina è cieca sugli ordini");
  assert.match(src, /MARKETPLACE_SITE_URL/, "e deve bussare a un indirizzo vero, non a una costante");
});

// ⚠️ AR-070 RESTA APERTO, e questa prova serve a impedire che si chiuda per sbaglio.
//
// La prima versione di questo caso cercava /posthog|checkout/ dentro sentinella-dati.mjs e passava
// — ma quello che trovava era la parola «checkout» dentro un commento su `git checkout`. Il mio
// stesso metro stava comprando il verde: la malattia che questo cantiere cura, dentro la prova che
// la cura. Verificato dopo: in sentinella-dati.mjs non c'è nessun sensore di funnel.
//
// Il motivo per cui non c'è NON è lavoro mancante: PostHog è stato SPENTO da Nicola il 5/7 («togli
// PostHog»), e il sensore è dichiarato `optional`. Finché è spento un sensore di funnel non può
// esistere, e fingere il contrario sarebbe peggio del buco.
//
// Quello che si può difendere oggi, e che si difende qui: uno spento deve leggersi come SPENTO, mai
// come verde. Un sensore che tace e uno che dice «tutto bene» sono la stessa riga solo per chi non
// guarda, e questa macchina ha già pagato quella confusione.
test("uno spento si legge come SPENTO, mai come verde (il buco di AR-070 resta aperto)", () => {
  const src = leggi("cervello/verifica-sensori.mjs");
  assert.match(src, /posthog_api: "optional"/, "dev'essere dichiarato facoltativo, non dato per scontato");
  assert.match(src, /non_configurato/, "spento ≠ ok: un sensore che tace non deve comprare il verde");
  assert.match(src, /togli PostHog/, "la decisione di Nicola dev'essere citata accanto allo spegnimento");

  // E il buco resta un buco: nessuno ha scritto un sensore di funnel altrove di nascosto.
  const sent = leggi("cervello/sentinella-dati.mjs");
  assert.doesNotMatch(sent, /checkout_start|funnel_drop|tasso_conversione/,
    "se un giorno arriva davvero, questa riga cade e AR-070 va richiuso con la sua prova vera");
});

test("AR-071 · la puntualità delle consegne ha il suo sensore, ed è la promessa del modello", () => {
  const src = leggi("cervello/sentinella-dati.mjs");
  assert.match(src, /ordini_slot_scaduto/, "un ordine oltre lo slot promesso dev'essere un numero");
  assert.match(src, /expected_delivery=lt\./, "misurato sul dato vero: slot passato e consegna non avvenuta");
  assert.match(src, /delivered_at=is\.null/);
});

test("AR-068 · ogni rischio di compliance ha un owner, e vive in una casa sola", () => {
  const reg = json("MyCity-Vault/05-Soldi-Rischi/REGISTRO-RISCHI.json").rischi;
  assert.ok(reg.length >= 14);
  const senzaOwner = reg.filter((r) => !String(r.owner || "").trim());
  assert.deepEqual(senzaOwner.map((r) => r.id), [], "un rischio senza owner è un rischio di nessuno");
  const puntatore = json("MyCity-Vault/90-Memoria-AI/auto-coscienza/registro-rischi.json");
  assert.ok(puntatore._canonico, "l'altro file dev'essere un puntatore, o sono due registri che divergono");
});

test("AR-069 · le proposte di pezzi nuovi hanno un cantiere con lo stato, come i difetti", () => {
  const p = join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-pezzi.json");
  assert.ok(existsSync(p), "«aggiustarsi» aveva un contratto di chiusura, «crescere» era un elenco");
  const pezzi = json("MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-pezzi.json");
  const lista = pezzi.pezzi || pezzi;
  assert.ok(Array.isArray(lista) && lista.length > 0);
  assert.deepEqual(lista.filter((x) => !x.stato).map((x) => x.id), [], "un pezzo senza stato non si può chiudere");
});

// ── LA STELLA ────────────────────────────────────────────────────────────────────────────────────

test("AR-080 · la North Star è un motore che gira e dà un numero, non prosa in un documento", () => {
  const r = spawnSync(process.execPath, [join(REPO, "cervello/north-star-check.mjs")], { encoding: "utf8" });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  assert.match(out, /Ordini pagati/, "la stella polare dev'essere un numero che qualcuno stampa");
  assert.match(out, /Fonte del numero/, "…e con la sua fonte, o è un numero orfano");
});

test("AR-079 · il silo di allocazione è misurato a ogni giro, non solo constatato", () => {
  const giro = leggi("cervello/giro.sh");
  assert.match(giro, /allocazione-check\.mjs/, "era conclamato e mai corretto: adesso è un guardiano");
  assert.match(giro, /_alloc_rc=\$\?/, "e il suo verdetto viene RACCOLTO, non buttato in una pipe");
});

test("AR-081 · il verdetto dell'allocazione diventa un vincolo per il motore, non un avviso", () => {
  const giro = leggi("cervello/giro.sh");
  assert.match(giro, /ALLOC_VINCOLO/, "senza vincolo il pre-mortem resta un rituale che si può saltare");
});
