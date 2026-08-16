#!/usr/bin/env node
// 🔢 CHI PUÒ DICHIARARE QUANTI SENIOR SIAMO — il perimetro si deriva, non si elenca.
//
// PERCHÉ ESISTE (AR-347). Il guardiano del registro agenti controlla che nessun file dichiari un
// numero di agenti diverso da quello vero. Buona idea, perimetro sbagliato: l'elenco dei file da
// guardare era scritto a mano dentro il guardiano — sei percorsi, `FILE_PILOTA`. Tutto ciò che sta
// fuori da quelle sei righe può dichiarare quello che vuole, e nessuno lo contesta.
//
// Non è teoria: il 16/8 il «quarantadue» era ancora vivo in due posti, ed erano entrambi fuori dall'elenco.
// `COMANDI.md` lo diceva a Nicola nel menù dei comandi. `cervello/sentinelle.md` lo diceva alla
// sentinella che dovrebbe accorgersi proprio del disallineamento del registro — cioè il numero
// sbagliato viveva dentro la regola che serve a scoprirlo. I senior veri erano centoventi.
//
// LA MALATTIA, che è già censita in casa come `perimetro-dedotto-non-misurato`: un controllo che
// sceglie a mano dove guardare nasce già vecchio, perché la prossima volta che qualcuno scrive un
// numero lo scrive in un file nuovo. Curare l'istanza (aggiungere due righe all'elenco) lascia in
// piedi il modo in cui si è rotta. Qui il perimetro lo dà il repo: si guarda TUTTO ciò che può
// pilotare il lavoro, e le esclusioni sono poche e dichiarate.
//
// COSA RESTA FUORI, e perché non è una scappatoia. La STORIA non si riscrive: un briefing di luglio
// che diceva «quarantadue» era vero quel giorno, e correggerlo sarebbe falsificare un verbale. Vale la
// stessa regola della fonte unica dei fatti (AR-102): i file VIVI si allineano, la storia è esente.
//
// USO: importato da `cervello/agent-registry-check.mjs`. Da solo non fa niente.

/** Un numero seguito da «agenti» o «senior»: la forma in cui questa casa dichiara quanti siamo. */
export const RE_CONTEGGIO = /(\d{2,4})\s+(?:agenti|senior)\b/gi;

/**
 * I posti dove un conteggio vale come DICHIARAZIONE, cioè può pilotare il lavoro di qualcuno.
 * Si tiene per prefisso e per estensione, non per elenco di file.
 */
export const DENTRO = [
  { prefisso: "", estensioni: [".md"], soloRadice: true }, // CLAUDE.md, COMANDI.md, README.md…
  { prefisso: "cervello/", estensioni: [".md", ".mjs", ".js"] },
  { prefisso: ".claude/", estensioni: [".md", ".js", ".mjs"] },
  { prefisso: "MyCity-Vault/07-Agenti/", estensioni: [".md"] },
];

/**
 * La storia, che NON si riscrive — e le copie di lavoro che non pilotano nessuno.
 * Ogni voce ha il suo perché: un'esclusione senza motivo è un buco travestito da scelta.
 */
export const FUORI = [
  { prefisso: "MyCity-Vault/90-Memoria-AI/Briefing/", perche: "verbali di giornata: erano veri quel giorno" },
  { prefisso: "MyCity-Vault/90-Memoria-AI/DECISIONI.md", perche: "registro append-only: le righe vecchie non si riscrivono" },
  { prefisso: "MyCity-Vault/90-Memoria-AI/SALA-OPERATIVA.md", perche: "canale di lavoro, non una dichiarazione" },
  { prefisso: "MyCity-Vault/90-Memoria-AI/auto-coscienza/", perche: "referti generati: fotografano un momento passato" },
  { prefisso: "memoria-squadra/", perche: "quaderni dei reparti: storia degli esiti" },
  { prefisso: "marketplace/", perche: "copia in sola lettura di un altro repo" },
  { prefisso: "node_modules/", perche: "dipendenze di terzi" },
  { prefisso: "consegne/", perche: "consegne datate: valgono per il giorno in cui sono uscite" },
];

/** Il file sta in un posto dove un conteggio è una dichiarazione viva? Pura: una prova la può girare. */
export function nelPerimetro(percorso) {
  const p = String(percorso || "").replace(/\\/g, "/");
  if (!p) return false;
  if (FUORI.some((f) => p.startsWith(f.prefisso))) return false;
  return DENTRO.some((d) => {
    if (!p.startsWith(d.prefisso)) return false;
    const resto = p.slice(d.prefisso.length);
    if (d.soloRadice && resto.includes("/")) return false;
    return d.estensioni.some((e) => p.endsWith(e));
  });
}

/**
 * Il perimetro vero, derivato dall'elenco dei file del repo.
 * Riceve l'elenco invece di andarselo a prendere: così la stessa funzione gira su un repo finto.
 */
export function perimetroDaRepo(elencoFile) {
  return (elencoFile || []).map((p) => String(p).replace(/\\/g, "/")).filter(nelPerimetro).sort();
}

/**
 * I conteggi dichiarati in un testo.
 *
 * TOLLERANZA, ereditata dal guardiano e tenuta qui in un posto solo: si accetta il numero reale e il
 * reale+1. Il +1 non è indulgenza — l'agente `ad` a volte è contato e a volte no, ed è una differenza
 * di conteggio legittima, non un numero vecchio.
 */
export function conteggiDi(file, testo, nReali) {
  const t = String(testo || "");
  const fuori = [];
  for (const m of t.matchAll(RE_CONTEGGIO)) {
    const n = Number(m[1]);
    if (n === nReali || n === nReali + 1) continue;
    if (eParziale(t, m.index + m[0].length)) continue;
    fuori.push({ file, dichiarato: n, reali: nReali });
  }
  return fuori;
}

/**
 * Il numero appena letto è un SOTTOINSIEME dichiarato, non una dichiarazione di quanti siamo?
 *
 * PERCHÉ SERVE, e perché senza questo il guardiano nasceva inutile. Il 16/8, appena allargato il
 * perimetro, sono usciti trentaquattro rossi, e la maggior parte erano frasi giuste: un sottoinsieme col suo
 * denominatore («settantatre su centoventi non hanno mai consegnato») e una scomposizione
 * («ventisei: tredici revisori piu tredici verificatori»). Quelle non sono affermazioni
 * vecchie sul roster: sono conti di un pezzo, scritti bene. Una guardia che le chiama errori si
 * impara a scorrere in due giorni, e allora tanto vale non averla — è la regola di taratura che
 * questa casa applica a ogni freno.
 *
 * DUE SEGNI, tutti e due espliciti nel testo, nessuno indovinato:
 *   · «su N» subito dopo — chi scrive sta già dicendo che è una parte di un tutto.
 *   · i due punti con una scomposizione — «ventisei: tredici piu tredici» è un totale di quel gruppo, non del roster.
 *
 * Quello che NON faccio è indovinare dagli aggettivi: «divergenti», «mai usati», «in turno» sono
 * infiniti e la lista invecchierebbe come l'elenco di file che questo modulo è nato per togliere.
 */
export function eParziale(testo, da) {
  const coda = String(testo).slice(da, da + 40);
  if (/^\s*su\s+\d+/i.test(coda)) return true;
  if (/^\s*:\s*\d+\s*[a-zà-ù]+\s*\+/i.test(coda)) return true;
  return false;
}

/** Tutti i conteggi vecchi, su una mappa percorso→testo già letta. */
export function conteggiSbagliati(testiPerFile, nReali) {
  const fuori = [];
  for (const [file, testo] of Object.entries(testiPerFile || {})) {
    fuori.push(...conteggiDi(file, testo, nReali));
  }
  return fuori;
}
