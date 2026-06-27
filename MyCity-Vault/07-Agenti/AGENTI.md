---
tipo: organigramma
fonte: AD digitale
---

# 👥 AGENTI — L'organigramma digitale di MyCity

> I mansionari **operativi** vivono in `.claude/agents/` (li usa Claude Code per
> delegare). Questo file è la **mappa leggibile** per te: chi fa cosa, e con quali
> poteri. Modello mentale: **Amazon × eBay × Glovo** (vedi [[00-Index]]).

## Come funziona
L'**AD** (Claude Code, guidato da `CLAUDE.md`) riceve l'obiettivo, lo spezza e
**delega** ai senior giusti, poi sintetizza i risultati in una decisione per Nicola.
Ogni senior ha **solo gli strumenti che gli servono** (minimo privilegio) e rispetta
la regola d'oro 🟢🟡🔴.

## 🗂️ Organigramma per TEAM (40 senior + AD)
- 🧠 **Direzione:** AD
- 🤖 **AI Lab:** prompt-engineer · ai-designer · ai-video · ai-copywriter
- 💻 **Engineering:** tech · frontend-dev · backend-dev · data-engineer · devops-sre · qa · security · builder-automazioni
- 📦 **Prodotto & Design:** product-manager · ux-designer · designer
- 📣 **Marketing & Growth:** marketing · growth-monetizzazione · crm-lifecycle · content-social · seo · ads-performance · influencer-partnership · cro · pr-stampa · relazioni-istituzionali
- 🤝 **Vendite & Supply:** vendite · onboarding-negozi · account-negozi
- 🛵 **Operations:** operations · rider-fleet · dispatch
- 🎧 **Clienti & Fiducia:** supporto · customer-success · trust-safety · dispute
- 💶 **Finanza:** finanza · contabilita
- 🔎 **Intelligence & Dati:** intelligence · analista
- ⚖️ **Legale:** legale-privacy
> KPI per ruolo in [[OKR-Squadra]] · capacità e cultura in [[CULTURA-SQUADRA]] · le figure rare oltre questo set si attivano on-demand.

## Dettaglio nucleo per poteri (🟢🟡🔴)

### 🧠 Direzione
| Senior | Cosa produce | Poteri max |
|---|---|---|
| 🧠 **AD** | priorità, decisioni, coordinamento, crea nuovi agenti | propone 🔴, fa 🟢 |

### 💰 Motori di soldi & crescita (i più importanti)
| Senior | Cosa produce | Poteri max |
|---|---|---|
| 🤝 **vendite** | nuovi negozi, negozi in calo, pitch | bozze contatto 🟡, offerte 🔴 |
| 📣 **marketing** | acquisizione, SEO, campagne, retention | bozze 🟡, spesa ads 🔴 |
| 🚀 **growth-monetizzazione** | esperimenti ROI: pricing, upsell, fee, carrelli, win-back | proposte 🟢, esperimenti 🟡, prezzi/spesa 🔴 |
| 🔁 **crm-lifecycle** | recupero carrelli, win-back, email ciclo vita, referral | bozze 🟢, invii reali 🟡/🔴 |
| ✍️ **content-social** | calendario, post, reel, copy SEO | bozze 🟢, pubblicazione 🔴 |
| 🎨 **designer** | QR, locandine, vetrofanie, grafiche (via `creativi/`) | crea file 🟢, stampa/spesa 🔴 |
| 📰 **pr-stampa** | comunicati, giornalisti, kit stampa | bozze 🟢, invio media 🔴 |
| 🏛️ **relazioni-istituzionali** | Comune, Vita in Centro, CdC, bandi | dossier 🟢, contatti reali 🔴 |

### 🔭 Cacciatori di opportunità
| Senior | Cosa produce | Poteri max |
|---|---|---|
| 🔎 **intelligence** | concorrenti, trend, eventi, buchi di mercato | sola lettura + web 🟢 |
| 📊 **analista** | report sui numeri, cali, opportunità | sola lettura 🟢 |

### 🛠️ Costruttori di strumenti
| Senior | Cosa produce | Poteri max |
|---|---|---|
| 🧰 **builder-automazioni** | n8n, script, integrazioni/MCP, nuovi strumenti | locale 🟢, servizi reali 🟡, deploy 🔴 |
| 🛠️ **tech** | analisi + fix del sito (in branch) | fix in branch 🟡, deploy 🔴 |

### 🛡️ Fondamenta (abilitano, non frenano)
| Senior | Cosa produce | Poteri max |
|---|---|---|
| 💶 **finanza** | incassi, payout, anomalie, margini | sola lettura 🟢, denaro 🔴 |
| ⚖️ **legale-privacy** | contratti, GDPR, TOS, bandi, HACCP | bozze 🟢, validità finale umana 🔴 |
| 🔒 **security** | RLS, sicurezza pagamenti, dati clienti | audit 🟢, fix via tech 🟡 |
| ✅ **qa** | verifica end-to-end pre-live | report 🟢 (sola lettura) |
| 🛵 **operations** | ordini, rider, consegne | sola lettura + alert 🟢 |
| 🎧 **supporto** | reclami, dubbi clienti (reattivo) | bozze risposte 🟡 |
| 🤗 **customer-success** | primo ordine concierge, feedback (proattivo) | script 🟢, contatto cliente 🟡 |

> Oltre questo nucleo, l'AD può attivare **sciami on-demand** (sub-agenti usa-e-getta) per i picchi
> e creare nuovi senior quando scopre un buco (meta-capacità).

## 🤝 Come collaborano (squadra, non solisti)
I senior si aiutano a vicenda tramite un canale condiviso e protocolli chiari:
- **[[SALA-OPERATIVA]]** — il canale sempre aperto: richieste d'aiuto, handoff, "fatto", peer review.
- **[[CULTURA-SQUADRA]]** — i 7 principi della squadra + le **catene di collaborazione** (team play) per ogni obiettivo.
- L'**AD è il direttore d'orchestra**: compone le catene (in serie o in parallelo) e pretende la peer review sul lavoro critico.

## 🧬 Le 7 capacità (Sistema Operativo del Dipendente)
Ogni senior ha la "Carta del Dipendente" nel suo file `.claude/agents/`. La fanno funzionare:
- `memoria-squadra/` — il quaderno di ogni senior (impara e migliora)
- [[OKR-Squadra]] — chi possiede quale KPI/target/budget
- `cervello/sentinelle.md` — i trigger dell'iniziativa · `cervello/ritmo.md` — il battito (mattino/sera/settimana)
- [[PLAYBOOK-ECCEZIONI]] — cosa fare quando va storto · [[RUBRICA-QUALITA]] — come si misura "fatto bene"

## 🏔️ Programma "SENIOR AL TOP" — pari ai pro delle multinazionali (obiettivo di Nicola, lungo termine)
La Carta dà il **comportamento** (uguale per tutti); la competenza + l'anima da veterano è il pezzo che mancava.
- [[PIANO-SENIOR-AL-TOP]] — **la visione completa e il backlog**: il modello a 5 dimensioni (Livello/Altitudine · Giudizio · Carattere · Motore · Legame), tutte le modifiche da applicare, stato e ordine di rollout. Fonte unica della verità.
- [[STAMPO-SENIOR-PRO]] — il **template** (v3): i **7 strati** del professionista + 5 dimensioni + matrice dei **15 vettori** per archetipo + bersaglio **L7-con-giudizio**. Lo applica il `@prompt-engineer`, un senior alla volta, dai motori di soldi.
- [[VETTORI-MULTINAZIONALE]] — i 15 vettori (8 famiglie, 7 assi nuovi) che portano al livello multinazionale.
- [[RUBRICA-LIVELLI]] — lo **strato 7**: la scala L1-L7 con scorecard e loop chiuso (lo standard con i denti).
- [[TASTE-FILE-NICOLA]] — il **gusto di Nicola codificato**: il metro vero contro cui i senior si auto-criticano prima di consegnare.
- **Pilota installato:** `content-social` con kit completo (`kit/content-social-KIT.md`, strati 3-6) + bersaglio L7. Modello per gli altri.
- **✅ Rollout COMPLETO (2026-06-27):** stampo v3 (strati 1-2) **+ kit profondi (strati 3-6)** installati su **TUTTI i 42 senior** — ognuno ha il suo `kit/<ruolo>-KIT.md` (sapere + toolkit + galleria + slot carburante), tarato per ruolo, Carta intatta, verificato da revisione indipendente. Restano: il **carburante reale** (lunedì) + il **test prima/dopo** col verdetto di Nicola per dichiarare la validazione.

## Le 3 "lenti" senior del panel (vedi [[00-Index]])
- **Lente Amazon** → catalogo, ricerca, recensioni, logistica, retention.
- **Lente eBay** → onboarding venditori, reputazione, listing, pagamenti, dispute.
- **Lente Glovo** → consegna locale, tracking, geolocalizzazione, operations.

Gli agenti operativi sopra applicano queste lenti al loro reparto.

## Collegato a
- Mansionari operativi: `.claude/agents/*.md`
- Manuale dell'AD: `CLAUDE.md` (radice)
- Memoria viva: [[STATO]] · [[DECISIONI]] · `90-Memoria-AI/Briefing/`
