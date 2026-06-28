---
tipo: stato
aggiornato: 2026-06-28 22:23
fonte: AD digitale (dati reali Supabase + Stripe)
---

# 📟 STATO — Cruscotto dell'azienda

> Baseline del PRIMO PASSO. Verificato sul vivo (Supabase `clmpyfvpvfjgeviworth` + Stripe reale).
> Domani (25/6) i numeri devono iniziare a muoversi da 0.
>
> ⚠️ **28/6 00:51 (primo giro del nuovo giorno) — Web ✅ / Supabase ❌:** è domenica, il giorno
> **dopo** il Giorno-1 (la prima consegna concierge era ieri 27/6). **Supabase MCP ritentato → di
> nuovo NEGATO** → i 7 numeri restano alla baseline 24/6; la domanda chiave *"il Giorno-1 ha mosso
> qualcosa?"* è leggibile solo da Nicola o sbloccando il MCP. Check live: **allerta caldo confermata
> per oggi** (Arpae/Prot. Civile, 38-39°C, apice; svolta a inizio luglio ma con rischio temporali),
> **Arisa a Palazzo Farnese stasera** (presidio serale), **piattaforme operative** (gap ops-02 chiuso).
> ⭐ **Mossa strategica del giro:** preparare la **settimana di Sant'Antonino** (patrono, culmine
> **sab 4/7** + Venerdì Piacentini 3/7) = finestra di presidio/lead vendite più grande del mese.
> Vedi [[2026-06-28]].

## I 7 numeri del primo passo (baseline = oggi 24/6)
| Numero | Oggi | "Riuscito" domani | Note |
|---|---|---|---|
| Negozi LIVE nel cluster (approvato + payout + ≥1 prodotto) | **0** | ≥1 | oggi 2 approvati su 17, ma solo 1 con payout |
| Prodotti VERI del faro pubblicati | **0** | ≥5 | (250 "available" attuali = seed/test, da ignorare) |
| Ordini creati | **0** | ≥1 | anche l'ordine-test conta come prova pipeline |
| Ordini pagati | **0** | 1 | |
| Payout testato | **0** | 1 | la prova che incassa-trattiene-paga gira |
| Nuovi clienti reali | **0** | ≥1 | |
| Consegnato (primo sabato 27/6) | **0** | 1 (sab) | concierge a mano |

## Semafori
- 🟢 Va bene: infrastruttura pronta (Stripe attivo, onboarding/COD nel codice, catalogo tecnico ok).
- 🟡 Da tenere d'occhio: solo 1 seller con payout attivo; catalogo "sporco" di seed; email da confermare.
- 🔴 Problema: **chiave Stripe live o sandbox?** (da confermare stasera) · branding Stripe = "boh".

## Ultime mosse dell'AD
0l. **Giro 28/6 — 22:23 (passaggio 14, FINESTRA POST-ARISA + NOVITÀ INFRA MCP):** 2 ore dopo il 13°,
   nella finestra "~23:00 post-Arisa" che il p13 aveva schedulato (cadenza legittima). ⭐ Contributo a valore =
   **una novità tecnica concreta:** in sessione sono comparsi i **due server Supabase DEDICATI** —
   `supabase-marketplace` (dati) + `supabase-memoria` (digest), che prima non c'erano (solo il vecchio
   `claude_ai_Supabase`). Testati **tutti e tre** (`list_tables` + `execute_sql` marketplace, `execute_sql`
   memoria) → **"permesso non ancora concesso"**: 21° giro cieco, **MA lo sblocco è ora UN SOLO "approva"**
   di Nicola sul prompt del permesso, su server scoped — diagnosi affinata (non più un MCP generico vago).
   Nessuna ricerca web (notte, esterno fresco → Max risparmiato). Coda piena (8), nessuna azione nuova. **Voto
   fiducia 7.** Serve da Nicola: **un "approva" sul permesso MCP** (sblocca i 7 numeri) + **esito presidio
   Arisa** + **link lista d'attesa**. Prossimo giro utile: **domattina** o appena Nicola approva/risponde. Vedi [[2026-06-28]].
0m. **Giro 28/6 — 20:22 (passaggio 13, APERTURA EFFETTIVA DEL PRESIDIO SERALE):** 2 ore dopo il 12°.
   **Cambio-fase reale** (non il quasi-duplicato delle 18:22): la finestra fisica attesa tutto il giorno è
   **ORA aperta** — gente in arrivo in centro per Arisa (21:15), ore fresche post-picco. ⭐ Contributo a
   valore = **l'unico check decisivo del momento (go/no-go):** Arisa **CONFERMATA stasera ore 21:15 a Palazzo
   Farnese** (prima di 14 date del summer tour, biglietti in vendita, nessuna cancellazione nonostante
   l'allerta caldo — è di sera) → il presidio **si fa** ([ticketone](https://www.ticketone.it/event/arisa-live-tour-palazzo-farnese-21450766/) ·
   [piacenzasera](https://www.piacenzasera.it/2026/03/si-apre-a-piacenza-il-summer-tour-di-arisa-a-palazzo-farnese-il-28-giugno/636659/)).
   Mossa n.1: **essere in centro col QR ADESSO (20:00-21:15) + post-show 23:00** (coperto da azioni #6 e #8).
   **Supabase MCP ritentato su ENTRAMBI i progetti (marketplace + memoria) → negati** (20° giro cieco; il
   digest non è scrivibile sulla tabella `briefings`, resta nel vault). Resto del radar non rifatto (cadenza,
   Max risparmiato). Nessuna azione nuova (coda piena, 8). **Voto fiducia 7.** Serve da Nicola **stasera**: il
   **link reale lista d'attesa** (senza, il QR converte 0); appena può: i 3 sblocchi. Prossimo giro utile:
   **~23:00 post-Arisa** o domattina. Vedi [[2026-06-28]].
0n. **Giro 28/6 — 18:22 (passaggio 12, NON-PASSAGGIO DI DISCIPLINA):** appena 15 min dopo il 11°.
   **Esterno INVARIATO**, nessun cambio-fase, presidio Arisa (21:15) ancora ~1,5h avanti → da governatore
   di cadenza (DF-02) **niente valore nuovo da estrarre**: **zero ricerche** (meteo/eventi/competitor erano
   freschi alle 18:07 → Max risparmiato), **zero azioni nuove** (coda piena, 8). **Supabase MCP ritentato →
   di nuovo NEGATO** (19° giro cieco). Aggiornata solo la **traccia di freschezza** (timestamp, ultimo-briefing,
   auto-coscienza, sonda del volano, storico-salute) perché la Cabina mostri "Vivo" all'ora giusta. **Voto di
   fiducia onesto: 6** (alto su candore/disciplina, basso su valore marginale: è un quasi-duplicato e lo dico).
   ⭐ Raccomandazione esplicita: **prossimo giro utile = stasera ~23:00** (post-Arisa, per imparare dal presidio)
   **o domattina**, non tra 15 min. Il collo di bottiglia è UMANO: i 3 sblocchi di Nicola restano identici. Vedi [[2026-06-28]].
0o. **Giro 28/6 — 18:07 (passaggio 11, APERTURA PRESIDIO SERALE):** 2 ore dopo il 10°. **Cambio-fase reale:**
   il picco di caldo delle 17 è passato, la temperatura cala (36°C alle 20, 30°C alle 23) → si apre **ORA** l'unica
   finestra fisica vera del giorno: il **presidio serale**. ⭐ Contributo = **1 check live mirato a valore** (giustificato
   dal cambio-fase + precedente di un evento già cancellato per caldo): **Arisa @ Palazzo Farnese CONFERMATA stasera
   ore 21:15** (cortile, piazza Cittadella 29 — [ticketone](https://www.ticketone.it/event/arisa-live-tour-palazzo-farnese-21450766/)).
   L'evento **regge** (è nelle ore fresche) → **finestra QR affinata: ~20:00-21:15** (gente che arriva) **+ post-show ~23:00**
   (prima stimavo ~19:00). Coperta da azioni #6 e #8 già in coda. **Supabase MCP ritentato → permesso di nuovo NEGATO**
   (18° giro cieco; piattaforma sana, è solo il permesso). Nessuna azione nuova accodata (coda piena, 8). **Questo è il giro
   serale promesso dal governatore di cadenza (DF-02):** dopo il presidio mi fermo → prossimo utile **domattina** o a uno
   sblocco. I 3 sblocchi da Nicola restano identici (+ link lista d'attesa per far convertire il QR stasera). Vedi [[2026-06-28]].
0p. **Giro 28/6 — 16:07 (passaggio 10, RUN-UP AL PRESIDIO SERALE):** 2 ore dopo il 9°. Delta unico:
   la fase passa dal cuore del pomeriggio al **run-up della sera** (~1h dal picco 17:00, ~3h dall'apertura
   della finestra presidio) → la macchina guarda ormai solo al **presidio serale di stasera** (Arisa a
   Palazzo Farnese, ore fresche): mossa n.1 = essere lì col QR (coperta da azioni #6 e #8 già in coda).
   Esterno **invariato** → nessuna ricerca ripetuta (meteo già riconfermato stamattina + scan 08:30,
   competitor a cadenza settimanale → Max risparmiato). **Supabase MCP ritentato → permesso di nuovo
   NEGATO** (17° giro cieco; piattaforma sana, è solo il permesso). Nessuna azione nuova accodata (coda
   piena, 8 azioni). **Applicato il GOVERNATORE di cadenza (DF-02):** a dati fermi giro solo al cambio-fase
   → questo è l'ultimo passaggio utile prima della sera. I 3 sblocchi da Nicola restano identici (+ serve il
   link lista d'attesa per far convertire il QR stasera). **Consiglio:** prossimo giro utile = stasera per/
   dopo il presidio, oppure dopo uno sblocco; non tra un'ora. Vedi [[2026-06-28]].
0q. **Giro 28/6 — 14:06 (passaggio 9, CUORE POMERIGGIO ROVENTE):** 2 ore dopo l'8°. Delta unico:
   siamo a ~3h dal **picco delle 17 (38-41°C)** → il piano operativo pivota dalla "consegna" (freschi fermi
   fino a domattina presto) al **PRESIDIO SERALE nelle ore fresche**: stasera **Arisa a Palazzo Farnese**
   (~19:00+) è la finestra fisica migliore della giornata per QR + iscritti a costo ≈0 (coperta da azioni #6
   e #8 già in coda). Esterno **invariato** → nessuna ricerca ripetuta (meteo già riconfermato stamattina +
   scan web 08:30, competitor a cadenza settimanale → Max risparmiato). **Supabase MCP ritentato → permesso di
   nuovo NEGATO** (16° giro cieco; piattaforma sana, è solo il permesso). Nessuna azione nuova accodata (coda
   piena, 8 azioni). I 3 sblocchi da Nicola restano identici. **Consiglio:** prossimo giro utile = stasera per
   il presidio, oppure dopo uno sblocco; non tra un'ora. Vedi [[2026-06-28]].
0r. **Giro 28/6 — 12:05 (passaggio 8, MEZZOGIORNO / fascia-calda):** 2 ore dopo il 7°. Delta unico:
   siamo **ENTRATI nella fascia 12-18** → la finestra-freschi del mattino è **chiusa** e la regola "no
   freschi 12-18" è ora **attiva** (14h=38°C, picco 38,8°C alle 17, 36°C alle 20): eventuale consegna di
   deperibili non partita stamattina va **rimandata a domattina presto**. Esterno **invariato** → nessuna
   ricerca ripetuta (meteo già riconfermato stamattina, competitor a cadenza settimanale → Max risparmiato).
   **Supabase MCP ritentato → permesso di nuovo NEGATO** (15° giro cieco; piattaforma sana, è solo il
   permesso). Nessuna azione nuova accodata (coda piena, 8 azioni). I 3 sblocchi da Nicola restano identici.
   **Consiglio:** valore a dati fermi esaurito → prossimo giro utile dopo uno sblocco o a fine giornata.
   Vedi [[2026-06-28]].
0s. **Giro 28/6 — 10:06 (passaggio 7, CHIUSURA finestra-freschi):** 2 ore dopo il 6°. Delta unico:
   la finestra-freschi del mattino passa da **attiva a in chiusura** (~10:30, poi 34°C alle 11) → se oggi
   c'è una consegna di deperibili e Garetti è LIVE, è **adesso** il momento; mai 12-18 (picco 38,8°C alle 17).
   Esterno **invariato** → nessuna ricerca ripetuta (meteo già riconfermato 2h fa, competitor a cadenza
   settimanale → Max risparmiato). **Supabase MCP ritentato → permesso di nuovo NEGATO** (14° giro cieco;
   piattaforma sana, è solo il permesso). Nessuna azione nuova accodata (coda piena, 8 azioni). I 3 sblocchi
   da Nicola restano identici. **Consiglio:** valore a dati fermi esaurito → prossimo giro utile dopo uno
   sblocco o a fine giornata. Vedi [[2026-06-28]].
0t. **Giro 28/6 — 08:05 (passaggio 6, MATTINO operativo):** 2 ore dopo il 5°. Cambia la **fase**: da
   alba a mattino pieno → la **finestra-freschi è ora ATTIVA e in scadenza** (~2,5h residue, fino a ~10:30;
   34°C già alle 11). ⭐ Contributo = riconferma meteo orario di oggi via WebSearch (input peso-4 ogni-giro,
   a cadenza): 11h=34°C · 14h=38°C · **picco 38,8°C alle 17** · 20h=36°C · 23h=30°C, nessun nuovo temporale
   ([ilmeteo](https://www.ilmeteo.it/meteo/piacenza)). Resto dell'esterno invariato (cadenza rispettata, Max
   risparmiato). **Supabase MCP ritentato → permesso di nuovo NEGATO** (13° giro cieco; piattaforma sana, è
   solo il permesso). Nessuna azione nuova accodata (coda piena, 8 azioni). I 3 sblocchi da Nicola restano
   identici. **Consiglio:** valore a dati fermi esaurito → prossimo giro utile dopo uno sblocco o a fine
   giornata. Vedi [[2026-06-28]].
0u. **Giro 28/6 — 06:05 (passaggio 5, ALBA del giorno-apice):** 2 ore dopo il 4°, ma cambia la
   **fase del giorno**: si apre la giornata operativa. ⭐ Contributo = **l'operatività dell'alba**: check
   meteo orario fresco di oggi (input peso-4 ogni-giro, a cadenza) → **min 24°C ora alle 6:00, max 39°C
   alle 17** ([ilmeteo](https://www.ilmeteo.it/meteo/piacenza)) → **finestra-freschi del mattino aperta
   ADESSO (6:30-10:30), mai 12-18**. Se Garetti è LIVE e c'è una consegna oggi, è la fascia da usare.
   Resto dell'esterno invariato (non rifatto, cadenza). **Supabase MCP ritentato → di nuovo NEGATO** (12°
   giro cieco; piattaforma sana, è solo il permesso). Nessuna azione nuova accodata (coda piena). I 3
   sblocchi da Nicola restano identici. **Consiglio:** valore a dati fermi ormai esaurito → il prossimo
   passaggio utile è dopo uno sblocco o a fine giornata. Vedi [[2026-06-28]].
0v. **Giro 28/6 — 04:05 (passaggio 4, NOTTE FONDA):** 2 ore dopo il 3°. Esterno **invariato**
   (notte fonda → niente ricerche meteo/eventi/competitor ripetute, cadenza rispettata, Max
   risparmiato). ⭐ Contributo del passaggio = **una verifica reale**: ho controllato lo **status di
   Supabase** (ops-02, ROSSO, ogni-giro) → **piattaforma operativa**, incident del 20-24/6 tutti
   risolti ([status/history](https://status.supabase.com/history)). Quindi il blocco ai 7 numeri
   **NON è un'outage**: è solo il **MCP non autorizzato** in sessione (ritentato → di nuovo NEGATO,
   11° giro cieco). WebFetch anch'esso non autorizzato → usato WebSearch come ripiego. **Nessuna
   azione nuova accodata** (coda già piena, no duplicati). I 3 sblocchi da Nicola restano identici.
   Vedi [[2026-06-28]].
0w. **Giro 28/6 — 02:05 (passaggio 3, NOTTE):** 38 min dopo il 2°. Esterno **invariato** (notte fonda
   → niente ricerche ripetute, Max risparmiato). **Supabase MCP ritentato (`execute_sql`/`list_projects`)
   → di nuovo NEGATO** (10° giro cieco). ⭐ Contributo del passaggio = **chiuso un GAP STRUTTURALE**: la
   cartella `auto-coscienza/` **non esisteva** → creati i file obbligatori del cancello di serietà
   (`auto-analisi.json` + `registro-realta.json` + `AUTO-ANALISI.md` + `apprendimento.json` +
   `calibrazione.json`): i giri precedenti **saltavano il passo 11**. **Garetti declassato** nel
   registro-realtà a «scelta ragionata, LIVE da confermare» (evito l'errore «Garetti inventati»). Inoltre
   prodotta la **bozza del post caldo** (`consegne/content/POST-caldo-38.md`, azione #6 da "da creare" a
   pronta). I 3 sblocchi da Nicola restano identici. Vedi [[2026-06-28]].
0x. **Giro 28/6 — 01:27 (passaggio 2, NOTTE):** 36 min dopo il primo. Quadro **invariato** (notte
   fonda: meteo/eventi/status piattaforme identici al check 00:51, <1h → cadenza rispettata, Max
   risparmiato). **Supabase MCP ritentato (`execute_sql`/`list_tables`) → di nuovo NEGATO** (7 numeri
   ciechi). ⭐ Contributo del passaggio = **doer**: prodotto l'artefatto 🟢 **Piano Sant'Antonino**
   (`consegne/marketing/2026-07-04-piano-santantonino.md`) + accodata l'azione 🟡 #8 (presidio 3-4/7 +
   stampa). I 3 sblocchi da Nicola restano: esito Giorno-1/Garetti LIVE · 3 firme 🔴 · autorizzare il
   MCP. Vedi [[2026-06-28]].
0y. **Giro 28/6 — 00:51 (primo giro del nuovo giorno, NOTTE):** è il giorno **dopo** il Giorno-1.
   Check live → **allerta caldo confermata oggi** (Arpae/Prot. Civile, 38-39°C, apice; svolta inizio
   luglio con rischio temporali), **Arisa stasera** a Palazzo Farnese (presidio serale), **piattaforme
   operative** (gap ops-02 chiuso). **Supabase MCP ritentato (`list_projects`) → di nuovo NEGATO** (7
   numeri ciechi: il Giorno-1 non è misurabile dal DB). ⭐ Mossa strategica: preparare la **settimana di
   Sant'Antonino** (culmine 4/7 + Venerdì Piacentini 3/7), la finestra fisica più grande del mese.
   Coda 🟡/🔴 già piena (6 azioni): nessuna nuova accodata. Vedi [[2026-06-28]].
0z4. **Giro 27/6 — 20:51 (passaggio 8, SERA INOLTRATA):** presidio serale in corso. Check live →
   il caldo è ora **allerta meteo UFFICIALE (Allerta 066/2026, temperature estreme)** con **un evento di
   domani 28/6 cancellato per emergenza caldo**; **Arisa** confermata domani sera a Palazzo Farnese →
   regola "no freschi 12–18" **rinforzata** per domani (freschi solo al mattino presto). **Supabase MCP
   ritentato (`execute_sql`/`list_projects`) → di nuovo negato** (7 numeri ciechi). Coda 🟡/🔴 già piena:
   nessuna nuova azione accodata. Vedi [[2026-06-27]].
0z3. **Giro 27/6 — 18:50 (passaggio 7, SERA):** entrati nella **finestra di presidio serale** (centro
   animato ADESSO: Buffa a Palazzo Farnese + 2ª serata Venerdì Piacentini; domani Arisa) → mossa n°1 =
   essere in centro ora con QR mentre c'è gente e fa fresco. Check live: **domani dom 28/6 ancora 39°C**
   → regola "no freschi 12–18" vale anche domani. **Supabase MCP ritentato (`list_tables`) → di nuovo
   negato** (7 numeri ciechi). Coda 🟡/🔴 già piena: nessuna nuova azione accodata. Vedi [[2026-06-27]].
0z2. **Giro 27/6 — 14:49 (passaggio 6, PRIMO POMERIGGIO):** quadro stabile. Check meteo orario live →
   picco rivisto a **39°C alle 17** (stamattina 38°C) e **sera senza temporali** → presidio serale 19:00+
   confermato, regola "no freschi 12–18" ancora più giusta. **Supabase MCP ritentato → ancora negato**
   (7 numeri ciechi). Nessuna nuova azione accodata: la coda 🟡/🔴 è già piena. Vedi [[2026-06-27]].
0z. **Giro 27/6 — 12:49 (passaggio 5, MEZZOGIORNO):** la finestra di consegna fresca (9:00–10:30) è
   **chiusa** → pivot del giorno: da "consegnare" a **raccogliere il passaparola del primo cliente**.
   Scritto il **piano pomeriggio/sera** (`consegne/operations/2026-06-27-giorno1-pomeriggio-sera.md`):
   feedback a caldo + richiesta recensione/foto (🟡 accodata) + presidio serale in centro nelle ore
   fresche (Web: eventi serali confermati) + regola "no freschi 12–18" (picco 38°C alle 17). **Supabase
   MCP ritentato → ancora negato.** Vedi [[2026-06-27]].
0a. **Giro 27/6 — 08:48 (passaggio 4):** chiuso il gap **ops-02** via WebSearch → **Supabase e Stripe
   OPERATIVI**, nessuna outage. Conclusione importante: il blackout sui 7 numeri **non è un guasto**, è
   solo il **permesso del Supabase MCP** da concedere. Le rotaie del payout per oggi sono in piedi (🟢).
   (Nota minore: monitor terzo segnala possibile intoppo sul componente Stripe "Acquirers" — riverificare ai primi incassi.) Vedi [[2026-06-27]].
0. **Giro 27/6 — 08:48 (mattina consegna):** check **meteo orario** live (8h=28°C, 11h=34°C, picco
   17h=38°C) → **finestra di consegna 9:00-10:30** blindata nel piano caldo (🟢). Verificato: nessun
   file .env → l'unico sblocco dati è autorizzare il Supabase MCP. Vedi [[2026-06-27]].
0bis. **Giro 27/6 — 00:39 (notte):** radar live → **caldo 38-39°C**. Scritto il **piano catena del
   freddo** per la consegna di oggi (🟢) e aggiornati i 3 file Intelligence del Pannello
   (eventi-picchi, concorrenti, buchi-mercato). Supabase cieco. Vedi [[2026-06-27]].
1. **Giro 26/6 — 2° passaggio** (dati ancora bloccati): consolidato le 3 decisioni 🔴 in un
   **foglio-firma da 2 minuti** `consegne/decisioni/2026-06-26-foglio-firma-lancio.md` per
   sbloccare la prima consegna. Vedi [[2026-06-26]].
2. **Giro 26/6 — 1° passaggio** (vigilia prima consegna): dati-live mancanti; checklist vigilia
   in `consegne/operations/2026-06-26-vigilia-prima-consegna.md`.
3. **MACCHINA DI MARKETING completa**: piano editoriale 4 settimane + 7 pacchetti di contenuti/copy
   (16 post, 7 flussi email, kit stampa, 8 reel, SEO/GBP, visivo) + **Marketing Autopilot** (scheduler
   + 5 publisher + n8n, dry-run) + **Content Factory** che genera **contenuti grafici VERI** (post PNG
   + reel): prodotti i contenuti S1, le **5 categorie** e i **5 "vincenti dei competitor" (W1–W5)**.
   Vedi [[2026-06-24-piano-editoriale]].
4. **Costruttore → DNA v1.1**: capacità di auto-marketing innestata nel genoma (riusabile da ogni
   Organismo). Comando **"contenuti pro"** salvato nel pannello.
5. **Giro 25/6**: 7 senior → pacchetto faro pronto (pitch, contratto, QR, payout, primo ordine).
   Decisioni 🔴 bloccanti ancora in coda (Stripe live/sandbox, fee, commissione) — [[AZIONI-IN-ATTESA]].

## Prossime priorità (da approvare)
- [ ] STASERA: confermare Stripe live/sandbox + sistemare branding + stampare materiali + creare form/IG.
- [ ] DOMANI 25/6 (vedi Piano del Mattino in [[SALA-OPERATIVA]]): ① Garetti LIVE · ② accendere domanda (QR+lista+storia) · ③ ordine-test fino al payout.
- [ ] SABATO 27/6: primo ordine reale consegnato concierge.
- [ ] ⛔ Sbloccare: Stripe live/sandbox + firme righe 1-2 di [[AZIONI-IN-ATTESA]].

---
*Scritto dall'AD. Per il dettaglio operativo vedi [[2026-06-25]]; per le decisioni [[DECISIONI]].*
