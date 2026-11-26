// Gli account dei venditori: password, sessione, blocco dopo troppi errori, rinvio sicuro dopo l'accesso.
import test from 'node:test';
import assert from 'node:assert/strict';
import { impronta, verifica, passwordValida } from '../lib/password.ts';
import { firma, leggi, tornaSicuro } from '../lib/sessione.ts';
import { puoProvare, dopoLaProva, invitoGiusto, ERRORI_MAX } from '../lib/venditori.ts';

const SEGRETO = 'segreto-di-prova-lungo-abbastanza-per-il-test';

test('la password si salva solo come impronta, e si verifica', async () => {
  const h = await impronta('torta-di-rose');
  assert.match(h, /^scrypt\$16384\$8\$1\$/);
  assert.ok(!h.includes('torta'));
  assert.equal(await verifica('torta-di-rose', h), true);
  assert.equal(await verifica('torta-di-rosa', h), false);
  assert.equal(await verifica('torta-di-rose', 'scrypt$1$1$1$aa$bb'), false, 'un costo assurdo non si accetta');
  assert.notEqual(await impronta('torta-di-rose'), h, 'ogni impronta ha il suo sale');
  assert.equal(passwordValida('corta'), false);
  assert.equal(passwordValida('abbastanza-lunga'), true);
});

test('la sessione: firmata, scade, non si falsifica, non vale con un altro segreto', async () => {
  const adesso = Date.now();
  const c = await firma('mario@esempio.it', SEGRETO, adesso);
  assert.equal((await leggi(c, SEGRETO, adesso))?.email, 'mario@esempio.it');
  assert.equal(await leggi(c, SEGRETO, adesso + 31 * 24 * 3600 * 1000), null, 'dopo 30 giorni scade');
  assert.equal(await leggi(c, 'un-altro-segreto-lungo-abbastanza-xyz', adesso), null);
  const [corpo, sig] = c.split('.');
  const falso = Buffer.from(JSON.stringify({ e: 'nicola@esempio.it', x: 9999999999 })).toString('base64url');
  assert.equal(await leggi(`${falso}.${sig}`, SEGRETO, adesso), null, 'cambiare l’email rompe la firma');
  assert.equal(await leggi(corpo, SEGRETO, adesso), null);
  assert.equal(await firma('x@y.it', 'corto'), null, 'senza segreto vero nessuno entra');
});

test('dopo l’accesso si torna solo a una pagina del sito (i rinvii trovati dal collaudo non passano)', () => {
  const o = 'https://scheda-venditore.vercel.app';
  for (const t of ['/\\evil.example', '/\t/evil.example', '//evil.example', 'https://evil.example', ' /x', null, ''])
    assert.equal(tornaSicuro(t, o), '/', String(t));
  // Codificato resta una pagina di questo sito (il browser lo legge come percorso, non come dominio).
  assert.equal(new URL(tornaSicuro('/%09/evil', o), o).origin, o);
  assert.equal(tornaSicuro('/?lavoro=1b4e28ba-2fa1-11d2-883f-0016d3cca427', o), '/?lavoro=1b4e28ba-2fa1-11d2-883f-0016d3cca427');
});

test('otto errori di fila bloccano per 15 minuti; un account sospeso non entra', () => {
  let riga = { trovato: true, hash: 'scrypt$x', stato: 'attivo', errori: 0, bloccato_fino: 0 };
  const t0 = 1_800_000_000_000;
  for (let i = 1; i < ERRORI_MAX; i++) { riga = { ...riga, ...dopoLaProva(riga, false, t0) }; assert.equal(riga.errori, i); assert.equal(puoProvare(riga, t0).ok, true); }
  riga = { ...riga, ...dopoLaProva(riga, false, t0) };
  const p = puoProvare(riga, t0 + 60_000);
  assert.equal(p.ok, false); assert.equal(p.motivo, 'bloccato'); assert.equal(p.minuti, 14);
  assert.equal(puoProvare(riga, t0 + 16 * 60_000).ok, true);
  assert.deepEqual(dopoLaProva(riga, true, t0), { errori: 0, bloccato_fino: 0, ultimo_accesso: t0 });
  assert.equal(puoProvare({ ...riga, bloccato_fino: 0, stato: 'sospeso' }).motivo, 'sospeso');
  assert.equal(puoProvare({ trovato: false }).motivo, 'nessuno');
});

test('il codice d’invito: spazi intorno tolti da tutte e due le parti, corto = sito chiuso', () => {
  assert.equal(invitoGiusto('  ABCD-1234 ', ' ABCD-1234  '), true);
  assert.equal(invitoGiusto('ABCD-1235', 'ABCD-1234'), false);
  assert.equal(invitoGiusto('abc', 'abc'), false);
});
