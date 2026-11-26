// La scheda a schermo: le stesse sezioni di scheda.html (cervello/scheda-cliente.mjs → paginaScheda),
// in un ordine pensato per chi la legge in strada: prima cosa dire e cosa offrire, poi i dati e le fonti.
// Finché l'AD non ha finito, le sezioni sue mostrano «sta scrivendo»; quelle del programma sono già piene.

import { FASCE, ID_FASCE, euro } from '../lib/fasce.ts';
import { STATI, type Scheda as TScheda } from '../lib/scheda.ts';

const dominio = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };

function Fonte({ url }: { url: string | null }) {
  if (url && url.startsWith('https://')) return <a className="fonte" href={url} target="_blank" rel="noopener noreferrer">{dominio(url)}</a>;
  return <span className="fonte nessuna">nessuna fonte</span>;
}

function Scrive({ righe = 3 }: { righe?: number }) {
  return (
    <div className="scrive" aria-label="L’AD sta scrivendo questa parte">
      {Array.from({ length: righe }, (_, i) => <i key={i} style={{ width: `${92 - i * 14}%` }} />)}
    </div>
  );
}

function Lista({ voci, attesa, righe }: { voci: string[]; attesa: boolean; righe?: number }) {
  if (!voci.length) return attesa ? <Scrive righe={righe} /> : <p className="vuoto">Niente da dire, per ora.</p>;
  return <ul>{voci.map((v, i) => <li key={i}>{v}</li>)}</ul>;
}

export default function Scheda({ s }: { s: TScheda }) {
  const attesa = !s.completa;
  const f = s.consigliato ? FASCE[s.consigliato] : null;
  const m = s.sito.misura;
  return (
    <article className="pagina" aria-busy={attesa}>
      <header className="testata">
        <p className="interno">Scheda interna per il venditore: non si mostra e non si manda al titolare.</p>
        <span className="occhiello">Scheda cliente · {s.data}</span>
        <h1>{s.nome}</h1>
        <p>{[s.tipo, s.indirizzo ?? s.citta].filter(Boolean).join(' · ')}</p>
        <div className="chips">
          {f ? <><span className="chip forte">Consigliato: {f.nome} · {euro(f.centesimi)} al mese</span><span className="chip">Primo mese {euro(f.centesimi / 2)}</span></>
            : <span className="chip">{attesa ? 'L’abbonamento lo sceglie l’AD fra pochi secondi' : 'L’AD non ha scelto l’abbonamento: guarda le fasce qui sotto'}</span>}
          {s.linkMaps && <a className="chip" href={s.linkMaps} target="_blank" rel="noopener noreferrer">Apri la scheda Google ↗</a>}
        </div>
      </header>

      <section className="trenta" aria-labelledby="t30">
        <span className="occhiello" id="t30">In 30 secondi, prima di entrare</span>
        {s.in_30_secondi.length ? <ul>{s.in_30_secondi.map((v, i) => <li key={i}>{v}</li>)}</ul> : attesa ? <Scrive righe={4} /> : <p>L’AD non ha scritto il riassunto: leggi «Ha già» e «Non ha» qui sotto.</p>}
        {s.gancio ? <p><b>Il gancio per aprire:</b> {s.gancio}</p> : attesa ? null : null}
      </section>

      <section className="sezione"><h2>Cosa ha, cosa non ha, cosa va migliorato</h2>
        <div className="colonne">
          <div className="riquadro ha"><h3><span className="pallino" />Ha già</h3><Lista voci={s.ha} attesa={attesa} /></div>
          <div className="riquadro nonha"><h3><span className="pallino" />Non ha</h3><Lista voci={s.non_ha} attesa={attesa} /></div>
          <div className="riquadro migliora"><h3><span className="pallino" />Da migliorare</h3><Lista voci={s.migliorare} attesa={attesa} /></div>
        </div>
      </section>

      <section className="sezione"><h2>Cosa possiamo offrire, e perché</h2>
        {s.offerta.length ? <div className="griglia">{s.offerta.map((o, i) => <div className="riquadro" key={i}><h3>{o.servizio}</h3><p>{o.perche}</p></div>)}</div>
          : attesa ? <div className="riquadro"><Scrive /></div> : <p className="vuoto">L’AD non ha scritto le offerte.</p>}
        {s.perche_consigliato && <p className="nota"><b>Perché il {f?.nome ?? 'consigliato'}:</b> {s.perche_consigliato}</p>}
        <div className="fasce">
          {ID_FASCE.map((id) => (
            <div key={id} className={`fascia${id === s.consigliato ? ' scelta' : ''}`}>
              <span className="occhiello">{FASCE[id].nome}{id === s.consigliato ? ' · consigliato' : ''}</span>
              <b>{euro(FASCE[id].centesimi)} <span className="nota">al mese</span></b>
              <span className="nota">{FASCE[id].inPratica.piano}. Sito: {FASCE[id].inPratica.sito.toLowerCase()}.</span>
            </div>
          ))}
        </div>
        <p className="nota">Primo mese a metà, nessun vincolo, disdetta con 30 giorni di preavviso. Sui prodotti venduti tramite MyCity resta il 10%; al banco niente. Oggi si paga in contanti, di persona.</p>
      </section>

      <section className="sezione"><h2>Domande da fare al titolare</h2><div className="riquadro"><Lista voci={s.domande} attesa={attesa} righe={4} /></div></section>

      <section className="sezione"><h2>Obiezioni probabili</h2>
        <div className="griglia">{s.obiezioni.map((o, i) => <div className="riquadro" key={i}><p><b>«{o.obiezione}»</b></p><p>{o.risposta}</p></div>)}</div>
        {attesa && <p className="nota">Quelle tipiche di questo negozio le aggiunge l’AD.</p>}
      </section>

      <section className="sezione"><h2>Attenzione</h2><div className="riquadro"><Lista voci={s.attenzione} attesa={false} /></div></section>

      <section className="sezione"><h2>Sito e social di oggi</h2>
        <div className="riquadro">
          <h3>Sito · livello «{s.sito.livello}»{s.sito.daChi === 'programma' ? ' (stima del programma)' : ''}</h3>
          {m?.aperto && (
            <div className="misure">
              <div className="misura"><b>{m.pagine}</b><span className="nota">{m.pagine === 1 ? 'pagina' : 'pagine'} dalla home</span></div>
              <div className="misura"><b>{m.https === false ? 'No' : m.https ? 'Sì' : '—'}</b><span className="nota">protetto (https)</span></div>
              <div className="misura"><b>{m.telefonino ? 'Sì' : 'No'}</b><span className="nota">pensato per il telefono</span></div>
              {m.anno && <div className="misura"><b>{m.anno}</b><span className="nota">anno in fondo alla pagina</span></div>}
              {m.piattaforma && <div className="misura"><b>{m.piattaforma}</b><span className="nota">fatto con</span></div>}
            </div>
          )}
          {s.sito.giudizio ? <p>{s.sito.giudizio}</p> : attesa ? <Scrive righe={2} /> : !m?.aperto ? <p className="vuoto">Sito non visto: per la tabella firmata vale «medio». Guardalo dal telefono.</p> : null}
          {s.sito.fonte && <p className="nota">Fonte: <Fonte url={s.sito.fonte} /></p>}
        </div>
        <div className="tabella"><table className="pila"><thead><tr><th>Canale</th><th>Livello</th><th>Cosa si vede</th><th>Fonte</th></tr></thead>
          <tbody>{s.social.map((p, i) => (
            <tr key={i}><td>{p.canale}</td><td><span className={`stato ${p.stato === 'non_trovato' ? 'non_trovato' : 'da_confermare'}`}>{p.livello ?? (p.stato === 'trovato' ? 'Trovato' : 'Non trovato')}</span></td><td>{p.giudizio ?? ''}</td><td><Fonte url={p.fonte} /></td></tr>
          ))}
          {attesa && <tr><td colSpan={4}><span className="nota">Instagram, Facebook e TikTok li sta cercando l’AD…</span></td></tr>}</tbody></table></div>
      </section>

      <section className="sezione"><h2>Reputazione</h2>
        <div className="riquadro">{s.reputazione.sintesi ? <p>{s.reputazione.sintesi}</p> : attesa ? <Scrive righe={2} /> : <p className="vuoto">Nessuna recensione trovata fuori da Google: guardale sulla scheda Google.</p>}</div>
        <div className="colonne">
          <div className="riquadro"><h3>Cosa piace</h3><Lista voci={s.reputazione.positivi} attesa={attesa} righe={2} /></div>
          <div className="riquadro"><h3>Cosa non piace</h3><Lista voci={s.reputazione.negativi} attesa={attesa} righe={2} /></div>
        </div>
      </section>

      <section className="sezione"><h2>Concorrenti vicini</h2>
        <div className="riquadro">
          {s.concorrenti.length ? <>
            <p>{s.concorrentiContati} dello stesso tipo nel raggio di 450 metri, sulla mappa libera. I più vicini:</p>
            <ul>{s.concorrenti.map((c, i) => <li key={i}>{c.nome}{c.tipo ? ` · ${c.tipo}` : ''} · {c.distanza} m <Fonte url={c.fonte} /></li>)}</ul>
          </> : <p className="vuoto">La mappa libera non dice chi c’è vicino{s.tipo ? '' : ' (il tipo di attività non è segnato)'}. Guardati intorno: chi vende le stesse cose nella via?</p>}
        </div>
      </section>

      <section className="sezione"><h2>Potenziale</h2><div className="riquadro"><Lista voci={s.potenziale} attesa={attesa} /></div></section>

      <section className="sezione"><h2>I dati dell’attività</h2>
        <p className="nota">Ogni dato dice da dove viene e quanto è sicuro. «Da confermare» vuol dire letto in un elenco, sulla mappa o in una ricerca, non ancora visto dal titolare.</p>
        <div className="tabella"><table className="pila"><thead><tr><th>Voce</th><th>Valore</th><th>Quanto è sicuro</th><th>Fonte</th></tr></thead>
          <tbody>{s.campi.map((c, i) => (
            <tr key={i}><td>{c.voce}</td><td>{c.valore ?? <span className="vuoto">—</span>}</td><td><span className={`stato ${c.stato}`}>{STATI[c.stato]}</span></td><td><Fonte url={c.fonte} /></td></tr>
          ))}</tbody></table></div>
      </section>

      {(s.fonti.length > 0 || s.avvisi.length > 0) && (
        <section className="sezione"><h2>Fonti e avvisi</h2>
          {s.fonti.length > 0 && <div className="riquadro"><ul>{s.fonti.map((x, i) => <li key={i}><a href={x.url} target="_blank" rel="noopener noreferrer">{x.titolo}</a> <span className="fonte">{dominio(x.url)}</span></li>)}</ul></div>}
          {s.avvisi.length > 0 && <div className="riquadro"><ul className="nota">{s.avvisi.map((a, i) => <li key={i}>{a}</li>)}</ul></div>}
        </section>
      )}
      <p className="piede">Indirizzi, tipi e concorrenti: © OpenStreetMap contributors (licenza ODbL). Ricerca e giudizio: l’AD di MyCity. Nessun dato di Google viene copiato: la scheda Google si guarda dal link.</p>
    </article>
  );
}
