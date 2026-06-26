# 🎨 CHECKLIST BRAND — la coerenza visiva e verbale (mandatori di ogni grafica)

> La coerenza è ciò che fa sembrare un brand "grande". Token unico = `creativi/brand.mjs`.
> La verifica automatica la fa il gate `@qa-designer` prima di accodare.

## Colori (palette ufficiale, da `creativi/brand.mjs`)
| Ruolo | Nome | HEX | Uso |
|---|---|---|---|
| Primary | terracotta (cotto) | `#C0492C` | fondi forti, headline su panna |
| Accent | senape | `#E8A33D` | CTA, badge, parola-chiave |
| Success/fresco | oliva | `#5A7C42` | freschezza, numeri positivi |
| Urgenza | bordeaux | `#B82A28` | urgenza/sconti, badge [ESEMPIO] |
| Testo | inchiostro | `#2C2A28` | corpo testo |
| Sfondo | panna | `#FBF7F0` | fondo editoriale |
| — | bianco | `#FFFFFF` | — |
> ❌ **Vietati:** giallo-Glovo, arancio-Amazon, blu-tech.

## Tipografia
- **Display:** Fraunces (serif, artigianale) — headline, numeri, wordmark.
- **Testo:** Inter (sans) — corpo, caption, CTA.
- Nei render: `@import` Google Fonts + fallback Georgia/Helvetica; attendere `document.fonts.ready`.

## Gabbia & formati
- Feed 1080×1080 · Portrait 1080×1350 (preferito IG) · Story/Reel-cover 1080×1920.
- **Safe-area reel/story:** testo nel **80% centrale** (no testo sotto i 250px in basso: lo coprono i UI di IG/TikTok).
- **1 sola idea per grafica.** Max ~30 parole sull'immagine. Gerarchia chiara: kicker → headline → (sub) → CTA → footer.
- **Footer brand sempre:** wordmark "MyCity" (Fraunces) + tagline + @handle.

## Timbri & motivi
- Calore artigianale + orgoglio civico: bande terracotta, fondo panna "carta da salumeria".
- Silhouette Palazzo Gotico/Cavalli come timbro civico (no emoji come logo).
- Volti reali, grafia a mano dove possibile.

## Voce (micro)
- Dà del tu. Frasi brevi. Una CTA sola. Ironia gentile, mai sarcasmo.
- Dialetto solo come spezia, marcato **[DA VALIDARE]**.

## Checklist automatica `@qa-designer` (PRIMA di accodare)
- [ ] Solo colori della palette? (nessun giallo/arancio/blu vietato)
- [ ] Font Fraunces+Inter (o fallback corretto)?
- [ ] 1 idea sola, ≤~30 parole, gerarchia leggibile?
- [ ] Safe-area rispettata (reel/story)?
- [ ] Footer brand (wordmark+tagline+handle) presente?
- [ ] Nessun segnaposto `{{...}}` o `[...]` rimasto visibile per errore?
- [ ] Tagline e handle scritti **identici** allo standard?
> Tutte ✅ → ok render. Una ❌ → rigenera.
