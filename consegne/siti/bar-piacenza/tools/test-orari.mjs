// Prove delle funzioni pure di app.js con date simulate. Uso: node tools/test-orari.mjs
// Esce con codice 1 se una prova fallisce. Non serve nessuna dipendenza.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const ctx = { Intl, Date, Math, JSON, String, Number, Object, Array, console };
ctx.window = ctx;
vm.createContext(ctx);
for (const f of ['site-data.js', 'app.js']) vm.runInContext(fs.readFileSync(path.join(dir, '../assets/js', f), 'utf8'), ctx, { filename: f });
const { orari: O, util: U, data: DATI } = ctx.BP;

let ok = 0, ko = 0;
function prova(nome, reale, atteso) {
  const r = JSON.stringify(reale), a = JSON.stringify(atteso);
  if (r === a) { ok++; console.log('  ✓ ' + nome); }
  else { ko++; console.log('  ✗ ' + nome + '\n      atteso: ' + a + '\n      reale:  ' + r); }
}
const frase = (istante, orari) => O.testoStato(O.stato(new Date(istante), orari)).frase;
const tipo = (istante, orari) => O.testoStato(O.stato(new Date(istante), orari)).tipo;

const tipico = DATI.orari; // lun–ven 6:30–20:00, sab 7:00–23:00, dom chiuso + eccezioni e ferie
const spezzato = { fuso: 'Europe/Rome', settimana: { 1: [['07:00', '14:30'], ['17:00', '22:00']], 2: [['07:00', '14:30'], ['17:00', '22:00']], 3: [], 4: [], 5: [], 6: [], 0: [] } };
const notturno = { fuso: 'Europe/Rome', settimana: { 1: [], 2: [], 3: [], 4: [], 5: [['18:00', '02:00']], 6: [['18:00', '24:00']], 0: [['00:00', '01:00']] } };

console.log('Stato aperto/chiuso — orario tipico (sabato 14/11/2026 è sabato)');
prova('lunedì 10:00 → aperto', frase('2026-11-16T10:00:00+01:00', tipico), 'Aperto ora, chiude alle 20:00');
prova('lunedì 19:45 → chiude tra 15 minuti', frase('2026-11-16T19:45:00+01:00', tipico), 'Aperto ora, chiude tra 15 minuti');
prova('lunedì 19:45 → tipo presto', tipo('2026-11-16T19:45:00+01:00', tipico), 'presto');
prova('lunedì 20:00 in punto → chiuso, apre domani', frase('2026-11-16T20:00:00+01:00', tipico), 'Chiuso, apre domani alle 6:30');
prova('venerdì 21:00 → apre domani alle 7:00 (sabato)', frase('2026-11-20T21:00:00+01:00', tipico), 'Chiuso, apre domani alle 7:00');
prova('sabato 23:30 → domenica chiuso, apre lunedì', frase('2026-11-21T23:30:00+01:00', tipico), 'Chiuso, apre lunedì alle 6:30');
prova('domenica 12:00 (giorno di chiusura) → apre domani', frase('2026-11-22T12:00:00+01:00', tipico), 'Chiuso, apre domani alle 6:30');
prova('lunedì 6:10 → apre tra 20 minuti', frase('2026-11-16T06:10:00+01:00', tipico), 'Apre tra 20 minuti, alle 6:30');
prova('lunedì 5:29 → più di un\'ora: chiuso, apre alle 6:30', frase('2026-11-16T05:29:00+01:00', tipico), 'Chiuso, apre alle 6:30');
prova('lunedì 6:29 → apre tra 1 minuto (singolare)', frase('2026-11-16T06:29:00+01:00', tipico), 'Apre tra 1 minuto, alle 6:30');
prova('fuso del visitatore ignorato: 09:00Z = 10:00 a Roma', frase('2026-11-16T09:00:00Z', tipico), 'Aperto ora, chiude alle 20:00');

console.log('Orario spezzato (7:00–14:30, 17:00–22:00)');
prova('lunedì 12:00 → chiude alle 14:30', frase('2026-11-16T12:00:00+01:00', spezzato), 'Aperto ora, chiude alle 14:30');
prova('lunedì 15:00 → chiuso, riapre alle 17:00', frase('2026-11-16T15:00:00+01:00', spezzato), 'Chiuso, apre alle 17:00');
prova('lunedì 16:30 → apre tra 30 minuti', frase('2026-11-16T16:30:00+01:00', spezzato), 'Apre tra 30 minuti, alle 17:00');
prova('martedì 22:00 → riapre il lunedì dopo (6 giorni)', frase('2026-11-17T22:00:00+01:00', spezzato), 'Chiuso, apre lunedì alle 7:00');

console.log('Dopo mezzanotte (ven 18–02, sab 18–24 + dom 00–01, contigui)');
prova('venerdì 23:00 → chiude alle 2:00', frase('2026-11-20T23:00:00+01:00', notturno), 'Aperto ora, chiude alle 2:00');
prova('sabato 01:00 → ancora aperto dalla sera prima', frase('2026-11-21T01:00:00+01:00', notturno), 'Aperto ora, chiude alle 2:00');
prova('sabato 02:00 → chiuso, apre alle 18:00', frase('2026-11-21T02:00:00+01:00', notturno), 'Chiuso, apre alle 18:00');
prova('sabato 21:00 → fasce unite oltre mezzanotte, chiude all\'1:00', frase('2026-11-21T21:00:00+01:00', notturno), 'Aperto ora, chiude alle 1:00');
prova('chiusura alle 24:00 → "a mezzanotte"', frase('2026-11-21T21:00:00+01:00', { ...notturno, settimana: { ...notturno.settimana, 0: [] } }), 'Aperto ora, chiude a mezzanotte');

console.log('Festività ed eccezioni');
prova('24/12 ore 10 → orario ridotto con nota', O.testoStato(O.stato(new Date('2026-12-24T10:00:00+01:00'), tipico)), { tipo: 'aperto', titolo: 'Aperto ora', dettaglio: 'chiude alle 15:00', nota: 'Oggi: Vigilia di Natale', frase: 'Aperto ora, chiude alle 15:00' });
prova('24/12 ore 16 → chiuso fino a lunedì 28', frase('2026-12-24T16:00:00+01:00', tipico), 'Chiuso, apre lunedì alle 6:30');
prova('25/12 (Natale, di venerdì) → chiuso', tipo('2026-12-25T11:00:00+01:00', tipico), 'chiuso');
prova('ferie 10/8/2027 → riapre dopo 13 giorni con la data', frase('2027-08-10T10:00:00+02:00', tipico), 'Chiuso, apre lunedì 23 agosto alle 6:30');
prova('ferie → la nota è quella delle ferie', O.stato(new Date('2027-08-10T10:00:00+02:00'), tipico).nota, 'Ferie estive');

console.log('Cambio dell\'ora (Europe/Rome)');
prova('29/3/2027 06:20 ora legale (04:20Z) → apre tra 10 minuti', frase('2027-03-29T04:20:00Z', tipico), 'Apre tra 10 minuti, alle 6:30');
prova('26/10/2026 06:20 ora solare (05:20Z) → apre tra 10 minuti', frase('2026-10-26T05:20:00Z', tipico), 'Apre tra 10 minuti, alle 6:30');

console.log('Sintesi orari e giorni speciali');
prova('sintesi raggruppata', O.sintesiOrari(tipico.settimana), ['Lun–ven 6:30–20:00', 'Sab 7:00–23:00', 'Dom chiuso']);
prova('sintesi orario spezzato', O.sintesiOrari(spezzato.settimana), ['Lun–mar 7:00–14:30, 17:00–22:00', 'Mer–dom chiuso']);
const oggi20Dic = Date.UTC(2026, 11, 20) / 864e5;
prova('giorni speciali nei prossimi 11 giorni (31/12 incluso)', O.speciali(oggi20Dic, 11, tipico).map(x => x.testo + ' = ' + x.orari), ['giovedì 24 dicembre, Vigilia di Natale = 7:00–15:00', 'venerdì 25 dicembre, Natale = chiuso', 'sabato 26 dicembre, Santo Stefano = chiuso', 'giovedì 31 dicembre, San Silvestro = 7:00–15:00']);

console.log('Eventi e calendario');
const ev = [{ titolo: 'Passato', inizio: '2026-11-10T19:00', fine: '2026-11-10T22:00' }, { titolo: 'Dopo', inizio: '2026-11-20T19:00' }, { titolo: 'Adesso', inizio: '2026-11-14T18:00', fine: '2026-11-14T21:00' }];
prova('eventi finiti nascosti, ordinati per data', U.eventiFuturi(ev, new Date('2026-11-14T19:00:00+01:00'), 'Europe/Rome').map(e => e.titolo), ['Adesso', 'Dopo']);
prova('evento senza fine dura 2 ore', U.eventiFuturi([{ titolo: 'X', inizio: '2026-11-14T17:30' }], new Date('2026-11-14T19:31:00+01:00'), 'Europe/Rome').length, 0);
prova('anteprima: date relative', U.risolviRelative([{ titolo: 'A', inizio: '+3T19:00', fine: '+3T22:00' }], new Date('2026-11-14T10:00:00+01:00'), 'Europe/Rome')[0].inizio, '2026-11-17T19:00');
const testoIcs = U.ics({ titolo: 'Jazz, vino; e altro', inizio: '2026-11-17T19:00', fine: '2026-11-17T22:00', testo: 'Riga uno\nRiga due' }, 'Bar Piacenza, Via XX Settembre 1, 29121 Piacenza PC', '20261114T120000Z');
prova('ics: righe con CRLF', testoIcs.split('\r\n').length > 20 && !/[^\r]\n/.test(testoIcs), true);
prova('ics: inizio nel fuso di Roma', testoIcs.includes('DTSTART;TZID=Europe/Rome:20261117T190000'), true);
prova('ics: virgole e punti e virgola protetti', testoIcs.includes('SUMMARY:Jazz\\, vino\\; e altro al Bar Piacenza'), true);
prova('ics: a capo nella descrizione', testoIcs.includes('DESCRIPTION:Riga uno\\nRiga due'), true);
prova('ics: nessuna riga oltre 75 byte', testoIcs.split('\r\n').every(r => Buffer.byteLength(r) <= 75), true);

console.log('Modulo di prenotazione');
const adesso = new Date('2026-11-16T10:00:00+01:00'); // lunedì
const base = { nome: 'Marco', giorno: '2026-11-21', ora: '19:00', persone: '4', note: '' };
prova('dati validi → nessun errore', U.validaPrenotazione(base, adesso, tipico), {});
prova('persone 0', U.validaPrenotazione({ ...base, persone: '0' }, adesso, tipico).persone, 'Scrivi un numero di persone tra 1 e 20.');
prova('persone 21', U.validaPrenotazione({ ...base, persone: '21' }, adesso, tipico).persone, 'Scrivi un numero di persone tra 1 e 20.');
prova('persone "due"', U.validaPrenotazione({ ...base, persone: 'due' }, adesso, tipico).persone, 'Scrivi un numero di persone tra 1 e 20.');
prova('domenica chiusi', U.validaPrenotazione({ ...base, giorno: '2026-11-22' }, adesso, tipico).giorno, 'Domenica 22 novembre siamo chiusi: scegli un altro giorno.');
prova('Natale chiusi con il motivo', U.validaPrenotazione({ ...base, giorno: '2026-12-25' }, adesso, tipico).giorno, 'Venerdì 25 dicembre siamo chiusi (Natale): scegli un altro giorno.');
prova('ora fuori orario', U.validaPrenotazione({ ...base, ora: '23:30' }, adesso, tipico).ora, 'A quell’ora siamo chiusi: sabato 21 novembre siamo aperti dalle 7:00 alle 23:00.');
prova('giorno passato', U.validaPrenotazione({ ...base, giorno: '2026-11-15' }, adesso, tipico).giorno, 'Scegli un giorno da oggi in poi.');
prova('oggi, ora già passata', U.validaPrenotazione({ ...base, giorno: '2026-11-16', ora: '09:00' }, adesso, tipico).ora, 'Quest’ora è già passata: scegli un orario più avanti.');
prova('nome vuoto', U.validaPrenotazione({ ...base, nome: ' ' }, adesso, tipico).nome, 'Scrivi il tuo nome.');
prova('note troppo lunghe', U.validaPrenotazione({ ...base, note: 'x'.repeat(301) }, adesso, tipico).note, 'Le note possono avere al massimo 300 caratteri.');
prova('messaggio WhatsApp', U.messaggioPrenotazione({ ...base, note: 'Un seggiolone' }, 'Bar Piacenza'), 'Ciao, vorrei prenotare un tavolo al Bar Piacenza.\nNome: Marco\nGiorno: sabato 21 novembre\nOra: 19:00\nPersone: 4\nNote: Un seggiolone');

console.log('Link');
const link = U.link(DATI.locale);
prova('telefono', link.tel, 'tel:+390523000000');
prova('WhatsApp', link.wa, 'https://wa.me/393330000000');
prova('indicazioni Google Maps', link.indicazioni, 'https://www.google.com/maps/dir/?api=1&destination=Bar%20Piacenza%2C%20Via%20XX%20Settembre%201%2C%2029121%20Piacenza%20PC');

console.log(`\n${ok} prove passate, ${ko} fallite.`);
process.exit(ko ? 1 : 0);
