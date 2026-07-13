---
tipo: audit-pannello-design
titolo: "🩻 Radiografia del design — Pannello completo"
data: 2026-07-13 23:30
autore: AD digitale (sola lettura su pannello/src, verifica avversariale)
stato: "COMPLETO — 22 problemi (0 bloccanti · 9 gravi · 13 minori). Nessuna modifica al codice."
colore: 🟢 analisi · 🟡 fix nel codice = firma Nicola
---

# 🩻 Radiografia del design — Pannello · 13 luglio 2026

Audit in **sola lettura** su tutto il Pannello (`pannello/src/`): layout, navigazione, coerenza visiva, mobile, accessibilità, stati UI e frizioni UX. **Niente rimosso, niente modificato** — solo ciò che ho verificato nel codice.

Confronto con le radiografie del **3/7** e **7/7**: molti bug runtime critici sono **già chiusi** (vedi sotto). Restano soprattutto **navigazione/cronologia**, **coerenza visiva** e **rumore in pagina**.

## In sintesi

| Gravità | N° | Cosa significa per te |
|---------|-----|------------------------|
| 🔴 Bloccante | **0** | Niente che mandi due volte un'azione reale (fix «Annulla» ok) |
| 🟠 Grave | **9** | INDIETRO che confonde, tab che non si aprono, grafica che stanca |
| 🟡 Minore | **13** | Dettagli touch, ombre, focus tastiera, pulizia legacy |

**Già sistemato** (non riproposto come bug): doppio invio su «Annulla» · merge chat al salvataggio · buffer sub al mount · ParlaCasella che ricarica la risposta · rollback Approva/Rifiuta · pallino worker su mobile · safe-area chat · target 44px sui bottoni chat · hub Memoria 4 tab · menu laterale ripulito (Storico/GitHub fuori dal menu).

---

## 🟠 GRAVI (9)

### Navigazione & cronologia

**G1 — Cambi area e la scheda vecchia resta incollata alla cronologia**
- Dove: `pannello/src/app/page.tsx` ~1737 (`pushState` fa spread di `history.state` **senza togliere** `sub`)
- Cosa vedi: sei in Memoria › Archivio, vai su Home, premi INDIETRO → atterri in Memoria ma su una scheda sbagliata, o Archivio prova ad aprire un file con un nome assurdo («documento non trovato»)
- Fix 🟡: al cambio area `{ const { sub: _, ...resto } = st; pushState({ ...resto, vista }, …) }`

**G2 — Archivio accetta qualsiasi stringa come nome file (legacy Report)**
- Dove: `pannello/src/components/aree/Documenti.tsx` ~99-101 (`openFromSub` senza validazione)
- Cosa vedi: percorsi di cronologia vecchi con `sub="approvare"` → errore «documento non trovato»
- Fix 🟡: accetta solo path che sembrano documenti (`consegne/`, `.md`, ecc.) — stesso filtro già suggerito a luglio

**G3 — Tocchi più volte la stessa scheda → INDIETRO va a vuoto**
- Dove: `pannello/src/lib/nav.ts` ~55-63 (`vaiSub` fa sempre `pushState`)
- Cosa vedi: 3 tap su «In coda» = 3 INDIETRO inutili prima di uscire dall'area
- Fix 🟡: all'inizio di `vaiSub`, se `state.vista/sub` è già uguale → `return`

**G4 — Primo INDIETRO dentro un'area sembra morto**
- Dove: `pannello/src/app/page.tsx` ~1765 (`ripristinaSub` solo se `st.sub` esiste)
- Cosa vedi: entri in Azioni dal menu, apri «Da approvare», INDIETRO → resti lì; serve un secondo tap
- Fix 🟡: mappa `DEFAULT_SUB` per area (es. azioni → `mosse`) e ripristina sempre

**G5 — Deep-link Auto-coscienza ancora su `location.hash`**
- Dove: `pannello/src/components/AutoCoscienza.tsx` ~276
- Cosa vedi: link `#auto-coscienza` dalla Plancia bypassa il contrato unico `pushState` — rischio di INDIETRO incoerente con il resto
- Fix 🟡: usare `vaiArea` / anchor id come le altre aree

### Layout & gerarchia visiva

**G6 — Troppa roba sopra il contenuto, in ogni pagina**
- Dove: `pannello/src/app/page.tsx` ~2232-2242 (`DemoBanner` + timbro aggiornamento + `RicercaGlobale` sempre visibili)
- Cosa vedi: scroll extra prima di arrivare a ciò che ti interessa; in mobile la home «10 secondi» non è più a 10 secondi
- Fix 🟡: ricerca solo in header o collassata; banner demo solo se attivo; timbro più discreto fuori dalla Plancia

**G7 — Memoria: due livelli di tab (4 + 3 sotto Storico)**
- Dove: `Memoria.tsx` (4 tab) + `StoricoMemoria.tsx` (Decisioni · Quaderni · Stato&numeri)
- Cosa vedi: «Dove sono?» — hub ok ma profondo; Governo&diretta e Diario non sono qui (Diario resta solo via legacy assistente se ancora usato)
- Fix 🟡: valutare etichette più esplicite o breadcrumb «Memoria › Storico › Decisioni»

**G8 — Tab Memoria: altezza tap incoerente**
- Dove: `pannello/src/components/aree/Memoria.tsx` ~96-98 (mischia `nav-tab` con `py-1.5` / override attivo)
- Cosa vedi: tab attiva più bassa delle altre aree che usano `nav-tab` (44px)
- Fix 🟡: usare solo classi `nav-tab` / `nav-tab-active` senza override altezza

### Dark mode & grafica

**G9 — Grafici Numeri quasi invisibili col tema scuro**
- Dove: `pannello/src/components/NumeriReport.tsx` ~174 (`colore="#1a1410"` sulle barre incasso)
- Cosa vedi: barre scure su sfondo scuro → trend illeggibile
- Fix 🟡: `var(--text-primary)` o token Tailwind `ink` invece di hex fisso

---

## 🟡 MINORI (13)

| # | Area | Problema | Dove |
|---|------|----------|------|
| M1 | Mobile | Voci menu laterale ~32px altezza (`py-2`), sotto i 44px consigliati | `page.tsx` ~2214 |
| M2 | Mobile | Ombra chat `rgba(0,0,0,0.28)` fissa — troppo dura in dark | `page.tsx` ~2721 |
| M3 | a11y | Pochi `focus-visible` sui bottoni tab/card (navigazione da tastiera debole) | diffuso |
| M4 | Coerenza | Markdown Archivio usa CSS vars; Memoria viva / Governo usano `text-black/XX` — stesso tema, stili diversi | `Documenti.tsx` vs `MemoriaViva.tsx` |
| M5 | Coerenza | Tab attiva Memoria: doppia classe `nav-tab-active` + `bg-brand text-white` ridondante | `Memoria.tsx` ~96 |
| M6 | UX | «Scoperte & proposte» dentro tab Memoria viva — lunga scrollata sotto KPI/decisioni | `Memoria.tsx` ~109-152 |
| M7 | Legacy | Tipi `report` / `esplora` / `storico` ancora nel router TypeScript anche se il menu li ha fusi | `page.tsx` Vista union |
| M8 | Performance | Home Plancia: 6 fetch paralleli ogni 60s anche se resti su altra area (polling solo su Plancia ok, ma pesante se ci torni spesso) | `Plancia.tsx` ~68-80 |
| M9 | UX | Assistente: drawer chat alta fino a 660px — su telefono piccolo copre quasi tutto lo schermo | `page.tsx` ~2719 |
| M10 | Tipografia | KPI tile label 10.5px — limite basso per lettura su mobile | `globals.css` ~121 |
| M11 | Stati | `brand-50/30` su card scoperte — in dark può sembrare «spento» rispetto alle card `.card` standard | `Memoria.tsx` ~146 |
| M12 | Nav | `localStorage mycity_vista` può salvare vista legacy `report` — al refresh passa dal redirect (flash) | `page.tsx` ~1713-1716 |
| M13 | UX | Ricerca globale sempre aperta: competizione visiva con titolo area (`t-area`) | `page.tsx` ~2242 |

---

## ✅ Cosa regge bene (design)

- **Design system centralizzato** in `globals.css`: token `--text-*`, `.t-area`, `.t-corpo`, `.card`, `.nav-tab` con touch 44px
- **Hub Memoria** allineato alla decisione del 13/7: 4 tab (Viva · Archivio · Storico · GitHub), menu laterale snello
- **Home Plancia** chiara: firmare → allarmi → ritmo → lettera → macchina → KPI — flusso «10 secondi» sensato
- **Dark mode** a livello token: `text-black/` e `text-ink/` mappano su RGB che inverte — non è tutto rotto, ma i **grafici hex** e alcune **ombre fisse** sì
- **Chat mobile**: safe-area, bottoni 44px, annulla invio — curati

---

## 📋 Ordine consigliato dei fix (tutti 🟡, tu firmi)

1. **Nav batch** (G1+G2+G3+G4) — una PR, stesso file `nav.ts` + `page.tsx` + validazione `Documenti.tsx`
2. **Dark Numeri** (G9) — una riga in `NumeriReport.tsx`
3. **Rumore pagina** (G6) — dove mettere ricerca/banner
4. **Tab Memoria** (G7+G8) — coerenza touch + breadcrumb
5. **Minori** a batch (M1-M13) quando c'è tempo

---

*Prossima radiografia consigliata: dopo merge dei fix nav, o se segnali di nuovo «INDIETRO mi porta altrove» / «risposta sparita».*
