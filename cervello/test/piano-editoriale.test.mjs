#!/usr/bin/env node
// IL PIANO EDITORIALE PER ABBONAMENTO — la prova del programma (26/11/2026).
//
// Cosa deve reggere: un piano che promette 12 contenuti e ne ha 11 non deve passare; un testo con una
// parola che il cliente ha vietato, o un prezzo che nel menu non c'è, non deve passare; un reel nel giorno
// di chiusura non deve passare; due righe con lo stesso id del Calendario non devono nascere.
//
// NON-VACUITÀ: ogni caso parte dal piano vero del Tropico, che passa (caso ①), e lo rompe in un punto
// solo. Se il controllo corrispondente sparisse da cervello/piano-editoriale.mjs, il suo caso diventa rosso.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { FASCE, controlla, espandi, righeCalendario, sereAperte } from '../piano-editoriale.mjs';

const QUI = dirname(fileURLToPath(import.meta.url));
const modello = JSON.parse(readFileSync(join(QUI, '..', 'modelli', 'piano-editoriale-fasce.json'), 'utf8'));
const vero = () => JSON.parse(readFileSync(join(QUI, '..', '..', 'consegne', 'clienti', 'tropico-latino', 'piano-editoriale-2026-12.json'), 'utf8'));
const errori = (piano, fascia) => controlla(piano, modello, fascia).errori;

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); } catch (e) { casi.push({ nome, ok: false, e }); }
};

prova('① il piano vero del Tropico passa in tutte e tre le fasce', () => {
  for (const f of FASCE) assert.deepEqual(errori(vero(), f), [], f);
});

prova('② un contenuto del Base in meno rompe tutte e tre le fasce (matrioska)', () => {
  const p = vero();
  p.contenuti = p.contenuti.filter((c) => c.id !== 'b04');
  for (const f of FASCE) assert.ok(errori(p, f).some((e) => e.includes('feed')), f);
});

prova('③ un contenuto del Premium in più rompe solo il Premium', () => {
  const p = vero();
  p.contenuti.push({ id: 'x1', fascia: 'premium', data: '2026-12-02', ora: '18:30', tipo: 'post', pilastro: 'P1', titolo: 'Prova', idea: 'Prova', materiale: 'foto' });
  assert.deepEqual(errori(p, 'base'), []);
  assert.deepEqual(errori(p, 'business'), []);
  assert.ok(errori(p, 'premium').some((e) => e.includes('feed 21')));
});

prova('④ una parola vietata dal tono del cliente non passa', () => {
  const p = vero();
  p.contenuti.find((c) => c.id === 'b01').idea += ' Il gusto autentico del Messico.';
  assert.ok(errori(p, 'base').some((e) => e.includes('autentic')));
});

prova('⑤ un prezzo che nel menu non c’è non passa, nei testi del pubblico', () => {
  const p = vero();
  p.contenuti.find((c) => c.id === 'b04').idea = 'Il Negroni mexicano a 7,90 €.';
  assert.ok(errori(p, 'base').some((e) => e.includes('7,90')));
});

prova('⑥ un reel il lunedì (giorno di chiusura) non passa', () => {
  const p = vero();
  p.contenuti.find((c) => c.id === 'b03').data = '2026-12-14';
  assert.ok(errori(p, 'base').some((e) => e.includes('giorno di chiusura')));
});

prova('⑦ nel Premium c’è una storia per ogni sera di apertura, e il conto vede i buchi', () => {
  const p = vero();
  const storie = espandi(p, modello, 'premium').filter((c) => c.tipo === 'storia');
  assert.equal(storie.length, sereAperte(p).length);
  assert.deepEqual([...new Set(storie.map((s) => s.data))].sort(), sereAperte(p));
  delete p.rubriche_storie.giorni['2'];
  assert.ok(errori(p, 'premium').some((e) => e.includes('storie')));
});

prova('⑧ le righe del Calendario non riusano gli id delle righe che ci sono già', () => {
  const p = vero();
  const righe = righeCalendario(p, modello, 'premium');
  assert.ok(righe.length > 0);
  assert.equal(new Set(righe.map((r) => r.id)).size, righe.length);
  // tropico-latino-20261211-1830 è il carosello già pubblicato il 26/11: la riga nuova dell'11/12 alle 18:30 non deve avere quell'id.
  assert.ok(!righe.some((r) => r.id === 'tropico-latino-20261211-1830'));
  assert.ok(righe.every((r) => r.stato === 'idea'));
  // La prova sul Tropico misura per strato: ogni riga deve dire da quale fascia viene.
  assert.ok(righe.every((r) => /strato (base|business|premium)/.test(r.note)));
  assert.ok(righe.some((r) => r.note.includes('strato base')) && righe.some((r) => r.note.includes('strato premium')));
  assert.ok(!righe.some((r) => r.id.includes('-pe-b02')), 'le righe che esistono già non si riscrivono');
});

prova('⑨ due contenuti social alla stessa ora dello stesso giorno non passano', () => {
  const p = vero();
  p.contenuti.find((c) => c.id === 's01').ora = '19:00';
  assert.ok(errori(p, 'business').some((e) => e.includes('stessa ora')));
});

prova('⑩ un contenuto del feed che aspetta un sì del titolare senza riserva non passa', () => {
  const p = vero();
  delete p.contenuti.find((c) => c.id === 'p05').riserva;
  assert.ok(errori(p, 'premium').some((e) => e.includes('riserva')));
  assert.deepEqual(errori(p, 'business'), [], 'p05 è del Premium: il Business non cambia');
});

const rossi = casi.filter((c) => !c.ok);
for (const c of casi) console.log(`${c.ok ? 'ok ' : 'NO '} ${c.nome}${c.ok ? '' : `\n     ${c.e.message}`}`);
console.log(`\n${casi.length - rossi.length}/${casi.length} casi verdi`);
process.exit(rossi.length ? 1 : 0);
