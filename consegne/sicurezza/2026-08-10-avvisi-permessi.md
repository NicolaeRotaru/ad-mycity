---
tipo: consegna
reparto: devops-sre + security
data: 2026-08-10 16:30
difetto: AR-562
stato: pronto — serve la mano di Nicola sui due fogli dei permessi
---

# Le dieci righe che riempiono di avvisi ogni analisi

## In parole semplici
Parliamo del foglio dei permessi. È l'elenco che dice cosa posso toccare e cosa no. Ce ne sono due:
uno nella cartella del progetto, uno sul server. Il programma che mi fa girare li legge a ogni avvio.
Dieci righe sono scritte in una forma vecchia. Lui non le applica più. Ogni volta che parte te lo
scrive, in inglese, e quella scritta finisce in cima al lavoro che stai leggendo.

## Cosa cambia per te
Due cose, e la seconda conta di più.

**Ti nascondono il lavoro.** L'avviso occupa l'inizio della risposta. Nella card del Pannello vedi
quello invece dell'analisi. Per esempio la card che mi hai mandato oggi alle 16:06, quella della
sentinella sulla salute bassa: apriva con sei avvisi di fila, e l'analisi vera cominciava sotto.

**Cinque di quelle righe dovevano darmi un permesso e non me lo danno.** Sono nel foglio del server.
Riguardano la scrittura in memoria, nelle consegne, nei creativi, nel cervello e nel Pannello.
Scritte in quella forma, non concedono niente.

## Cosa devi fare
Due comandi sul server, uno per file. Fanno la copia di sicurezza da soli.

```bash
cd /percorso/della/repo   # sul VPS: la cartella ad-mycity

# ① foglio del server — i permessi passano da Write( a Edit(, doppioni tolti, ordine intatto
cp .claude/settings.local.json .claude/settings.local.json.bak
jq '.permissions.allow |= (map(if type=="string" and test("^(Write|MultiEdit|NotebookEdit)\\(.+\\)$") then sub("^[A-Za-z]+\\("; "Edit(") else . end) | reduce .[] as $v ([]; if index([$v]) then . else . + [$v] end))' \
  .claude/settings.local.json.bak > .claude/settings.local.json

# ② foglio del repo — via i cinque DIVIETI in forma vecchia, già coperti dall'Edit gemello
cp .claude/settings.json .claude/settings.json.bak
jq '.permissions.deny as $d | .permissions.deny |= map(. as $v | select((($v|type) != "string") or (($v|test("^(Write|MultiEdit|NotebookEdit)\\(.+\\)$")) | not) or ((($d | index([($v|sub("^[A-Za-z]+\\("; "Edit("))]))) | not)))' \
  .claude/settings.json.bak > .claude/settings.json

node cervello/permessi-check.mjs   # le righe morte devono sparire dall'elenco 🪦
sudo systemctl restart mycity-worker mycity-worker-chat
```

Se qualcosa non torna, i due `.bak` rimettono tutto com'era.

## Le protezioni non si toccano
Le chiavi e i due fogli dei permessi restano negati. A negarli sono le righe `Read` e `Edit`. Quelle
il programma le applica davvero. Ogni riga che tolgo ha già la sua gemella valida accanto. Le ho
controllate una per una, e sono quattro coppie.

- Le chiavi nei file di ambiente. Le protegge `Read(**/.env)`. Si toglie `Write(**/.env)`.
- Le chiavi del server. Le protegge `Read(./cervello/vps/.env)`. Si toglie `Write(./cervello/vps/.env)`.
- Il foglio dei permessi del progetto. Lo protegge `Edit(./.claude/settings.json)`. Si toglie la riga `Write` con lo stesso percorso.
- Il foglio dei permessi del server. Lo protegge `Edit(./.claude/settings.local.json)`. Si toglie la riga `Write` con lo stesso percorso.

Nessun buco si apre.

## Cosa non ho verificato
Il foglio del server (`.claude/settings.local.json`) non esiste in questa sessione: sta solo sul VPS.
Le sue cinque righe le ho lette dal messaggio che hai mandato, non dal file. Il comando ① l'ho provato
su una copia costruita con quelle righe. Il comando ② l'ho provato sul `settings.json` vero di questa
cartella, in sola lettura.

## Come l'ho verificato
A mano, il 10 agosto, con `claude` versione 2.1.226. Ho scritto un foglio di prova con cinque righe
finte e ho lanciato un comando qualsiasi. Ecco cosa ha detto, riga per riga.

- `Write(a/**)` → un avviso. La regola non viene applicata.
- `MultiEdit(b/**)` → un avviso. Stessa cosa.
- `NotebookEdit(c/**)` → un avviso. Stessa cosa.
- `Edit(d/**)` → nessun avviso. La regola vale.
- `Read(e/**)` → nessun avviso. La regola vale.

L'avviso esce su **stderr**, che è il canale del rumore, non su stdout, che è il canale della
risposta. È esattamente il motivo per cui finiva dentro la card. La corsia dei lavori catturava i due
canali insieme.

## Il freno perché non torni
- `cervello/permessi-check.mjs` — regola `forma-file-non-applicata`: nomina ogni riga scritta in
  quella forma e dice come riscriverla. Un **divieto** in forma vecchia senza la gemella `Edit`
  diventa una violazione vera, perché è una difesa che non difende.
- `cervello/test/risposta-senza-rumore.bats` — cinque prove che eseguono la funzione vera: il rumore
  della CLI non entra nella risposta, ma non si perde (va nel log) e resta attaccato quando il lavoro
  fallisce, perché lì è la diagnosi.
