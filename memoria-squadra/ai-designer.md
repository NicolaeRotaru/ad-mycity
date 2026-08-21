---
tipo: quaderno-memoria
reparto: ai-designer
---

# 🧠 Quaderno di ai-designer
> Cosa ho imparato. Leggi all'inizio, aggiungi un ESITO alla fine di ogni lavoro.

## Esiti
- 2026-07-01 · giro web · Pipeline prodotto 2026 = foto reale hero + AI solo per sfondo/varianti, con verifica umana anti-drift catalogo · https://www.gopackshot.com/blog/ai-product-photography-hype-vs-reality · per botteghe MyCity l'asset vero resta master; etichettare output AI-enhanced (EU AI Act da ago 2026) · #ai-image #hybrid #compliance
- 2026-08-21 14:20 · audit design marketplace, dimensione immagini-media · la causa radice non era "una foto brutta": `sizedImage(x,'card'|'thumb')` in lib/image-url.ts impone height=width lato Supabase, e il loader lib/image-loader.ts ripropaga height=width ogni volta che il parametro c'è già — quindi UNA sola riga di taglia sbagliata rende quadrata la foto a tutti i breakpoint anche nei riquadri 16:9 e 4:3 · 3 punti a doppio ritaglio (HomeEvents 16/9, CategoryShowcase 4/3, anteprima storie 3/4) + 21 `unoptimized` residui su 29 (il fix #99 fu applicato a 8 file soli) · lezione: in un audit immagini si parte SEMPRE dalla catena taglia→loader→contenitore, non dal componente; e un fix di pipeline applicato "sui file principali" lascia il difetto vivo dove nessuno guarda · #audit #immagini #aspect-ratio #causa-radice
