#!/usr/bin/env node
/**
 * Genera i 50 workflow n8n stub (10 categorie × 5) per MyCity.
 * Uso: node consegne/automazioni/n8n/genera-catalogo-50.mjs
 */
import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, "workflows");

const CATALOG = [
  {
    cat: "01-social",
    label: "Social & canali",
    items: [
      ["01-pubblica-post-fb", "Pubblica post Facebook", "Webhook da card approvata → Graph API pagina MyCity.", "🔴"],
      ["02-pubblica-post-ig", "Pubblica post Instagram", "Webhook → crea media IG + publish feed.", "🔴"],
      ["03-pubblica-post-gbp", "Pubblica post Google Business", "Webhook → localPost su Maps.", "🔴"],
      ["04-calendario-post-cron", "Calendario post settimanale", "Cron lunedì 9:00 legge Google Sheet calendario → instrada al router canali.", "🔴"],
      ["05-report-social-settimana", "Report social settimanale", "Cron venerdì → conta post usciti → Telegram riepilogo.", "🟢"],
    ],
  },
  {
    cat: "02-acquisizione",
    label: "Acquisizione clienti",
    items: [
      ["01-nuovo-iscritto-hub", "Nuovo iscritto lista attesa", "Webhook iscrizione → Sheets + Telegram + email welcome.", "🟡"],
      ["02-invito-zona-live", "Invito zona quando negozio apre", "Webhook negozio live → email iscritti stessa zona.", "🔴"],
      ["03-reminder-lista-attesa", "Reminder lista attesa", "Cron settimanale → email «stiamo arrivando» a chi aspetta.", "🔴"],
      ["04-referral-traccia-codice", "Referral traccia codice", "Webhook signup con codice amico → Sheets + notifica Telegram.", "🟡"],
      ["05-report-iscrizioni", "Report iscrizioni settimanale", "Cron → conta nuovi iscritti → Sheets + Telegram.", "🟢"],
    ],
  },
  {
    cat: "03-carrelli",
    label: "Carrelli abbandonati",
    items: [
      ["01-carrello-1h-email", "Carrello abbandonato 1 ora", "Supabase/cron → email promemoria «hai lasciato qualcosa».", "🔴"],
      ["02-carrello-24h-secondo", "Carrello abbandonato 24 ore", "Secondo touch email + link diretto checkout.", "🔴"],
      ["03-carrello-alert-telegram", "Alert carrello alto valore", "Carrello > soglia → Telegram immediato a Nicola.", "🟡"],
      ["04-carrello-coupon-recupero", "Coupon recupero carrello", "Dopo 2 touch → API marketplace coupon (solo se approvato).", "🔴"],
      ["05-report-recupero-carrelli", "Report recupero carrelli", "Cron settimanale → tasso recupero → Google Sheets.", "🟢"],
    ],
  },
  {
    cat: "04-fidelizzazione",
    label: "Fidelizzazione",
    items: [
      ["01-winback-30gg", "Win-back dormiente 30 giorni", "Cron → clienti senza ordine 30gg → email riattivazione.", "🔴"],
      ["02-winback-60gg", "Win-back dormiente 60 giorni", "Secondo touch con offerta soft.", "🔴"],
      ["03-post-consegna-recensione", "Grazie + recensione post-consegna", "Ordine consegnato → email/push chiedi recensione.", "🔴"],
      ["04-promemoria-riordino", "Promemoria riordino pane/freschi", "Cron per categoria ad alta frequenza → email «serve di nuovo?».", "🔴"],
      ["05-report-retention", "Report retention mensile", "Cron → coorte riattivati → Sheets + Telegram.", "🟢"],
    ],
  },
  {
    cat: "05-negozi",
    label: "Negozi & onboarding",
    items: [
      ["01-nuovo-ordine-negozio", "Notifica nuovo ordine al negozio", "Webhook ordine pagato → email/WhatsApp negozio.", "🔴"],
      ["02-promemoria-kyc-stripe", "Promemoria KYC Stripe", "Cron giornaliero negozi senza payout → email checklist.", "🟡"],
      ["03-health-score-caldo", "Health score negozio in calo", "Webhook/cron health → Telegram avviso AD.", "🟡"],
      ["04-catalogo-vuoto", "Promemoria catalogo vuoto", "Negozio live senza prodotti → email + Telegram.", "🟡"],
      ["05-checkin-settimanale-negozio", "Check-in settimanale negozio", "Cron lunedì → WhatsApp/email template check-in anchor.", "🔴"],
    ],
  },
  {
    cat: "06-operations",
    label: "Operations & consegne",
    items: [
      ["01-ordine-ritardo", "Alert ordine in ritardo", "Supabase trigger ritardo → Telegram sala controllo.", "🟡"],
      ["02-negozio-non-risponde", "Escalation negozio non risponde", "Timer ordine non accettato → Telegram + notifica negozio.", "🔴"],
      ["03-meteo-pioggia-ops", "Meteo pioggia → post + ops", "OpenWeather pioggia → prepara post delivery + alert rider.", "🔴"],
      ["04-pagamento-fallito", "Pagamento fallito cliente", "Stripe webhook fail → email cliente + Telegram ops.", "🔴"],
      ["05-report-ordini-giorno", "Report ordini giornaliero", "Cron 22:00 → riepilogo ordini/consegne → Sheets + Telegram.", "🟢"],
    ],
  },
  {
    cat: "07-comunicazione",
    label: "Comunicazione AD",
    items: [
      ["01-card-da-approvare", "Card Da approvare → Telegram", "Webhook Pannello → messaggio Telegram ogni nuova card 🔴.", "🟡"],
      ["02-errore-worker", "Errore worker/deploy", "Webhook alert → Telegram urgente.", "🟡"],
      ["03-email-transazionale", "Email transazionale Resend", "Webhook generico → invio template Resend.", "🔴"],
      ["04-whatsapp-negozio", "WhatsApp template negozio", "Webhook → WhatsApp Business Cloud (setup Meta).", "🔴"],
      ["05-sms-urgente", "SMS urgente consegna", "Fallback Twilio per ritardi critici.", "🔴"],
    ],
  },
  {
    cat: "08-marketing-locale",
    label: "Marketing locale",
    items: [
      ["01-post-meteo-pioggia", "Post pioggia + delivery", "Meteo → bozza post «resta a casa» → accoda card 🔴.", "🔴"],
      ["02-storia-bottega", "Storia bottega settimanale", "Cron → prende scheda negozio → prepara post Volti.", "🔴"],
      ["03-evento-vp-locale", "Evento Venerdì Piacentini", "Calendar evento → promemoria post + checklist.", "🔴"],
      ["04-prodotto-giorno", "Prodotto del giorno", "Cron → rotazione prodotto hero → webhook pub social.", "🔴"],
      ["05-report-reach-locale", "Report reach post locale", "Cron → metriche post → Telegram.", "🟢"],
    ],
  },
  {
    cat: "09-intelligence",
    label: "Intelligence programmata",
    items: [
      ["01-rss-bandi-comune", "RSS bandi Comune", "Cron 7:00 → RSS Comune/CCIAA → filtro 5 righe → Telegram.", "🟢"],
      ["02-rss-vita-centro", "RSS Vita in Centro / CNA", "Cron → feed associazioni → riassunto Telegram.", "🟢"],
      ["03-promemoria-scadenza-bando", "Promemoria scadenza bando", "Calendar T-7/T-1 → Telegram (es. PI26).", "🟡"],
      ["04-meteo-domani-ops", "Meteo domani per ops", "Cron sera → previsione pioggia → Telegram marketing/ops.", "🟢"],
      ["05-report-intelligence", "Report intelligence settimanale", "Cron → webhook worker con link briefing.", "🟢"],
    ],
  },
  {
    cat: "10-backoffice",
    label: "Salute macchina & back-office",
    items: [
      ["01-stripe-payout-bloccato", "Stripe payout bloccato", "Stripe read → Telegram se payout fermo >48h.", "🟡"],
      ["02-runway-cassa-alert", "Alert runway cassa", "Cron → se burn/runway sotto soglia → Telegram.", "🟡"],
      ["03-export-incassi-sheets", "Export incassi payout Sheets", "Cron settimanale → Stripe read → riga Sheets.", "🟢"],
      ["04-health-check-n8n", "Health check n8n", "Cron ogni ora → ping self → Telegram se giù.", "🟢"],
      ["05-log-uscite-social", "Log uscite social audit", "Dopo ogni pub → append riga Sheets audit trail.", "🟢"],
    ],
  },
];

function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function makeWorkflow(num, catSlug, fileSlug, title, desc, colore, trigger) {
  const id = randomUUID();
  const webhookPath = `mycity-wf-${String(num).padStart(2, "0")}-${fileSlug.replace(/^\d+-/, "")}`;
  const isCron = trigger === "cron";

  const triggerNode = isCron
    ? {
        parameters: { rule: { interval: [{ field: "cronExpression", expression: "0 7 * * *" }] } },
        id: "trigger-cron",
        name: "Schedule (modifica orario)",
        type: "n8n-nodes-base.scheduleTrigger",
        typeVersion: 1.2,
        position: [240, 300],
      }
    : {
        parameters: {
          httpMethod: "POST",
          path: webhookPath,
          responseMode: "responseNode",
          options: {},
        },
        id: "trigger-webhook",
        name: "Webhook (da worker/card)",
        type: "n8n-nodes-base.webhook",
        typeVersion: 2,
        position: [240, 300],
        webhookId: webhookPath,
      };

  const nodes = [
    triggerNode,
    {
      parameters: {
        mode: "raw",
        jsonOutput: JSON.stringify({
          workflow: title,
          categoria: catSlug,
          numero: num,
          colore,
          nota: desc,
          payload: "={{ $json.body || $json }}",
        }),
      },
      id: "set-meta",
      name: "Metadati workflow",
      type: "n8n-nodes-base.set",
      typeVersion: 3.4,
      position: [480, 300],
    },
    {
      parameters: {
        method: "POST",
        url: "=https://api.telegram.org/bot{{ $env.TELEGRAM_BOT_TOKEN }}/sendMessage",
        sendBody: true,
        bodyParameters: {
          parameters: [
            { name: "chat_id", value: "={{ $env.TELEGRAM_CHAT_ID }}" },
            {
              name: "text",
              value: `=🤖 [STUB ${num}] ${title}\n${desc}\n\nConfigura i nodi azione prima di attivare. Colore: ${colore}`,
            },
          ],
        },
        options: {},
      },
      id: "stub-telegram",
      name: "Stub Telegram (sostituire)",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [720, 300],
    },
  ];

  const connections = {
    [isCron ? "Schedule (modifica orario)" : "Webhook (da worker/card)"]: {
      main: [[{ node: "Metadati workflow", type: "main", index: 0 }]],
    },
    "Metadati workflow": { main: [[{ node: "Stub Telegram (sostituire)", type: "main", index: 0 }]] },
  };

  if (!isCron) {
    nodes.push({
      parameters: { respondWith: "json", responseBody: `={{ { "ok": true, "workflow": "${title}" } }}` },
      id: "respond",
      name: "Rispondi OK",
      type: "n8n-nodes-base.respondToWebhook",
      typeVersion: 1,
      position: [960, 300],
    });
    connections["Stub Telegram (sostituire)"] = { main: [[{ node: "Rispondi OK", type: "main", index: 0 }]] };
  }

  return {
    id,
    versionId: id,
    name: `MyCity ${String(num).padStart(2, "0")} — ${title}`,
    _descrizione: `${desc} COLORE: ${colore} — stub importabile: sostituisci «Stub Telegram» con l'azione reale (Meta/Resend/Sheets/API). Attiva solo con credenziali pronte.`,
    _categoria: catSlug,
    _numero: num,
    _colore: colore,
    _webhook_path: isCron ? null : webhookPath,
    nodes,
    connections,
    settings: { executionOrder: "v1" },
    active: false,
  };
}

mkdirSync(OUT, { recursive: true });

let num = 0;
const index = [];

const CRON_SLUGS = new Set([
  "04-calendario-post-cron",
  "05-report-social-settimana",
  "03-reminder-lista-attesa",
  "05-report-iscrizioni",
  "05-report-recupero-carrelli",
  "01-winback-30gg",
  "02-winback-60gg",
  "04-promemoria-riordino",
  "05-report-retention",
  "02-promemoria-kyc-stripe",
  "05-checkin-settimanale-negozio",
  "05-report-ordini-giorno",
  "02-storia-bottega",
  "04-prodotto-giorno",
  "05-report-reach-locale",
  "01-rss-bandi-comune",
  "02-rss-vita-centro",
  "03-promemoria-scadenza-bando",
  "04-meteo-domani-ops",
  "05-report-intelligence",
  "02-runway-cassa-alert",
  "03-export-incassi-sheets",
  "04-health-check-n8n",
  "05-log-uscite-social",
]);

for (const block of CATALOG) {
  for (const [fileSlug, title, desc, colore] of block.items) {
    num += 1;
    const trigger = CRON_SLUGS.has(fileSlug) ? "cron" : "webhook";
    const wf = makeWorkflow(num, block.cat, fileSlug, title, desc, colore, trigger);
    const fname = `${String(num).padStart(2, "0")}-${block.cat}-${fileSlug}.json`;
    writeFileSync(join(OUT, fname), JSON.stringify(wf, null, 2) + "\n");
    index.push({ num, fname, title, categoria: block.label, colore, webhook: wf._webhook_path });
  }
}

writeFileSync(join(ROOT, "CATALOGO-50-WORKFLOW.json"), JSON.stringify({ generato: new Date().toISOString(), totale: index.length, workflows: index }, null, 2) + "\n");

console.log(`OK: ${index.length} workflow in ${OUT}`);
