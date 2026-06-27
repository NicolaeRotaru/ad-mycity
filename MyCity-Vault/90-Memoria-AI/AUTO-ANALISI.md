---
tipo: auto-analisi
data: 2026-06-28 00:35
voto_fiducia: 62
---

# 🔬 Auto-analisi dell'AD — 2026-06-28 00:35

> Il cancello di serietà: la macchina si controlla da sola PRIMA di consegnare. Report leggibile;
> il digest strutturato è in `auto-coscienza/auto-analisi.json`. Spec: `cervello/auto-analisi.md`.

## 🎯 Voto di fiducia: 62/100 (= rispetto al giro precedente)
Voto medio, abbassato da un errore di gravità alta non ancora chiarito (Garetti). Non è un «tutto ok»:
ci sono punti ciechi dichiarati (Supabase/Stripe giù) e un'entità su cui si stava agendo senza conferma.

## 🚨 Errori trovati (per gravità)

### 🔴 ALTA — «Garetti» trattato come negozio confermato senza una decisione di Nicola
- **Cosa:** pitch, kit, commissione 12% e payout-test 1€ sono preparati su Garetti.
- **Perché è un problema:** in `DECISIONI.md` Garetti compare **solo** come esempio di contenuto
  («post Garetti — La saracinesca»). Nessuna fonte (Supabase / decisione / documento) conferma che sia
  un negozio reale scelto. Se è un segnaposto, partirebbero azioni 🔴 reali su un'entità inventata.
- **Azione presa:** **declassato**. Tutte le azioni che riguardano Garetti restano sospese finché Nicola
  non conferma. Registro aggiornato (`da_confermare`, confidenza 0.35). → Domanda per Nicola qui sotto.
- **Scoperto a:** livello L1 (grounding delle entità).

### 🟡 MEDIA — l'apprendimento era cieco (imparava solo da un linter di 4 regole)
- **Cosa:** l'unico apprendimento automatico era `verificaQualita()` — 4 controlli (testo corto,
  segnaposti, email senza Oggetto/destinatario). Per questo aveva «imparato» solo 3 cose.
- **Perché è un problema:** ignorava le fonti vere di apprendimento (esiti, approvazioni di Nicola,
  calibrazione, pattern nei dati, benchmark). Una macchina che non impara dai dati non cresce.
- **Azione presa:** **corretto** — introdotto il motore `cervello/apprendimento.md` (7 fonti, archivio
  lezioni con confidenza/decadimento, preference learning, meta-apprendimento).

## ❓ Domande per Nicola
1. **Garetti è un negozio reale che hai scelto, o un esempio/segnaposto?** *(gravità alta)*
   Serve perché ci sono azioni 🔴 pronte su di lui. Se rispondi «reale» → lo confermo e si procede; se
   «esempio» → fermo tutto ciò che lo riguarda finché non c'è un negozio vero.

## 🩺 Salute della macchina
- Supabase MCP: **giù** in questo giro · Stripe MCP: **giù** · Dati freschi: **no** · Sensori attivi: **0**.
- Conseguenza: i dati interni non sono stati verificati live → ogni numero interno va trattato come da
  riconfermare appena gli MCP tornano.

## 🕳️ Punti ciechi
- Senza Supabase/Stripe non ho potuto verificare ordini/incassi/clienti reali.
- Nessuna metrica social/competitor collegata: i benchmark partono da fonti web, non da dati nostri.

## ⏭️ Cosa miglioro al prossimo giro
- Verificare ogni entità nuova contro il registro **prima** di preparare azioni.
- Iniziare a registrare previsto-vs-reale per costruire la calibrazione.
