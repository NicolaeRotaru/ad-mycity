#!/usr/bin/env node
// Dal link Google Maps alla proposta (26/11/2026) — cervello/da-link-maps.mjs.
//
// COSA PROVA, su due schede Google finte costruite qui (nessun dato vero di persone):
//   ① una scheda vuota (niente orari né telefono, sito = Facebook, non rivendicata, copertina Street View)
//     si legge così com'è: niente valori inventati, e il consiglio è il Base (nessun sito vero);
//   ② una scheda piena: telefono, orari ordinati da lunedì, sito proprio → consiglio Business;
//   ③ dei recensori non esce niente: né il nome né il link al profilo, in nessuno dei due file;
//   ④ il dati.json della versione lampo passa i controlli di scheda-cliente.mjs (prezzi del registro,
//     piano con i contenuti e i video della fascia, frasi su misura che non promettono troppo);
//   ⑤ quando la scheda non ha orari o telefono, la bozza del sito non se li inventa.
//
// NON-VACUITÀ: se `estrai` leggesse il nome del recensore (g(x, 0, 1, 4, 5, 0)) il caso ③ diventa ROSSO;
// se il piano prendesse un video in più, il controllo ④ di scheda-cliente.mjs diventa ROSSO.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import { estrai, lampo, scegliCartella } from '../da-link-maps.mjs';
import { controlla, canoniDalRegistro, pagamentoDalRegistro } from '../scheda-cliente.mjs';

const RADICE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const registro = JSON.parse(fs.readFileSync(path.join(RADICE, 'MyCity-Vault/90-Memoria-AI/registro-fatti.json'), 'utf8'));
const canoni = canoniDalRegistro(registro);
const pagamento = pagamentoDalRegistro(registro);

function metti(o, p, v) {
  let a = o;
  p.slice(0, -1).forEach((k, i) => { a[k] ??= typeof p[i + 1] === 'number' ? [] : {}; a = a[k]; });
  a[p.at(-1)] = v;
  return o;
}
function recensione(voto, quando, testo) {
  const x = [];
  metti(x, [0, 1, 4, 5, 0], 'Mario Recensore');
  metti(x, [0, 1, 4, 2, 0], 'https://www.google.com/maps/contrib/123456789?hl=it');
  metti(x, [0, 1, 6], quando);
  metti(x, [0, 2, 0, 0], voto);
  if (testo) metti(x, [0, 2, 15, 0, 0], testo);
  return x;
}
function scheda({ piena }) {
  const r = [];
  metti(r, [11], piena ? 'Forno Prova' : 'Bar Prova');
  metti(r, [13], piena ? ['Panetteria', 'Pasticceria'] : ['Bar']);
  metti(r, [2], ['Via Esempio, 1', '29121 Piacenza PC', 'Italia']);
  metti(r, [39], 'Via Esempio, 1, 29121 Piacenza PC, Italia');
  metti(r, [183, 1, 3], 'Piacenza');
  metti(r, [4, 7], piena ? 4.6 : 5);
  metti(r, [4, 8], piena ? 120 : 2);
  metti(r, [4, 3, 0], 'https://search.google.com/local/reviews?placeid=ChIJprova123&q=x');
  metti(r, [175, 9, 0, 0], piena
    ? [recensione(5, '2 mesi fa', 'Pane buonissimo e personale gentile.'), recensione(2, 'un anno fa', 'Attesa lunga al banco.')]
    : [recensione(5, 'un anno fa', 'Titolare gentilissima.'), recensione(5, '8 mesi fa', null)]);
  if (piena) {
    metti(r, [7, 0], 'https://www.fornoprova.it/');
    metti(r, [178, 0, 1, 0, 0], '0523 000000');
    metti(r, [203, 0], [['mercoledì', 3, null, [['07–19']]], ['lunedì', 1, null, [['Chiuso']]], ['martedì', 2, null, [['07–19']]]]);
    metti(r, [154, 0, 0], 'Pane e dolci fatti da noi ogni mattina.');
    metti(r, [37, 0, 0, 6, 0], 'https://lh3.googleusercontent.com/grass-cs/foto');
  } else {
    metti(r, [7, 0], 'https://m.facebook.com/BarProva/');
    metti(r, [49, 1], 'Rivendica questa attività');
    metti(r, [37, 0, 0, 6, 0], 'https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=x');
  }
  return r;
}

test('① la scheda vuota si legge com\'è e porta al Base', () => {
  const x = estrai(scheda({ piena: false }));
  assert.equal(x.nome, 'Bar Prova');
  assert.equal(x.telefono, null);
  assert.deepEqual(x.orari, []);
  assert.equal(x.sito_tipo, 'social');
  assert.equal(x.non_rivendicata, true);
  assert.equal(x.copertina_street_view, true);
  assert.equal(x.recensioni_n, 2);
  assert.equal(lampo(x, 'https://maps.app.goo.gl/prova').consigliato, 'base');
});

test('② la scheda piena: telefono, orari da lunedì, sito proprio → Business', () => {
  const x = estrai(scheda({ piena: true }));
  assert.equal(x.telefono, '0523 000000');
  assert.deepEqual(x.orari.map((d) => d.giorno), ['lunedì', 'martedì', 'mercoledì']);
  assert.equal(x.sito_tipo, 'proprio');
  assert.equal(x.non_rivendicata, false);
  assert.equal(x.place_id, 'ChIJprova123');
  assert.equal(lampo(x, 'https://maps.app.goo.gl/prova').consigliato, 'business');
});

test('③ dei recensori non esce né il nome né il profilo', () => {
  for (const piena of [false, true]) {
    const x = estrai(scheda({ piena }));
    const testo = JSON.stringify(x) + JSON.stringify(lampo(x, 'https://maps.app.goo.gl/prova'));
    assert.ok(!testo.includes('Mario Recensore'), 'nome del recensore');
    assert.ok(!testo.includes('/maps/contrib/'), 'profilo del recensore');
  }
});

test('④ la versione lampo passa i controlli della proposta, con la fascia giusta', () => {
  for (const [piena, post, video] of [[false, 8, 0], [true, 12, 2]]) {
    const d = lampo(estrai(scheda({ piena })), 'https://maps.app.goo.gl/prova');
    assert.deepEqual(controlla(d, canoni, pagamento), [], `controlli (${piena ? 'piena' : 'vuota'})`);
    assert.equal(d.proposta.piano.righe.length, post);
    assert.equal(d.proposta.piano.righe.filter((r) => /reel|video/i.test(r.formato)).length, video);
  }
});

test('⑥ un locale che Google segna CHIUSO si riconosce, e le recensioni vecchie fanno scattare l\'avviso', () => {
  const r = scheda({ piena: true });
  metti(r, [88, 0], 'CHIUSO');
  assert.equal(estrai(r).chiusa, 'definitivamente');
  assert.equal(estrai(scheda({ piena: true })).chiusa, null);
  const vecchia = scheda({ piena: false });
  metti(vecchia, [175, 9, 0, 0], [recensione(5, '12 anni fa', 'Ottimo.'), recensione(4, '10 anni fa', 'Buono.')]);
  metti(vecchia, [4, 8], 40);
  const d = lampo(estrai(vecchia), 'https://maps.app.goo.gl/prova');
  assert.ok(d.attenzione.some((a) => /circa 10 anni fa/.test(a)), 'avviso recensioni vecchie');
});

test('⑦ la cartella si sceglie dal codice del luogo Google, mai dal nome', () => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'clienti-'));
  const x = estrai(scheda({ piena: true }));
  // una cartella che finisce col suo nome ma è di un altro luogo: non va toccata
  fs.mkdirSync(path.join(base, '2026-11-01-forno-prova'));
  fs.writeFileSync(path.join(base, '2026-11-01-forno-prova', 'google.json'), JSON.stringify({ place_id: 'ChIJaltro' }));
  fs.mkdirSync(path.join(base, '2026-11-26-forno-prova'));
  assert.equal(path.basename(scegliCartella(base, x, '2026-11-26')), '2026-11-26-forno-prova-2');
  // la stessa attività letta di nuovo torna nella sua cartella
  fs.mkdirSync(path.join(base, '2026-11-20-forno'));
  fs.writeFileSync(path.join(base, '2026-11-20-forno', 'google.json'), JSON.stringify({ place_id: 'ChIJprova123' }));
  assert.equal(path.basename(scegliCartella(base, x, '2026-11-26')), '2026-11-20-forno');
});

test('⑧ il piano non pubblica a Natale e Santo Stefano', () => {
  for (const piena of [false, true]) {
    const d = lampo(estrai(scheda({ piena })), 'https://maps.app.goo.gl/prova', new Date('2026-11-26T12:00:00Z'));
    const date = d.proposta.piano.righe.map((r) => r.data);
    assert.ok(!date.some((x) => / (25|26)\/12$/.test(x)), date.join(', '));
  }
});

test('⑨ un prezzo nel sopratitolo della bozza ferma la proposta', () => {
  const d = lampo(estrai(scheda({ piena: false })), 'https://maps.app.goo.gl/prova');
  d.sito_bozza.sopra_titolo = 'Pizza a 5 €';
  assert.ok(controlla(d, canoni, pagamento).some((e) => /prezzo/.test(e)));
});

test('⑤ senza orari né telefono, la bozza del sito non li inventa', () => {
  const d = lampo(estrai(scheda({ piena: false })), 'https://maps.app.goo.gl/prova');
  assert.equal(d.sito_bozza.contatti.telefono, null);
  assert.match(d.sito_bozza.orari, /da confermare/);
  assert.equal(d.campi.find((c) => c.voce === 'Orari').stato, 'non_trovato');
  assert.equal(d.campi.find((c) => /Telefono/.test(c.voce)).stato, 'non_trovato');
});
