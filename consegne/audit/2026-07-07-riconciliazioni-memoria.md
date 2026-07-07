---
data: 2026-07-07 12:55
tipo: hand-off — riconciliazioni di memoria (da applicare dal giro/VPS, non da un PR di codice)
fonte: radiografia totale 7/7 (deep-dive memoria)
---

# 🧠 Riconciliazioni di memoria — cosa resta e come applicarlo

> Queste sono correzioni sulla **memoria viva** che il VPS riscrive di continuo (STATO, checklist,
> quaderni): NON possono passare da un PR di codice (ri-conflitterebbero col giro ogni 5 min). Vanno
> applicate **dal giro/VPS stesso** (o a mano da Nicola). Qui trovi il cosa + i comandi esatti.

## ✅ Già risolte (nessuna azione)
- **registro-fatti.json** — era vuoto alla radiografia; ora ha **9 fatti** (il giro l'ha seminato). OK.
- **Collegamento-AD.md** — puntava ancora a `memoria-ad`; **corretto in questo stesso PR** a `main` (ramo unico).

## ⏳ Da applicare (3)

### 1) CHECKLIST-NICOLA.md ferma al 26/6 — il Pannello serve una to-do morta
Il file ha `aggiornato: 2026-06-26` e ripropone firme già date (es. commissione 12% a Garetti, firmata
1/7) e date scadute. Il Pannello (`/api/memoria/todo`) la mostra come "cose da fare di Nicola".
**Fix (giro/report della sera):** rigenerare la checklist dalle azioni VIVE — le voci `⏳` di
`AZIONI-IN-ATTESA.md` — e agganciarla come output obbligatorio del report della sera, così non invecchia
più. In alternativa: farla derivare direttamente dal parser della coda nel Pannello (elimina la copia).

### 2) Stato Stripe divergente in STATO.md (4 versioni)
`STATO.md` dice nella tabella sensori «❌ mai cablato · cieco (REST)» e nel semaforo «Stripe/Resend ok» —
si contraddicono. La verità è in `auto-coscienza/sensori-cecita.json`.
**Fix (giro):** derivare la riga Stripe della tabella sensori di STATO **da `sensori-cecita.json`** invece
di tenerla a mano, e riconciliare il semaforo nello stesso giro. (Se `STRIPE_SECRET_KEY` non è collegata,
scrivere «non configurato», non «ok».)

### 3) Doppia cartella `memoria-squadra`
Esistono `memoria-squadra/` (root, 44 file — la canonica che legge `chiusura-loop.mjs`) **e**
`MyCity-Vault/90-Memoria-AI/memoria-squadra/` (3 file doppioni). Le sessioni che lavorano nel vault
scrivono nella copia sbagliata → il guardiano misura una freschezza falsa.
**Fix (giro):** fondere le righe uniche dei 3 file della copia-vault nei quaderni root, sostituire la
cartella-vault con un `README` tombstone («i quaderni vivono in /memoria-squadra — non scrivere qui»), e
far fallire `chiusura-loop.mjs` se trova `.md` nella cartella-vault (guardia anti-ricomparsa).

## Come registrare i fatti-chiave (per non ripetere la divergenza)
Ogni fatto che cambia (specie da una risposta di Nicola) va nel registro unico, poi si riscrivono i file
vivi che lo citano:
```
node cervello/coerenza-fatti.mjs registra <id> "<nuovo valore>" --caccia "<frase col valore vecchio>" --fonte "…"
node cervello/coerenza-fatti.mjs   # verifica finché passa (exit 0)
```

---
*Deliverable della radiografia totale 7/7. I fix di codice (Round 1-5) sono su main via PR #212-221.*
