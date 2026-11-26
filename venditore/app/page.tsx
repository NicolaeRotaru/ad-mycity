'use client';

// La pagina del venditore: una casella, un pulsante, la scheda.
// Il tempo conta (il venditore è in strada): la prima scheda arriva in pochi secondi, poi si completa da sola.

import { useCallback, useEffect, useRef, useState } from 'react';
import Scheda from '../components/Scheda.tsx';
import type { Scheda as TScheda } from '../lib/scheda.ts';

type Fase = 'pronto' | 'leggo' | 'cerca' | 'fatto' | 'errore';
type Ultima = { lavoro: string; nome: string; data: string };

const OGNI_MS = 3000;
const PAZIENZA_S = 600; // poi si smette di chiedere (la routine aspetta al massimo 15 minuti)
const CHIAVE = 'scheda-venditore:ultime';

function leggiUltime(): Ultima[] {
  try { const v = JSON.parse(localStorage.getItem(CHIAVE) || '[]'); return Array.isArray(v) ? v.slice(0, 8) : []; } catch { return []; }
}
function salvaUltima(u: Ultima) {
  try { localStorage.setItem(CHIAVE, JSON.stringify([u, ...leggiUltime().filter((x) => x.lavoro !== u.lavoro)].slice(0, 8))); } catch { /* niente */ }
}

export default function Pagina() {
  const [testo, setTesto] = useState('');
  const [fase, setFase] = useState<Fase>('pronto');
  const [errore, setErrore] = useState<string | null>(null);
  const [scheda, setScheda] = useState<TScheda | null>(null);
  const [lavoro, setLavoro] = useState<string | null>(null);
  const [secondi, setSecondi] = useState(0);
  const [ultime, setUltime] = useState<Ultima[]>([]);
  const inizio = useRef(0);
  const giro = useRef(0);

  const ferma = () => { giro.current++; };

  const segui = useCallback((id: string, dalPrincipio: number) => {
    const mio = ++giro.current;
    inizio.current = dalPrincipio;
    const chiedi = async () => {
      if (mio !== giro.current) return;
      const passati = Math.round((Date.now() - inizio.current) / 1000);
      if (passati > PAZIENZA_S) { setFase('errore'); setErrore('L’AD non ha risposto in 10 minuti. La prima scheda resta qui; riprova più tardi con «Analizza».'); return; }
      try {
        const r = await fetch(`/api/stato?lavoro=${id}`, { cache: 'no-store' });
        const d = await r.json();
        if (mio !== giro.current) return;
        if (d.scheda) setScheda(d.scheda);
        if (d.stato === 'pronta') {
          setFase('fatto');
          salvaUltima({ lavoro: id, nome: d.scheda?.nome ?? 'Scheda', data: d.scheda?.data ?? '' });
          setUltime(leggiUltime());
          return;
        }
        if (d.stato === 'errore') { setFase('errore'); setErrore(`L’AD non è riuscito a finire: ${d.errore}. La prima scheda resta valida.`); return; }
        if (r.status === 401) { location.href = '/accesso'; return; }
      } catch { /* rete ballerina: si riprova al prossimo giro */ }
      setTimeout(chiedi, OGNI_MS);
    };
    setTimeout(chiedi, 1500);
  }, []);

  // Riaprire una scheda dal link (?lavoro=…) o dalle ultime.
  const riapri = useCallback((id: string) => {
    ferma(); setErrore(null); setScheda(null); setLavoro(id); setFase('cerca');
    history.replaceState(null, '', `?lavoro=${id}`);
    segui(id, Date.now());
  }, [segui]);

  useEffect(() => {
    setUltime(leggiUltime());
    const id = new URLSearchParams(location.search).get('lavoro');
    if (id && /^[0-9a-f-]{36}$/i.test(id)) riapri(id);
  }, [riapri]);

  useEffect(() => {
    if (fase !== 'leggo' && fase !== 'cerca') return;
    const t = setInterval(() => setSecondi(Math.round((Date.now() - inizio.current) / 1000)), 500);
    return () => clearInterval(t);
  }, [fase]);

  async function analizza(e?: React.FormEvent) {
    e?.preventDefault();
    if (!testo.trim() || fase === 'leggo') return;
    ferma(); setErrore(null); setScheda(null); setLavoro(null); setFase('leggo');
    inizio.current = Date.now(); setSecondi(0);
    try {
      const r = await fetch('/api/analizza', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ testo }) });
      if (r.status === 401) { location.href = '/accesso'; return; }
      const d = await r.json();
      if (!r.ok) { setFase('errore'); setErrore(d.errore ?? 'Qualcosa non va: riprova.'); return; }
      setScheda(d.scheda);
      if (d.lavoro) {
        setLavoro(d.lavoro); setFase('cerca');
        history.replaceState(null, '', `?lavoro=${d.lavoro}`);
        segui(d.lavoro, inizio.current);
      } else { setFase('errore'); setErrore(d.scheda?.avvisi?.at(-1) ?? 'L’AD non è partito: hai solo la prima scheda.'); }
    } catch {
      setFase('errore'); setErrore('Niente rete, o il sito non risponde. Riprova fra un attimo.');
    }
  }

  async function incolla() {
    try { const t = await navigator.clipboard.readText(); if (t) setTesto(t.trim()); } catch { /* il telefono non lo permette: si incolla a mano */ }
  }

  const percento = fase === 'leggo' ? Math.min(12, secondi * 3) : fase === 'cerca' ? Math.min(95, 12 + secondi * 1.4) : 100;
  const passo = (soglia: number) => (secondi >= soglia ? 'fatto' : 'ora');

  return (
    <main className="pagina">
      <a className="salta" href="#scheda">Vai alla scheda</a>
      <div className="testata">
        <span className="marchio"><b>MyCity</b> · SDG Agenzia</span>
        <h1>Scheda del cliente</h1>
        <p className="nota">Incolla il link di Google Maps dell’attività in cui stai per entrare e premi «Analizza». La prima parte arriva in pochi secondi, la scheda intera in circa un minuto.</p>
      </div>

      <form className="cerca" onSubmit={analizza}>
        <label htmlFor="link">Link di Google Maps dell’attività</label>
        <div className="riga-cerca">
          <input id="link" className="campo" type="text" inputMode="url" autoComplete="off" autoCapitalize="off" spellCheck={false}
            placeholder="https://maps.app.goo.gl/…  oppure  nome e città" value={testo} onChange={(e) => setTesto(e.target.value)} />
          <button type="button" className="bottone secondario" onClick={incolla}>Incolla</button>
          <button type="submit" className="bottone" disabled={fase === 'leggo' || !testo.trim()}>{fase === 'leggo' ? 'Leggo…' : 'Analizza'}</button>
        </div>
        <p className="nota">Su Google Maps: apri l’attività → «Condividi» → «Copia link». Va bene anche scrivere il nome e la città.</p>
        {errore && <p className="errore" role="alert">{errore}</p>}
        {ultime.length > 0 && fase === 'pronto' && (
          <div className="ultime" aria-label="Le ultime schede">{ultime.map((u) => <button type="button" key={u.lavoro} onClick={() => riapri(u.lavoro)}>{u.nome}</button>)}</div>
        )}
      </form>

      {(fase === 'leggo' || fase === 'cerca') && (
        <div className="attesa" role="status" aria-live="polite">
          <div className="barra" aria-hidden="true"><span style={{ width: `${percento}%` }} /></div>
          <ul className="passi">
            <li className={fase === 'leggo' ? 'ora' : 'fatto'}>{fase === 'leggo' ? '●' : '✓'} Leggo il link, l’indirizzo, il sito e i negozi vicini</li>
            <li className={fase === 'cerca' ? passo(20) : 'dopo'}>{fase === 'cerca' && secondi >= 20 ? '✓' : '●'} L’AD cerca social, recensioni e giornali</li>
            <li className={fase === 'cerca' && secondi >= 20 ? 'ora' : 'dopo'}>● L’AD sceglie l’abbonamento e scrive la scheda</li>
          </ul>
          <p className="nota">{secondi} secondi{secondi > 90 ? ' · ci mette più del solito: la scheda si completa da sola, intanto leggi la prima parte' : ''}</p>
        </div>
      )}

      <div id="scheda">{scheda && <Scheda s={scheda} />}</div>
      {fase === 'fatto' && lavoro && <p className="nota">Questa scheda si riapre dal link della pagina, anche da un altro telefono del gruppo.</p>}
    </main>
  );
}
