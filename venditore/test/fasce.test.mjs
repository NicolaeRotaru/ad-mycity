// La copia degli abbonamenti del sito venditore deve restare uguale a quella del programma della scheda e
// al registro dei fatti: se Nicola cambia un prezzo lì e qui no, questa prova diventa rossa.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FASCE, CONDIZIONI, PAGAMENTO } from '../lib/fasce.ts';

const QUI = path.dirname(fileURLToPath(import.meta.url));
const RADICE = path.resolve(QUI, '..', '..');
const programma = await import(path.join(RADICE, 'cervello', 'scheda-cliente.mjs'));
const registro = JSON.parse(fs.readFileSync(path.join(RADICE, 'MyCity-Vault', '90-Memoria-AI', 'registro-fatti.json'), 'utf8'));

test('fasce uguali al programma della scheda (nome, canone, contenuti, video, cosa dà in pratica)', () => {
  for (const id of Object.keys(programma.FASCE)) {
    const a = programma.FASCE[id], b = FASCE[id];
    assert.ok(b, `manca la fascia ${id}`);
    assert.deepEqual({ nome: b.nome, centesimi: b.centesimi, post: b.post, video: b.video, inPratica: b.inPratica, perChi: b.perChi },
      { nome: a.nome, centesimi: a.centesimi, post: a.post, video: a.video, inPratica: a.inPratica, perChi: a.perChi });
  }
  assert.deepEqual(Object.keys(FASCE), Object.keys(programma.FASCE));
});

test('canoni uguali al registro dei fatti (sdg.abbonamenti) e condizioni uguali al programma', () => {
  const canoni = programma.canoniDalRegistro(registro);
  for (const [id, f] of Object.entries(FASCE)) assert.equal(f.centesimi, canoni[id], `canone ${f.nome}`);
  assert.equal(CONDIZIONI, programma.CONDIZIONI);
});

test('come si paga: uguale al registro dei fatti (sdg.pagamento)', () => {
  assert.equal(PAGAMENTO, programma.pagamentoDalRegistro(registro));
});
