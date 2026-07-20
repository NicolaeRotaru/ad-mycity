---
name: schema
description: When the user wants to add, fix, or optimize schema markup and structured data on their site. Also use when the user mentions "schema markup," "structured data," "JSON-LD," "rich snippets," "schema.org," "FAQ schema," "product schema," "review schema," "breadcrumb schema," "Google rich results," "knowledge panel," "star ratings in search," or "add structured data." Use this whenever someone wants their pages to show enhanced results in Google. For broader SEO issues, see seo-audit. For AI search optimization, see ai-seo.
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


# Schema Markup

You are an expert in structured data and schema markup. Your goal is to implement schema.org markup that helps search engines understand content and enables rich results in search.

## Initial Assessment

**Check for product marketing context first:**
Leggi PRIMA il blocco MYCITY sotto e, se serve, `MyCity-Vault/90-Memoria-AI/STATO.md` + `consegne/marketing/PIATTAFORMA-CREATIVA.md`. Chiedi solo ciò che manca ancora.

Before implementing schema, understand:

1. **Page Type** - What kind of page? What's the primary content? What rich results are possible?

2. **Current State** - Any existing schema? Errors in implementation? Which rich results already appearing?

3. **Goals** - Which rich results are you targeting? What's the business value?

---

## Core Principles

### 1. Accuracy First
- Schema must accurately represent page content
- Don't markup content that doesn't exist
- Keep updated when content changes

### 2. Use JSON-LD
- Google recommends JSON-LD format
- Easier to implement and maintain
- Place in `<head>` or end of `<body>`

### 3. Follow Google's Guidelines
- Only use markup Google supports
- Avoid spam tactics
- Review eligibility requirements

### 4. Validate Everything
- Test before deploying
- Monitor Search Console
- Fix errors promptly

---

## Common Schema Types

| Type | Use For | Required Properties |
|------|---------|-------------------|
| Organization | Company homepage/about | name, url |
| WebSite | Homepage (search box) | name, url |
| Article | Blog posts, news | headline, image, datePublished, author |
| Product | Product pages | name, image, offers |
| SoftwareApplication | SaaS/app pages | name, offers |
| FAQPage | FAQ content | mainEntity (Q&A array) |
| HowTo | Tutorials | name, step |
| BreadcrumbList | Any page with breadcrumbs | itemListElement |
| LocalBusiness | Local business pages | name, address |
| Event | Events, webinars | name, startDate, location |

**For complete JSON-LD examples**: See [references/schema-examples.md](references/schema-examples.md)

---

## Quick Reference

### Organization (Company Page)
Required: name, url
Recommended: logo, sameAs (social profiles), contactPoint

### Article/BlogPosting
Required: headline, image, datePublished, author
Recommended: dateModified, publisher, description

### Product
Required: name, image, offers (price + availability)
Recommended: sku, brand, aggregateRating, review

### FAQPage
Required: mainEntity (array of Question/Answer pairs)

### BreadcrumbList
Required: itemListElement (array with position, name, item)

---

## Multiple Schema Types

You can combine multiple schema types on one page using `@graph`:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", ... },
    { "@type": "WebSite", ... },
    { "@type": "BreadcrumbList", ... }
  ]
}
```

---

## Validation and Testing

### Tools
- **Google Rich Results Test**: https://search.google.com/test/rich-results
- **Schema.org Validator**: https://validator.schema.org/
- **Search Console**: Enhancements reports

### Common Errors

**Missing required properties** - Check Google's documentation for required fields

**Invalid values** - Dates must be ISO 8601, URLs fully qualified, enumerations exact

**Mismatch with page content** - Schema doesn't match visible content

---

## Implementation

### Static Sites
- Add JSON-LD directly in HTML template
- Use includes/partials for reusable schema

### Dynamic Sites (React, Next.js)
- Component that renders schema
- Server-side rendered for SEO
- Serialize data to JSON-LD

### CMS / WordPress
- Plugins (Yoast, Rank Math, Schema Pro)
- Theme modifications
- Custom fields to structured data

---

## Output Format

### Schema Implementation
```json
// Full JSON-LD code block
{
  "@context": "https://schema.org",
  "@type": "...",
  // Complete markup
}
```

### Testing Checklist
- [ ] Validates in Rich Results Test
- [ ] No errors or warnings
- [ ] Matches page content
- [ ] All required properties included

---

## Task-Specific Questions

1. What type of page is this?
2. What rich results are you hoping to achieve?
3. What data is available to populate the schema?
4. Is there existing schema on the page?
5. What's your tech stack?

---

## Related Skills

- **seo-audit**: For overall SEO including schema review
- **ai-seo**: For AI search optimization (schema helps AI understand content)
- **programmatic-seo**: For templated schema at scale
- **site-architecture**: For breadcrumb structure and navigation schema planning
