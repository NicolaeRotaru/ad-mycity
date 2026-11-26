// LA PROVA DI CONTRATTO — il corpo che il sito manda passa davvero dal nodo n8n che lo riceve.
// Il collaudo del 26/11 ha trovato che il sito e il flusso 14 si aspettavano due forme diverse: il test di n8n
// si fabbricava il suo input, il finto n8n non controllava niente, e tutte le prove erano verdi.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { corpoLavoro } from '../lib/n8n.ts';
import { primaScheda } from '../lib/scheda.ts';
import { COMPITO, SCHEMA, FLUSSO, datiPerAd } from '../lib/compito.ts';
import { leggiIndirizzoGoogle } from '../lib/link.ts';

const QUI = path.dirname(fileURLToPath(import.meta.url));
const NODO = path.resolve(QUI, '..', '..', '..', 'N8N', 'flussi', '14-scheda-venditore', 'codice', 'controlla-lavoro.js');
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

test('il corpo del sito passa da «Controlla il lavoro» del flusso 14', async (t) => {
  if (!fs.existsSync(NODO)) { t.skip(`manca il repo N8N accanto (${NODO})`); return; }
  const letto = leggiIndirizzoGoogle('https://www.google.com/maps?q=La+Dolce+Dispensa,+Via+Bianchi,+27,+29122+Piacenza+PC');
  const prima = primaScheda({ letto, osm: null, misura: null, citta: 'Piacenza', data: '2026-11-26 21:00' });
  const corpo = JSON.parse(JSON.stringify(corpoLavoro('1b4e28ba-2fa1-11d2-883f-0016d3cca427', 'mario@esempio.it', prima.nome, prima,
    { flusso: FLUSSO, compito: COMPITO, schema: SCHEMA, dati: datiPerAd({ prima, osm: null, misura: null, giorno: '2026-11-26' }) })));
  const $ = (nome) => ({ first: () => (nome === 'Dal sito del venditore' ? { json: { body: corpo } } : undefined) });
  const [esito] = await new AsyncFunction('$', fs.readFileSync(NODO, 'utf8'))($);
  assert.equal(esito.json.valido, true, esito.json.motivo);
  assert.equal(esito.json.venditore, 'mario@esempio.it');
  assert.equal(esito.json.job.flusso, '14 · Scheda per il venditore');
});
