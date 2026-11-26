#!/usr/bin/env node
// La scheda del cliente dalla foto (26/11/2026) — i quattro controlli di cervello/scheda-cliente.mjs.
//
// COSA PROVA, sui dati veri di Ora del Gusto e La Ragazzetta e su loro copie rotte apposta:
//   ① un dato senza fonte https (e non «non_trovato») ferma tutto: niente cifre orfane nella scheda;
//   ② un prezzo nella bozza del sito ferma tutto (gli orari «7.30-22.30» invece passano);
//   ③ se il registro dei fatti cambia un canone e il programma no, si ferma: niente preventivi vecchi;
//   ④ il piano editoriale deve avere i contenuti e i video promessi dall'abbonamento consigliato;
//   ⑤ le pagine escono con quello che il venditore e il cliente devono vedere;
//   ⑥ i dati presi dal web non possono mettere codice nelle pagine (link javascript:, colori o caratteri
//     che chiudono il blocco <style>);
//   ⑦ (26/11, la proposta prima del preventivo) la proposta ha i prezzi, spiega cosa cambia con ogni
//     abbonamento con una frase su misura per ognuno, dice come si paga leggendolo dal registro, e il
//     programma scrive proposta.html e non più preventivo.html;
//   ⑧ dopo il sì, --iscrizione dà al flusso 20 solo dati pubblici dell'attività, mai siti non confermati.
//
// NON-VACUITÀ (provata rompendo il programma apposta): togliendo la riga del controllo ①
// («un dato … vuole la fonte https») il caso ① diventa ROSSO; togliendo il confronto col registro il
// caso ③ diventa ROSSO.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import { controlla, canoniDalRegistro, pagamentoDalRegistro, datiIscrizione, haPrezzo, paginaScheda, paginaProposta, paginaSito } from '../scheda-cliente.mjs';

const RADICE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const leggi = (p) => JSON.parse(fs.readFileSync(path.join(RADICE, p), 'utf8'));
const REGISTRO = leggi('MyCity-Vault/90-Memoria-AI/registro-fatti.json');
const CANONI = canoniDalRegistro(REGISTRO);
const PAGAMENTO = pagamentoDalRegistro(REGISTRO);
const CLIENTI = ['consegne/clienti/2026-11-26-ora-del-gusto/dati.json', 'consegne/clienti/2026-11-26-la-ragazzetta/dati.json'];
const copia = (o) => JSON.parse(JSON.stringify(o));

test('i dati veri dei due locali passano tutti i controlli', () => {
  assert.deepEqual(CANONI, { base: 30000, business: 50000, premium: 99900 });
  for (const f of CLIENTI) assert.deepEqual(controlla(leggi(f), CANONI, PAGAMENTO), [], f);
});

test('① un dato «da confermare» senza fonte ferma la scheda', () => {
  const d = copia(leggi(CLIENTI[0]));
  d.campi.find((c) => c.voce === 'Telefono del bar').fonte = null;
  assert.ok(controlla(d, CANONI, PAGAMENTO).some((e) => e.includes('Telefono del bar') && e.includes('fonte')));
  const n = copia(leggi(CLIENTI[0]));
  n.campi.push({ voce: 'Fax', valore: null, stato: 'non_trovato', fonte: null });
  assert.deepEqual(controlla(n, CANONI, PAGAMENTO), [], '«non_trovato» senza fonte è onesto, e passa');
  const f = copia(leggi(CLIENTI[0]));
  f.campi.push({ voce: 'Insegna', valore: 'Ora del Gusto', stato: 'confermato', fonte: 'foto' });
  assert.deepEqual(controlla(f, CANONI, PAGAMENTO), [], 'quello che il venditore legge sulla sua foto vale come fonte');
  assert.match(paginaScheda(f), /foto del venditore/);
});

test('② un prezzo nella bozza del sito la ferma, un orario no', () => {
  assert.equal(haPrezzo('Bar: dal lunedì al sabato, 7.30-22.30'), false);
  assert.equal(haPrezzo('Cappuccino e brioche a 2,50'), true);
  assert.equal(haPrezzo('Menu degustazione 35 €'), true);
  const d = copia(leggi(CLIENTI[1]));
  d.sito_bozza.cosa_offriamo[0].testo = 'Colazione completa a 4 euro.';
  assert.ok(controlla(d, CANONI, PAGAMENTO).some((e) => e.startsWith('bozza del sito')));
});

test('③ un canone cambiato nel registro e non nel programma ferma il preventivo', () => {
  const r = copia(REGISTRO);
  const fatti = r.fatti ?? r;
  const voce = Array.isArray(fatti) ? fatti.find((f) => f.id === 'sdg.abbonamenti') : fatti['sdg.abbonamenti'];
  voce.valore = voce.valore.replace('Business 500 euro', 'Business 550 euro');
  const errori = controlla(leggi(CLIENTI[0]), canoniDalRegistro(r), PAGAMENTO);
  assert.ok(errori.some((e) => e.startsWith('canone Business')), errori.join(' | '));
  assert.ok(controlla(leggi(CLIENTI[0]), null, PAGAMENTO).some((e) => e.startsWith('registro dei fatti')));
});

test('④ il piano editoriale mantiene la promessa dell’abbonamento consigliato', () => {
  const d = copia(leggi(CLIENTI[0]));
  d.proposta.piano.righe.pop();
  assert.ok(controlla(d, CANONI, PAGAMENTO).some((e) => e.includes('11 contenuti')));
  const v = copia(leggi(CLIENTI[0]));
  v.proposta.piano.righe[2].formato = 'Reel';
  assert.ok(controlla(v, CANONI, PAGAMENTO).some((e) => e.includes('3 video')));
  const p = copia(leggi(CLIENTI[0]));
  p.consigliato = 'premium';
  assert.ok(controlla(p, CANONI, PAGAMENTO).some((e) => e.includes('il Premium ne promette 20')));
});

test('⑥ i dati presi dal web non possono iniettare codice nelle pagine', () => {
  const d = copia(leggi(CLIENTI[0]));
  d.fonti.push({ titolo: 'trappola', url: 'javascript:alert(1)' });
  d.sito_bozza.palette.accento = 'red}</style><script>alert(1)</script>';
  d.sito_bozza.font.titoli = 'X"><script>';
  const e = controlla(d, CANONI, PAGAMENTO);
  assert.ok(e.some((x) => x.startsWith('fonte «trappola»')), e.join(' | '));
  assert.ok(e.some((x) => x.includes('colore «accento»')));
  assert.ok(e.some((x) => x.includes('carattere «titoli»')));
  const n = copia(leggi(CLIENTI[0]));
  n.campi.push({ voce: 'Link strano', valore: null, stato: 'non_trovato', fonte: 'javascript:alert(1)' });
  n.fonti.push({ titolo: 'trappola', url: 'javascript:alert(1)' });
  assert.doesNotMatch(paginaScheda(n), /javascript:/, 'nessun link che non sia https');
});

test('⑤ le pagine dicono quello che serve, e la scheda resta interna', () => {
  const d = leggi(CLIENTI[1]);
  const scheda = paginaScheda(d);
  assert.match(scheda, /Scheda interna per il venditore/);
  assert.match(scheda, /Cosa ha, cosa non ha, cosa va migliorato/);
  assert.match(scheda, /Domande da fare al titolare/);
  const prev = paginaProposta(d, PAGAMENTO);
  assert.doesNotMatch(prev, /Scheda interna/, 'la proposta per il cliente non porta le note interne');
  assert.match(prev, /500 €<\/b> al mese/);
  assert.match(prev, /Il primo mese 250 €/);
  // Il 10% sui prodotti venduti tramite MyCity resta anche con l'abbonamento (pricing.commissione, 26/11).
  assert.match(prev, /sui prodotti venduti tramite MyCity resta il 10%/);
  assert.doesNotMatch(prev, /[Nn]essuna percentuale su quello che vendi/);
  assert.equal((prev.match(/<td class="quando">/g) ?? []).length, 12);
  assert.match(prev, /<iframe[^>]+srcdoc=/);
  const sito = paginaSito(d);
  assert.match(sito, /^<!doctype html>/);
  assert.match(sito, /anteprima non pubblicata/);
  assert.match(sito, /"@type":"Restaurant"/);
});

test('⑦ la proposta: prezzi, cosa cambia con ogni abbonamento, come si paga; il preventivo dopo il sì', () => {
  assert.match(PAGAMENTO ?? '', /contanti/, 'il registro dice che per ora si paga in contanti (sdg.pagamento, 26/11)');
  const d = leggi(CLIENTI[0]);
  const html = paginaProposta(d, PAGAMENTO);
  assert.match(html, /<h2>Cosa cambia con ogni abbonamento<\/h2>/);
  for (const id of ['base', 'business', 'premium']) {
    const frase = d.proposta.su_misura[id].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    assert.ok(html.includes(frase), `la frase su misura del ${id} è nella proposta`);
  }
  assert.match(html, /<th scope="col" class="scelta">Business · consigliato<\/th>/, 'la colonna del consigliato si vede');
  assert.match(html, /300 €<\/b> al mese/);
  assert.match(html, /999 €<\/b> al mese/);
  assert.ok(html.includes(PAGAMENTO.replace(/&/g, '&amp;')), 'come si paga, preso dal registro');
  assert.match(html, /vi mandiamo il preventivo con un link/);
  // Rotture apposta: manca una frase, due frasi uguali, il registro senza sdg.pagamento.
  const a = copia(d); delete a.proposta.su_misura.premium;
  assert.ok(controlla(a, CANONI, PAGAMENTO).some((e) => e.includes('col Premium')));
  const b = copia(d); b.proposta.su_misura.base = b.proposta.su_misura.business;
  assert.ok(controlla(b, CANONI, PAGAMENTO).some((e) => e.includes('la stessa frase')));
  const r = copia(REGISTRO); r.fatti = r.fatti.filter((f) => f.id !== 'sdg.pagamento');
  assert.equal(pagamentoDalRegistro(r), null);
  assert.ok(controlla(d, CANONI, pagamentoDalRegistro(r)).some((e) => e.includes('sdg.pagamento')));
  // Il programma vero scrive proposta.html e non preventivo.html.
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'proposta-'));
  fs.copyFileSync(path.join(RADICE, CLIENTI[1]), path.join(tmp, 'dati.json'));
  const uscita = execFileSync(process.execPath, [path.join(RADICE, 'cervello', 'scheda-cliente.mjs'), tmp], { encoding: 'utf8' });
  assert.match(uscita, /scheda, proposta e bozza del sito/);
  assert.deepEqual(fs.readdirSync(tmp).sort(), ['bozza-sito.html', 'dati.json', 'proposta.html', 'scheda.html']);
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('⑧ dopo il sì: i dati per il flusso 20 sono solo quelli pubblici, mai un sito non confermato', () => {
  const d = leggi(CLIENTI[0]);
  const x = datiIscrizione(d);
  assert.deepEqual(Object.keys(x).sort(), ['citta', 'indirizzo', 'nome', 'tipo']);
  assert.equal(x.nome, 'Ora del Gusto');
  assert.equal(x.sito, undefined, 'i tre siti di Ora del Gusto sono «da confermare»: non partono');
  const c = copia(d);
  c.campi.push({ voce: 'Sito ufficiale', valore: 'oradelgusto.it', stato: 'confermato', fonte: 'https://oradelgusto.it' });
  assert.equal(datiIscrizione(c).sito, 'https://oradelgusto.it');
  const n = copia(leggi(CLIENTI[1]));
  n.campi.find((k) => k.voce === 'Indirizzo').stato = 'non_trovato';
  assert.equal(datiIscrizione(n).indirizzo, undefined, 'un indirizzo non trovato non parte');
});
