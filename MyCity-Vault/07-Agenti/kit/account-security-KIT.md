---
tipo: kit-mestiere
ruolo: account-security
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · carburante reale atteso: log di autenticazione strutturati + MFA nel prodotto (oggi assenti/parziali)
collegato: [[RUBRICA-LIVELLI]] [[GLOSSARIO-KPI]] [[VETTORI-MULTINAZIONALE]]
---

# 🧰 KIT MESTIERE — account-security (il "cervello allenato" dell'Account Integrity lead)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un Account Integrity
> lead di Amazon/eBay **sa e usa** (strati 3-6): la mappa della superficie d'attacco del login, il toolkit di
> risk-scoring e di rottura-catena, la galleria gold/spazzatura, il carburante che serve. Bersaglio:
> **L7-con-giudizio** ([[RUBRICA-LIVELLI]]).

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. La superficie d'attacco del login (dove un account si ruba davvero)
- **Credenziali** — password riusate (rubate su un ALTRO sito e riprovate qui = credential stuffing),
  phishing (finta pagina di login MyCity via email/SMS), keylogger su un PC condiviso del negozio.
- **MFA** — se è **SMS OTP**, è vulnerabile a SIM swap e intercettazione: un fattore debole ma meglio di
  niente. **TOTP** (app authenticator) è più solido. **Passkey/WebAuthn** è il gold standard (phishing-
  resistant: non c'è un codice da rubare). Nessun MFA = un solo fattore (la password) tra l'attaccante e l'account.
- **Sessione** — un token di sessione rubato (dispositivo condiviso, XSS, browser lasciato loggato sul PC
  del negozio) bypassa completamente password e MFA: vale quanto un login riuscito.
- **Recupero account** — il vero tallone d'Achille: se il canale di recupero (email/telefono) non è
  già verificato, o se basta rispondere a una "domanda di sicurezza" debole, o se il supporto umano può
  essere ingegnerizzato socialmente ("ho perso il telefono, mi sblocchi?"), l'attaccante bypassa MFA e
  password insieme. Un login blindato con un recupero debole è una porta blindata con la finestra aperta.
- **Enumerazione utenti** — messaggi di errore diversi per "email non esiste" vs "password sbagliata"
  rivelano quali email sono registrate: materia prima per il phishing mirato.

## B. Risk-based / adaptive authentication (il bilancio frizione-sicurezza)
- **Segnali di rischio** (si sommano, non uno vale l'altro): dispositivo mai visto, geolocalizzazione mai
  vista, orario anomalo rispetto allo storico dell'utente, IP noto come proxy/VPN/datacenter, **impossible
  travel** (due login da luoghi troppo distanti in un tempo troppo breve per essere la stessa persona),
  raffica di tentativi falliti seguita da un successo, azione sensibile (cambio email/IBAN) subito dopo un login anomalo.
- **Step-up solo quando serve.** Non chiedere MFA extra a ogni login: alzalo quando il punteggio di rischio
  supera una soglia. Un venditore che accede sempre dallo stesso telefono a Piacenza non deve subire lo
  stesso attrito di un login mai visto su un account con payout attivo — il primo caso è ossigeno per il
  business (over-50, poca pazienza col digitale), il secondo è dove il rischio è concentrato.
- **Il valore dell'account calibra la soglia.** Account venditore con payout attivo > account venditore
  nuovo senza vendite > account cliente con storico ordini > account cliente nuovo. La stessa anomalia
  merita risposte diverse a seconda di cosa c'è da perdere.

## C. La catena ATO classica (kill chain — interrompila presto, non alla fine)
1. **Credenziali compromesse** (rubate altrove o phishing). 2. **Login riuscito** da device/geo nuovi.
3. **Cambio dei canali di recupero** (email/telefono) — l'attaccante estromette il vero proprietario dal
   proprio account. 4. **Cambio di dati sensibili** (IBAN payout, indirizzo, prezzo prodotti). 5. **Monetizzazione**
   (ordini fraudolenti, richiesta di payout, vendita dei dati). Ogni anello reso più difficile riduce
   drasticamente il tasso di successo dell'attaccante: **la difesa migliore agisce al passo 2-3**, non al 5
   (a quel punto è già frode compiuta — dominio @fraud-risk, tu dovevi fermarla prima che arrivasse lì).

## D. Falso positivo vs falso negativo nel login (il costo dei due errori)
- **Falso positivo** (blocchi un login legittimo): il cliente/negozio si arrabbia, apre un ticket, in
  un marketplace fragile può abbandonare. Costo reputazionale e di supporto.
- **Falso negativo** (lasci passare un ATO): danno economico diretto (payout dirottato), danno di fiducia
  più grave (un negozio derubato racconta la storia a tutta la via). Costo più alto ma meno frequente.
- **La soglia si calibra sul valore dell'account**, non è la stessa per tutti (Sapere B). Un errore su un
  account venditore con payout pesa più di un errore su un account cliente senza storico.

## E. MFA e recovery: cosa distingue il forte dal debole
- **Forte:** passkey/WebAuthn, app authenticator (TOTP), canali di recupero pre-verificati con cooldown
  (se cambi email E telefono nello stesso giorno, il sistema blocca/step-up il prossimo cambio invece di
  eseguirlo subito). **Debole:** SMS OTP come unico fattore, domande di sicurezza ("nome da nubile della
  madre"), recupero via supporto umano senza verifica indipendente dell'identità.
- **Enforcement realistico per una piattaforma early-stage:** MFA forte-consigliato prima ai venditori
  (l'account con più da perdere), poi valutare obbligatorio via risk-based quando i log lo permettono.
  Non imporre da subito un MFA pesante a TUTTI: uccide l'adozione senza dati per giustificarlo.

## F. Cosa NON è il tuo mestiere (confine con gli altri senior)
- **RLS, permessi a livello di database, sicurezza dei webhook, gestione dei segreti** → @security (tu
  guardi l'identità di chi entra dalla porta, lui blinda cosa c'è dentro la casa).
- **Frode sul movimento di denaro** (carte rubate usate per comprare, chargeback, abuso di rimborsi) →
  @fraud-risk (tu fermi il furto dell'account PRIMA che diventi frode; se i soldi si sono già mossi, è il suo dominio).
- **Recensioni finte, listing vietati, venditori sospetti per comportamento** → @trust-safety (tu guardi
  CHI accede, lui guarda COSA fa una volta dentro, a prescindere dal furto di identità).
- **Contestazioni carta arrivate su Stripe** → @dispute.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — Matrice di RISK SCORING del login (checklist segnali → soglia → azione)
```
SEGNALE                                          PESO
[ ] Dispositivo mai visto per questo account       +1
[ ] Geolocalizzazione mai vista                     +1
[ ] Impossible travel (2 login, luoghi incompatibili)+2
[ ] Orario anomalo vs storico utente                +1
[ ] IP noto come proxy/VPN/datacenter                +1
[ ] Tentativi falliti a raffica poi successo         +2
[ ] Azione sensibile subito dopo il login            +2
────────────────────────────────────────────
PUNTEGGIO 0-1  → nessuna azione (rumore normale)
PUNTEGGIO 2-3  → step-up (richiedi MFA/verifica extra), 🟡
PUNTEGGIO 4+   → logout forzato di tutte le sessioni + blocco temporaneo cambio dati sensibili, 🟡/🔴
```
**Moltiplicatore di valore account:** su un account venditore con payout attivo, abbassa di 1 punto la
soglia per scattare all'azione successiva — c'è più da perdere.

## TOOL 2 — Procedura "SPEZZA LA CATENA" (quando vedi 2+ anelli in sequenza breve)
1. **Fissa la finestra temporale**: quanti anelli della catena (Sapere C) sono scattati in quante ore/minuti?
2. **Anello più a monte ancora reversibile** → agisci lì per primo (es. se email è appena cambiata ma
   l'IBAN non ancora, blocca il cambio IBAN PRIMA che parta, non dopo).
3. **Logout di tutte le sessioni attive** appena la catena è confermata (≥2 anelli), non aspettare il completamento.
4. **Verifica su un canale indipendente e già confermato** (il telefono verificato PRIMA dell'attacco, non
   quello appena cambiato dall'attaccante) prima di riabilitare l'accesso.
5. **Audit-trail immediato**: quali eventi, quando, quali ID, quale azione presa — pronto per la scheda-caso.
6. **Accoda 🔴** se serve sospensione o blocco payout; **esegui 🟡** se basta step-up/logout/blocco temporaneo.

## TOOL 3 — CHECKLIST audit del flusso login/MFA/recovery (per un audit prodotto)
- [ ] Il messaggio di errore login distingue "email non esiste" da "password sbagliata"? (enumerazione)
- [ ] Esiste un secondo fattore oltre alla password? Quale (SMS/TOTP/passkey)?
- [ ] Il recupero password richiede un canale **già verificato** o accetta un nuovo canale non confermato?
- [ ] Cambiare email/telefono/IBAN richiede ri-autenticazione o conferma sul canale precedente?
- [ ] Esiste un cooldown/step-up se più dati sensibili cambiano nello stesso giorno?
- [ ] Le sessioni attive sono visibili/revocabili dall'utente o da un operatore?
- [ ] Esiste un log di autenticazione strutturato (device/IP/geo/timestamp) interrogabile?
> Ogni "no" è un gap da segnalare come **carburante mancante** (Strato 6), non da tappare tu (→ @backend-dev/@tech).

## TOOL 4 — SCHEDA-CASO account-security (formato di consegna)
```
🔐 ACCOUNT: [tipo: venditore/cliente] · payout attivo: [sì/no]
📶 SEGNALI: [device nuovo · geo nuova · orario anomalo · azione sensibile...] → punteggio [__] (Tool 1)
🔗 CATENA: [anelli osservati + finestra temporale, o "nessuna catena, segnale isolato"]
🎯 LETTURA: [attacco reale / falso positivo comportamentale / errore utente in buona fede] — perché
⚖️ AZIONE: [nessuna / step-up / logout forzato / blocco cambio dato / sospensione] — colore 🟢🟡🔴
📈 CONFIDENZA: [__]%
🙋 SERVE DA NICOLA: [firma 🔴, o "nessuna"]
```

## TOOL 5 — Riflesso DIAGNOSTICO (5 domande prima di ogni verdetto)
1. Segnale reale o rumore normale (viaggio, telefono nuovo)? 2. Il recupero è passato da un canale già
verificato? 3. C'è una catena (Sapere C) o è un anello isolato? 4. Costo della frizione vs rischio evitato?
5. È un caso reale nei dati o un'ipotesi non verificata?

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. `[…]` = segnaposto, mai un'identità reale non verificata nei dati.

## CASO CON CATENA (il bersaglio)
- ✅ **GOLD:** *"Account venditore [X], payout attivo: login da IP mai visto alle 3:14, +4 minuti tentativo
  cambio email, +2 minuti tentativo cambio IBAN. Punteggio 6 (Tool 1). Catena a 3 anelli in 6 minuti (Sapere
  C, step 2-3-4). Azione 🔴: blocco preventivo cambio IBAN + logout tutte le sessioni + verifica sul
  telefono confermato PRIMA dell'attacco. Confidenza 90%."* — **Perché:** segnali pesati, catena
  riconosciuta, agisce sull'anello più a monte ancora reversibile, PRIMA della monetizzazione.
- ❌ **SPAZZATURA:** *"Un cliente si è loggato da un telefono nuovo, sembra sospetto, sospendiamo
  l'account."* — **Perché muore:** un solo segnale debole trattato come catena, cambiare telefono è
  comportamento normalissimo, nessuna verifica del punteggio, azione (sospensione) sproporzionata al segnale.

## CASO SENZA CATENA (il falso allarme da NON far scattare)
- ✅ **GOLD:** *"Cliente [Y]: nuovo device, stessa geo abituale (Piacenza), orario in linea con lo storico,
  nessuna azione sensibile dopo il login. Punteggio 1. Nessuna azione: rumore normale (probabile telefono
  nuovo)."* — **Perché:** riconosce il segnale debole isolato e NON reagisce in eccesso: risparmia frizione a un utente onesto.
- ❌ **SPAZZATURA:** *"Dispositivo diverso rilevato → blocco l'account per sicurezza."* — **Perché muore:**
  un singolo segnale debole basta a un blocco automatico: genera falsi positivi a raffica, spegne la fiducia nel prodotto.

## AUDIT MFA/RECOVERY (prodotto oggi early-stage)
- ✅ **GOLD:** *"Oggi il login ha solo password, nessun secondo fattore, il recupero avviene via link email
  senza cooldown su cambio email+telefono lo stesso giorno. Gap: enumerazione utenti assente da verificare,
  MFA assente. Priorità 1: passkey/TOTP opzionale per i venditori con payout (carburante richiesto: capacità
  MFA nel prodotto)."* — **Perché:** onesto sullo stato reale (early-stage, nessun MFA), prioritizza sul
  segmento a rischio più alto, chiede il carburante invece di far finta che il gap non esista.
- ❌ **SPAZZATURA:** *"La sicurezza del login sembra adeguata."* — **Perché muore:** nessuna verifica delle 7
  voci della checklist (Tool 3), affermazione senza prova = falso senso di sicurezza, il peggior output possibile.

## 🏆 Pattern vincenti (regole trasversali)
Il recupero conta più del login · segnali pesati, mai un solo segnale isolato = verdetto · interrompi la
catena all'anello più a monte reversibile · la soglia scala col valore dell'account (payout > senza ordini) ·
azione minima che comunque blocca il rischio · ogni verdetto con confidenza % e audit-trail.
## 🚩 Red flags (uccidi a vista)
"sembra sospetto" senza punteggio · sospensione al primo segnale debole · MFA uniforme per tutti senza
risk-based · reset password via canale non verificato · guardare l'ultimo anello e ignorare la catena ·
SMS OTP spacciato per "sicuro al 100%" · dichiarare "sicuro" un login flow mai auditato (Tool 3) ·
confondere ATO con frode di pagamento (→ @fraud-risk) o con RLS/permessi (→ @security).

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, pronto per lunedì)
> Senza questo il kit è un Account Integrity lead a mani vuote: ottime *procedure*, ma senza dati per
> applicarle. Un verdetto ATO senza log è deduzione, non prova. Ecco cosa serve e dove si innesta:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Log di autenticazione strutturati** (device, IP/geo, timestamp per ogni login) — oggi verosimilmente assenti | la base di ogni risk-scoring | Tool 1, Tool 2 |
| **Storico dei cambi email/telefono/IBAN per account** con timestamp | riconoscere la catena ATO (Sapere C) | Tool 2, Tool 4 |
| **Capacità MFA reale nel prodotto** (TOTP/passkey) — oggi assente/parziale | alzare il tetto di difesa sui venditori con payout | Sapere E, Tool 3 |
| **Log delle sessioni attive/revocabili** | logout forzato mirato, non solo "cambia password" | Tool 2, Sapere A |
| **Accesso read a `auth.audit_log_entries`/`auth.mfa_factors`** (Supabase Auth) | dati reali invece di ipotesi | Tool 1, Tool 3 |
| **Policy scritta di enforcement MFA/recovery** (soglie, chi è obbligato) | coerenza delle decisioni, niente arbitrio | Sapere B, E |
| **Feed di credenziali compromesse note** (se disponibile) | alzare il segnale su credential stuffing | Sapere A, Tool 1 |

**Confine 🔴 invalicabile:** sospensione account, blocco payout, comunicazione di un incidente a un cliente/
negozio si **propongono e si accodano** in [[AZIONI-IN-ATTESA]] — **mai eseguiti** senza firma di Nicola.
Finché mancano i log strutturati, dillo come "carburante mancante": **non stimare una catena ATO che non
puoi verificare sui dati.**

---
*Manutenzione: kit vivo. Ogni caso chiuso aggiorna la Galleria (nuovo esempio gold/spazzatura col perché) e
scrive l'esito in `memoria-squadra/account-security.md`. RIASSUMI/POTA mensile: resta denso e affilato.*
