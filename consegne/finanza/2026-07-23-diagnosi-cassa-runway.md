---
data: 2026-07-23 11:53
tipo: diagnosi
reparto: finanza
origine: RIPROVA sentinella cassa_sconosciuta (riapprovata da Nicola dal Pannello 2026-07-23T09:28:40Z; firma=208, ora 217 giri)
---

# Diagnosi cassa / runway — 23 luglio 2026 (7ª volta, invariato dal 14/7)

## In una riga per Nicola

**Non c'è niente di nuovo da diagnosticare: Stripe funziona, legge 0 €, e il burn mensile (302 €/m) lo hai già confermato a voce il 20/7 — manca solo la riga di comando sul VPS che lo scrive nel file. La macchina non può scriverla da sola: quel file è protetto, solo tu puoi toccarlo dal terminale.**

---

## Cosa dice il sensore ADESSO (11:32, giro di stamattina — dato fresco, non ri-eseguito per non toccare Stripe due volte inutilmente)

| Pezzo | Stato | Prova |
|---|---|---|
| Cassa Stripe (available + pending) | **0 €** | `cassa-runway.json` 11:32, `fonte_cassa: "Stripe balance"` |
| `BURN_MENSILE_EUR` nel `.env` VPS | ❌ ancora assente | `burn_mensile_eur: null` |
| Runway | **sconosciuto** | **217 giri consecutivi** (`giri_sconosciuto: 217`) |
| Ordini pagati marketplace | 0 | invariato da settimane |

Nessun bug: il sensore fa esattamente il suo lavoro (`cervello/sensore-cassa.mjs`) — legge Stripe, cerca `BURN_MENSILE_EUR`, non lo trova, scrive «sconosciuto» e conta i giri. È la 7ª volta che questa diagnosi arriva alla stessa conclusione (14/7 → 98 giri, 18/7 → 137, 19/7 → 159, 20/7 → 175, oggi → 217).

## Perché la macchina non l'ha già fatto da sola

Il file `cervello/vps/.env` è protetto da permessi del sistema operativo del VPS: **solo tu puoi scriverci**, dal terminale con la tua sessione. Non è un blocco software che posso sbloccare — è voluto (i segreti/env non li tocca la macchina in autonomia, per sicurezza). Per questo la card è rimasta 🟡 «in attesa OK Nicola» invece di 🟢 «fatto».

## Il numero da usare — già deciso, non serve rispondere di nuovo

Il 20/7 hai confermato a voce: Claude Max 200 € + Vercel 30 € + Supabase 50 € + VPS 20 € + dominio ~2 € = **302 €/mese**. Questo valore è già la fonte unica di verità in `registro-fatti.json` (nessuna nuova domanda: uso quello, non A/B come nelle diagnosi precedenti).

**Comando unico da incollare nel terminale del VPS:**

```bash
echo "BURN_MENSILE_EUR=302" >> /opt/mycity/ad-mycity/cervello/vps/.env && sudo systemctl restart mycity-worker-chat.service
```

## Cosa cambia appena lo fai

Con cassa Stripe a 0 € oggi, il calcolo darà **runway = 0 mesi → stato critico** (sotto la soglia di 3 mesi). Non è un errore del sensore: è la verità — non c'è ancora incasso reale (0 ordini pagati). La card «runway sconosciuto» sparisce e ne arriva una nuova, onesta: «runway critico», che è il segnale giusto per lavorare su @fp-and-a (piano cassa) finché non entra il primo incasso vero da Pane Quotidiano.

## Cosa NON serve (per non farti perdere tempo)

- ❌ Nessuna nuova PR di codice — il sensore e la sentinella sono già su `main`, funzionano bene
- ❌ Nessun ricollegamento Stripe — è a posto da mesi
- ❌ Nessuna decisione nuova sul numero di burn — è già confermato (302 €/m)
- ❌ La macchina non muove né tocca denaro — questa è solo una riga di configurazione

## Effetto collaterale trovato: la card è duplicata in coda

In `AZIONI-IN-ATTESA.md` lo stesso comando è accodato **due volte** con nomi diversi: `#burn-mensile-env` (17/7) e `#burn-mensile-runway` (16/7, già segnata "✅ APPROVATA" ma mai eseguita perché il permesso file lo impedisce). Basta eseguire il comando una volta sola — copre entrambe. Segnalo la doppia card per la prossima pulizia coda (non la tocco ora, è housekeeping già in coda separatamente su `#cadenza-housekeeping`).

---

## Storico completo (7 diagnosi, stesso blocco, mai una riga di codice cambiata)

| Data | Giri sconosciuto | Blocco |
|---|---|---|
| 14/7 | 98 | BURN assente (prima diagnosi) |
| 18/7 | 137 | invariato |
| 19/7 | 159 | invariato |
| 20/7 02:07 | 175 | invariato |
| **23/7 11:32** | **217** | invariato — unica azione mancante: comando VPS di Nicola |

---
*Fonti: `MyCity-Vault/90-Memoria-AI/auto-coscienza/cassa-runway.json` (11:32, dato del giro di stamattina) · `MyCity-Vault/90-Memoria-AI/registro-fatti.json` (burn 302 €/m confermato 20/7) · `consegne/finanza/2026-07-20-diagnosi-cassa-runway.md` (diagnosi precedente) · sola lettura, nessuna scrittura su Stripe o sul DB.*

---

## Addendum 12:13 — RIPROVA riapprovata da Nicola, nessun cambiamento (8ª volta)

Rieseguita perché Nicola ha premuto "riprova" sulla card dal Pannello alle 09:29. Ricontrollato `cassa-runway.json` (aggiornato 11:57, non ri-lanciato il sensore per non interrogare Stripe due volte a vuoto): **`giri_sconosciuto` ora 218** (era 217), cassa 0€, `burn_mensile_eur: null` — tutto invariato rispetto a sopra. Non c'è niente di nuovo da diagnosticare: il blocco resta lo stesso comando VPS che solo Nicola può lanciare (vedi sopra). Non serve una card "RIPROVA" per questa sentinella finché il comando non viene eseguito — riprovare non cambia l'esito perché non è un guasto della macchina, è un'azione che aspetta la sua firma sul terminale.

## Addendum 12:23 — RIPROVA di nuovo (9ª volta, terza in 10 minuti)

Nicola ha ripremuto "riprova" alle 09:29:03Z (stesso minuto della precedente, verosimilmente click ripetuti sulla stessa card). Ricontrollato `cassa-runway.json`: **`giri_sconosciuto` ora 219**, cassa 0€, `burn_mensile_eur: null` — invariato. **Fermo qui, non serve una quarta rilettura:** premere "riprova" su questa card non fa nulla, perché il blocco non è nella macchina — è un comando da incollare a mano nel terminale del VPS (Nicola ha accesso SSH, l'AD no sul file protetto). Se Nicola vuole chiudere davvero questa sentinella, l'unico passo è:

```bash
echo "BURN_MENSILE_EUR=302" >> /opt/mycity/ad-mycity/cervello/vps/.env && sudo systemctl restart mycity-worker-chat.service
```

Un comando, una volta sola, dal terminale del VPS — non dal Pannello. Finché non parte da lì, ogni "riprova" tornerà a questa stessa riga.
