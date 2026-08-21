---
tipo: quaderno-memoria
reparto: accessibility
bootstrap: 2026-07-14 02:31
---

# 🧠 Quaderno di accessibility
> Cosa ho imparato. Leggi all'inizio, aggiungi un ESITO alla fine di ogni lavoro 🟡/🔴.
> Formato: AAAA-MM-GG · contesto · scorecard 6 assi · atteso→reale · #tag

## Esiti
- (ancora vuoto — il primo ESITO si registra con: node cervello/chiusura-loop.mjs registra accessibility "…" "…" "…" "…")
2026-08-21 · Radiografia a11y marketplace (lettura statica /home/user/mycity) · Il codice ha già 15+ correzioni a11y numerate (#128 #131 #132 #134 #138 #139 #142 #145 #147 #150 #152): grep generici (div onClick, img senza alt, label senza htmlFor) danno quasi solo falsi positivi. Quello che paga è cercare le correzioni APPLICATE A METÀ: il pattern è fissato in un file e non nel gemello (Modal.tsx ok / rider senza dialog · product page qty con aria-live / cart senza · Field.tsx errore con role=alert / Checkbox dello stesso file senza). 15 difetti reali su 352 componenti, 1 bloccante. · lezione: su una base già auditata si cerca la DIFFUSIONE della correzione, non la correzione · #a11y #radiografia

2026-08-21 14:05 · Audit accessibilita visiva del marketplace (contrasto, fuoco, target, alt, aria) su /home/user/mycity, sola lettura · Ha funzionato: calcolare il contrasto con uno script sui hex veri invece che a occhio, e poi INCROCIARE la palette col dato reale del database — cosi e saltato fuori che Pane Quotidiano, l'unico negozio vero, ha scelto proprio l'unico colore del catalogo che non passa (senape #C4801F, bianco sopra = 3,25:1 contro 4,5:1 richiesti). Non ha funzionato: i primi tre scan a espressione regolare sui pulsanti hanno dato 31 falsi positivi e poi 0 — il codice e curato e le mie euristiche erano tarate su un codice sciatto. · Numeri: 12 difetti reali su 189 componenti; alt delle immagini pulito (0 mancanti su 83), pulsanti-icona senza nome 0 su ~600. · Lezione: in una base gia curata il valore non sta nel trovare tanti difetti, sta nel trovare le CORREZIONI GIA FATTE E NON PROPAGATE — RatingStars corretto ad accent-700 ma SellerCard no; il velo minimo del banner aggiunto in HomeSectionRenderer ma non in BannerSection ne in CmsBlockRenderer; il ring del fuoco corretto nella primitiva Field ma il bordo a riposo lasciato a 1,32:1. Si cerca il fix, poi i suoi gemelli. · #contrasto #wcag #propagazione-fix
