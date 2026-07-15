Fai un GIRO DI MONITORAGGIO WEB come AD digitale di MyCity (Ondata 3). Obiettivo:
tenere il mondo esterno di Piacenza sempre aggiornato, in continuo, scrivendo nei file
Intelligence del vault — così la Cabina mostra sempre dati freschi senza che Nicola chieda.

Passi:
0. Leggi `cervello/fonti-salute.json`: **salta** fonti con `morta: true` (non spendere token). Fonti con
   `accesso: "websearch"` o `waf_blocked: true` → **solo WebSearch mirata**, mai retry WebFetch (403 WAF).
1. Leggi il registro fonti `cervello/radar-fonti.json`. Seleziona SOLO le fonti **DOVUTE oggi**
   per `cadenza`: tutte le "giornaliera" + le "settimanale" che non controlli da ≥7 giorni
   (guarda la data in cima ai file Intelligence per capire quando l'hai fatto l'ultima volta).
   Non sprecare il Max: NON ricontrollare le settimanali ogni giorno.
2. Per ogni fonte dovuta: apri l'`url` con **WebFetch** (o **WebSearch** mirata su `cosa_cercare`
   + "Piacenza"). Estrai SOLO novità REALI e azionabili (no copia-incolla, no notizie vecchie).
   Cita sempre il link. Se una fonte non dà nulla di nuovo, NON inventare: passala.
3. Raggruppa i risultati per file di destinazione (`scrive_in`) e AGGIORNA i file Intelligence
   in `MyCity-Vault/90-Memoria-AI/Intelligence/` (uno per tipo), con la **data di oggi in cima**,
   sintetici e azionabili. Sovrascrivi col risultato più fresco; se per un file non hai nulla di
   nuovo, lascia quello esistente (non svuotarlo):
   - `radar-concorrenti.md` — concorrenti (Glovo/CompraPiacenza/GDO/Cortilia): prezzi, promo, novità, punti deboli.
   - `eventi-picchi.md` — eventi/sagre/fiere/meteo/ZTL a 7-14 gg e i PICCHI di domanda attesi, con consigli operativi.
   - `buchi-mercato.md` — categorie/zone scoperte e botteghe a rischio (da immobiliare/news).
   - `leve-uscita.md` — leve OUT attivabili ora (bandi, istituzioni, associazioni, eventi da agganciare).
   - `reputazione.md` — cosa si dice di MyCity e dei nostri negozi: menzioni, recensioni, sentiment, lamentele.
4. Per ogni novità ad alto impatto, instradala al `senior` indicato nella fonte e, se serve un'azione
   reale (contattare un giornalista, un ente, uno sponsor), preparala COMPLETA e accodala in
   `MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md` col colore giusto (🟡/🔴, firma di Nicola).
5. Segui le **catene indirette** (`cervello/radar.json` → `catene_indirette`): se una novità muove il
   primo anello (es. allerta meteo, caro-energia, evento grosso), cogli l'opportunità a valle.
6. Registra una riga in `MyCity-Vault/90-Memoria-AI/SALA-OPERATIVA.md`:
   `- AAAA-MM-GG HH:MM · @intelligence · FATTO · monitoraggio web: <fonti controllate, novità chiave>`.

Nota metodo (imparata 2026-06-27): i portali locali (Libertà, IlPiacenza, PiacenzaSera, comune.piacenza.it)
spesso **bloccano WebFetch con HTTP 403**. È un blocco lato-sito, non un problema di proxy: in quel caso
**ripiega su WebSearch mirata** ("<cosa_cercare> Piacenza <data>") e cita comunque il link alla fonte.
Per leggerli oltre il 403 servirebbe un'integrazione RSS/feed via @builder-automazioni (sbloccherebbe le
chiusure/aperture di botteghe → lead per @vendite, oggi invisibili): segnalalo come carburante a Nicola.

Regole: solo dati reali con link (mai inventare); ora-di-parete di Piacenza con l'ora nelle date;
è un giro LEGGERO (solo le fonti dovute), non l'audit completo. Il colore: 🟢 leggere/scrivere note ·
🟡/🔴 le azioni reali sul mondo (si accodano e le firma Nicola).
