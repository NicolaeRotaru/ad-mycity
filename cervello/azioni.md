# 🤲 LE MANI — tutti i canali con cui i senior agiscono (per costo)

> Le "mani" fanno agire i senior sul mondo reale. Regola: **ogni compito alla mano più economica capace.**
> Claude (Max, costo fisso) = ragionamento; le AI economiche e le mani gratis = il lavoro ad alto volume →
> tante mani in parallelo a ~€0. Tutto passa dal cancello 🟢🟡🔴 e dalla coda `AZIONI-IN-ATTESA.md`.
> ⚠️ Piani gratuiti/prezzi cambiano: verificare al collegamento. Le mani esterne richiedono account/chiavi di Nicola.
> Come collegarle (passo-passo): `cervello/collega-le-mani.md`. Le AI economiche: `cervello/banco-ai.md`.

Legenda stato: ✅ già nel marketplace · 🟢 gratis da collegare · 🟡 pronta, serve chiave · 🔴 da costruire/a pagamento.

## 🆓 GRATIS / quasi-gratis — accendi queste per prime
| Mano | A cosa serve | Chi la usa | Come parte | Stato | Serve da Nicola |
|---|---|---|---|---|---|
| Email (Resend) | clienti/negozianti | crm, marketing, supporto | `lib/email` o esecutore | ✅ | RESEND_API_KEY + dominio |
| Notifiche in-app | clienti/negozianti | tutti | insert `notifications` | ✅ | chiave scrittura marketplace |
| Web push | clienti | crm, operations | `lib/push` | ✅ | VAPID keys |
| **Telegram Bot** ⭐ | avvisi a te + clienti | tutti | Bot API | 🟢 | crea bot (@BotFather), TELEGRAM_BOT_TOKEN+CHAT_ID |
| **n8n self-hosted** | hub: collega tutto | builder | webhook | 🟢 | installare n8n (gratis) + N8N_WEBHOOK_URL |
| Google Sheets/Drive | report, liste | analista, crm | API/n8n | 🟢 | account Google + API |
| Google Forms | lista d'attesa | marketing | link | 🟢 | account Google |
| Google Business Profile | post + risposte recensioni | marketing, pr | API/n8n | 🟢 | scheda GBP |
| Maps/Geocoding | zone consegna | operations | Nominatim(OSM) gratis o Google free | 🟢 | (OSM nessuna chiave) |
| Browser automation | siti senza API, scraping | intelligence, builder | browser | 🟢 | — (sul worker) |
| WebSearch | ricerca/intelligence | intelligence, analista | nativo | ✅ | — |
| QR / PDF / locandine | materiali | designer | `creativi/` | ✅ | — |
| Marketplace interne | coupon, prodotti, nascondi, ordini, modera, risposte recensioni | growth, vendite, ops | admin API | ✅ | chiave SCRITTURA |
| **Config sito** (banner, logo, home, pagine, vetrine) | cambia aspetto/contenuti SENZA deploy | product, designer, content | `cervello/marketplace.mjs` | ✅ | chiave SCRITTURA |

## 🤖 IL BANCO DELLE AI ECONOMICHE → dettaglio in `cervello/banco-ai.md`
| AI | Per cosa | Costo |
|---|---|---|
| **Gemini Flash** ⭐ | vision (foto→prodotti), generazione immagini, multimodale | free tier / ~€0,10 a negozio |
| Groq / DeepSeek / Gemini Flash-Lite | alto volume: router, classificazione, bozze di massa, riassunti | gratis / bassissimo |
| Whisper | trascrizione note vocali | molto cheap |
| TTS (Google/ElevenLabs free) | messaggi vocali | free tier |
| Traduzione | multilingua | gratis |

## 💸 BASSO COSTO a consumo — quando servono
| Mano | A cosa serve | Stato | Note |
|---|---|---|---|
| WhatsApp Business (Cloud API) | clienti + negozianti | 🔴 | per-messaggio; setup con verifica Meta (lenta) |
| SMS | notifiche consegna | 🔴 | Telegram è l'alternativa gratis |
| Stripe write (refund/transfer/payout) | soldi | 🔴 | nessuna fee extra ma **sempre 🔴 firma** |
| E-signature contratti | legale | 🔴 | free tier di alcuni servizi |

## 💰 A PAGAMENTO — solo con budget (sempre 🔴)
Ads Meta / Google / TikTok · WhatsApp a volume · voce/telefonate a volume · stampa fisica (tipografia).

---
**Starter pack gratis (da accendere subito):** Email · Notifiche · Push · **Telegram** · **n8n** · **Gemini Flash** ·
Google Sheets/Forms/Business · Browser · WebSearch · chiave **scrittura marketplace**. → la squadra agisce su quasi tutto a ~€0.
