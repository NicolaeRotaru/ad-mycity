---
tipo: checklist-personale
destinatario: Nicola
fonte: AD digitale (rigenerata da AZIONI-IN-ATTESA + cantiere-difetti + STATO)
aggiornato: 2026-07-08 06:21
---

# ✅ Cose che devo fare io (Nicola)

> Solo le cose che richiedono **me**: firme, decisioni umane, sblocchi, materiali.
> Le spunte si salvano dal Pannello. Priorità: 🔴 critico · 🟡 importante · 🟢 utile.
> L'AD rigenera questo elenco a ogni giro dalla coda viva; tu spunti ciò che hai fatto.

## 🖥️ Porta online i fix già pronti (merge & deploy)
- [ ] 🔴 **Ok al merge del fix "il Pannello non vede tutti i dati"** (coda #28, PR #167) — «ok merge 28». Il deploy Vercel si sblocca da solo entro ~24h (limite giornaliero free).
- [ ] 🔴 **Ok al merge delle modifiche Pannello** (coda #18, PR #131).

## 🚦 Firme e materiali che sbloccano il faro
- [ ] 🔴 **Firma del negozio** sul contratto Pane Quotidiano (commissione 12%, 0€ fissi) — al momento dell'onboarding (coda #1: la tua firma è già data l'1/7, manca quella della bottega).
- [ ] 🟡 **Materiale di Pane Quotidiano**: foto, scheda prodotti, consenso — serve per portare i contenuti a livello pro (R3 / pacchetto PQ; i segnaposti `[SERVE DA NICOLA]` dicono cosa manca).

## 🔧 Un comando / un accesso (setup macchina)
- [ ] 🟡 **Attiva il sync automatico del VPS** — 1 comando root una tantum dalla Console Hetzner (coda #17): `sudo bash /opt/mycity/ad-mycity/cervello/vps/install-sync-vps.sh`.
- [ ] 🟢 **Aggancia il blocca-segreti su questo VPS** — 1 comando: `bash cervello/installa-hooks.sh` (il pre-commit hook oggi non è attaccato su questo checkout).
- [ ] 🟡 **Chiudi il buco RLS + smoke checkout (SQL 107)** — è AD-owned e già firmato: mi serve solo **la mano** (concedimi lo strumento `execute_sql` in una sessione live **oppure** fai partire un giro sul VPS con le credenziali) e lo applico + verifico in ~1 min (coda #32).

## 🩻 Salute della macchina — 6 firme sui fix (radiografia del 7/7)
> Sono auto-modifiche: per regola **non le applico da sola**, le firmi tu. Ordinate per impatto sulla crescita.
- [ ] 🟡 **Il contatore dei costi AI è cieco** (AR-043): oggi registra ~882 token per un giro da 20 minuti (sottostima di ~1000×). Con questo numero non possiamo decidere nulla su costo/valore. Fix pronto: leggere l'uso reale del motore.
- [ ] 🟡 **Il "volano" non misura mai gli esiti** (AR-040/041/042): le 18 previsioni registrate non entrano nel punteggio (schemi diversi) e nessun codice apre un esperimento → autonomia dei reparti ferma a zero da sempre. Fix pronto: un ponte previsto→misura.
- [ ] 🟡 **Il giro può pubblicare il proprio codice senza firma** (AR-044): `git add -A` mette in produzione anche eventuali auto-modifiche. Fix pronto: un guardiano che blocca il push se tocca codice fuori dalla memoria.
- [ ] 🟡 **Pannello: "approva/ignora" dice ok anche se il salvataggio fallisce** (AR-034): con le azioni reali accese diventa rischio di doppio invio. Fix: rollback + chiave di idempotenza.

## 📅 Dal 13/7 (ripresa operativa) e leve a scadenza
- [ ] 🟡 **Visita di persona le 6 botteghe food prioritarie** il 13/7 (coda #39: Osteria Carducci, La Forchetta, Tre Ganasce, La Dispensa, Trattoria dei Pescatori, Tigellabella) — dossier + schede-cheat tascabili pronti da stampare.
- [ ] 🟡 **Bando Commercio ER (40% a fondo perduto) scade il 21/7**: chi vuole candidarsi va sentito entro ~15/7.

## ⏳ Parte da solo al 1° ordine reale — niente da fare ora
> Questi aspettano che nasca e si consegni **il primo ordine reale** (il vecchio #16 è stato annullato). Li accendo io al momento giusto: recupero del carrello da €10 (samir), richiesta prima recensione, referral "porta un amico", payout-test.

---
> Cosa NON serve più (tolto rispetto alla versione vecchia del 26/6): il token GitHub è **già revocato** (fatto 7/7), il merge dei fix del cantiere è **già pubblicato su main** (7/7), l'ordine di lancio del 27/6 e la domanda "Stripe live o sandbox?" (deciso: **sandbox**) sono **superati**, e il sensore PostHog è stato **spento da te** (non va più configurato).
