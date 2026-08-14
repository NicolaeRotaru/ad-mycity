---
tipo: checklist-personale
destinatario: Nicola
fonte: AD digitale (rigenerata da AZIONI-IN-ATTESA + STATO · AR-030)
aggiornato: 2026-08-15 00:40
---

# ✅ Cose che devo fare io (Nicola)

> Solo ciò che richiede **te**: firme, merge, materiali, decisioni umane.
> Rigenerata perché era ferma al 12/8 22:43 — oltre i 2 giorni (AR-030).
> Business ancora **invariato**: 1 ordine totale (mai pagato, 24/6), 0 pagati, stallo **52 giorni**
> — dentro la pausa concordata con te fino al 24/8-1/9, non è churn.

---

## 🔴 DECISIONI TECNICHE A PIÙ ALTO IMPATTO (dal marketplace vero, ferme dal 29/7)

- [ ] 🔴 **Tappa i 5 punti dove il marketplace perde soldi da solo** (doppia vendita dopo checkout scaduto, coupon che si esauriscono sui tentativi non sugli ordini, il rider può decidersi lo stipendio, il rider non viene mai pagato sulla spedizione gratis, un reclamo blocca il negozio per sempre) — bastano poche righe per i primi due, una migration per gli altri.
  → Card `#38` in [[AZIONI-IN-ATTESA]]

- [ ] 🔴 **Chiudi le 4 porte aperte su dati di negozi e clienti** (liste negozi scrivibili senza login, indirizzi clienti leggibili senza login, venditori/rider auto-approvati alla registrazione, dati di consegna modificabili senza login) — verificate una per una sul database vero.
  → Card `#37` in [[AZIONI-IN-ATTESA]]

- [ ] 🔴 **Ripara il pulsante che negozio e rider usano per far avanzare un ordine** — oggi dà errore sempre, per un campo cancellato a giugno che un controllo di sicurezza cerca ancora. Al primo ordine vero il negoziante non riesce ad accettarlo.
  → Card `#36` in [[AZIONI-IN-ATTESA]]

---

## 🟡 DECISIONI RAPIDE (una parola/un click bastano)

- [ ] 🟡 **Spegni davvero PostHog sul server** — nel codice l'hai già deciso il 5/7, ma sul VPS la chiave è ancora accesa. Un comando da incollare nel terminale.
  → Card `#80` in [[AZIONI-IN-ATTESA]]

- [ ] 🟡 **Apri gli occhi delle sessioni cloud sulla Cabina e sul marketplace** — 3 host da aggiungere all'allowlist di rete dell'ambiente claude.ai/code (2 minuti), più due variabili facoltative se vuoi che vedano anche i dati.
  → Card `#76` in [[AZIONI-IN-ATTESA]]

- [ ] 🟡 **Due domande su 5 righe nuove nel foglio dei permessi del server** (push diretto su main va bene così? i due strumenti Supabase che scrivono servono davvero?) — una parola per ciascuna basta.
  → Card `#74` in [[AZIONI-IN-ATTESA]]

- [ ] 🟡 **Da quale piano rivedo prima?** 9 dei tuoi 10 piani hanno frasi smentite dai fatti (bando chiuso dato per aperto, negozio-faro sbagliato, commissione 12% invece di 10%). Ordine proposto: ① Piano Vendite ② Piano Istituzionale ③ Piano Editoriale.
  → Card `#69` in [[AZIONI-IN-ATTESA]]

- [ ] 🟡 **Telegram lo vuoi acceso o lasciamolo spento?** Oggi è spento e basta, nessuno te l'ha mai chiesto.
  → Card `#66` in [[AZIONI-IN-ATTESA]]

- [ ] 🟡 **Il permesso "jolly" nei permessi della macchina va tolto?** Oggi può eseguire qualunque programma finisca nella sua cartella `cervello/`. L'elenco esplicito di 75 programmi veri è già pronto da incollare — e sbloccherebbe anche i comandi di controllo (`test-cervello`, `gate-veri`, ecc.) oggi bloccati in sessione chat.
  → Card `#42` in [[AZIONI-IN-ATTESA]]

- [ ] 🟡 **Metti la partita IVA vera nell'informativa privacy** (oggi c'è un segnaposto `IT00000000000`) — l'unico dato che non posso dedurre da solo; il resto (cancellazione documenti, dati visti dal rider) lo preparo io in branch.
  → Card `#39` in [[AZIONI-IN-ATTESA]]

- [ ] 🟡 **Metti in sicurezza le anteprime del codice** (oggi usano le chiavi vere di Stripe e del database) prima che un fix ancora da approvare tocchi soldi o dati veri.
  → Card `#40` in [[AZIONI-IN-ATTESA]]

---

## 🟡 Da valutare quando hai un minuto (non bloccanti)

- [ ] 🟡 **Il cancello di fine-turno accusa lavoro vecchio come se fosse di oggi** (bug tecnico noto, non urgente) — un tecnico deve scegliere tra due cure.
  → Card `#65` in [[AZIONI-IN-ATTESA]]

- [ ] 🟡 **Rimetti in funzione il comando "radiografia"** prima che ti serva davvero — oggi è rotto in due punti, riparabile in un branch.
  → Card `#41` in [[AZIONI-IN-ATTESA]]

- [ ] 🟡 **Radiografia di te stessa scaduta** (oltre 11 giorni, soglia 10) — di' «radiografia di te stessa» quando vuoi che riparta. Nessuna urgenza, il business è comunque in pausa.
  → Riga `64` in [[AZIONI-IN-ATTESA]]

- [ ] 🟡 **`apprendimento.json` ricresciuto sopra il tetto che blocca le PR su GitHub** (di nuovo, come 6 giorni fa) — serve solo il tuo via libera a rilanciare lo strumento che lo alleggerisce.
  → Riga `63` in [[AZIONI-IN-ATTESA]]

> ⚠️ **Restano altre righe tecniche in coda** (fix di codice interno, PR da aprire/mergiare lato AD, cure alla memoria) che non richiedono una TUA decisione — sono lavoro che porto avanti io o i senior, oppure PR che aspettano solo il click di merge quando vuoi. Elenco completo, sempre aggiornato: [[AZIONI-IN-ATTESA]] (69 righe aperte al 15/8 00:32).
