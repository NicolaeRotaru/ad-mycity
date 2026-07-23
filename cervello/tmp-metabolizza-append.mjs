import fs from 'node:fs';

const path = 'MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

data['_preferenza_nicola_23_07_1800_dedup_lavori_identici'] =
  "📌 FATTO DUREVOLE Nicola (chat 23/7 ~18:00, allegati screenshot lavori) — vuole che i lavori IDENTICI ripetuti in coda (stessa analisi rigenerata più volte, es. dopo che i limiti Claude erano scaduti e le analisi fallite sono state riprovate) vengano SOVRAPPOSTI/aggiornati invece di accumularsi come card separate. Preferenza generale riusabile: quando una sentinella/analisi produce lo stesso risultato di un lavoro già in coda, il sistema deve riconoscerlo come lo STESSO lavoro (aggiorna timestamp/contenuto) e non crearne uno nuovo — vale sia per il ciclo normale sia per i retry dopo un blocco (limite settimanale, errore). Vedi anche la lezione root-cause in LEZIONI-CHAT.md 23/7 (etichetta di dedup instabile = numero di giro invece di etichetta fissa).";

data['_nota_metabolizzazione_23_07_1800'] =
  "Chat 23/7 ~18:00: Nicola segnala analisi duplicate nei lavori (screenshot) dopo che i limiti Claude erano scaduti e i retry dal Pannello ne avevano creati di nuovi invece di riusare quelli esistenti. AD ha verificato nel DB: cassa-cieca ripetuta 76x dal 14/7, sensori-ciechi 39x — causa: le due sentinelle usano il numero del giro come etichetta invece di una fissa, quindi il controllo anti-doppione non scatta mai; negozi-fermi 25x è invece normale (si ripete ogni 24h a negozio fermo). Fix proposto (etichetta fissa + check-prima-di-creare sul tasto Riprova) in attesa del sì di Nicola. Aggiornati STATO.md (nuova mossa + priorità #8) e LEZIONI-CHAT.md (nuova lezione in cima, rimossa la più debole/vecchia del 20/7 per restare a 12).";

fs.writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
console.log('OK');
