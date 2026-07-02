---
tipo: audit-pannello
titolo: "Radiografia del Pannello — 2° giro (completo, 8 dimensioni)"
data: 2026-07-02 15:20
autore: AD digitale (workflow audit-pannello)
stato: COMPLETO — 16/16 agenti, 0 errori. 63 rilevazioni → ~13 bug unici (0 bloccanti, molti gravi).
colore: 🟢 analisi · 🟡 i fix nel codice (firma Nicola)
---

# 🩻 Radiografia del Pannello — 2° giro

Girata sul codice **già corretto** (dopo i 7 fix di oggi). Ogni bug è passato dalla verifica avversariale.
I 63 findings si deduplicano in ~13 bug unici (lo stesso bug emerge da più dimensioni). 0 bloccanti.

## ✅ Corretto in questa PR
- **Tasto INDIETRO — residuo**: il mio fix precedente non seminava la voce di cronologia iniziale
  (`state=null`) → un clic morto e poi uscita dal Pannello. Ora: `history.replaceState({vista})` al mount
  + fallback a "plancia" in `popstate`. *(La macchina ha trovato da sola il buco nel proprio fix — è il volano che funziona.)*

## 🟡 Backlog per priorità (da fare)

### 🔴 Sicurezza — doppia esecuzione di azioni reali (il più urgente)
1. **"Approva" senza blocco durante l'invio** → doppio clic = azione 🔴 eseguita due volte. *Fix:* disabilitare il bottone finché l'invio non risponde.
2. **`/api/proposta` e `/api/azioni-pronte` senza idempotenza/dedup** → riapprovare accoda due lavori / rifà le "mani". *Fix:* dedup lato server sulla decisione già registrata.
3. **"Riprova" ripetibile dopo refresh** → riaccoda doppioni. *Fix:* `/api/riprova` rifiuta se il job è già stato riproposto.

### 🟠 Funzionali gravi
4. **Proposte del giro tracciate per INDICE**: dopo un nuovo giro le proposte NUOVE appaiono già "decise" e grigie, senza pulsanti. *Fix:* chiave stabile `idProposta(p)` invece dell'indice (propBusy/propEsito/propDecise).
5. **"Parla con questa casella" volatile**: cambiando tab/area la mini-chat si svuota; la risposta in arrivo si perde per sempre. *Fix:* coda pendenti persistente + salvataggio conversazione prima dell'attesa (come la chat principale).
6. **Liste dei moduli congelate** (ordini, negozi, clienti, consegne, recensioni): caricate una volta sola, senza `cache:no-store`. *Fix:* polling/refetch + no-store (come già fatto per Azioni).

### 📱 Mobile / accessibilità (il Pannello si usa da telefono)
7. **Bottoni Invia/Microfono chat sotto i 44px** (difficili da toccare). *Fix:* min 44×44.
8. **nav-tab sotto i 44px** + **nessuna gestione safe-area** (notch/barra Home) nella PWA. *Fix:* altezze touch + `env(safe-area-inset-*)`.

### ⚡ Performance
9. **La chat ri-parsa tutto il Markdown a ogni tasto** → scatti. *Fix:* memoizzare le bolle (React.memo/useMemo per messaggio).
10. **Doppio polling concorrente di `/api/lavori`** mentre una chat è in attesa. *Fix:* un solo poller.
11. **`setLavori` sostituisce sempre l'array** → re-render + riordino ogni 2-8s anche senza novità. *Fix:* aggiornare solo se cambiato (diff per id/updated_at).
12. Minori: `useMemo` con dip `[lavori]` che legge `window`; contatori tab che rifiltrano tutta la lista a ogni render.

### 🐛 Robustezza / edge
13. Due messaggi di fila nella stessa chat possono **scambiarsi le risposte**; area Lavori può crollare se un lavoro ha `richiesta` nulla; chat nuova con salvataggio fallito → bolla che gira all'infinito. *Fix:* id/lavoroId sui messaggi + guard su null.

## Nota strategica
La radice comune di metà di questi (navigazione, deep-link, hash-fantasma) è la **mancanza di un vero
router URL↔stato**: una bonifica unica li chiuderebbe insieme. I fix di sicurezza (1-3) sono invece
indipendenti e vanno fatti per primi (toccano azioni 🔴). Consiglio: **batch A = sicurezza doppio-invio (1-3)**,
poi **batch B = proposte-per-id + liste (4,6)**, poi mobile/perf.
