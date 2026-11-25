#!/usr/bin/env node
// 🗺️ LA MAPPA DELL'AZIENDA — tutto quello che esiste, in una pagina che l'AD legge per prima.
//
// Nicola, 24/11/2026: l'AD deve «pensare a tutto»: n8n, SDG, MyCity, ogni imprenditore che aderisce,
// i siti e quello che gira intorno. «È un'azienda a tutti gli effetti.» Il 25/11: «parti con la mappa».
//
// Perché un programma e non un documento scritto a mano: una mappa scritta a mano mente dal giorno dopo,
// e rileggerla o rifarla costa token a ogni sessione. Questa si rifà da sola, a 0 token, e l'AD legge
// UNA pagina invece di esplorare quattro repository e n8n a ogni sessione.
//
// Cosa misura (tutto in sola lettura):
//   ① i repository vicini (ad-mycity, mycity, SDG, N8N): ultimo commit, quanto pesano;
//   ② n8n (API pubblica): ogni flusso vivo, se è acceso, quanti nodi, l'ultima corsa, se paga Claude;
//   ③ i negozi del marketplace (REST in sola lettura se ci sono le chiavi, oppure --negozi <file>);
//   ④ il codice della macchina (cervello/): chi lo fa partire. Per ogni file cerca chi lo nomina,
//      a partire dagli ingressi veri (GitHub, Pannello, hook delle sessioni, manuali, server) e dice se
//      è vivo da fuori, vivo a mano, vivo solo col server spento, o orfano;
//   ⑤ il peso fisso che ogni sessione dell'AD rilegge (regole, descrizioni dei senior, memoria).
//
// Scrive SOLO nella memoria dell'AD:
//   · MyCity-Vault/90-Memoria-AI/MAPPA-AZIENDA.md
//   · MyCity-Vault/90-Memoria-AI/auto-coscienza/mappa-azienda.json
//
// Uso: node cervello/mappa-azienda.mjs [--negozi file.json] [--senza-n8n] [--stdout]
// Non è un guardiano: non dice sì o no, scrive una mappa. Senza il repository si ferma con un messaggio.
// Scrive con la penna condivisa (scrivi-json.mjs) e legge git con l'esecutore unico (git-github.mjs).

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gitLetto } from './git-github.mjs';
import { scriviJsonAtomico, scriviTestoAtomico } from './scrivi-json.mjs';

const RADICE = join(dirname(fileURLToPath(import.meta.url)), '..');
const MEMORIA = join(RADICE, 'MyCity-Vault', '90-Memoria-AI');
const argv = process.argv.slice(2);
const opz = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };
const ora = new Date();
const quando = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome', dateStyle: 'short', timeStyle: 'short' }).format(ora);
const fmt = (n) => Number(n).toLocaleString('it-IT');
const tok = (byte) => (byte === null ? null : Math.round(byte / 4)); // stima: circa 4 byte per token
const PAROLE = { approved: 'approvato', pending: 'in attesa', rejected: 'rifiutato', success: 'riuscita', error: 'errore', waiting: 'in attesa', running: 'in corso', canceled: 'annullata', crashed: 'caduta' };
const it = (x) => PAROLE[x] || x;
const giorni = (data) => (data ? Math.floor((ora - new Date(data)) / 864e5) : null);

// null = git non ha risposto: si scrive «non misurato», non si indovina un valore.
const git = (dir, ...args) => gitLetto(args, dir);

function elencaFile(dir, filtro, esclusi = ['node_modules', '.git', '.next']) {
  const out = [];
  const giro = (d) => {
    let voci;
    try { voci = readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const v of voci) {
      if (esclusi.includes(v.name)) continue;
      const p = join(d, v.name);
      if (v.isDirectory()) giro(p);
      else if (filtro(p)) out.push(p);
    }
  };
  giro(dir);
  return out;
}
// null = file illeggibile: chi lo usa decide cosa farne, non arriva uno zero travestito da misura.
const leggi = (p) => { try { return readFileSync(p, 'utf8'); } catch { return null; } };
const righe = (testo) => (testo === null ? null : testo.split('\n').length);
const fmtMisura = (n) => (n === null || n === undefined ? 'non misurato' : fmt(n));

// ── ① I repository ─────────────────────────────────────────────────────────────────────────────
const REPO = [
  { nome: 'ad-mycity', cosa: "la macchina dell'AD: memoria, senior, programmi, Pannello", dir: RADICE },
  { nome: 'mycity', cosa: 'il marketplace MyCity (sito, dashboard dei negozi, API)', dir: join(RADICE, '..', 'mycity') },
  { nome: 'SDG', cosa: "il sito dell'agenzia SDG", dir: join(RADICE, '..', 'SDG') },
  { nome: 'N8N', cosa: 'i sorgenti e le prove dei flussi n8n costruiti da programma (repository pubblico)', dir: join(RADICE, '..', 'N8N') },
];
const repo = REPO.map((r) => {
  if (!existsSync(join(r.dir, '.git'))) return { ...r, presente: false };
  const ultimo = git(r.dir, 'log', '-1', '--format=%cs|%s');
  const elenco = git(r.dir, 'ls-files');
  const [data, ...titolo] = ultimo === null ? [null] : ultimo.split('|');
  const file = elenco === null ? null : elenco.split('\n').filter(Boolean).length;
  return { nome: r.nome, cosa: r.cosa, presente: true, ultimo_commit: data, titolo: titolo.join('|').slice(0, 90), file };
});

// Dove gira cosa. Non si misura da qui (servono le chiavi di Vercel e Sliplane): letto dall'AD il 25/11.
const DOVE_GIRA = [
  ['Marketplace MyCity', 'Vercel', 'mycity', 'mycity', "il database è Supabase «Mycity», a Parigi; l'AD lo legge e basta"],
  ['Pannello di Controllo', 'Vercel', 'ad-mycity', 'ad-mycity, cartella pannello/', 'due lavori a orario: battito alle 9:00, report alle 19:07'],
  ['Palestra', 'Vercel', 'mycity-palestra', 'mycity', 'la copia di prova del marketplace'],
  ['Sito SDG', 'nessuno', '—', 'SDG', 'non risulta pubblicato'],
  ['n8n', 'Sliplane', 'n8n-shdy.sliplane.app', 'N8N, per i flussi fatti da programma', "le mani e l'orologio dell'azienda"],
  ["Memoria dell'AD", 'Supabase e il repository', 'ad-mycity', 'ad-mycity', 'qui vive anche la coda dei lavori del vecchio server'],
  ['Server del worker', 'spento per sempre', '—', 'ad-mycity, cartella cervello/vps/', 'spento dal 21/11; Nicola ha deciso il 24/11 di non riaccenderlo'],
];

// ── ② n8n ───────────────────────────────────────────────────────────────────────────────────────
async function leggiN8n() {
  if (argv.includes('--senza-n8n')) return { misurato: false, motivo: 'saltato con --senza-n8n' };
  const base = (process.env.N8N_URL || 'https://n8n-shdy.sliplane.app').replace(/\/+$/, '');
  const chiave = process.env.N8N_API_KEY;
  if (!chiave) return { misurato: false, motivo: 'manca N8N_API_KEY' };
  const chiama = async (p) => {
    const r = await fetch(`${base}/api/v1${p}`, { headers: { 'X-N8N-API-KEY': chiave, accept: 'application/json' }, signal: AbortSignal.timeout(30_000) });
    if (!r.ok) throw new Error(`${p} → ${r.status}`);
    return r.json();
  };
  try {
    const flussi = [];
    let cursore = '';
    do {
      const pag = await chiama(`/workflows?limit=250${cursore ? `&cursor=${encodeURIComponent(cursore)}` : ''}`);
      flussi.push(...(pag.data || []));
      cursore = pag.nextCursor || '';
    } while (cursore);
    const vivi = flussi.filter((w) => !w.isArchived);
    const righeN8n = [];
    for (const w of vivi) {
      const claude = w.nodes.filter((n) => /anthropic|lmChat/i.test(n.type)
        || (/httpRequest/.test(n.type) && /api\.anthropic\.com/.test(JSON.stringify(n.parameters || {})))).length;
      let ultima = null;
      try {
        const e = await chiama(`/executions?workflowId=${encodeURIComponent(w.id)}&limit=1`);
        const x = (e.data || [])[0];
        if (x) ultima = { stato: x.status, quando: x.startedAt };
      } catch { /* senza esecuzioni leggibili */ }
      righeN8n.push({ nome: w.name, acceso: !!w.active, nodi: w.nodes.length, chiamate_claude: claude, ultima });
    }
    righeN8n.sort((a, b) => a.nome.localeCompare(b.nome, 'it'));
    return { misurato: true, totali: flussi.length, archiviati: flussi.length - vivi.length, vivi: righeN8n };
  } catch (e) {
    return { misurato: false, motivo: `n8n non risponde: ${e.message}` };
  }
}

// ── ③ I negozi ──────────────────────────────────────────────────────────────────────────────────
async function leggiNegozi() {
  const file = opz('--negozi');
  if (file) {
    try { return { misurato: true, fonte: `file ${basename(file)} (estratto in sola lettura)`, negozi: JSON.parse(readFileSync(file, 'utf8')) }; }
    catch (e) { return { misurato: false, motivo: `file dei negozi illeggibile: ${e.message}` }; }
  }
  const url = process.env.MARKETPLACE_SUPABASE_URL;
  const chiave = process.env.MARKETPLACE_SUPABASE_KEY;
  if (!url || !chiave) return { misurato: false, motivo: 'mancano MARKETPLACE_SUPABASE_URL e MARKETPLACE_SUPABASE_KEY' };
  const h = { apikey: chiave, Authorization: `Bearer ${chiave}` };
  try {
    const r = await fetch(`${url}/rest/v1/profiles?select=id,store_name,approval_status,subscription_status,visibile_senza_abbonamento,created_at&role=eq.seller&order=created_at`, { headers: h, signal: AbortSignal.timeout(20_000) });
    if (!r.ok) throw new Error(`profili → ${r.status}`);
    const profili = await r.json();
    const p = await fetch(`${url}/rest/v1/products?select=seller_id`, { headers: h, signal: AbortSignal.timeout(20_000) });
    const prodotti = p.ok ? await p.json() : [];
    const conta = {};
    for (const x of prodotti) conta[x.seller_id] = (conta[x.seller_id] || 0) + 1;
    return { misurato: true, fonte: 'database del marketplace, in sola lettura', negozi: profili.map((x) => ({
      store_name: x.store_name, approval_status: x.approval_status, abbonamento: x.subscription_status || '-',
      visibile: x.visibile_senza_abbonamento, dal: String(x.created_at || '').slice(0, 10), prodotti: conta[x.id] || 0, id8: String(x.id).slice(0, 8),
    })) };
  } catch (e) {
    return { misurato: false, motivo: `database non leggibile: ${e.message}` };
  }
}

// ── ④ Il codice della macchina: chi fa partire ogni file ───────────────────────────────────────────
const ESTENSIONI = /\.(sh|mjs|js|cjs|ts|py|ps1|bats)$/;
const CERVELLO = join(RADICE, 'cervello');
const eProva = (rel) => /(^|\/)(test|tests|__tests__)\//.test(rel) || /\.test\.|\.bats$/.test(rel);

function inventarioCodice() {
  const file = elencaFile(CERVELLO, (p) => ESTENSIONI.test(p));
  const info = new Map();
  for (const p of file) {
    const rel = relative(RADICE, p);
    const letto = leggi(p);
    const testo = letto ?? ''; // un file illeggibile non nomina nessuno: lo si conta, ma non fa vivere niente
    info.set(rel, { rel, nome: basename(p), testo, righe: righe(letto) ?? 0, illeggibile: letto === null, prova: eProva(rel) });
  }
  // Un nome troppo corto o generico darebbe collegamenti finti: si usano solo i nomi lunghi almeno 6.
  const perNome = new Map();
  for (const x of info.values()) if (x.nome.length >= 6) {
    if (!perNome.has(x.nome)) perNome.set(x.nome, []);
    perNome.get(x.nome).push(x.rel);
  }
  const nomi = [...perNome.keys()];
  const nominati = (testo) => {
    const out = new Set();
    for (const n of nomi) if (testo.includes(n)) for (const rel of perNome.get(n)) out.add(rel);
    return out;
  };

  // Gli ingressi veri, dal più forte al più debole.
  const testi = (lista) => lista.map((p) => leggi(p)).filter((t) => t !== null).join('\n');
  const daFuori = testi([
    ...elencaFile(join(RADICE, '.github', 'workflows'), (p) => /\.ya?ml$/.test(p)),
    ...elencaFile(join(RADICE, 'pannello'), (p) => /\.(ts|tsx|js|mjs|json)$/.test(p)),
    join(RADICE, 'package.json'),
    join(RADICE, '.claude', 'settings.json'),
  ]);
  const aMano = testi([
    join(RADICE, 'CLAUDE.md'), join(RADICE, 'COMANDI.md'), join(CERVELLO, 'MANUALE-AD.md'),
    ...elencaFile(join(RADICE, '.claude', 'skills'), (p) => p.endsWith('.md')),
    ...elencaFile(join(RADICE, '.claude', 'agents'), (p) => p.endsWith('.md')),
  ]);
  // I README e le note dentro cervello/ non contano: raccontano i file, non li fanno partire.
  const server = testi([
    ...elencaFile(join(CERVELLO, 'vps'), () => true),
  ]) + '\n' + [...info.values()].filter((x) => /^cervello\/worker[^/]*$/.test(x.rel)).map((x) => x.nome).join('\n');

  const categoria = new Map();
  const ordine = ['da_fuori', 'a_mano', 'solo_server'];
  const propaga = (semi, cat) => {
    const coda = [...semi];
    while (coda.length) {
      const rel = coda.shift();
      const x = info.get(rel);
      if (!x) continue;
      const gia = categoria.get(rel);
      if (gia && ordine.indexOf(gia) <= ordine.indexOf(cat)) continue;
      if (x.prova) continue; // una prova non fa vivere niente: si giudica dal codice che prova
      categoria.set(rel, cat);
      for (const g of nominati(x.testo)) if (g !== rel) coda.push(g);
    }
  };
  propaga(nominati(daFuori), 'da_fuori');
  propaga(nominati(aMano), 'a_mano');
  propaga(nominati(server), 'solo_server');

  // Una prova vale quanto il codice che prova: il migliore fra i file che nomina.
  for (const x of info.values()) if (x.prova) {
    const bersagli = [...nominati(x.testo)].filter((g) => g !== x.rel && !info.get(g)?.prova).map((g) => categoria.get(g)).filter(Boolean);
    const migliore = bersagli.sort((a, b) => ordine.indexOf(a) - ordine.indexOf(b))[0];
    if (migliore) categoria.set(x.rel, migliore);
  }

  // Ultima modifica di ogni file: una sola passata su git.
  const ultima = new Map();
  let data = '';
  for (const r of (git(RADICE, 'log', '--format=@%cs', '--name-only', '--', 'cervello') ?? '').split('\n')) {
    if (r.startsWith('@')) data = r.slice(1);
    else if (r && !ultima.has(r)) ultima.set(r, data);
  }

  const voci = [...info.values()].map((x) => ({
    file: x.rel, righe: x.righe, prova: x.prova,
    categoria: categoria.get(x.rel) || 'orfano', ultima_modifica: ultima.get(x.rel) || null,
  }));
  const somma = (filtro) => voci.filter(filtro).reduce((a, v) => ({ file: a.file + 1, righe: a.righe + v.righe }), { file: 0, righe: 0 });
  const riepilogo = {};
  for (const cat of [...ordine, 'orfano']) {
    riepilogo[cat] = { programmi: somma((v) => v.categoria === cat && !v.prova), prove: somma((v) => v.categoria === cat && v.prova) };
  }
  riepilogo.totale = somma(() => true);
  const grandi = (cat, n) => voci.filter((v) => v.categoria === cat && !v.prova).sort((a, b) => b.righe - a.righe).slice(0, n);
  return { voci, riepilogo, orfani_grandi: grandi('orfano', 15), server_grandi: grandi('solo_server', 15) };
}

// ── ⑤ Il peso fisso di ogni sessione ──────────────────────────────────────────────────────────────
function pesoFisso() {
  const byte = (p) => { try { return statSync(p).size; } catch { return null; } };
  const agenti = elencaFile(join(RADICE, '.claude', 'agents'), (p) => p.endsWith('.md'));
  let descrizioni = 0;
  for (const p of agenti) {
    const m = (leggi(p) ?? '').match(/^---\n([\s\S]*?)\n---/);
    const d = m && m[1].match(/^description:\s*([\s\S]*?)(?=\n[a-zA-Z_-]+:|$)/m);
    if (d) descrizioni += Buffer.byteLength(d[1]);
  }
  const memoria = ['DECISIONI.md', 'LAVORO-APERTO.md', 'STATO.md', 'registro-fatti.json', 'BACHECA-SESSIONI.md', 'AZIONI-IN-ATTESA.md']
    .map((f) => ({ file: f, byte: byte(join(MEMORIA, f)), righe: righe(leggi(join(MEMORIA, f))) }));
  return {
    claude_md: byte(join(RADICE, 'CLAUDE.md')),
    manuale_ad: byte(join(CERVELLO, 'MANUALE-AD.md')),
    senior: agenti.length,
    descrizioni_senior: descrizioni,
    memoria,
  };
}

// ── La pagina ─────────────────────────────────────────────────────────────────────────────────────
function pagina({ n8n, negozi, codice, peso }) {
  const L = [];
  const r = codice.riepilogo;
  L.push('---', `data: ${quando}`, 'generata_da: cervello/mappa-azienda.mjs', '---', '');
  L.push("# La mappa dell'azienda", '');
  const breve = [];
  if (n8n.misurato) breve.push(`n8n ha ${n8n.vivi.length} flussi vivi, e ${n8n.vivi.filter((x) => x.acceso).length} sono accesi.`);
  if (negozi.misurato) breve.push(`Nel marketplace ci sono ${negozi.negozi.length} venditori.`);
  breve.push(`Nella macchina, ${r.orfano.programmi.file + r.orfano.prove.file} file di codice su ${r.totale.file} non li fa partire nessuno.`);
  L.push(`**In breve.** ${breve.join(' ')}`, '');
  L.push(`> Rifatta da un programma il ${quando}, a 0 token: \`node cervello/mappa-azienda.mjs\`. Non si corregge a mano.`);
  L.push("> È la pagina che l'AD legge per prima: invece di esplorare quattro repository e n8n, legge questa.", '');

  L.push('## In parole semplici', '');
  L.push("Qui c'è tutto quello che l'azienda ha oggi: le sue parti, dove gira ogni cosa, i flussi di n8n, i negozi, le persone e il codice della macchina.");
  L.push('Ogni numero lo conta il programma da solo. Quello che da qui non si può misurare è scritto come «non misurato», mai come zero.');
  L.push("Un esempio. Per sapere se il flusso «08 Post dalle foto» è acceso, prima l'AD apriva n8n e leggeva il flusso. Adesso legge la sua riga nella tabella dei flussi, qui sotto.", '');
  L.push('## Cosa cambia per te', '');
  L.push("L'AD non deve più esplorare tutto a ogni sessione: legge questa pagina, e spende meno token. Tu trovi in un posto solo cosa c'è e cosa è acceso.", '');
  L.push('## Cosa devi fare', '');
  L.push("Niente. Se vedi un errore, dillo all'AD: si corregge il programma, non la pagina.", '');
  L.push('## Cosa non ho verificato', '');
  L.push('Per capire chi fa partire un file, il programma cerca il suo nome negli altri file. Un file nominato solo in un commento sembra vivo.');
  L.push("La tabella «Dove gira ogni cosa» l'ha letta l'AD a mano, il 25/11.", '');

  L.push("## Le parti dell'azienda", '');
  L.push('| Parte | Cos\'è | Dove sta scritto |');
  L.push('| --- | --- | --- |');
  L.push('| **MyCity** | il marketplace dei negozi di Piacenza: catalogo, ordini, consegna | registro-fatti, `strategia.cliente-core` |');
  L.push("| **SDG Agenzia** | l'agenzia di Nicola: web, marketing, foto e video. Vende gli abbonamenti Base, Business e Premium | registro-fatti, `sdg.abbonamenti` |");
  L.push("| **scattiDG** | azienda partner: solo foto e video | registro-fatti, `agenzia.nome` |");
  L.push("| **L'organizzazione dell'AD** | l'AD, i 120 senior, la memoria e n8n come mani: fa girare MyCity e SDG. Il nome nuovo è da scegliere | DECISIONI 24/11 21:23 |");
  L.push('', "Com'è fatta dentro la macchina dell'AD (le sue 9 parti): `MAPPA-MACCHINA.md`.", '');

  L.push('## Dove gira ogni cosa', '');
  L.push('| Cosa | Dove gira | Nome lì | Repository | Note |');
  L.push('| --- | --- | --- | --- | --- |');
  for (const [a, b, c, d, e] of DOVE_GIRA) L.push(`| ${a} | ${b} | ${c} | ${d} | ${e} |`);
  L.push('');
  L.push('| Repository | Cos\'è | Ultimo commit | File |');
  L.push('| --- | --- | --- | --- |');
  for (const x of repo) L.push(x.presente ? `| ${x.nome} | ${x.cosa} | ${x.ultimo_commit || 'non misurato'} | ${fmtMisura(x.file)} |` : `| ${x.nome} | ${x.cosa} | non misurato (non c'è qui accanto) | — |`);
  L.push('');

  L.push('## I flussi di n8n', '');
  if (!n8n.misurato) L.push(`Non misurato: ${n8n.motivo}.`, '');
  else {
    const accesi = n8n.vivi.filter((x) => x.acceso);
    const nodi = n8n.vivi.reduce((a, x) => a + x.nodi, 0);
    const conClaude = accesi.filter((x) => x.chiamate_claude > 0);
    L.push(`${n8n.totali} flussi: ${n8n.vivi.length} vivi, ${n8n.archiviati} archiviati. Accesi: ${accesi.length}. Nodi nei flussi vivi: ${fmt(nodi)}.`);
    L.push(`Accesi con almeno un nodo che chiama l'API di Claude: ${conClaude.length}${conClaude.length ? ` (${conClaude.map((x) => x.nome).join(', ')})` : ''}. Un nodo presente non vuol dire che venga chiamato: dipende dai bivi.`, '');
    L.push('| Flusso | Acceso | Nodi | Nodi Claude | Ultima corsa |');
    L.push('| --- | --- | --- | --- | --- |');
    for (const x of n8n.vivi) {
      const u = x.ultima ? `${it(x.ultima.stato)}, ${String(x.ultima.quando).slice(0, 10)}` : 'mai, o non salvata';
      L.push(`| ${x.nome} | ${x.acceso ? 'sì' : 'no'} | ${x.nodi} | ${x.chiamate_claude || '—'} | ${u} |`);
    }
    L.push('');
  }

  L.push('## I negozi e gli imprenditori', '');
  if (!negozi.misurato) L.push(`Negozi del marketplace: non misurato (${negozi.motivo}).`, '');
  else {
    const n = negozi.negozi;
    const sistema = (x) => /^(sdg agenzia|mycity)$/i.test(x.store_name || '');
    const veri = n.filter((x) => !sistema(x));
    L.push(`Fonte: ${negozi.fonte}. Venditori registrati: ${n.length}, di cui ${n.length - veri.length} di sistema.`, '');
    L.push('| Negozio | Approvazione | In vetrina | Prodotti | Dal |');
    L.push('| --- | --- | --- | --- | --- |');
    for (const x of n) L.push(`| ${x.store_name || `_senza nome_ (${x.id8})`}${sistema(x) ? ' · di sistema' : ''} | ${x.approval_status ? it(x.approval_status) : 'non chiesta'} | ${x.visibile ? 'sì' : 'no'} | ${x.prodotti} | ${x.dal} |`);
    L.push('');
  }
  L.push("**Clienti dell'agenzia SDG:** stanno nella scheda Clienti, un foglio Google che usano i flussi di n8n. Da qui non si legge: non misurato.", '');

  L.push('## Le persone', '');
  L.push("| Chi | Cosa fa | Cosa gli prepara l'AD |");
  L.push('| --- | --- | --- |');
  L.push('| Nicola | il titolare: dà la rotta e firma soldi, rilasci e messaggi a persone vere. Al lancio consegna lui, in bici, fino a 10 km | le decisioni pronte da firmare, nel Pannello |');
  L.push('| Fotografo e videomaker | scattiDG, partner per foto e video | elenco degli scatti, appuntamento col negozio, materiale da montare |');
  L.push('| Fattorino | al lancio è Nicola (registro-fatti, `consegna.promessa`) | il giro delle consegne |');
  L.push('| Commercialista | conferma IVA, bilancio e adempimenti | i documenti del mese in ordine. Il nome non è in memoria |');
  L.push('');

  L.push('## I soldi', '');
  L.push("- Al lancio i clienti pagano solo in contanti, alla consegna. Fonte: `pagamenti.al-lancio`.");
  L.push("- Stripe non è collegato ai sensori dell'AD.");
  L.push("- L'agenzia vende tre abbonamenti al mese: Base a 300 euro, Business a 500 euro e Premium a 999 euro. Fonte: `sdg.abbonamenti`.");
  L.push("- Il marketplace prende il 10% sugli ordini che porta lui. Fonte: `pricing.commissione`.");
  L.push("- Per l'IA non si paga nessuna API: quel lavoro lo fa l'AD col piano Max. Fonte: `ad.uso-e-crediti`.", '');

  L.push('## Il codice della macchina: chi lo fa partire', '');
  L.push('Il programma parte dagli ingressi veri e segue chi nomina chi. Gli ingressi sono di tre tipi.');
  L.push('Da fuori: GitHub e il Pannello. A mano: i manuali, le skill e i senior. Solo server: il server del worker.');
  L.push(`Un file che nessuno nomina è orfano. In \`cervello/\` ci sono ${fmt(r.totale.file)} file di programma, con ${fmt(r.totale.righe)} righe.`, '');
  L.push('Le prove stanno nella riga del codice che provano: una prova di un file orfano è orfana anche lei.', '');
  L.push('| Chi lo fa partire | Programmi | Righe | Prove | Righe delle prove |');
  L.push('| --- | --- | --- | --- | --- |');
  const nomeCat = { da_fuori: 'Da fuori (GitHub, Pannello, hook)', a_mano: 'A mano (manuali, skill, senior)', solo_server: 'Solo il server, spento per sempre', orfano: 'Nessuno: orfano' };
  for (const cat of ['da_fuori', 'a_mano', 'solo_server', 'orfano']) {
    L.push(`| ${nomeCat[cat]} | ${fmt(r[cat].programmi.file)} | ${fmt(r[cat].programmi.righe)} | ${fmt(r[cat].prove.file)} | ${fmt(r[cat].prove.righe)} |`);
  }
  L.push('', 'Gli orfani più grandi, primi candidati da togliere dopo un controllo uno per uno:', '');
  for (const v of codice.orfani_grandi) L.push(`- \`${v.file}\`: ${fmt(v.righe)} righe, ultima modifica ${v.ultima_modifica || 'non nota'}`);
  L.push('', 'I pezzi più grandi che vivono solo col server:', '');
  for (const v of codice.server_grandi) L.push(`- \`${v.file}\`: ${fmt(v.righe)} righe, ultima modifica ${v.ultima_modifica || 'non nota'}`);
  L.push('', "_Il collegamento è una ricerca di nomi: un file nominato solo in un commento risulta vivo. Per questo gli orfani sono sicuri, i vivi no. Prima di togliere un file, una prova che gira._", '');

  L.push('## Il peso fisso di ogni sessione', '');
  L.push(`Ogni sessione dell'AD rilegge le stesse cose prima di fare qualsiasi lavoro. Stima: circa 4 byte per token.`, '');
  L.push('| Cosa | Byte | Token, circa |');
  L.push('| --- | --- | --- |');
  L.push(`| Regole per tutti (CLAUDE.md) | ${fmtMisura(peso.claude_md)} | ${fmtMisura(tok(peso.claude_md))} |`);
  L.push(`| Le descrizioni dei ${peso.senior} senior, nella lista degli agenti | ${fmt(peso.descrizioni_senior)} | ${fmt(tok(peso.descrizioni_senior))} |`);
  L.push(`| Manuale dell'AD, una volta per sessione | ${fmtMisura(peso.manuale_ad)} | ${fmtMisura(tok(peso.manuale_ad))} |`);
  for (const m of peso.memoria) L.push(`| Memoria: ${m.file} (${fmtMisura(m.righe)} righe), se si legge intera | ${fmtMisura(m.byte)} | ${fmtMisura(tok(m.byte))} |`);
  L.push('');

  L.push('## Cosa non è misurato', '');
  L.push("- Le visite e la velocità dei siti: servono le chiavi di Vercel, che il programma non ha.");
  L.push("- Gli incassi veri: Stripe non è collegato.");
  if (!n8n.misurato) L.push(`- n8n: ${n8n.motivo}.`);
  if (!negozi.misurato) L.push(`- I negozi: ${negozi.motivo}.`);
  L.push('');
  return L.join('\n');
}

// ── Via ─────────────────────────────────────────────────────────────────────────────────────────
if (!existsSync(join(RADICE, 'CLAUDE.md'))) { console.error('Non trovo il repository ad-mycity.'); process.exit(2); }
const [n8n, negozi] = await Promise.all([leggiN8n(), leggiNegozi()]);
const codice = inventarioCodice();
const peso = pesoFisso();
const testo = pagina({ n8n, negozi, codice, peso });
if (argv.includes('--stdout')) process.stdout.write(testo);
else {
  scriviTestoAtomico(join(MEMORIA, 'MAPPA-AZIENDA.md'), testo);
  scriviJsonAtomico(join(MEMORIA, 'auto-coscienza', 'mappa-azienda.json'), {
    generata: quando, repo, n8n, negozi, peso, codice: { riepilogo: codice.riepilogo, voci: codice.voci },
  });
  const r = codice.riepilogo;
  console.log(`🗺️  Mappa scritta (${quando}). n8n: ${n8n.misurato ? `${n8n.vivi.length} vivi` : 'non misurato'} · negozi: ${negozi.misurato ? negozi.negozi.length : 'non misurato'} · codice: ${r.totale.file} file, orfani ${r.orfano.programmi.file + r.orfano.prove.file}, solo server ${r.solo_server.programmi.file + r.solo_server.prove.file}.`);
}
