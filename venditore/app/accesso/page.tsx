'use client';

import { useState } from 'react';

export default function Accesso() {
  const [codice, setCodice] = useState('');
  const [errore, setErrore] = useState<string | null>(null);
  const [attesa, setAttesa] = useState(false);

  async function entra(e: React.FormEvent) {
    e.preventDefault();
    setAttesa(true); setErrore(null);
    try {
      const r = await fetch('/api/accesso', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ codice }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setErrore(d.errore ?? 'Non riesco a entrare.'); return; }
      const torna = new URLSearchParams(location.search).get('torna');
      location.href = torna && torna.startsWith('/') && !torna.startsWith('//') ? torna : '/';
    } catch { setErrore('Niente rete: riprova.'); } finally { setAttesa(false); }
  }

  return (
    <main className="pagina" style={{ maxWidth: '28rem', paddingTop: '3rem' }}>
      <div className="testata">
        <span className="marchio"><b>MyCity</b> · SDG Agenzia</span>
        <h1>Scheda del cliente</h1>
        <p className="nota">Sito riservato ai venditori. Il codice te lo dà Nicola.</p>
      </div>
      <form className="cerca" onSubmit={entra}>
        <label htmlFor="codice">Codice del venditore</label>
        <input id="codice" className="campo" type="password" autoComplete="current-password" value={codice} onChange={(e) => setCodice(e.target.value)} />
        <button className="bottone" disabled={attesa || !codice}>{attesa ? 'Controllo…' : 'Entra'}</button>
        {errore && <p className="errore" role="alert">{errore}</p>}
      </form>
    </main>
  );
}
