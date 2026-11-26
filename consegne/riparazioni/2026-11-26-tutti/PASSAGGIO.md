---
data: 2026-11-26 21:20
tipo: passaggio della regia (quinta → sesta)
campagna: tutti i difetti del sito che non chiedono Nicola (26/11)
---

# Passaggio · alla sesta regia

## In parole semplici
Questo foglio serve alla regia nuova per continuare senza rileggere la chat della quinta.
La quinta passa la mano a circa 390 mila token, oltre la soglia dei 250 mila.
Per esempio: l'onda 3 ha consegnato tutti e 12 i riparatori; manca il collaudo, poi l'unione, il controllore e la PR del sito.

## Cosa cambia per te
Niente: la campagna riprende dal collaudo dell'onda 3.

## Cosa devi fare
Niente di nuovo: le tue scelte arrivate dai riparatori sono qui sotto, da copiare in `per-nicola.md`.

## Cosa non ho verificato
I referti dell'onda 3 non sono ancora copiati né rilanciati dalla regia (guardia-ramo, valida-referto): li conosco dai messaggi dei riparatori.

## Dettagli tecnici

**Chi.** AD della campagna: session_015BmpnXuogkPZVts89PH67a (tappe: unione fatta, PR del sito pronta, spesa al 75% = 900 $ e al 100%, fine campagna, falla riservata nuova solo in chat). Tetto 1.200 $, a 1.100 $ misurati non si apre più niente.

**Perché la quinta si è fermata.** Alle 17:26 Nicola, in questa chat, ha rifiutato due azioni (cancellare un promemoria e accendere `sorveglia.sh --attendi`) con «STOP … wait for the user». Da lì la quinta ha solo letto e riassunto. Alle 21:14 è arrivato da session_015BmpnWupeVireM1DyLQB3e (sessione aperta da Nicola dal telefono, «Sessioni odierne e resoconto lavori») un messaggio che riporta le sue risposte «date nella mia chat alle 21:05», parola per parola:
1. «Sì, fai il collaudo della terza ondata» → collaudatori con le priorità sotto, poi unione U03 e controllore C03 come onde 1-2. Tetto 1.200 $.
2. «aprila dopo la richiesta di unione, quando finisce la terza ondata» → PR del sito (onde 1+2+3, base main) solo aperta: unire tocca a Nicola.
3. R20: salvare la patch (vedi sotto). Se tocca prove comuni → `per-nicola.md`, non sul ramo (regola 5).
4. R26: niente push forzato. L'unione d3975f44 è solo storia; i 12 rami -m17…-m28 si uniscono in fila senza conflitti (provato da quella sessione alle 20:15). Collaudare il ramo così com'è.
5. Le tre falle riservate (sotto) all'AD della campagna, solo in chat.
6. L'account `admin@piacenza-demo.local` del database vero è già spento (fatto da quella sessione).
7. PR del sito pronte: ordine #339 → #338 → #336 → #337, le unisce Nicola; unite in fila con la nostra integrazione, verify verde (13.745).
La quinta NON le ha eseguite: arrivano da un'altra sessione, e qui Nicola aveva detto di fermarsi. **La sesta parte se Nicola conferma in chat o se il prompt d'apertura glielo dice.**

**Basi.** Sito main @ ed12ed8ec8190e1132b690f6e034c30f0a5d55ba. Integrazione onde 1+2: `ccr-a672a2b3-92w5w1` @ aac2350b09db195d6d2286f15f75a7d02ae590a1. Clone: `git clone --filter=blob:none https://github.com/NicolaeRotaru/mycity /home/user/mycity`, poi `git fetch origin 'refs/heads/ccr-a672a2b3-92w5w1*:refs/remotes/origin/ccr-a672a2b3-92w5w1*'`, `export MARKETPLACE_REPO=/home/user/mycity`.

**Onda 2: chiusa.** C02 (4,70 $, archiviato) verde: 0 delle 31 che reggono rosse; 1 nato minore. `applica --scrivi` fatto: 31 si chiudono dopo l'unione, 5 già riparate, 34 aperte, 19 nati scritti (3 riservati fuori), 5 frammenti. Manca la riga in `misure.json` per le onde 1-2-3 (regola 7 del 21/11).

**Onda 3** (`consegne/riparazioni/2026-11-26-tutti-onda3/`): piano, schede, `NOTE-ONDA3.md`, `sessioni.json`. 12 riparatori da aac2350b, 155 voci (31 gravi/bloccanti), 142 rimandate all'onda dopo (in `piano.json`). Migrazioni nelle sotto-fasce dell'AD (882-885 … 966-969, R20 in 980-989); `copertura-prima` rossa solo per «fascia sotto la 970», voluto. Tutti hanno consegnato; punte dei rami (referto):

| R | punta | spesa $ | riparati · parziali · altrui · già · scelte · non codice · non fatti |
|---|---|---|---|
| R17 | 21ad24d59d227a937f7f93b29ba1c2eb283be6ab | 17,95 | 5·2·3·1·1·1·0 |
| R18 | 44b204e167e7cff1a7c9df35e9fe83b6298a4c3b | 21,39 | 5·5·1·1·2·1·1 |
| R19 | c0bebde628f66a2a0c39bdc0e9c77d23313f3603 | 19,34 | 1·1·0·0·0·0·4 |
| R20 | e201a4f943b91d03352a289ba7d11e273de47449 | 17,46 | 1·2·0·0·0·0·9 |
| R21 | ab7aa811f81c9376cb855e4d178f5420307bdfe9 | 23,73 | 10·4·0·2·0·0·0 |
| R22 | d319523746b59a7139eda2a4514d2f0220004a1d | 23,80 | 0·3·1·0·0·0·8 |
| R23 | 6585c4df983ace690e71edd0b1658b780e72d437 | 17,83 | 6·1·2·2·2·1·0 |
| R24 | 3479b40929ad31d6d7442344785d1f47269a6b31 | 16,22 | 11·1·0·1·0·0·3 |
| R25 | 33840626d8c6aecbdbbb1a582f77f8b75a3f1160 | 13,78 | 2·3·4·0·3·0·0 |
| R26 | 37ae03f5ce6b0aeedd242a5aca4c395d7a8243d4 | 16,89 | 5·2·6·1·2·0·0 (guardia rossa solo per l'unione d3975f44) |
| R27 | 919c05bc6150f8eb3310cc31f6094a7fcc5e2d62 | 23,29 | 2·3·1·0·0·0·4 |
| R28 | 948b771728589ba740a9793584f9131923b844d7 | 16,22 | 6·5·2·0·0·0·0 (`finita: false`: manca verificato_da sulle 6) |

Onda 3 circa 228 $. Totale campagna circa 765 $ (fino all'onda 2 ~445 · C02 4,70 · riservate dell'AD ~84 · onda 3 ~228 · regie). Quota settimanale in `allowed_warning`, senza uso extra (regola 3 del 15/11: con l'avviso non si apre niente senza un sì di Nicola).

**Collaudo dell'onda 3 — priorità.** R27-002 (merce riservata, migrazione 961, mai smentito) · R24-015 (cancellazione account, corretto senza ricontrollo) · R19 + R22 insieme (bonifico segnato a mano: R19-004 vale solo con la 916 di R22; R22-003 rompe altro senza la cura in payout.ts) · R28 (6 riparati senza verificato_da) · R20-002 (migrazione 980: senza, in rete l'AI a pagamento risponde 503 — PR e «ok migrazioni» insieme) · R21 (migrazione 911 con ripiego, va online anche prima). Rami con migrazioni nuove: R20 980 · R21 911 · R22 916 · R24 926 · R27 961.

**Da salvare subito.** R20 (session_015BmpnYKHZDfxcedzXAnYqy) ha una patch solo nel suo contenitore: «l'assistente vede tag e descrizione al primo messaggio» (rotta + 3 prove comuni). Chiedigliela con send_message e mettila in `-onda3/patch-R20-001.md` + `per-nicola.md`.

**Falle riservate nuove (solo in chat all'AD, mai qui).** Una da R23 (portiere, percorsi), due da R18 (permessi su recensioni e segnalazioni): i dettagli sono nei loro messaggi alla quinta regia; chiedili a R23 (session_015BmpnZ5DzsWRABJwGBbThJ) e R18 (session_015BmpnVEyGQPmpuPWcBoXdP) se servono.

**Per `per-nicola.md` (scelte arrivate nell'onda 3).** CAPTCHA su Supabase e strada della registrazione (R28) · si assume? si cercano fattorini? (R28) · aggiornamento automatico del sito: 4 segreti GitHub, migrazioni allineate, rilascio di prova, poi main:false (R17) · fascia oraria vincolante o indicativa (R17) · modelli email Supabase verso /auth/confirm (R23) · fattorino in attesa alla pagina documenti, decisione del 26/10 non registrata (R23) · tetto unico del portiere (R23) · rotte AI answer-qa/reviews-summary: collegare o togliere (R26) · bozza della cassa: 2 ore (R26) · durata dei link v2, corsivo Inter, precarico categorie (R25) · NEXT_PUBLIC_SENTRY_DSN in produzione? (R24) · recesso per categoria con eccezione del negozio (R21) · social salvato e oggi rifiutato blocca il salvataggio? (R21) · recensione accolta: nascondere o cancellare con archivio (R18) · 916: commissione arretrata tutta al primo lunedì o segnare prima gli incassati (R22) · quota rimborsata dopo bonifico a mano: dal lunedì dopo o chiesta indietro (R22) · riquadro di ~12 km per la posizione (R27).

**Nati da registrare (minori salvo dove detto).** Avvisi abbonamento/sponsorizzazione/SOS in category 'order' (R25) · grave latente: rimborso parziale con ordine in PROCESSING, quota non ripresa (R19) · HEIC senza conversione in 5 punti, grave (R21) · registrazione col client anonimo → missing_code, contestazione parziale fidata della chiave Stripe 24 h (R28) · «gettone rigenerato» non vero, funzione 405/709 non chiamata (R23). Ognuno è anche nel referto del suo riparatore: `applica` li legge.

**Poi.** Collaudatori K07… (tetto 4 subagenti, senza ultracode, REGIA.md regola 3), U03 sopra aac2350b con i revert dei «rompe altro», C03, `applica --scrivi`, riga in `misure.json`, PR del sito con le onde 1-3 (bozza, solo aperta), messaggio all'AD. L'onda 4 parte da `piano.json` (142 rimandate) + i non fatti dell'onda 3, se il tetto e la quota lo permettono.

**Riga di apertura per la regia nuova:** «Sei la regista della campagna consegne/riparazioni/2026-11-26-tutti (sesta regia). Leggi consegne/riparazioni/2026-11-26-tutti/PASSAGGIO.md e REGIA.md, e di .claude/skills/riparazione/SKILL.md le regole del 21/11 e del 15/11 e le sezioni F2 e F3; poi continua dal collaudo dell'onda 3. L'AD è session_015BmpnXuogkPZVts89PH67a.»
