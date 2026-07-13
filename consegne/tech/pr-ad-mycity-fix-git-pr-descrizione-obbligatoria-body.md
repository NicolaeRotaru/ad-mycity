## Cosa cambia
Lo script che apre le Pull Request **non accetta più** descrizioni vuote o generiche: se manca il testo vero, si ferma con errore chiaro invece di pubblicare «PR aperta dall'AD…».

## Perché
Nicola ha chiesto che **ogni** PR su GitHub abbia sempre una spiegazione in italiano (cosa, perché, come provare). Prima lo script metteva un testo automatico se l'AD dimenticava `--body`.

## Come funziona ora
- Passa `--body "…"` oppure `--body-file percorso`
- Oppure salva prima il testo in `consegne/tech/pr-ad-mycity-body.md` (o con il nome del branch)
- Se la PR esiste già, aggiorna la descrizione su GitHub quando il testo è diverso

## Come verificare
1. Prova senza body: `node cervello/git-pr.mjs --repo ad-mycity --dry-run` → deve uscire con errore «descrizione comprensibile»
2. Con questo file body: stesso comando sul branch fix → deve mostrare il body in anteprima
3. Dopo il merge, apri una PR di prova: su GitHub la descrizione deve comparire subito, non il testo generico
