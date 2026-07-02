---
tipo: sintesi-ad
data: 2026-07-01 01:29
richiesta: Nicola — giro web tutti i senior
senior: 42/42
ambiente: Cursor (WebFetch globale locale); worker VPS ancora whitelist fino merge PR main
---

# Giro web apprendimento — 42 senior (2026-07-01)

Ogni senior ha 1 riga ESITO in `memoria-squadra/<nome>.md` con URL + data fonte.

## Top 10 scoperte azionabili per MyCity

| # | Reparto | Cosa hanno imparato | Perché conta per noi |
|---|---------|---------------------|----------------------|
| 1 | **relazioni-istituzionali** | Bando FESR ER Commercio 2026 **chiuso 23/06** (tet domande, fino 40% fondo perduto) | Non promettere il bando ai negozi — cercare prossimo sportello |
| 2 | **contabilita** | Fattura elettronica **v1.9.1** da **15/05/2026** (AdE: codici destinatario fino 300, controllo Gruppi IVA) | Verificare gestionale commissioni MyCity |
| 3 | **legale-privacy** | CGUE **2/12/2025** (C-492/23): marketplace = **titolare GDPR** su dati negli annunci | Mappare su catalogo/recensioni MyCity |
| 4 | **marketing + growth** | **Agentic Commerce**: cataloghi devono essere leggibili dagli agenti AI (Casaleggio mag 2026, Netcomm) | Schema prodotto + FAQ strutturate = moat SEO/AI |
| 5 | **seo** | Google mag 2026: niente trucchi GEO — AI Overview premia GBP + schema LocalBusiness + contenuti utili | Allineato al pacchetto SEO già pronto |
| 6 | **cro + ux-designer** | Checkout: **costi consegna inaspettati = #1 abbandono** (40,7% EU); wallet-first mobile +6-11% in test A/B | Mostrare fee consegna prima del pagamento |
| 7 | **crm-lifecycle** | Flow email = 2-8% invii ma **40-65% revenue**; carrello: serie 3 email recupera ~60-70% in più di 1 sola | Conferma strategia flussi già in `consegne/crm/` |
| 8 | **vendite + intelligence** | Glovo/DH: quick commerce integra **botteghe locali** (local shops >€1 mld GMV Q1 2025); EU food delivery ~$83 mld 2026 | Conferma tesi "botteghe del centro" vs solo dark store |
| 9 | **finanza + dispute** | Stripe Pricing Policy agg. **18/12/2025** (IC+ rettifiche retroattive); disputa IT **20€** fee | Budget dispute + verificare accordo pricing MyCity |
| 10 | **tech stack** | Next.js 16 (cache components), Supabase: tabelle public non auto-esposte (**deadline ott 2026**), OWASP Top 10:2025 | Backlog tech 🟡 — niente deploy 🔴 |

## Per cluster reparto (1 riga ciascuno)

**Crescita:** ads locali 85-95% Google vs 5-15% Meta (SteerAds); short-form <60s domina IG/FB (Sprout); micro-creator 10-20 roster > 1 hero (impact.com).

**Vendite/Ops:** churn merchant food 25-45% annuo se integrazione debole (ClearlyPayments); last-mile 2026 = affidabilità ETA > velocità (Bringg); cargo bike commerciale = EN 17860 (United eBike).

**Tech:** n8n 2.0 Save≠prod, Publish esplicito; PostHog agent-first MCP; Render ISR = persistent disk su `.next/cache`.

**Creative:** texture/tipografia audace vs feed AI-polish (Planable); reel IG 4× interazioni vs immagine (Metricool); AI foto = hero reale + AI solo sfondo (GoPackshot).

**Strategia:** liquidity rate >20% = marketplace sano (Fairview); continuous discovery settimanale resta standard PM (Torres); PR locale = verifica + narrazione fedele ai dati (Prima Online).

## Limiti del giro

- Eseguito in **Cursor** (web libero). **Worker VPS** ancora whitelist 11 domini finché PR `fix/webfetch-globale` non mergiata su `main`.
- Alcuni fetch timeout (Delivery Hero, Appscrip, comune.piacenza.it) → ripiego WebSearch, limite dichiarato in ESITO.
- Numeri benchmark = fonti citate, **non** dati MyCity — da validare sui nostri KPI.

## Dove vedere tutto

| Dove | Cosa |
|------|------|
| `memoria-squadra/*.md` | 42 righe ESITO con URL |
| `SALA-OPERATIVA.md` | Handoff cross-reparto |
| Questo file | Sintesi AD per Nicola |
