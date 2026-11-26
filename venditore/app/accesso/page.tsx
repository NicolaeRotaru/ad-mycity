'use client';

// Entrare o iscriversi. Ogni venditore ha il suo account (email e password); per iscriversi serve il codice
// d'invito che dà Nicola.

import { useState } from 'react';
import { tornaSicuro } from '../../lib/sessione.ts';

type Modo = 'entra' | 'iscriviti';

export default function Accesso() {
  const [modo, setModo] = useState<Modo>('entra');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ripeti, setRipeti] = useState('');
  const [codice, setCodice] = useState('');
  const [errore, setErrore] = useState<string | null>(null);
  const [attesa, setAttesa] = useState(false);

  async function invia(e: React.FormEvent) {
    e.preventDefault();
    setErrore(null);
    if (modo === 'iscriviti' && password !== ripeti) { setErrore('Le due password non sono uguali.'); return; }
    setAttesa(true);
    try {
      const r = await fetch(modo === 'entra' ? '/api/entra' : '/api/iscriviti', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify(modo === 'entra' ? { email, password } : { email, password, codice }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setErrore(d.errore ?? 'Non riesco a entrare.'); return; }
      location.href = tornaSicuro(new URLSearchParams(location.search).get('torna'), location.origin);
    } catch { setErrore('Niente rete: riprova.'); } finally { setAttesa(false); }
  }

  const cambia = (m: Modo) => { setModo(m); setErrore(null); };

  return (
    <main className="pagina" style={{ maxWidth: '28rem', paddingTop: '2.5rem' }}>
      <div className="testata">
        <span className="marchio"><b>MyCity</b> · SDG Agenzia</span>
        <h1>Scheda del cliente</h1>
        <p className="nota">Il sito dei venditori. Ognuno entra col suo account.</p>
      </div>
      <div className="schede-accesso" role="tablist" aria-label="Entra o iscriviti">
        <button type="button" role="tab" aria-selected={modo === 'entra'} className={modo === 'entra' ? 'attiva' : ''} onClick={() => cambia('entra')}>Entra</button>
        <button type="button" role="tab" aria-selected={modo === 'iscriviti'} className={modo === 'iscriviti' ? 'attiva' : ''} onClick={() => cambia('iscriviti')}>Iscriviti</button>
      </div>
      <form className="cerca" onSubmit={invia}>
        <label htmlFor="email">Email</label>
        <input id="email" className="campo" type="email" autoComplete="email" inputMode="email" autoCapitalize="off" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <label htmlFor="password">Password{modo === 'iscriviti' ? ' (almeno 8 caratteri)' : ''}</label>
        <input id="password" className="campo" type="password" autoComplete={modo === 'entra' ? 'current-password' : 'new-password'} required minLength={modo === 'iscriviti' ? 8 : undefined} value={password} onChange={(e) => setPassword(e.target.value)} />
        {modo === 'iscriviti' && <>
          <label htmlFor="ripeti">Ripeti la password</label>
          <input id="ripeti" className="campo" type="password" autoComplete="new-password" required value={ripeti} onChange={(e) => setRipeti(e.target.value)} />
          <label htmlFor="codice">Codice d’invito</label>
          <input id="codice" className="campo" type="text" autoComplete="off" autoCapitalize="characters" required value={codice} onChange={(e) => setCodice(e.target.value)} />
          <p className="nota">Il codice d’invito te lo dà Nicola. La tua email serve solo per farti entrare e per sapere quali schede hai fatto tu.</p>
        </>}
        <button className="bottone" disabled={attesa}>{attesa ? 'Un attimo…' : modo === 'entra' ? 'Entra' : 'Crea il mio account'}</button>
        {errore && <p className="errore" role="alert">{errore}</p>}
        {modo === 'entra' && <p className="nota">Password dimenticata? Chiedi a Nicola di rimettere a posto il tuo account, poi iscriviti di nuovo con la stessa email.</p>}
      </form>
    </main>
  );
}
