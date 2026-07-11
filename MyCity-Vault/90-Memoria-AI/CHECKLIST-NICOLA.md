---
tipo: checklist-personale
destinatario: Nicola
fonte: AD digitale (rigenerata da AZIONI-IN-ATTESA + STATO + cantiere-difetti)
aggiornato: 2026-07-11 08:30
---

# ✅ Cose che devo fare io (Nicola)

> Solo le cose che richiedono **me**: firme, decisioni umane, sblocchi, materiali.
> L'AD rigenera questo elenco a ogni giro dalla coda viva. Priorità: 🔴 critico · 🟡 importante · 🟢 utile.

## 🖥️ Sblocca il Pannello prima del 13/7 (urgente — <2 giorni)

- [ ] 🟡 **Committa un trigger su `pannello/`** per forzare il build Vercel (#trigger-build-pannello) — il Pannello online mostra la versione del 10/7 senza chip nella chat. Opzione A: dimmelo e lo faccio io con `git push origin main` (già nell'allowlist). Opzione B: dal terminale VPS `date > pannello/.deploy-trigger && git add pannello/.deploy-trigger && git commit -m "chore: trigger build pannello" && git push origin main`.
- [ ] 🟡 **Riavvia i worker** per eliminare il `module_not_found` (#worker-restart). Opzione A: Pannello → sezione Worker → «Riavvia worker». Opzione B: dal terminale VPS `sudo systemctl restart mycity-worker mycity-worker-chat`.
- [ ] 🟡 **Aggiungi in `.claude/settings.local.json`** la riga `"Bash(git push origin fix/*:*)"` dopo le altre Bash esistenti → poi dimmi «fatto» e pusho il branch per i chip nella chat normale (#chip-chat-normale).

## 🔐 Fix sicurezza pronti (merge della PR #212)

- [ ] 🟡 **Crea un PAT** su github.com/settings/tokens: tipo Fine-grained · Repository `NicolaeRotaru/mycity` · Permesso `Contents: Read and write`. Poi dal terminale VPS:
  ```bash
  cd /opt/mycity/ad-mycity/marketplace
  git stash
  git remote set-url origin "https://NicolaeRotaru:IL_NUOVO_PAT@github.com/NicolaeRotaru/mycity.git"
  git fetch origin && git rebase origin/main
  git push --force-with-lease origin fix/5-bloccanti-sicurezza
  git stash pop
  ```
  Poi **mergia la PR #212** su GitHub. Chiude: IBAN esposto (G10), RLS rider (B2), rimborso mancante (B4), coupon atomico (G8), middleware fail-open (G11), XSS JSON-LD (G12) e altro.

## 📅 Dal 13/7 (lunedì — ripresa operativa)

- [ ] 🟡 **Visita di persona le 6 botteghe food prioritarie** — dossier + schede-cheat tascabili pronti da stampare (`consegne/vendite/2026-07-06-dossier-6-botteghe-visita-13-7.md`): Osteria Carducci, La Forchetta, Tre Ganasce, La Dispensa, Trattoria dei Pescatori, Tigellabella.
- [ ] 🟡 **Conferma con Pane Quotidiano borse termiche** per il caldo >40°C previsto il 15-17/7 (batch food freschi il 13/7 — gate catena del freddo).

## ⏰ Scadenza 21/7 — bando ER (40% a fondo perduto)

- [ ] 🟡 **Decidi entro ~15/7** se candidare qualcuna delle 6 botteghe del 13/7 al Bando Commercio Emilia-Romagna (40% a fondo perduto). La mail Hub Urbano/Comune parte DOPO che la prima bottega è online (gate Nicola 9/7).

## 🩻 Salute della macchina — firme in attesa

- [ ] 🟡 **Il contatore costi AI è cieco** (AR-043): registra ~882 token per un giro da 20 min (sottostima ~1000×). Fix pronto.
- [ ] 🟡 **Il volano non misura mai gli esiti** (AR-040/041/042): 18 previsioni loggate, 0 entrano nel punteggio → autonomia reparti = 0 da sempre. Fix pronto.
- [ ] 🟡 **Il giro può pubblicare codice senza firma** (AR-044): `git add -A` mette in produzione auto-modifiche del motore. Fix pronto.
- [ ] 🟡 **Pannello: «approva/ignora» dice ok anche se il salvataggio fallisce** (AR-034): rischio doppio invio con azioni reali accese. Fix pronto.

## 💾 Allegati in chat (quando vuoi)

- [ ] 🔴 **Metti le variabili Storage su Vercel** + fai Redeploy per abilitare foto/file in chat (#60). Vercel → Settings → Environment Variables → `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` (progetto memoria) → Redeploy.

## ⏳ Gate al 1° ordine reale — parte da solo quando nasce

> Questi si attivano quando nasce e si consegna il primo ordine reale (VEN 17/7 o dopo):
> recupero carrello samir €10+ · prima recensione · referral «porta un amico» · payout-test.

---
> Rimosso rispetto alle versioni vecchie: token GitHub revocato ✅ (7/7) · fix cantiere su main ✅ (7/7) · SMS a PostHog ❌ (spento Nicola 5/7) · ordine #16 ❌ (ANNULLATO 3/7).
