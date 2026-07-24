---
tipo: consegna
reparto: AD
data: 2026-07-24 17:45
colore: 🟡
titolo: Ho fatto l'hook, le card e il motore della chat — manca solo un pezzo del worker da posare
---

# 🧠 Hook memoria · Card salute/utilizzo · Chat per tema

> Seguito di «fai l'hook, cabla la chat, fai le card». Tre fronti. Due sono **completi e pushati** sul
> branch `claude/improve-machine-accuracy-a3oucg` (nuova PR); il terzo (il cablaggio dentro il worker)
> è pronto ma va posato da un posto che può pushare `worker.sh` — spiego sotto.

## ✅ Fatto e sul branch (parte al merge)

| Fronte | Cosa | File |
|---|---|---|
| **L'hook** | A ogni sessione (chat, giro, lavori) la macchina riceve in automatico la **memoria persistente**: fatti-chiave, principi, **errori che si ripetono**, le tue preferenze, le lezioni. È il pezzo che fa smettere di ripetere gli errori — entra dappertutto, non solo nella chat. | `.claude/settings.json` (hook `SessionStart` → `contesto-lezioni.mjs --hook`) |
| **Le card** | Due riquadri nella **Radiografia macchina**: **📈 Salute onesta** (sto migliorando davvero? voto onesto + il cantiere che sale/scende) e **📊 Utilizzo senior** (il roster di 120 come numero: 47 usati, 73 che dormono). | 2 API + 2 componenti nel Pannello |
| **Il motore della chat** | Aggiunto a `recupero-memoria.mjs` il modo `--righe` (lezioni nette), pronto per essere chiamato dalla chat. | `cervello/recupero-memoria.mjs` |

Tutto verificato: TypeScript verde, le card mostrano gli stessi numeri dei comandi `salute-onesta`/`utilizzo-senior`, i file sul branch sono **identici byte-per-byte** a quelli provati qui.

## 🙋 Il pezzo che manca (e perché)

**Cosa:** cambiare 3 righe dentro `cervello/worker.sh` così la chat, invece di pescare le 8 lezioni **più recenti a caso** (`head -8`), pesca le 8 **più pertinenti** al tuo messaggio (via `recupero-memoria.mjs`). Con fallback: se il recupero non trova nulla, torna alle 8 recenti — la chat non resta mai senza lezioni.

**Perché non l'ho già pushato:** `worker.sh` è il motore della chat, 1500 righe, e da qui (cloud) l'unico canale per scrivere su GitHub è l'API a un file per volta — riscrivere a mano 1500 righe del file più delicato del sistema è un rischio che non vale la pena correre per una modifica di 3 righe. La modifica è **pronta e provata** (`bash -n` verde, simulata sui casi reali): è nel patch qui sotto.

**La buona notizia:** grazie all'hook (sopra), la chat riceve **già** la memoria vera (principi, errori ricorrenti, preferenze) a ogni sessione. Questa modifica del worker è il **di più**: rende pertinenti anche le lezioni supplementari che il worker aggiunge. Non è il cuore — il cuore è l'hook, ed è fatto.

**Come posarla (scegli tu):**
1. **Dal VPS o dal tuo PC** (10 secondi): `git apply consegne/tech/worker-chat-bm25.patch` dentro la repo, poi committa e pusha. Il patch applica pulito sul `worker.sh` di oggi.
2. **Dimmi «pusha anche il worker»** e lo riscrivo per intero via l'API, controllando che venga identico byte-per-byte. Più lento e più pesante, ma se preferisci fa tutto la macchina.

## Cosa cambia
Il Pannello mostra due metri nuovi e onesti sulla macchina; ogni sessione parte con la memoria in testa (meno errori ripetuti). Al merge parte il deploy del Pannello.

## Se va bene
Merge della PR dal Pannello (🟡, la firmi tu). Poi decidi come posare il pezzo del worker (patch o «pusha anche il worker»).

---
*Consegna AD · branch `claude/improve-machine-accuracy-a3oucg` · hook+card+recupero live sul branch, patch worker pronto (🟡).*
