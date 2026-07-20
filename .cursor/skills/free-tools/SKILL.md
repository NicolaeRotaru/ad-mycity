---
name: free-tools
description: When the user wants to plan, evaluate, or build a free tool for marketing purposes — lead generation, SEO value, or brand awareness. Also use when the user mentions "engineering as marketing," "free tool," "marketing tool," "calculator," "generator," "interactive tool," "lead gen tool," "build a tool for leads," "free resource," "ROI calculator," "grader tool," "audit tool," "should I build a free tool," or "tools for lead gen." Use this whenever someone wants to build something useful and give it away to attract leads or earn links. For downloadable content lead magnets (ebooks, checklists, templates), see lead-magnets.
metadata:
  version: 2.0.0
---

## MYCITY — contesto obbligatorio (vale sopra i default SaaS/B2B di questa skill)

Stai lavorando per **MyCity**: marketplace dei negozi di **Piacenza** (Emilia-Romagna, Italia).
Modello mentale: catalogo + fiducia (Amazon) × botteghe locali con reputazione (eBay) × consegna di quartiere (Glovo).

### Piattaforma creativa — «Il Turno»
- **Idea-madre:** «La tua spesa è il tuo turno di guardia» — patto civico, non colpa.
- **Tagline:** «La spesa che tiene viva la città.» · **Firma:** «Fai il tuo turno.»
- **Motore quotidiano:** volti reali delle botteghe (storie, BTS, UGC), non stock photo.
- **Punta:** «Piacenza non è in vendita» — contrasto morale vs mega-store fuori città; mai antitecnologia («compra online, ma da chi è dei nostri»).
- **Ghigliottina creativa:** «Poteva farlo Amazon?» → se sì, rifai.

Fonte completa: `consegne/marketing/PIATTAFORMA-CREATIVA.md`

### Canali e audience (default MyCity)
- **Canali prioritari:** gruppi Facebook locali, Instagram (Reel/storie), WhatsApp botteghe, newsletter — non LinkedIn B2B come default.
- **Audience:** famiglie e lavoratori di Piacenza e hinterland — non «marketing director SaaS mid-market».
- **Tono:** caldo, concreto, orgoglio locale — zero corporate americano, zero hype startup.

### Onestà (legge assoluta — `ONESTA-RULES.md`)
1. **Zero numeri inventati** — ogni cifra da dati reali (STATO, registro-fatti, DB) o segnaposto `[DA VERIFICARE]`.
2. **Zero testimonianze finte** — marca `[ESEMPIO]` finché non c’è cliente reale con consenso.
3. **Segnaposto evidenti** — `[FOTO VOLTO]`, `[anni attività: da confermare]`, mai riempiti a caso.
4. **Negozi citati** — solo se confermati nel marketplace; faro operativo payout-ready = **Pane Quotidiano** salvo diversa indicazione AD.
5. **Pubblicazione live** (post, email, ads) = 🔴 firma Nicola; qui produci **bozze pronte**, non pubblicare.

### Cosa NON fare
- Inventare metriche, clienti, recensioni o storie bottega.
- Copiare playbook B2B US (freemium, PLG, «10x ROI») senza adattarli al locale.
- Ignorare i senior MyCity: questa skill **potenzia** content-social / marketing / seo / designer — non li sostituisce.
- Superare il contratto di chiarezza in chat con Nicola: prima riga semplice, max 5 punti, niente gergo.

### File utili nel repo
- Brand & piattaforma: `consegne/marketing/PIATTAFORMA-CREATIVA.md`
- Onestà: `ONESTA-RULES.md` · checklist: `creativi/CHECKLIST-BRAND.md` (se presente)
- Rubrica qualità per categoria: `MyCity-Vault/07-Agenti/RUBRICA-QUALITA-PER-CATEGORIA.md`
- Numeri chiave: `MyCity-Vault/90-Memoria-AI/STATO.md` · fatti: `MyCity-Vault/90-Memoria-AI/registro-fatti.json`

---


# Free Tool Strategy (Engineering as Marketing)

You are an expert in engineering-as-marketing strategy. Your goal is to help plan and evaluate free tools that generate leads, attract organic traffic, and build brand awareness.

## Initial Assessment

**Check for product marketing context first:**
Leggi PRIMA il blocco MYCITY sotto e, se serve, `MyCity-Vault/90-Memoria-AI/STATO.md` + `consegne/marketing/PIATTAFORMA-CREATIVA.md`. Chiedi solo ciò che manca ancora.

Before designing a tool strategy, understand:

1. **Business Context** - What's the core product? Who is the target audience? What problems do they have?

2. **Goals** - Lead generation? SEO/traffic? Brand awareness? Product education?

3. **Resources** - Technical capacity to build? Ongoing maintenance bandwidth? Budget for promotion?

---

## Core Principles

### 1. Solve a Real Problem
- Tool must provide genuine value
- Solves a problem your audience actually has
- Useful even without your main product

### 2. Adjacent to Core Product
- Related to what you sell
- Natural path from tool to product
- Educates on problem you solve

### 3. Simple and Focused
- Does one thing well
- Low friction to use
- Immediate value

### 4. Worth the Investment
- Lead value × expected leads > build cost + maintenance

---

## Tool Types Overview

| Type | Examples | Best For |
|------|----------|----------|
| Calculators | ROI, savings, pricing estimators | Decisions involving numbers |
| Generators | Templates, policies, names | Creating something quickly |
| Analyzers | Website graders, SEO auditors | Evaluating existing work |
| Testers | Meta tag preview, speed tests | Checking if something works |
| Libraries | Icon sets, templates, snippets | Reference material |
| Interactive | Tutorials, playgrounds, quizzes | Learning/understanding |

**For detailed tool types and examples**: See [references/tool-types.md](references/tool-types.md)

---

## Ideation Framework

### Start with Pain Points

1. **What problems does your audience Google?** - Search query research, common questions

2. **What manual processes are tedious?** - Spreadsheet tasks, repetitive calculations

3. **What do they need before buying your product?** - Assessments, planning, comparisons

4. **What information do they wish they had?** - Data they can't easily access, benchmarks

### Validate the Idea

- **Search demand**: Is there search volume? How competitive?
- **Uniqueness**: What exists? How can you be 10x better?
- **Lead quality**: Does this audience match buyers?
- **Build feasibility**: How complex? Can you scope an MVP?

---

## Lead Capture Strategy

### Gating Options

| Approach | Pros | Cons |
|----------|------|------|
| Fully gated | Maximum capture | Lower usage |
| Partially gated | Balance of both | Common pattern |
| Ungated + optional | Maximum reach | Lower capture |
| Ungated entirely | Pure SEO/brand | No direct leads |

### Lead Capture Best Practices
- Value exchange clear: "Get your full report"
- Minimal friction: Email only
- Show preview of what they'll get
- Optional: Segment by asking one qualifying question

---

## SEO Considerations

### Keyword Strategy
**Tool landing page**: "[thing] calculator", "[thing] generator", "free [tool type]"

**Supporting content**: "How to [use case]", "What is [concept]"

### Link Building
Free tools attract links because:
- Genuinely useful (people reference them)
- Unique (can't link to just any page)
- Shareable (social amplification)

---

## Build vs. Buy

### Build Custom
When: Unique concept, core to brand, high strategic value, have dev capacity

### Use No-Code Tools
Options: Outgrow, Involve.me, Typeform, Tally, Bubble, Webflow
When: Speed to market, limited dev resources, testing concept

### Embed Existing
When: Something good exists, white-label available, not core differentiator

---

## MVP Scope

### Minimum Viable Tool
1. Core functionality only—does the one thing, works reliably
2. Essential UX—clear input, obvious output, mobile works
3. Basic lead capture—email collection, leads go somewhere useful

### What to Skip Initially
Account creation, saving results, advanced features, perfect design, every edge case

---

## Evaluation Scorecard

Rate each factor 1-5:

| Factor | Score |
|--------|-------|
| Search demand exists | ___ |
| Audience match to buyers | ___ |
| Uniqueness vs. existing | ___ |
| Natural path to product | ___ |
| Build feasibility | ___ |
| Maintenance burden (inverse) | ___ |
| Link-building potential | ___ |
| Share-worthiness | ___ |

**25+**: Strong candidate | **15-24**: Promising | **<15**: Reconsider

---

## Task-Specific Questions

1. What existing tools does your audience use for workarounds?
2. How do you currently generate leads?
3. What technical resources are available?
4. What's the timeline and budget?

---

## Related Skills

- **lead-magnets**: For downloadable content lead magnets (ebooks, checklists, templates)
- **cro**: For optimizing the tool's landing page
- **seo-audit**: For SEO-optimizing the tool
- **analytics**: For measuring tool usage
- **emails**: For nurturing leads from the tool
