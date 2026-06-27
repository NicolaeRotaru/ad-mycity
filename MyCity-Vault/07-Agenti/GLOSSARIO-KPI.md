---
tipo: glossario
fonte: AD digitale (abilita il vettore "coerenza cross-funzionale")
stato: seed v1 2026-06-27 · definizioni DA CONFERMARE con Nicola + dati reali (lunedì)
---

# 📖 GLOSSARIO KPI — una sola verità tra 40 reparti

> **Perché esiste.** Il fallimento tipico della scala: 40 senior ottimi che dicono cose **incoerenti**
> ("cliente attivo" = 3 definizioni diverse tra analista, finanza e marketing). Questo file è la
> **single-source-of-truth** dei termini e dei numeri: tutti usano queste definizioni, identiche. Se un
> reparto ne ha bisogno di una nuova, la propone qui — non se la inventa.
>
> ⚠️ **Stato seed:** le soglie qui sotto sono **proposte di partenza**, da **confermare con Nicola e coi
> dati reali**. Dove c'è `[?]`, il valore è da decidere. Non usarle come verità finché non sono confermate.

## Regola d'uso (vincolante per tutti i senior)
1. Un dato/termine ha **una** definizione: questa. Gli altri documenti **linkano**, non ridefiniscono.
2. Se due reparti portano numeri diversi sullo stesso KPI → **riconciliazione QUI prima** di portarli a Nicola.
3. Chi cita un numero dichiara **fonte + periodo + confronto** (regola della RUBRICA-QUALITA).

---
## Termini chiave (da confermare)
| Termine | Definizione proposta | Stato |
|---|---|---|
| **Cliente attivo** | ha fatto ≥1 ordine negli ultimi **[60?]** giorni | `[?]` da confermare |
| **Cliente dormiente** | aveva ordinato, nessun ordine da **[90?]** giorni | `[?]` |
| **Negozio attivo (live)** | vetrina pubblica + catalogo + payout configurato + ≥1 prodotto ordinabile | da confermare |
| **Negozio in calo** | ordini ultimi 30g < **[50%?]** della sua media 90g | `[?]` |
| **Carrello abbandonato** | carrello creato, nessun checkout entro **[24h?]** | `[?]` |
| **Primo ordine** | primo checkout completato e pagato di un cliente | ok |
| **Iscritto lista d'attesa** | email/contatto raccolto pre-lancio (≠ cliente) | ok |

## KPI principali (da confermare)
| KPI | Formula proposta | Owner | Stato |
|---|---|---|---|
| **GMV** | somma valore ordini completati nel periodo | finanza | da confermare |
| **Ricavo MyCity** | commissioni + fee sugli ordini completati | finanza | da confermare |
| **AOV (scontrino medio)** | GMV / n. ordini completati | analista | ok |
| **Tasso di conversione** | ordini / sessioni (stessa fonte: `[PostHog?]`) | analista/cro | `[?]` fonte |
| **CAC** | spesa acquisizione / nuovi clienti del periodo | growth/finanza | da confermare |
| **Retention 30g** | % clienti che riordinano entro 30g dal 1° ordine | analista/crm | da confermare |
| **Reach / Salvataggi / Iscritti** | metriche native per pezzo (UTM per attribuire) | content-social | ok |

---
## Come si aggiorna
Append-only per le nuove voci; per cambiare una definizione esistente serve l'**ok di Nicola** (cambia i
numeri di tutti). Quando arrivano i dati reali (lunedì), si confermano le soglie `[?]` e si toglie "seed".
Owner del glossario: **@analista** + **@finanza**, presidiato dall'**AD** nelle cadenze.
