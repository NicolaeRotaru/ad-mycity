# 🧠 Chat dell'AD dentro l'ADMIN del marketplace — pacchetto drop-in

> Pronto da incollare in **mycity-live**. Aggiunge nell'admin la **stessa chat**
> del Pannello di Controllo, col tuo **Max** (niente API a pagamento).

## Perche' e' un pacchetto e non una modifica diretta
Il codice del marketplace (`mycity-live`) **non sta in questa repo** (`ad-mycity` =
AD + vault + Pannello) e da qui ho accesso GitHub **solo** ad `ad-mycity`. Quindi
ho preparato i file pronti: li copi in mycity-live (stesso stack: Next.js + Supabase).

## L'architettura: un cervello, due facce
La chat dell'admin **non e' un secondo cervello**. Scrive nella **stessa coda
`lavori`** della MEMORIA (il Supabase del progetto AD) che usa gia' il Pannello.
Lo stesso `worker.sh` sul VPS la esegue col Max e riscrive il risultato.

```
[Pannello]  ─┐
             ├─→  [Supabase MEMORIA · tabella "lavori"]  ←─ worker.sh sul VPS (claude -p, Max)
[Admin mkt] ─┘                              │
   ▲  polling GET /api/admin/ad-chat?id=    │ riscrive stato=fatto + risultato
   └────────────────────────────────────────┘
```

Niente worker nuovo, niente brain nuovo, **0€ di API**.

## I file
| File del pacchetto | Dove va in mycity-live |
|---|---|
| `ChatAD.tsx` | `src/components/admin/ChatAD.tsx` |
| `route.ts` | `src/app/api/admin/ad-chat/route.ts` |

Poi usalo in una pagina admin:
```tsx
import ChatAD from "@/components/admin/ChatAD";
export default function Page() { return <ChatAD />; }
```

## Variabili d'ambiente (in mycity-live, lato server)
Nomi distinti per **non** collidere col Supabase del marketplace:
```
MEMORIA_SUPABASE_URL          = https://LA-MEMORIA.supabase.co
MEMORIA_SUPABASE_SERVICE_KEY  = eyJ... (service_role del progetto MEMORIA — NON del marketplace)
```
La `service_role` resta **solo lato server** (la route gira in `runtime = "nodejs"`).

## Da fare prima di andare in produzione (3 cose)
1. **Auth admin** — in `route.ts` la funzione `isAdmin()` ritorna `true` come gancio.
   Sostituiscila col tuo vero controllo (sessione Supabase Auth + ruolo `admin`),
   oppure proteggi `/api/admin/*` e la pagina con il tuo middleware admin. **Non
   deployare** con `isAdmin` aperto: la `service_role` puo' scrivere nella memoria.
2. **Worker acceso sul VPS** — e' lo stesso del Pannello ("Modo C", vedi
   `cervello/vps/SETUP-VPS.md`). Se gia' gira, non serve altro.
3. **Tabella `lavori`** — gia' creata per il Pannello (`pannello/sql/memoria-schema.sql`).

## Cosa e' gia' incluso
- ✅ **Memoria della chat**: ad ogni turno mando l'intera cronologia, non solo
  l'ultimo messaggio. Il tuo esempio funziona: «cosa non ho fatto da X?» → «l'ho
  iscritto» → l'AD capisce e **aggiorna la memoria** (gira con `acceptEdits`).
- ✅ Polling del singolo lavoro (default 2s) con timeout, indicatore "sto pensando".

## Onesta' (limiti)
- **Tempo "quasi" reale**: dipende dall'intervallo del worker sul VPS
  (`WORKER_INTERVALLO`, default 30s — abbassalo a 2-3s per una chat fluida) + i
  secondi che il Max impiega a rispondere. Per il vero realtime: Supabase Realtime
  sulla tabella `lavori`.
- **Coda condivisa**: un messaggio chat puo' aspettare dietro un lavoro pesante
  (radiografia, audit). Se serve, un worker dedicato ai `tipo:"chat"`.
- **Limiti del Max**: pensato per uso interattivo, si resetta ogni poche ore. Ok
  sul campo, non per migliaia di messaggi/ora.
- Le azioni reali **🔴 restano da firmare**.
