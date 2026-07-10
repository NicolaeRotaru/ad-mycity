"use client";

import { useState, useRef, useEffect, useCallback, memo, Fragment } from "react";
import {
  Send,
  Loader2,
  Wrench,
  X,
  TrendingUp,
  CheckCircle2,
  Package,
  Euro,
  Receipt,
  UserPlus,
  Users,
  Store,
  AlertTriangle,
  Percent,
  BarChart3,
  Eye,
  ShoppingCart,
  UserMinus,
  Trash2,
  History,
  Copy,
  FileText,
  Brain,
  Plus,
  MessagesSquare,
  Layers,
  Home,
  Menu,
  Mic,
  Mail,
  Target,
  Globe,
  Instagram,
  Wallet,
  MousePointer,
  ChevronDown,
  ChevronRight,
  Clock,
  Star,
  Truck,
  Bike,
  Timer,
  MapPin,
  Banknote,
  RotateCcw,
  ShieldAlert,
  PiggyBank,
  Repeat,
  Smile,
  Headphones,
  Gift,
  HandCoins,
  TrendingDown,
  Boxes,
  PackageX,
  Tags,
  Moon,
  ThumbsUp,
  CalendarClock,
  Scale,
  FlaskConical,
  ArrowUpRight,
  Coins,
  Filter,
  MessageSquare,
  Search,
  Heart,
  Share2,
  Video,
  Newspaper,
  Megaphone,
  Handshake,
  Building2,
  UserX,
  ShieldCheck,
  FileCheck,
  Lock,
  Server,
  Gauge,
  Bug,
  Rocket,
  Workflow,
  Zap,
  Plug,
  Cpu,
  FolderTree,
  Swords,
  CalendarDays,
  Lightbulb,
  Award,
  Microscope,
  Paperclip,
  Maximize2,
  Image as ImageIcon,
} from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import Memoria from "@/components/aree/Memoria";
import EsploraGitHub from "@/components/aree/EsploraGitHub";
import MacchinaArea from "@/components/aree/MacchinaArea";
import Lavori from "@/components/aree/Lavori";
import Storico from "@/components/aree/Storico";
import RicercaGlobale from "@/components/RicercaGlobale";
import Intelligence from "@/components/Intelligence";
import NumeriReport from "@/components/NumeriReport";
import Comandi from "@/components/Comandi";
import Plancia from "@/components/aree/Plancia";
import AreaModuli from "@/components/aree/AreaModuli";
import Azioni from "@/components/aree/Azioni";
import Documenti from "@/components/aree/Documenti";
import { vaultToIso } from "@/lib/format";
import Aggiornato from "@/components/Aggiornato";
import Arsenale from "@/components/Arsenale";
import DemoBanner from "@/components/DemoBanner";
import ParlaCasella from "@/components/ParlaCasella";
import ThemeToggle from "@/components/ThemeToggle";
import { preparaLavoro } from "@/lib/comandi";
import { salvaGruppoLavoroLocale, leggiMappaGruppiLocali, raggruppaLavori, messaggiDaGruppo } from "@/lib/lavori-gruppo";
import { ripristinaSub } from "@/lib/nav";

// Id stabile per un messaggio di chat: la lista dei messaggi usa `m.id` come key React
// (non più l'indice), così durante il polling/il passaggio "pending → risposta" le bolle
// non si scambiano il contenuto. (radiografia: key={i} → id stabile)
let _msgSeq = 0;
function nuovoIdMsg(): string {
  return `m${Date.now().toString(36)}${(_msgSeq++).toString(36)}`;
}

type Livello = "verde" | "giallo" | "rosso";
type Azione = { titolo: string; motivo: string; livello: Livello };
type Opportunita = {
  titolo: string;
  motivo: string;
  impatto: string;
  sforzo: string;
};
type Briefing = { situazione: string; opportunita: Opportunita[]; azioni: Azione[] };
type Msg = {
  id?: string; // key React stabile (vedi nuovoIdMsg): niente più key={i}
  role: "user" | "assistant";
  content: string;
  tools?: string[];
  esperto?: { nome: string; emoji: string };
  prompt?: boolean;
  pending?: boolean; // bolla "sto pensando…" in attesa della risposta del cervello
};
type Conversazione = {
  id: string;
  titolo: string;
  messaggi: Msg[];
  created_at: string;
  updated_at: string;
};
// Lavoro chat in attesa di risposta, con la conversazione di destinazione.
type PendingChat = { id: string; tipo: string; targetConvId: string };
type DiarioVoce = {
  id: number | string;
  at: string;
  tipo: "chat" | "briefing" | "azione";
  titolo: string;
  testo: string;
};

const DIARIO_TIPO: Record<DiarioVoce["tipo"], string> = {
  chat: "💬 Chat",
  briefing: "🔭 Giro",
  azione: "⚡ Azione",
};

type Lavoro = {
  id: string;
  created_at: string;
  updated_at: string;
  stato: "in_attesa" | "in_corso" | "fatto" | "errore";
  tipo: string;
  richiesta: string;
  risultato: string;
  esperto: string;
  gruppo_id?: string | null;
};

const TEAM = [
  { emoji: "🧠", nome: "Direzione (AD)", ruolo: "Strategia e coordinamento" },
  { emoji: "🎧", nome: "Supporto clienti", ruolo: "Clienti e reclami" },
  { emoji: "🛵", nome: "Operations", ruolo: "Ordini, rider, consegne" },
  { emoji: "📣", nome: "Marketing/Growth", ruolo: "Contenuti e acquisizione" },
  { emoji: "🤝", nome: "Vendite/Onboarding", ruolo: "Negozi" },
  { emoji: "📊", nome: "Analista", ruolo: "KPI e report" },
  { emoji: "💶", nome: "Finanza", ruolo: "Incassi e pagamenti" },
  { emoji: "🛠️", nome: "Tech", ruolo: "Analisi del sito" },
  { emoji: "🔎", nome: "Intelligence", ruolo: "Concorrenti e trend" },
];

// Comandi rapidi: cliccando precompilano l'input della chat (poi Nicola completa).
// "Contenuti PRO" = crea contenuti a qualita' alta (vedi COMANDI.md / CLAUDE.md).
const COMANDI_RAPIDI: { label: string; testo: string }[] = [
  { label: "✨ Contenuti PRO", testo: "contenuti pro: " },
  { label: "🔄 Fai un giro", testo: "fai un giro" },
  { label: "📋 Che comandi ho?", testo: "che comandi ho?" },
  { label: "📊 Come stiamo?", testo: "come stiamo?" },
];

const TOOL_LABELS: Record<string, string> = {
  web_search: "Ricerca web",
  marketplace_elenco_file: "Elenco file del sito",
  marketplace_leggi_file: "Lettura file del sito",
  dati_tabelle: "Tabelle del marketplace",
  dati_query: "Dati del marketplace",
  obsidian_cerca: "Note Obsidian",
  obsidian_leggi: "Lettura nota Obsidian",
  obsidian_scrivi: "Scrittura nota Obsidian",
};
// Il cockpit "I numeri di oggi": 30 dati Marketplace + 30 dati Marketing.
// Ogni KPI è una RIGA con tre finestre: oggi / 7 giorni / 30 giorni
// (10 KPI × 3 = 30 dati per blocco). Ogni finestra ha una "chiave" = campo di
// /api/metriche; senza chiave la cella è "—" (fonte ancora da collegare).
type Tipo = "n" | "euro" | "durata" | "stelle" | "perc";
type Kpi = {
  icon: React.ReactNode;
  label: string;
  fonte: string;
  tipo?: Tipo;
  oggi?: string; // chiave finestra "oggi"
  sett?: string; // chiave finestra "7 giorni"
  mese?: string; // chiave finestra "30 giorni"
  valore?: string; // chiave per i dati "snapshot" (foto di adesso, una sola cifra)
};

// === 30 DATI MARKETPLACE — 10 KPI × (oggi/7g/30g), tutti dal DB ===
const MARKETPLACE_KPI: Kpi[] = [
  { icon: <Package size={16} />, label: "Ordini", fonte: "mycity", tipo: "n", oggi: "ordini_oggi", sett: "ordini_7g", mese: "ordini_30g" },
  { icon: <Euro size={16} />, label: "Incasso (GMV)", fonte: "mycity", tipo: "euro", oggi: "incasso_oggi", sett: "incasso_7g", mese: "incasso_30g" },
  { icon: <Receipt size={16} />, label: "Scontrino medio", fonte: "mycity", tipo: "euro", oggi: "scontrino_oggi", sett: "scontrino_7g", mese: "scontrino_30g" },
  { icon: <UserPlus size={16} />, label: "Nuovi clienti", fonte: "mycity", tipo: "n", oggi: "nuovi_clienti_oggi", sett: "nuovi_clienti_7g", mese: "nuovi_clienti_30g" },
  { icon: <Users size={16} />, label: "Clienti attivi", fonte: "mycity", tipo: "n", oggi: "clienti_attivi_oggi", sett: "clienti_attivi_7g", mese: "clienti_attivi_30g" },
  { icon: <CheckCircle2 size={16} />, label: "Consegne completate", fonte: "mycity", tipo: "n", oggi: "consegne_oggi", sett: "consegne_7g", mese: "consegne_30g" },
  { icon: <AlertTriangle size={16} />, label: "Ordini annullati", fonte: "mycity", tipo: "n", oggi: "annullati_oggi", sett: "annullati_7g", mese: "annullati_30g" },
  { icon: <ShoppingCart size={16} />, label: "Carrelli abbandonati", fonte: "mycity", tipo: "n", oggi: "carrelli_oggi", sett: "carrelli_7g", mese: "carrelli_30g" },
  { icon: <UserMinus size={16} />, label: "Carrelli recuperati", fonte: "mycity", tipo: "n", oggi: "carrelli_recuperati_oggi", sett: "carrelli_recuperati_7g", mese: "carrelli_recuperati_30g" },
  { icon: <Store size={16} />, label: "Nuovi negozi", fonte: "mycity", tipo: "n", oggi: "nuovi_negozi_oggi", sett: "nuovi_negozi_7g", mese: "nuovi_negozi_30g" },
];

// === PUBBLICITÀ (ADS) === — Meta/Google/TikTok Ads
const ADS_KPI: Kpi[] = [
  { icon: <Wallet size={16} />, label: "Spesa ads", fonte: "Meta/Google Ads", tipo: "euro" },
  { icon: <Target size={16} />, label: "ROAS", fonte: "Meta/Google Ads", tipo: "n" },
  { icon: <Receipt size={16} />, label: "CPA (costo/acquisizione)", fonte: "Meta/Google Ads", tipo: "euro" },
  { icon: <MousePointer size={16} />, label: "CPC (costo/click)", fonte: "Meta/Google Ads", tipo: "euro" },
  { icon: <MousePointer size={16} />, label: "Click ads", fonte: "Meta/Google Ads", tipo: "n" },
  { icon: <Eye size={16} />, label: "Impression ads", fonte: "Meta/Google Ads", tipo: "n" },
];

// === SEO & TRAFFICO === — "Visite sito" arriva già da PostHog
const SEO_KPI: Kpi[] = [
  { icon: <Globe size={16} />, label: "Visite sito", fonte: "PostHog/GA4", tipo: "n", sett: "visite_7g" },
  { icon: <Users size={16} />, label: "Visitatori unici", fonte: "PostHog/GA4", tipo: "n" },
  { icon: <Search size={16} />, label: "Posizione media Google", fonte: "Search Console", tipo: "n" },
  { icon: <Award size={16} />, label: "Keyword in top 10", fonte: "Search Console", tipo: "n" },
  { icon: <MousePointer size={16} />, label: "Click da Google", fonte: "Search Console", tipo: "n" },
  { icon: <MapPin size={16} />, label: "Visite scheda Google", fonte: "Google Business", tipo: "n" },
];

// === SOCIAL & CONTENUTI ===
const SOCIAL_KPI: Kpi[] = [
  { icon: <Instagram size={16} />, label: "Follower", fonte: "IG/Facebook", tipo: "n" },
  { icon: <TrendingUp size={16} />, label: "Nuovi follower", fonte: "IG/Facebook", tipo: "n" },
  { icon: <Heart size={16} />, label: "Engagement", fonte: "IG/Facebook", tipo: "perc" },
  { icon: <Share2 size={16} />, label: "Reach / copertura", fonte: "IG/Facebook", tipo: "n" },
  { icon: <FileText size={16} />, label: "Post pubblicati", fonte: "content", tipo: "n" },
  { icon: <Video size={16} />, label: "Visualizzazioni reel", fonte: "IG/TikTok", tipo: "n" },
];

// === STAMPA, PARTNERSHIP & ISTITUZIONI ===
const PR_KPI: Kpi[] = [
  { icon: <Newspaper size={16} />, label: "Uscite stampa", fonte: "PR", tipo: "n" },
  { icon: <Megaphone size={16} />, label: "Menzioni / earned reach", fonte: "PR", tipo: "n" },
  { icon: <Handshake size={16} />, label: "Influencer attivi", fonte: "partnership", tipo: "n" },
  { icon: <Gift size={16} />, label: "Conversioni da partner", fonte: "partnership", tipo: "n" },
  { icon: <Award size={16} />, label: "Bandi attivi / vinti", fonte: "ist. relazioni", tipo: "n" },
  { icon: <Building2 size={16} />, label: "Partner istituzionali", fonte: "ist. relazioni", tipo: "n" },
];

// === SALUTE ADESSO — foto istantanea dell'azienda, tutta da dati REALI del DB ===
// Sono cifre "snapshot" (una sola finestra: adesso), già collegate al marketplace.
const SALUTE_KPI: Kpi[] = [
  { icon: <Users size={16} />, label: "Clienti totali", fonte: "mycity", tipo: "n", valore: "clienti" },
  { icon: <Store size={16} />, label: "Negozi attivi", fonte: "mycity", tipo: "n", valore: "negozi" },
  { icon: <Truck size={16} />, label: "Consegne in corso", fonte: "mycity", tipo: "n", valore: "consegne_in_corso" },
  { icon: <Clock size={16} />, label: "Tempo medio consegna", fonte: "mycity", tipo: "durata", valore: "tempo_consegna_min" },
  { icon: <Star size={16} />, label: "Recensione media", fonte: "mycity", tipo: "stelle", valore: "recensione_media" },
  { icon: <ThumbsUp size={16} />, label: "Recensioni totali", fonte: "mycity", tipo: "n", valore: "recensioni_totali" },
  { icon: <ShoppingCart size={16} />, label: "Carrelli attivi", fonte: "mycity", tipo: "n", valore: "carrelli" },
  { icon: <Moon size={16} />, label: "Clienti dormienti (>30g)", fonte: "mycity", tipo: "n", valore: "clienti_dormienti" },
  { icon: <AlertTriangle size={16} />, label: "Ordini con problemi", fonte: "mycity", tipo: "n", valore: "problemi" },
];

// === CONSEGNE & PUNTUALITÀ === — qualità del servizio di consegna
const CONSEGNE_KPI: Kpi[] = [
  { icon: <CheckCircle2 size={16} />, label: "Consegne puntuali", fonte: "tracking consegne", tipo: "perc" },
  { icon: <Clock size={16} />, label: "Consegne in ritardo", fonte: "tracking consegne", tipo: "n" },
  { icon: <Timer size={16} />, label: "Tempo medio preparazione", fonte: "negozi/POS", tipo: "durata" },
  { icon: <Truck size={16} />, label: "Tempo medio consegna", fonte: "tracking consegne", tipo: "durata" },
  { icon: <RotateCcw size={16} />, label: "Consegne contestate", fonte: "tracking consegne", tipo: "n" },
  { icon: <MapPin size={16} />, label: "Distanza media", fonte: "tracking consegne", tipo: "n" },
];

// === RIDER & FLOTTA === — chi consegna e a che costo
const RIDER_KPI: Kpi[] = [
  { icon: <Bike size={16} />, label: "Rider attivi", fonte: "flotta rider", tipo: "n" },
  { icon: <Users size={16} />, label: "Turni coperti", fonte: "flotta rider", tipo: "perc" },
  { icon: <Truck size={16} />, label: "Ordini per rider", fonte: "flotta rider", tipo: "n" },
  { icon: <Euro size={16} />, label: "Costo medio consegna", fonte: "flotta rider", tipo: "euro" },
  { icon: <MapPin size={16} />, label: "Zone scoperte", fonte: "flotta rider", tipo: "n" },
  { icon: <Clock size={16} />, label: "Tempo medio per giro", fonte: "flotta rider", tipo: "durata" },
];

// === FINANZA & MARGINI — 8 KPI × 3 finestre ===
// Si accendono quando colleghi Stripe/payout e i costi.
const FINANZA_KPI: Kpi[] = [
  { icon: <Percent size={16} />, label: "Ricavo piattaforma (commissioni)", fonte: "Stripe/ordini", tipo: "euro", valore: "ricavo_commissione_30g" },
  { icon: <TrendingUp size={16} />, label: "Margine medio / ordine", fonte: "Stripe/costi", tipo: "euro", valore: "cm_reale_per_ordine" },
  { icon: <Banknote size={16} />, label: "Payout ai negozi", fonte: "Stripe", tipo: "euro", valore: "payout_completati_euro" },
  { icon: <RotateCcw size={16} />, label: "Rimborsi", fonte: "Stripe", tipo: "euro", valore: "rimborsi_euro" },
  { icon: <ShieldAlert size={16} />, label: "Chargeback / dispute", fonte: "Stripe", tipo: "n" },
  { icon: <Truck size={16} />, label: "Costo consegne", fonte: "flotta rider", tipo: "euro" },
  { icon: <Receipt size={16} />, label: "IVA stimata", fonte: "contabilità", tipo: "euro" },
  { icon: <PiggyBank size={16} />, label: "Incasso netto", fonte: "Stripe/costi", tipo: "euro" },
];

// === CLIENTI & RETENTION (CRM) === — far tornare e fidelizzare i clienti
const CLIENTI_KPI: Kpi[] = [
  { icon: <Repeat size={16} />, label: "Tasso di riordino", fonte: "ordini", tipo: "perc", valore: "repeat_rate" },
  { icon: <UserMinus size={16} />, label: "Churn clienti", fonte: "ordini", tipo: "perc" },
  { icon: <HandCoins size={16} />, label: "Valore cliente (LTV)", fonte: "ordini", tipo: "euro", valore: "ltv_medio" },
  { icon: <History size={16} />, label: "Frequenza riordino", fonte: "ordini", tipo: "n", valore: "ordini_per_cliente" },
  { icon: <Mail size={16} />, label: "Email inviate", fonte: "Resend", tipo: "n" },
  { icon: <Eye size={16} />, label: "Apertura email", fonte: "Resend", tipo: "perc" },
  { icon: <RotateCcw size={16} />, label: "Win-back recuperati", fonte: "CRM", tipo: "n" },
  { icon: <Gift size={16} />, label: "Referral / inviti", fonte: "CRM", tipo: "n", valore: "referral_totali" },
];

// === NEGOZI & CATALOGO — 8 KPI × 3 finestre ===
// Si accendono quando colleghi catalogo prodotti e health dei negozi.
const NEGOZI_KPI: Kpi[] = [
  { icon: <TrendingDown size={16} />, label: "Negozi in calo", fonte: "ordini", tipo: "n", valore: "negozi_rossi" },
  { icon: <Boxes size={16} />, label: "Prodotti a catalogo", fonte: "catalogo", tipo: "n", valore: "prodotti_totali" },
  { icon: <PackageX size={16} />, label: "Prodotti esauriti", fonte: "catalogo", tipo: "n", valore: "prodotti_stock_zero" },
  { icon: <Store size={16} />, label: "Negozi senza ordini", fonte: "ordini", tipo: "n" },
  { icon: <Tags size={16} />, label: "Categorie coperte", fonte: "catalogo", tipo: "n", valore: "categorie_coperte" },
  { icon: <Star size={16} />, label: "Recensione media negozi", fonte: "recensioni", tipo: "stelle" },
  { icon: <Clock size={16} />, label: "Tempo risposta negozio", fonte: "messaggi", tipo: "durata" },
  { icon: <UserPlus size={16} />, label: "Negozi in onboarding", fonte: "vendite", tipo: "n" },
];

// === CONTABILITÀ & FISCO ===
const CONTABILITA_KPI: Kpi[] = [
  { icon: <FileText size={16} />, label: "Fatture emesse", fonte: "contabilità", tipo: "n" },
  { icon: <Receipt size={16} />, label: "Fatturato imponibile", fonte: "contabilità", tipo: "euro" },
  { icon: <Percent size={16} />, label: "IVA da versare", fonte: "contabilità", tipo: "euro" },
  { icon: <Banknote size={16} />, label: "Payout in attesa", fonte: "Stripe/contabilità", tipo: "n", valore: "payout_in_attesa" },
  { icon: <RotateCcw size={16} />, label: "Note di credito / rimborsi", fonte: "contabilità", tipo: "n", valore: "rimborsi_n" },
  { icon: <CalendarClock size={16} />, label: "Scadenze fiscali", fonte: "contabilità", tipo: "n" },
];

// === GROWTH & MONETIZZAZIONE === — esperimenti per fare più soldi
const GROWTH_KPI: Kpi[] = [
  { icon: <FlaskConical size={16} />, label: "Esperimenti attivi", fonte: "growth", tipo: "n" },
  { icon: <ArrowUpRight size={16} />, label: "Uplift ricavo", fonte: "growth", tipo: "perc" },
  { icon: <TrendingUp size={16} />, label: "Tasso upsell", fonte: "ordini", tipo: "perc" },
  { icon: <Coins size={16} />, label: "Fee media consegna", fonte: "ordini", tipo: "euro", valore: "fee_consegna_media_ordine" },
  { icon: <Receipt size={16} />, label: "Commissione media / ordine", fonte: "ordini", tipo: "euro", valore: "commissione_media_ordine" },
  { icon: <Truck size={16} />, label: "Uso soglia spedizione gratis", fonte: "ordini", tipo: "perc" },
];

// === CONVERSIONE & FUNNEL (CRO) === — "Conversione sito" arriva già da PostHog
const CRO_KPI: Kpi[] = [
  { icon: <Percent size={16} />, label: "Conversione sito", fonte: "PostHog/GA4", tipo: "perc", sett: "conversione" },
  { icon: <ShoppingCart size={16} />, label: "Add to cart", fonte: "PostHog/GA4", tipo: "perc" },
  { icon: <Filter size={16} />, label: "Abbandono carrello", fonte: "PostHog/GA4", tipo: "perc" },
  { icon: <Filter size={16} />, label: "Abbandono checkout", fonte: "PostHog/GA4", tipo: "perc" },
  { icon: <FlaskConical size={16} />, label: "A/B test attivi", fonte: "CRO", tipo: "n" },
  { icon: <Clock size={16} />, label: "Tempo al checkout", fonte: "PostHog/GA4", tipo: "durata" },
];

// === SUPPORTO & SODDISFAZIONE ===
const SUPPORTO_KPI: Kpi[] = [
  { icon: <MessageSquare size={16} />, label: "Ticket aperti", fonte: "supporto", tipo: "n" },
  { icon: <Clock size={16} />, label: "Tempo prima risposta", fonte: "supporto", tipo: "durata" },
  { icon: <Timer size={16} />, label: "Tempo di risoluzione", fonte: "supporto", tipo: "durata" },
  { icon: <Smile size={16} />, label: "Soddisfazione (CSAT)", fonte: "supporto", tipo: "perc" },
  { icon: <ThumbsUp size={16} />, label: "NPS", fonte: "sondaggi", tipo: "n" },
  { icon: <Headphones size={16} />, label: "Reclami aperti", fonte: "supporto", tipo: "n" },
];

// === FIDUCIA & SICUREZZA === — frodi, abusi, protezione dati
const TRUST_KPI: Kpi[] = [
  { icon: <ShieldAlert size={16} />, label: "Frodi bloccate", fonte: "trust&safety", tipo: "n" },
  { icon: <Star size={16} />, label: "Recensioni false rimosse", fonte: "trust&safety", tipo: "n" },
  { icon: <UserX size={16} />, label: "Account sospesi", fonte: "trust&safety", tipo: "n" },
  { icon: <ShieldAlert size={16} />, label: "Dispute vinte", fonte: "Stripe", tipo: "perc" },
  { icon: <AlertTriangle size={16} />, label: "Segnalazioni aperte", fonte: "trust&safety", tipo: "n" },
  { icon: <ShieldCheck size={16} />, label: "Incidenti sicurezza", fonte: "security", tipo: "n" },
];

// === LEGALE & PRIVACY ===
const LEGALE_KPI: Kpi[] = [
  { icon: <FileCheck size={16} />, label: "Contratti firmati", fonte: "legale", tipo: "n" },
  { icon: <Lock size={16} />, label: "Consensi GDPR", fonte: "legale/privacy", tipo: "perc" },
  { icon: <ShieldCheck size={16} />, label: "HACCP a norma", fonte: "legale", tipo: "perc" },
  { icon: <CalendarClock size={16} />, label: "Scadenze documenti", fonte: "legale", tipo: "n" },
  { icon: <Scale size={16} />, label: "Richieste GDPR aperte", fonte: "privacy", tipo: "n" },
  { icon: <FileText size={16} />, label: "Negozi senza contratto", fonte: "legale", tipo: "n" },
];

// === TECH & AFFIDABILITÀ SITO ===
const TECH_KPI: Kpi[] = [
  { icon: <Server size={16} />, label: "Uptime", fonte: "Render/monitor", tipo: "perc" },
  { icon: <AlertTriangle size={16} />, label: "Errori in produzione", fonte: "Render/Sentry", tipo: "n" },
  { icon: <Gauge size={16} />, label: "Velocità (LCP)", fonte: "Web Vitals", tipo: "durata" },
  { icon: <Bug size={16} />, label: "Bug aperti", fonte: "tech", tipo: "n" },
  { icon: <Rocket size={16} />, label: "Deploy", fonte: "CI/Render", tipo: "n" },
  { icon: <Eye size={16} />, label: "Core Web Vitals ok", fonte: "Web Vitals", tipo: "perc" },
];

// === AUTOMAZIONI & STRUMENTI ===
const AUTOMAZIONI_KPI: Kpi[] = [
  { icon: <Workflow size={16} />, label: "Flussi attivi", fonte: "n8n", tipo: "n" },
  { icon: <Zap size={16} />, label: "Esecuzioni / giorno", fonte: "n8n", tipo: "n" },
  { icon: <Clock size={16} />, label: "Ore risparmiate", fonte: "n8n", tipo: "n" },
  { icon: <Plug size={16} />, label: "Integrazioni (MCP)", fonte: "builder", tipo: "n" },
  { icon: <AlertTriangle size={16} />, label: "Errori automazioni", fonte: "n8n", tipo: "n" },
  { icon: <Cpu size={16} />, label: "Costo AI / mese", fonte: "builder", tipo: "euro" },
];

// === MERCATO & CONCORRENZA === — il mondo fuori che ci influenza
const MERCATO_KPI: Kpi[] = [
  { icon: <Swords size={16} />, label: "Concorrenti monitorati", fonte: "intelligence", tipo: "n" },
  { icon: <Euro size={16} />, label: "Prezzo medio mercato", fonte: "intelligence", tipo: "euro" },
  { icon: <Award size={16} />, label: "Quota di mercato stimata", fonte: "intelligence", tipo: "perc" },
  { icon: <CalendarDays size={16} />, label: "Eventi in arrivo", fonte: "intelligence", tipo: "n" },
  { icon: <Lightbulb size={16} />, label: "Opportunità aperte", fonte: "intelligence", tipo: "n" },
  { icon: <TrendingUp size={16} />, label: "Trend in salita", fonte: "intelligence", tipo: "n" },
];

// === AZIENDA & SQUADRA === — la salute dell'impresa dietro MyCity
const AZIENDA_KPI: Kpi[] = [
  { icon: <PiggyBank size={16} />, label: "Cassa disponibile", fonte: "finanza", tipo: "euro", valore: "cassa_attuale" },
  { icon: <CalendarClock size={16} />, label: "Runway (mesi)", fonte: "finanza", tipo: "n", valore: "runway_mesi" },
  { icon: <Wallet size={16} />, label: "Costi fissi / mese", fonte: "finanza", tipo: "euro", valore: "burn_lordo" },
  { icon: <TrendingDown size={16} />, label: "Burn netto mensile", fonte: "finanza", tipo: "euro", valore: "burn_netto" },
  { icon: <Scale size={16} />, label: "Break-even (ordini/mese)", fonte: "finanza", tipo: "n", valore: "break_even_ordini_mese" },
  { icon: <Percent size={16} />, label: "Margine operativo", fonte: "finanza", tipo: "perc" },
];

// === OBIETTIVI & GOVERNANCE === — come gira la macchina (AD + squadra)
const GOVERNANCE_KPI: Kpi[] = [
  { icon: <Target size={16} />, label: "OKR a target", fonte: "OKR-Squadra", tipo: "perc" },
  { icon: <AlertTriangle size={16} />, label: "KPI in allarme", fonte: "sentinelle", tipo: "n" },
  { icon: <CheckCircle2 size={16} />, label: "Decisioni prese", fonte: "memoria AI", tipo: "n" },
  { icon: <Clock size={16} />, label: "Azioni in attesa di firma", fonte: "memoria AI", tipo: "n" },
  { icon: <History size={16} />, label: "Giri/report fatti", fonte: "memoria AI", tipo: "n" },
  { icon: <Users size={16} />, label: "Senior attivi", fonte: "squadra", tipo: "n" },
];

// Lista piatta (KPI × finestra) per il generatore di prompt per Max.
const ALL_METRICHE: { label: string; periodo: string; chiave?: string; tipo?: Tipo }[] = [
  ...[
    ...MARKETPLACE_KPI,
    ...FINANZA_KPI,
    ...CONTABILITA_KPI,
    ...GROWTH_KPI,
    ...CLIENTI_KPI,
    ...CRO_KPI,
    ...SUPPORTO_KPI,
    ...NEGOZI_KPI,
    ...ADS_KPI,
    ...SEO_KPI,
    ...SOCIAL_KPI,
    ...PR_KPI,
    ...CONSEGNE_KPI,
    ...RIDER_KPI,
    ...TRUST_KPI,
    ...LEGALE_KPI,
    ...TECH_KPI,
    ...AUTOMAZIONI_KPI,
    ...MERCATO_KPI,
    ...AZIENDA_KPI,
    ...GOVERNANCE_KPI,
  ].flatMap((k) => [
    { label: k.label, periodo: "oggi", chiave: k.oggi, tipo: k.tipo },
    { label: k.label, periodo: "7 giorni", chiave: k.sett, tipo: k.tipo },
    { label: k.label, periodo: "30 giorni", chiave: k.mese, tipo: k.tipo },
  ]),
  ...SALUTE_KPI.map((k) => ({ label: k.label, periodo: "adesso", chiave: k.valore, tipo: k.tipo })),
];

// Le categorie del cockpit "I numeri di oggi", in ordine e raggruppate per
// macro-area (gruppo). Coprono TUTTE le sfere che riguardano e influenzano
// MyCity e l'azienda. Ognuna è una tendina.
type CategoriaNum = { gruppo: string; emoji: string; titolo: string; sottotitolo: string; kpis: Kpi[]; snapshot?: boolean };
const CATEGORIE_NUMERI: CategoriaNum[] = [
  // — Panoramica
  { gruppo: "Panoramica", emoji: "🩺", titolo: "Salute adesso", sottotitolo: "La foto dell'azienda in questo momento — già collegata ai dati reali.", kpis: SALUTE_KPI, snapshot: true },
  // — Soldi & vendite
  { gruppo: "Soldi & vendite", emoji: "📦", titolo: "Marketplace", sottotitolo: "Ordini, incassi, clienti, carrelli, consegne e negozi.", kpis: MARKETPLACE_KPI },
  { gruppo: "Soldi & vendite", emoji: "💶", titolo: "Finanza & margini", sottotitolo: "Commissioni, margini, payout, rimborsi e incasso netto — con Stripe e i costi.", kpis: FINANZA_KPI },
  { gruppo: "Soldi & vendite", emoji: "🧾", titolo: "Contabilità & fisco", sottotitolo: "Fatture, IVA, riconciliazioni e scadenze fiscali.", kpis: CONTABILITA_KPI },
  { gruppo: "Soldi & vendite", emoji: "🚀", titolo: "Growth & monetizzazione", sottotitolo: "Esperimenti, upsell, fee e leve per aumentare i ricavi.", kpis: GROWTH_KPI },
  // — Clienti & domanda
  { gruppo: "Clienti & domanda", emoji: "🤝", titolo: "Clienti & retention (CRM)", sottotitolo: "Riordino, churn, valore cliente, email e referral.", kpis: CLIENTI_KPI },
  { gruppo: "Clienti & domanda", emoji: "🛒", titolo: "Conversione & funnel", sottotitolo: "Conversione, carrello/checkout, A/B test — con PostHog/GA4.", kpis: CRO_KPI },
  { gruppo: "Clienti & domanda", emoji: "🎧", titolo: "Supporto & soddisfazione", sottotitolo: "Ticket, tempi di risposta, CSAT, NPS e reclami.", kpis: SUPPORTO_KPI },
  // — Offerta
  { gruppo: "Offerta", emoji: "🏪", titolo: "Negozi & catalogo", sottotitolo: "Negozi in calo, prodotti, esauriti e categorie — con catalogo e health negozi.", kpis: NEGOZI_KPI },
  // — Acquisizione & voce
  { gruppo: "Acquisizione & voce", emoji: "📢", titolo: "Pubblicità (Ads)", sottotitolo: "Spesa, ROAS, CPA, click e impression — con Meta/Google/TikTok Ads.", kpis: ADS_KPI },
  { gruppo: "Acquisizione & voce", emoji: "🔍", titolo: "SEO & traffico", sottotitolo: "Visite, posizionamento Google e scheda Business.", kpis: SEO_KPI },
  { gruppo: "Acquisizione & voce", emoji: "📱", titolo: "Social & contenuti", sottotitolo: "Follower, engagement, reach, post e reel.", kpis: SOCIAL_KPI },
  { gruppo: "Acquisizione & voce", emoji: "🗞️", titolo: "Stampa, partnership & istituzioni", sottotitolo: "Uscite stampa, influencer, bandi e alleanze locali.", kpis: PR_KPI },
  // — Operazioni & consegne
  { gruppo: "Operazioni & consegne", emoji: "🛵", titolo: "Consegne & puntualità", sottotitolo: "Puntualità, ritardi, tempi di preparazione e consegna.", kpis: CONSEGNE_KPI },
  { gruppo: "Operazioni & consegne", emoji: "🚴", titolo: "Rider & flotta", sottotitolo: "Rider attivi, turni, ordini per rider, costo e zone scoperte.", kpis: RIDER_KPI },
  // — Fondamenta
  { gruppo: "Fondamenta", emoji: "🛡️", titolo: "Fiducia & sicurezza", sottotitolo: "Frodi, recensioni false, account sospesi, dispute e sicurezza.", kpis: TRUST_KPI },
  { gruppo: "Fondamenta", emoji: "⚖️", titolo: "Legale & privacy", sottotitolo: "Contratti, consensi GDPR, HACCP e scadenze documenti.", kpis: LEGALE_KPI },
  { gruppo: "Fondamenta", emoji: "🛠️", titolo: "Tech & affidabilità", sottotitolo: "Uptime, errori in produzione, velocità e bug del sito.", kpis: TECH_KPI },
  { gruppo: "Fondamenta", emoji: "🤖", titolo: "Automazioni & strumenti", sottotitolo: "Flussi n8n, esecuzioni, ore risparmiate e integrazioni (MCP).", kpis: AUTOMAZIONI_KPI },
  { gruppo: "Fondamenta", emoji: "🔎", titolo: "Mercato & concorrenza", sottotitolo: "Concorrenti, prezzi, quota, eventi e opportunità di mercato.", kpis: MERCATO_KPI },
  // — Azienda
  { gruppo: "Azienda", emoji: "🏢", titolo: "Azienda & squadra", sottotitolo: "Cassa, runway, costi fissi, break-even e margine operativo.", kpis: AZIENDA_KPI },
  { gruppo: "Azienda", emoji: "🎯", titolo: "Obiettivi & governance", sottotitolo: "OKR, allarmi, decisioni, azioni in attesa e ritmo della squadra.", kpis: GOVERNANCE_KPI },
];
// Aperte di default: i due blocchi con più dati reali.
// Tutte le categorie chiuse di default: si vede una lista pulita, apri solo ciò che serve.
const NUM_DEFAULT_APERTE: string[] = [];

function formatta(v: any, tipo?: Tipo): string {
  if (v === undefined || v === null) return "—";
  if (tipo === "euro") return "€ " + Number(v).toLocaleString("it-IT", { maximumFractionDigits: 2 });
  if (tipo === "durata") {
    const min = Number(v);
    if (!min) return "—";
    return min >= 60 ? `${Math.floor(min / 60)}h ${Math.round(min % 60)}m` : `${Math.round(min)} min`;
  }
  if (tipo === "stelle") {
    const r = Number(v);
    return r > 0 ? `${r}/5` : "—";
  }
  if (tipo === "perc") return `${Number(v)}%`;
  return String(v);
}

// Tempo relativo ("5 min fa") + orario esatto, così si sa con precisione QUANDO.
// Oggi → "5 min fa · 14:32"; più vecchio → "3 g fa · 24/06 14:32". Fuso Europe/Rome.
function fa(iso: string | null): string {
  if (!iso) return "mai";
  // Le date del fallback-vault sono wall-clock di Piacenza senza fuso (es. "2026-06-27 00:48"):
  // ancorale a Europe/Rome, altrimenti new Date() le legge come ora locale (UTC su Vercel) e il tempo
  // relativo finisce nel "futuro" → ogni briefing mostrerebbe "poco fa" per 1-2h. Gli ISO veri restano tali.
  const d = new Date(vaultToIso(iso));
  const ms = d.getTime();
  if (Number.isNaN(ms)) return "mai";
  const sec = Math.max(0, (Date.now() - ms) / 1000);
  const rel =
    sec < 90 ? "poco fa" : sec < 3600 ? `${Math.round(sec / 60)} min fa` : sec < 86400 ? `${Math.round(sec / 3600)} h fa` : `${Math.round(sec / 86400)} g fa`;
  try {
    const giorno = (x: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(x);
    const opts: Intl.DateTimeFormatOptions = { timeZone: "Europe/Rome", hour: "2-digit", minute: "2-digit" };
    if (giorno(d) !== giorno(new Date())) {
      opts.day = "2-digit";
      opts.month = "2-digit";
    }
    return `${rel} · ${new Intl.DateTimeFormat("it-IT", opts).format(d)}`;
  } catch {
    return rel;
  }
}

type Vista =
  | "plancia"
  | "azioni"
  | "lavori"
  | "cervello"
  | "auto-coscienza"
  | "numeri"
  | "memoria"
  | "persone"
  | "operazioni"
  | "mondo"
  | "assistente"
  | "esplora"
  | "report"
  | "storico";

export default function Dashboard() {
  const [vista, setVista] = useState<Vista>("plancia");
  // Sidebar a sinistra, richiudibile e BLOCCATA: non scorre con la pagina (sticky sotto la
  // testata su desktop, drawer sotto la testata su telefono) e non copre mai la barra in alto.
  // Su desktop parte aperta, su telefono chiusa.
  const [navAperta, setNavAperta] = useState(true);
  useEffect(() => {
    if (typeof window !== "undefined") setNavAperta(window.innerWidth >= 1024);
  }, []);
  // Altezza VERA della testata → CSS var --altezza-testata: menù, linguetta e velo del
  // drawer partono esattamente sotto la barra. Misurata (non stimata) perché la testata
  // può cambiare altezza (pill di stato, wrap, zoom); fallback 69px in globals.css.
  const headerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const misura = () =>
      document.documentElement.style.setProperty(
        "--altezza-testata",
        `${Math.ceil(el.getBoundingClientRect().height)}px`
      );
    misura();
    const ro = new ResizeObserver(misura);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // Conversazioni: cassetto a scomparsa da SINISTRA dentro la chat (stile Claude).
  // Su desktop è un pannello laterale; su telefono riempie tutta la chat.
  const [convDrawerAperto, setConvDrawerAperto] = useState(false);
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [ultimoAt, setUltimoAt] = useState<string | null>(null);
  const [datiAggiornatiAt, setDatiAggiornatiAt] = useState<number | null>(null);
  const [memoria, setMemoria] = useState(false);
  const [vivo, setVivo] = useState(false);
  const [workerVivo, setWorkerVivo] = useState<boolean | null>(null);
  const [adInPausa, setAdInPausa] = useState(false);
  const [giri, setGiri] = useState(0);
  const [metriche, setMetriche] = useState<Record<string, any> | null>(null);
  // Quali categorie dei numeri sono aperte. Di default Salute + Marketplace
  // (i dati reali subito sott'occhio); le altre chiuse → meno scroll.
  const [catAperte, setCatAperte] = useState<Set<string>>(() => new Set(NUM_DEFAULT_APERTE));
  const toggleCat = (t: string) =>
    setCatAperte((s) => {
      const n = new Set(s);
      if (n.has(t)) n.delete(t);
      else n.add(t);
      return n;
    });
  const tutteCatAperte = catAperte.size === CATEGORIE_NUMERI.length;
  const toggleTutteCat = () =>
    setCatAperte(tutteCatAperte ? new Set() : new Set(CATEGORIE_NUMERI.map((c) => c.titolo)));

  const [messages, setMessages] = useState<Msg[]>([]);
  const [diario, setDiario] = useState<DiarioVoce[]>([]);
  const [lavori, setLavori] = useState<Lavoro[]>([]);
  const [conversazioni, setConversazioni] = useState<Conversazione[]>([]);
  const [convId, setConvId] = useState<string | null>(null);
  const [convServer, setConvServer] = useState(false);
  const [convSel, setConvSel] = useState<string[]>([]);
  const [base, setBase] = useState<{ titoli: string[]; testo: string } | null>(null);
  const [caricato, setCaricato] = useState(false);
  const [input, setInput] = useState("");
  const [ascoltando, setAscoltando] = useState(false);
  // Dettatura vocale (Web Speech API del browser): riempie l'input parlando.
  function dettaVoce() {
    const SR = typeof window !== "undefined" && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    if (!SR) {
      alert("Il riconoscimento vocale non è supportato da questo browser (prova Chrome).");
      return;
    }
    const rec = new SR();
    rec.lang = "it-IT";
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const t = e.results?.[0]?.[0]?.transcript || "";
      setInput((cur) => (cur ? cur + " " : "") + t);
    };
    rec.onend = () => setAscoltando(false);
    rec.onerror = () => setAscoltando(false);
    setAscoltando(true);
    rec.start();
  }
  const [loading, setLoading] = useState(false);
  // 📎 Foto/file allegati al prossimo messaggio della chat (condivisi tra chat intera e fluttuante:
  // è visibile una superficie sola per volta). Vengono caricati sullo storage in mandaAlCervello.
  const [allegatiChat, setAllegatiChat] = useState<File[]>([]);
  const fileChatRef = useRef<HTMLInputElement>(null);
  function aggiungiAllegatiChat(lista: FileList | null) {
    if (!lista || lista.length === 0) return;
    setAllegatiChat((prev) => [...prev, ...Array.from(lista)].slice(0, 6));
  }
  function togliAllegatoChat(i: number) {
    setAllegatiChat((prev) => prev.filter((_, idx) => idx !== i));
  }
  const endRef = useRef<HTMLDivElement>(null);
  // 📜 "Segui in fondo" solo se sei GIÀ in fondo: se sei salito a rileggere la chat,
  // una nuova risposta NON ti strappa giù (resti dove stai leggendo). I ref tengono
  // lo stato PRIMA che arrivi il nuovo messaggio (l'onScroll aggiorna, l'effect legge).
  const scrollBoxRef = useRef<HTMLDivElement>(null);
  const chatFabBoxRef = useRef<HTMLDivElement>(null);
  const stickFullRef = useRef(true);
  const stickFabRef = useRef(true);
  function vicinoAlFondo(el: HTMLElement | null) {
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }
  // 💬 Chat fluttuante ("Parla con l'AD") da ogni area: riusa la STESSA conversazione (messages/input/mandaAlCervello).
  const [chatFluttuante, setChatFluttuante] = useState(false);
  // Dentro la chat fluttuante: pannello "Conversazioni" (elenco per aprirne un'altra) a scomparsa.
  const [fabConvOpen, setFabConvOpen] = useState(false);
  const chatFabEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatFluttuante && stickFabRef.current) chatFabEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatFluttuante]);
  // Lavori chat in attesa di risposta — MAPPA (non più slot singolo): se mandi messaggi
  // in più chat di fila, OGNI risposta viene recuperata e instradata al thread giusto.
  const pendingLavoroChatRef = useRef<Map<string, PendingChat>>(new Map());
  const [pendingCount, setPendingCount] = useState(0);
  const lavoroRisoltoChatRef = useRef<Set<string>>(new Set());
  const convIdRef = useRef<string | null>(null);
  const conversazioniRef = useRef<Conversazione[]>([]);
  const sessionGruppoRef = useRef<string | null>(null);
  const PENDING_CHAT_KEY = "mycity_pending_lavoro";

  // Mirror SINCRONI (assegnati in render, non in useEffect): un useEffect aggiorna il ref DOPO il commit,
  // quindi al cambio-chat convIdRef restava indietro di un tick e una risposta in arrivo veniva instradata
  // (e salvata) nella conversazione SBAGLIATA. Assegnandoli in render restano sempre allineati allo stato.
  convIdRef.current = convId;
  conversazioniRef.current = conversazioni;

  function persistPendings() {
    try {
      const arr = [...pendingLavoroChatRef.current.values()];
      // localStorage (non sessionStorage): i messaggi della chat vivono in localStorage e sopravvivono
      // al RIAVVIO del browser; se i pending stessero in sessionStorage (cancellato al riavvio) la bolla
      // «sto pensando…» resterebbe eterna, senza nessuno che la risolve. Stessa durata dei messaggi.
      if (arr.length) localStorage.setItem(PENDING_CHAT_KEY, JSON.stringify(arr));
      else localStorage.removeItem(PENDING_CHAT_KEY);
      sessionStorage.removeItem(PENDING_CHAT_KEY); // pulizia del vecchio canale
    } catch {}
    setPendingCount(pendingLavoroChatRef.current.size);
  }
  function aggiungiPendingChat(pend: PendingChat) {
    pendingLavoroChatRef.current.set(pend.id, pend);
    persistPendings();
  }
  function rimuoviPendingChat(lavoroId: string) {
    if (pendingLavoroChatRef.current.delete(lavoroId)) persistPendings();
  }
  function pendingPerConv(convTarget: string | null): boolean {
    if (!convTarget) return false;
    for (const p of pendingLavoroChatRef.current.values()) {
      if (p.targetConvId === convTarget && !lavoroRisoltoChatRef.current.has(p.id)) return true;
    }
    return false;
  }

  // Fonde due versioni dello stesso thread SENZA perdere messaggi: prende la più lunga
  // come base e appende ciò che c'è solo nell'altra. È la difesa contro la race che
  // sovrascriveva la risposta dell'AD con uno snapshot vecchio (solo domanda).
  function mergeThread(a: Msg[], b: Msg[]): Msg[] {
    const pulisci = (list: Msg[]) => list.filter((m) => !m.pending && !m.prompt);
    const pa = pulisci(a);
    const pb = pulisci(b);
    const base = pa.length >= pb.length ? pa : pb;
    const altro = pa.length >= pb.length ? pb : pa;
    const visti = new Set(base.map((m) => `${m.role}|${m.content}`));
    const extra = altro.filter((m) => !visti.has(`${m.role}|${m.content}`));
    return extra.length ? [...base, ...extra] : base;
  }

  function rispondiInChat(prev: Msg[], content: string): Msg[] {
    const i = prev.findIndex((m) => m.pending);
    if (i !== -1) {
      const copia = [...prev];
      // Mantiene lo STESSO id della bolla pending: la key React resta invariata e il
      // contenuto non "salta" su un'altra bolla quando arriva la risposta.
      copia[i] = { ...prev[i], role: "assistant", content, pending: false };
      return copia;
    }
    // Nessuna bolla pending (es. si è cambiata chat e si è tornati): guarda SOLO l'ultimo
    // messaggio reale. Se è già una risposta identica → dedup del polling; se è una risposta
    // diversa (il polling aveva sostituito il pending) → aggiornala; se l'ultimo è la domanda
    // dell'utente → ACCODA la risposta. Mai sovrascrivere la risposta di un turno precedente
    // (era il bug: il loop all'indietro saltava la domanda e cancellava la risposta vecchia).
    const last = prev[prev.length - 1];
    if (last && last.role === "assistant" && !last.prompt) {
      if (last.content === content) return prev;
      const copia = [...prev];
      copia[copia.length - 1] = { ...last, role: "assistant", content };
      return copia;
    }
    return [...prev, { id: nuovoIdMsg(), role: "assistant", content }];
  }

  /** Applica la risposta al thread giusto (anche se Nicola ha aperto «Nuova chat» nel frattempo). */
  function aggiornaMessaggiConversazione(targetConvId: string, content: string) {
    setConversazioni((list) => {
      const idx = list.findIndex((c) => c.id === targetConvId);
      if (idx === -1) return list;
      const c = list[idx];
      const aggiornati = rispondiInChat(c.messaggi, content);
      const nuovaLista = list.map((x, i) =>
        i === idx ? { ...x, messaggi: aggiornati, updated_at: new Date().toISOString() } : x
      );
      if (!convServer) scriviConvLocali(nuovaLista);
      void persistConversazione(targetConvId, aggiornati);
      return nuovaLista;
    });
  }

  /** Mostra un messaggio nel thread giusto (UI attiva o conversazione salvata).
   *  Torna TRUE se la risposta è stata davvero applicata, FALSE se il thread non è raggiungibile
   *  ora (conversazione non ancora nell'elenco): in quel caso il chiamante NON deve marcare il
   *  lavoro come risolto, così riprova al prossimo giro di polling invece di perdere la risposta. */
  function instradaMessaggioChat(targetConvId: string, content: string): boolean {
    if (convIdRef.current === targetConvId) {
      setMessages((m) => {
        const nuovi = rispondiInChat(m, content);
        // Persisti ANCHE quando la chat è quella attiva: prima la risposta restava solo
        // nello stato React/localStorage e Supabase teneva la versione senza risposta.
        void persistConversazione(targetConvId, nuovi);
        return nuovi;
      });
      return true;
    }
    // Chat NON attiva: applicabile solo se la conversazione è già nell'elenco caricato. Se non c'è,
    // aggiornaMessaggiConversazione sarebbe un no-op (idx === -1) → risposta persa. Segnaliamo il fallimento.
    if (!conversazioniRef.current.some((c) => c.id === targetConvId)) return false;
    aggiornaMessaggiConversazione(targetConvId, content);
    return true;
  }

  function applicaRispostaChat(lavoroId: string, content: string, targetConvId: string) {
    if (lavoroRisoltoChatRef.current.has(lavoroId)) return;
    // FIX (bolla «sto pensando…» eterna): marca il lavoro "risolto" e togli il pending SOLO se la
    // risposta è stata DAVVERO applicata. Prima marcava risolto PRIMA di applicare: se la conversazione
    // target non era nell'elenco, l'aggiornamento era un no-op → risposta persa, lavoro chiuso come
    // risolto (niente retry) e bolla eterna. Ora, se non applicabile, resta pendente e riprova al
    // prossimo giro di polling (quando la conversazione si sarà caricata).
    if (!instradaMessaggioChat(targetConvId, content)) return;
    lavoroRisoltoChatRef.current.add(lavoroId);
    rimuoviPendingChat(lavoroId);
    if (convIdRef.current === targetConvId || !pendingPerConv(convIdRef.current)) setLoading(false);
  }

  /** STREAMING: mentre il lavoro è "in_corso", il worker scrive la risposta parziale in risultato.
   *  Qui la versiamo dentro la bolla "sto pensando" (che resta pending) così Nicola vede il testo
   *  crescere parola-per-parola. Niente persistenza: è transitorio, la versione finale la salva
   *  applicaRispostaChat quando il lavoro è "fatto". */
  function aggiornaPendingParziale(targetConvId: string, parziale: string) {
    if (!parziale) return;
    const rimpiazza = (msgs: Msg[]): Msg[] => {
      const i = msgs.findIndex((x) => x.pending);
      if (i === -1 || msgs[i].content === parziale) return msgs;
      const copia = [...msgs];
      copia[i] = { ...msgs[i], content: parziale };
      return copia;
    };
    if (convIdRef.current === targetConvId) {
      setMessages((m) => rimpiazza(m));
      return;
    }
    setConversazioni((list) => {
      const idx = list.findIndex((c) => c.id === targetConvId);
      if (idx === -1) return list;
      const nuovi = rimpiazza(list[idx].messaggi);
      if (nuovi === list[idx].messaggi) return list;
      return list.map((x, k) => (k === idx ? { ...x, messaggi: nuovi } : x));
    });
  }

  /** Risolve TUTTI i lavori chat pendenti che risultano finiti (anche di altre conversazioni). */
  function risolviLavoriPendenti(lavoriLista: Lavoro[]) {
    for (const pend of [...pendingLavoroChatRef.current.values()]) {
      const l = lavoriLista.find((x) => x.id === pend.id);
      if (!l) continue;
      if (l.stato !== "fatto" && l.stato !== "errore") {
        // ancora in lavorazione: se c'è già del testo parziale, mostralo crescere.
        if (l.stato === "in_corso" && l.risultato) aggiornaPendingParziale(pend.targetConvId, l.risultato);
        continue;
      }
      const testo = l.risultato || (l.stato === "errore" ? "🔄 Non è partita al primo colpo — la trovi come «da riapprovare» nell'area Lavori: un clic e riparte." : "(risposta vuota)");
      applicaRispostaChat(pend.id, testo, pend.targetConvId);
    }
  }

  function aggiungiDiario(tipo: DiarioVoce["tipo"], titolo: string, testo: string) {
    setDiario((d) => [{ id: Date.now() + Math.random(), at: new Date().toISOString(), tipo, titolo, testo }, ...d].slice(0, 200));
    // Salva anche nel database di memoria (server-side): resta dopo il refresh e su ogni dispositivo.
    fetch("/api/diario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, titolo, testo }),
    }).catch(() => {});
  }
  // --- Conversazioni: ricordare e riprendere le chat ---
  function titoloDa(msgs: Msg[]): string {
    const u = msgs.find((m) => m.role === "user" && !m.prompt)?.content || "";
    const t = u.replace(/\s+/g, " ").trim();
    if (!t) return "Conversazione";
    return t.length > 60 ? t.slice(0, 60) + "…" : t;
  }
  function leggiConvLocali(): Conversazione[] {
    try {
      return JSON.parse(localStorage.getItem("mycity_conversazioni") || "[]");
    } catch {
      return [];
    }
  }
  function scriviConvLocali(list: Conversazione[]) {
    try {
      localStorage.setItem("mycity_conversazioni", JSON.stringify(list.slice(0, 100)));
    } catch {}
  }

  // Salva/aggiorna una conversazione (database se disponibile, altrimenti locale).
  // Non cambia la conversazione "attiva": restituisce solo l'id salvato.
  // ANTI-RACE: prima di salvare, fonde con la versione già in memoria — uno snapshot
  // vecchio (es. al cambio chat) non può più sovrascrivere una risposta arrivata dopo.
  async function persistConversazione(id: string | null, msgs: Msg[]): Promise<string | null> {
    let reali = msgs.filter((m) => !m.prompt && !m.pending && (m.role === "user" || m.role === "assistant"));
    if (reali.length === 0) return id;
    if (id) {
      const esistente = conversazioniRef.current.find((c) => c.id === id);
      if (esistente?.messaggi?.length) reali = mergeThread(esistente.messaggi, reali);
    }
    const titolo = titoloDa(reali);
    let newId = id;
    if (convServer) {
      try {
        const res = await fetch("/api/conversazioni", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, titolo, messaggi: reali }),
        });
        const d = await res.json();
        if (d?.id) newId = d.id;
      } catch {}
    } else {
      newId = id || "loc_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    }
    if (!newId) return null;
    setConversazioni((list) => {
      const esiste = list.find((c) => c.id === newId);
      const created_at = esiste?.created_at || new Date().toISOString();
      // ANTI-RACE al COMMIT: dopo l'`await fetch`, `list` è lo stato PIÙ fresco. Se nel frattempo è
      // arrivata una risposta (dal poller), rifondiamo con la versione corrente invece di sovrascriverla
      // con lo snapshot `reali` di PRIMA dell'await → la risposta non si perde. Prima il merge era solo
      // al momento della chiamata (riga sopra), ma la scrittura avveniva col vecchio snapshot dopo l'await.
      const messaggiFinali = esiste?.messaggi?.length ? mergeThread(esiste.messaggi, reali) : reali;
      const altri = list.filter((c) => c.id !== newId);
      const nuova: Conversazione[] = [
        { id: newId as string, titolo, messaggi: messaggiFinali, created_at, updated_at: new Date().toISOString() },
        ...altri,
      ];
      if (!convServer) scriviConvLocali(nuova);
      return nuova;
    });
    return newId;
  }

  // Salva quella attuale e apre una chat nuova e vuota. NON fa partire risposte.
  async function nuovaConversazione() {
    await persistConversazione(convId, messages);
    setMessages([]);
    setConvId(null);
    setBase(null);
    setConvSel([]);
    sessionGruppoRef.current = null;
    setLoading(false);
    try {
      sessionStorage.removeItem("mycity_chat");
      sessionStorage.removeItem("mycity_convid");
    } catch {}
  }

  // Riprende una conversazione esistente per continuarla. NON fa partire risposte.
  // RECUPERO: fonde i messaggi salvati con quelli ricostruiti dai LAVORI della stessa
  // conversazione (fonte di verità in Supabase) — così una risposta "persa" da una
  // vecchia race o da un cambio chat riappare sempre.
  async function continuaConversazione(id: string) {
    void persistConversazione(convId, messages);
    const c = conversazioni.find((x) => x.id === id);
    if (!c) return;
    const mappa = typeof window !== "undefined" ? leggiMappaGruppiLocali() : {};
    // FIX «chat sottosopra»: i lavori arrivano dall'API in ordine created_at.desc (più recente prima).
    // Ricostruirli con lavori.filter() lasciava daLavori al contrario; mergeThread, prendendo come base
    // la lista più lunga, mostrava l'intera conversazione capovolta. raggruppaLavori ordina i lavori del
    // gruppo per created_at ASC (ed esclude i job interni "metabolizza"), come già fa apriChatDaGruppo →
    // thread in ordine cronologico.
    const g = raggruppaLavori(lavori, mappa).find((x) => x.id === id);
    const daLavori = g ? (messaggiDaGruppo(g.lavori) as Msg[]) : [];
    const msgs = daLavori.length ? mergeThread(c.messaggi, daLavori) : c.messaggi;
    setMessages(msgs);
    setConvId(c.id);
    setConvDrawerAperto(false); // aprendo una conversazione, richiudo il cassetto e mostro subito la chat
    setBase(null);
    setConvSel([]);
    if (daLavori.filter((m) => !m.pending).length > c.messaggi.length) {
      void persistConversazione(c.id, msgs);
    }
    setLoading(pendingPerConv(id));
  }

  /** Da Lavori → Assistente: riapre la conversazione collegata (o la ricostruisce dai lavori). */
  async function apriChatDaGruppo(gruppoId: string) {
    void persistConversazione(convId, messages);
    const mappa = typeof window !== "undefined" ? leggiMappaGruppiLocali() : {};
    const g = raggruppaLavori(lavori, mappa).find((x) => x.id === gruppoId);
    const daLavori = g ? (messaggiDaGruppo(g.lavori) as Msg[]) : [];
    const esistente = conversazioni.find((c) => c.id === gruppoId);

    if (esistente) {
      const msgs = daLavori.length ? mergeThread(esistente.messaggi, daLavori) : esistente.messaggi;
      setMessages(msgs);
      setConvId(esistente.id);
      setBase(null);
      setConvSel([]);
      sessionGruppoRef.current = esistente.id;
      setLoading(pendingPerConv(gruppoId));
      return;
    }

    if (!g) {
      setMessages([]);
      setConvId(gruppoId);
      setBase(null);
      setConvSel([]);
      sessionGruppoRef.current = gruppoId;
      setLoading(false);
      return;
    }

    const salvato = await persistConversazione(gruppoId, daLavori);
    setMessages(daLavori);
    setConvId(salvato || gruppoId);
    setBase(null);
    setConvSel([]);
    sessionGruppoRef.current = salvato || gruppoId;
    setLoading(pendingPerConv(gruppoId) || g.haAttivo);
  }

  // Usa una o piu' conversazioni selezionate come BASE per una nuova chat: carica
  // il contesto ma NON fa partire nessuna risposta, aspetta che scrivi tu.
  async function usaComeBase() {
    if (convSel.length === 0) return;
    await persistConversazione(convId, messages);
    const scelte = conversazioni.filter((c) => convSel.includes(c.id));
    if (scelte.length === 0) return;
    const testo = scelte
      .map((c) => {
        const corpo = c.messaggi
          .filter((m) => !m.prompt)
          .map((m) => `${m.role === "user" ? "Utente" : "Assistente"}: ${m.content}`)
          .join("\n");
        return `### ${c.titolo}\n${corpo}`;
      })
      .join("\n\n")
      .slice(0, 8000);
    setBase({ titoli: scelte.map((c) => c.titolo), testo });
    setMessages([]);
    setConvId(null);
    setConvSel([]);
    try {
      localStorage.removeItem("mycity_convid");
    } catch {}
  }

  function toggleSel(id: string) {
    setConvSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function eliminaConversazione(id: string) {
    // Conferma: il cestino è piccolo (14px) e sta accanto ad «Apri» → su mobile un tocco sbagliato
    // cancellava una conversazione PER SEMPRE, senza rete di sicurezza. (mobile/a11y)
    if (typeof window !== "undefined" && !window.confirm("Eliminare questa conversazione? Non si può annullare.")) return;
    if (convServer) {
      fetch("/api/conversazioni", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      }).catch(() => {});
    }
    setConversazioni((list) => {
      const n = list.filter((c) => c.id !== id);
      if (!convServer) scriviConvLocali(n);
      return n;
    });
    setConvSel((s) => s.filter((x) => x !== id));
    if (convId === id) {
      setConvId(null);
      setMessages([]);
    }
  }

  function svuotaConversazioni() {
    // Conferma: «Svuota» cancella TUTTE le conversazioni in un colpo → irreversibile. (mobile/a11y)
    if (typeof window !== "undefined" && !window.confirm("Svuotare TUTTE le conversazioni? Non si può annullare.")) return;
    if (convServer) {
      fetch("/api/conversazioni", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tutte: true }),
      }).catch(() => {});
    } else {
      scriviConvLocali([]);
    }
    setConversazioni([]);
    setConvSel([]);
    setConvId(null);
    setMessages([]);
  }
  function cancellaDiario() {
    setDiario([]);
    try {
      localStorage.removeItem("mycity_diario");
    } catch {}
    // Svuota anche la copia salvata nel database, altrimenti riappare al refresh.
    fetch("/api/diario", { method: "DELETE" }).catch(() => {});
  }

  // Confronto leggero fra due liste di lavori: evita di rimpiazzare lo stato con un array
  // NUOVO ma identico (che scatenerebbe un re-render globale ad ogni tick di polling).
  function lavoriUguali(a: Lavoro[], b: Lavoro[]): boolean {
    if (a === b) return true;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      const x = a[i], y = b[i];
      if (x.id !== y.id || x.stato !== y.stato || x.updated_at !== y.updated_at || x.risultato !== y.risultato) return false;
    }
    return true;
  }

  // Chatta col "cervello" (Claude Code sul tuo Max): la risposta compare QUI, nella
  // chat, e l'AD ricorda il filo della conversazione. SENZA API a pagamento.
  async function mandaAlCervello(text?: string) {
    const t = (text ?? input).trim();
    // 📎 Allegati SOLO per l'invio diretto dalla casella (non per i comandi programmatici con `text`).
    const daCaricare = text === undefined ? allegatiChat : [];
    // ⏩ CHAT MULTIPLA (stile Claude): niente più blocco mentre l'AD pensa — puoi mandare
    // il 2°/3° messaggio subito; il turno vecchio viene sostituito e quello nuovo legge tutto.
    if (!t && daCaricare.length === 0) return;
    if (text === undefined) {
      setInput("");
      setAllegatiChat([]);
    }

    // MEMORIA DELLA CHAT: mando tutta la conversazione finora, non solo l'ultimo
    // messaggio, così l'AD capisce il contesto ("cosa manca da X?" → "l'ho fatto").
    const storia = messages
      .filter((m) => !m.prompt && !m.pending)
      .map((m) => `${m.role === "user" ? "Nicola" : "AD"}: ${m.content}`)
      .join("\n");
    const baseTxt = base?.testo ? `\n\n## Contesto (conversazioni scelte come base)\n${base.testo}` : "";
    const prep = preparaLavoro(t || "Guarda gli allegati");
    // Nella bolla mostro il testo + i nomi degli allegati (così la conversazione resta leggibile).
    const nomiAllegati = daCaricare.map((f) => `📎 ${f.name}`).join("  ");
    const bollaUtente = [t, nomiAllegati].filter(Boolean).join("\n");

    // Se c'era già una bolla "sto pensando" (o un parziale in streaming), la togliamo:
    // il turno nuovo risponderà a TUTTI i messaggi insieme, con una sola bolla in fondo.
    setMessages((m) => [
      ...m.filter((x) => !x.pending),
      { id: nuovoIdMsg(), role: "user", content: bollaUtente },
      { id: nuovoIdMsg(), role: "assistant", content: "", pending: true },
    ]);
    setLoading(true);
    let targetConvId = convId || sessionGruppoRef.current || "";
    // ⏩ I messaggi-chat di QUESTA conversazione ancora in lavorazione vengono sostituiti:
    // il worker ferma la generazione vecchia (interrompi-e-ripensa) e il turno nuovo — che
    // nella storia contiene anche il messaggio precedente — risponde a tutto. Le risposte
    // dei turni sostituiti non vanno mai applicate (le marchiamo subito come risolte).
    for (const p of [...pendingLavoroChatRef.current.values()]) {
      if (p.tipo !== "chat" || p.targetConvId !== targetConvId) continue;
      lavoroRisoltoChatRef.current.add(p.id);
      rimuoviPendingChat(p.id);
      fetch("/api/lavori/sostituisci", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p.id }),
      }).catch(() => {});
    }
    try {
      let gruppoId = convId || sessionGruppoRef.current;
      if (!gruppoId) {
        gruppoId = `sess_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
        sessionGruppoRef.current = gruppoId;
      }
      targetConvId = gruppoId;
      const savedConv = await persistConversazione(convId, [
        ...messages.filter((m) => !m.prompt && !m.pending),
        { role: "user", content: bollaUtente },
      ]);
      if (savedConv) {
        setConvId(savedConv);
        gruppoId = savedConv;
        sessionGruppoRef.current = savedConv;
        targetConvId = savedConv;
      }

      // 📎 Carico prima gli allegati sullo storage, poi mando al cervello solo i loro percorsi
      // (il worker sul VPS li riscarica e li fa leggere/guardare a Claude).
      let bloccoAllegati = "";
      if (daCaricare.length > 0) {
        const fd = new FormData();
        fd.append("gruppo_id", gruppoId);
        daCaricare.forEach((f) => fd.append("file", f));
        const up = await fetch("/api/allegato", { method: "POST", body: fd })
          .then((r) => r.json())
          .catch(() => null);
        if (!up?.ok) throw new Error(up?.error || "Caricamento degli allegati non riuscito.");
        const righe = (up.allegati as Array<{ nome: string; tipo: string; percorso: string }>)
          .map((a) => `@ALLEGATO nome="${a.nome}" tipo="${a.tipo}" percorso="${a.percorso}"`)
          .join("\n");
        bloccoAllegati =
          `\n\n## Allegati di Nicola\nNicola ha allegato ${up.allegati.length} file a questo messaggio ` +
          `(foto o documenti). Sono nello storage: aprili e tienine conto nella risposta.\n${righe}`;
      }
      const richiesta =
        prep.tipo === "giro"
          ? prep.richiesta
          : (storia ? `## Conversazione finora\n${storia}\n\n` : "") +
            `## Nuovo messaggio di Nicola\n${t || "(nessun testo — vedi allegati)"}` +
            baseTxt +
            bloccoAllegati +
            `\n\n## Istruzioni\nRispondi all'ultimo messaggio in italiano, come in una chat: conciso e concreto. ` +
            `Se Nicola dice di aver completato un passo (es. ha iscritto un negozio), aggiorna la memoria nel vault e dichiara cosa hai aggiornato. Rispetta 🟢🟡🔴.`;

      const res = await fetch("/api/lavori", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ richiesta, tipo: prep.tipo, gruppo_id: gruppoId }),
      });
      const d = await res.json();
      if (d.ok && d.lavoro) {
        salvaGruppoLavoroLocale(d.lavoro.id, gruppoId);
        setLavori((l) => [d.lavoro, ...l]);
        aggiungiPendingChat({ id: d.lavoro.id, tipo: prep.tipo, targetConvId });
        aggiungiDiario(prep.tipo === "giro" ? "briefing" : "chat", prep.tipo === "giro" ? "🔭 Giro accodato" : "🧠 Chat col cervello", bollaUtente);
        // Niente polling dedicato qui: il POLLER UNICO (/api/lavori) risolve questo pendente
        // e instrada la risposta nel thread giusto — prima si sdoppiava (2 fetch/s). (bug #11)
      } else {
        instradaMessaggioChat(
          targetConvId,
          `⚠️ ${d.error || "Non sono riuscito a creare il lavoro. Serve il database di memoria collegato (tabella 'lavori')."}`
        );
        setLoading(false);
      }
    } catch (e: any) {
      // Non perdere gli allegati: li rimetto in coda così Nicola può riprovare.
      if (daCaricare.length > 0) setAllegatiChat(daCaricare);
      instradaMessaggioChat(targetConvId, `⚠️ ${e?.message || "Connessione fallita."}`);
      setLoading(false);
    }
  }

  function svuotaLavori() {
    setLavori([]);
    fetch("/api/lavori", { method: "DELETE" }).catch(() => {});
  }

  // Confeziona un prompt (con i dati attuali) da incollare in Claude col Max.
  // Costo API: ZERO — il lavoro pesante lo fai fare al tuo abbonamento.
  function generaPrompt(richiesta: string): string {
    const righe = metriche
      ? ALL_METRICHE.filter(
          (x) =>
            x.chiave &&
            metriche[x.chiave] !== undefined &&
            metriche[x.chiave] !== null &&
            formatta(metriche[x.chiave], x.tipo) !== "—"
        )
          .map((x) => `- ${x.label} (${x.periodo}): ${formatta(metriche[x.chiave!], x.tipo)}`)
          .join("\n")
      : "(metriche non disponibili)";
    const brief = briefing ? `\n\n## Ultimo briefing dell'assistente\n${briefing.situazione}` : "";
    return `Sei il consulente di crescita di MyCity, il marketplace dei negozi di Piacenza.

## Dati attuali dell'azienda
${righe}${brief}

## Compito
${richiesta}

Rispondi in italiano, in modo concreto e operativo. Se ti servono dati che non vedi qui, elenca quali.`;
  }

  function dammiPrompt() {
    const t = input.trim();
    if (!t) return;
    const p = generaPrompt(t);
    setMessages((m) => [...m, { id: nuovoIdMsg(), role: "user", content: t }, { id: nuovoIdMsg(), role: "assistant", content: p, prompt: true }]);
    setInput("");
    aggiungiDiario("chat", "📋 Prompt per Claude Max", p);
  }

  function copia(testo: string) {
    try {
      navigator.clipboard.writeText(testo);
    } catch {}
  }

  useEffect(() => {
    if (stickFullRef.current) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const caricaStato = useCallback(async () => {
    try {
      const res = await fetch("/api/stato", { cache: "no-store" });
      const data = await res.json();
      setMemoria(Boolean(data.memoria));
      setVivo(Boolean(data.vivo));
      setWorkerVivo(typeof data.workerVivo === "boolean" ? data.workerVivo : null);
      setAdInPausa(Boolean(data.adInPausa));
      setGiri((data.giri || []).length);
      if (data.ultimo) {
        setBriefing(data.ultimo.data);
        setUltimoAt(data.ultimo.created_at);
      }
      setDatiAggiornatiAt(Date.now());
    } catch {
      /* offline */
    }
  }, []);

  const caricaMetriche = useCallback(() => {
    fetch("/api/metriche", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d && d.connected) {
          setMetriche(d);
          setDatiAggiornatiAt(Date.now());
        } else {
          // Poll non collegato: NON azzerare i KPI già a schermo (evitava che la pagina si
          // accorciasse di colpo facendo SALTARE lo scroll in cima durante l'auto-refresh).
          // Lascio anche il timbro "Aggiornato" fermo → mostra l'età VERA dei dati, non un
          // refresh finto. Solo al PRIMO caricamento, se mai connesso, resta null (UI "non collegato").
          setMetriche((cur) => cur);
        }
      })
      .catch(() => {});
  }, []);

  // Aggiornamento automatico: ricarica l'ultima analisi del cervello-Max E i KPI ogni 60s,
  // cosi' il briefing orario e i numeri compaiono da soli (niente pulsante "Aggiorna").
  useEffect(() => {
    const id = setInterval(() => {
      caricaStato();
      caricaMetriche();
    }, 60000);
    return () => clearInterval(id);
  }, [caricaStato, caricaMetriche]);

  // 🧭 Vista persistente + cronologia del browser (il tasto INDIETRO torna all'area precedente
  // invece di uscire dal Pannello). Non tocchiamo URL/hash: usiamo solo lo state della history,
  // per non interferire con la navigazione a hash delle aree interne.
  const vistaPrimaVolta = useRef(true);
  const ultimaVistaStoria = useRef<string | null>(null);
  const applicaVistaSalvata = (v: string) => {
    if (v === "auto-coscienza") {
      setVista("cervello"); // valore legacy: l'area della radiografia/auto-coscienza è "cervello"
    } else {
      setVista(v as Vista);
    }
  };
  useEffect(() => {
    let iniz = "plancia";
    try {
      const v = localStorage.getItem("mycity_vista");
      if (v) {
        applicaVistaSalvata(v);
        iniz = v === "auto-coscienza" ? "cervello" : v;
      }
    } catch {}
    // Semina la voce di cronologia iniziale con la vista di partenza: senza, la voce base ha
    // state=null e il tasto INDIETRO fa un clic a vuoto e poi esce dal Pannello.
    // MERGE con lo stato esistente: Next.js (App Router) tiene i suoi internals in history.state
    // (__NA, __PRIVATE_NEXTJS_INTERNALS_TREE). Sovrascrivere lo state li cancella → al primo INDIETRO
    // Next non riconosce la voce e fa un RELOAD dell'intera pagina (ti sbatte fuori dall'area). Fondendo
    // preserviamo gli internals e la navigazione resta client-side.
    try { window.history.replaceState({ ...(window.history.state || {}), vista: iniz }, ""); } catch {}
    ultimaVistaStoria.current = iniz;
  }, []);
  useEffect(() => {
    if (vistaPrimaVolta.current) { vistaPrimaVolta.current = false; ultimaVistaStoria.current = vista; return; } // salta il montaggio
    try { localStorage.setItem("mycity_vista", vista); } catch {}
    // Aggiunge una voce alla cronologia: così INDIETRO torna qui invece di lasciare il Pannello.
    // pushState con URL = pathname+search (niente hash): il cambio AREA non trascina residui
    // di hash di una scheda precedente (che facevano fare un clic a vuoto). (bug #2/#4)
    if (ultimaVistaStoria.current !== vista) {
      // URL = pathname+search (niente hash): cambiando AREA non trasciniamo il residuo di hash
      // di una scheda interna precedente (era una fonte del "clic a vuoto" nel tasto INDIETRO).
      try { window.history.pushState({ ...(window.history.state || {}), vista }, "", window.location.pathname + window.location.search); } catch {}
      ultimaVistaStoria.current = vista;
    }
  }, [vista]);
  // 🧭 Handler popstate CENTRALE (contratto nav): ogni voce di cronologia — sia il cambio AREA
  // sia il cambio SOTTO-SCHEDA — porta state={vista, sub}. Rileggo entrambi e li ripristino:
  // setVista + (per la scheda interna) ripristinaSub → le aree ascoltano EVENTO_SUB e riaprono
  // la scheda giusta. Nel ramo con state mancante NON faccio "return" muto: ripristino la vista
  // di default, così il tasto INDIETRO non resta mai un clic morto. (bug #2/#3/#4)
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const st = e.state as { vista?: string; sub?: string } | null;
      // Voce SENZA stato = navigazione a hash interna a un'area (impostare window.location.hash
      // crea una voce con state=null e fa scattare ANCHE popstate, non solo hashchange — es. le
      // tab Radiografia ⇄ Auto-coscienza). Non è un "torna alla plancia": resta nell'area corrente
      // e timbra la voce con la vista attuale, così il tasto INDIETRO la conosce e non esce a vuoto.
      if (!st?.vista) {
        try { window.history.replaceState({ ...(window.history.state || {}), vista: ultimaVistaStoria.current || "plancia" }, ""); } catch {}
        return;
      }
      const v = st.vista;
      ultimaVistaStoria.current = v; // evita che l'effetto [vista] ri-aggiunga la voce (niente loop)
      applicaVistaSalvata(v);
      // Ripristina la sotto-scheda: l'assistente qui, le altre aree via EVENTO_SUB.
      if (v === "assistente") {
        // Conversazioni ora è un cassetto, non una scheda: il tasto "indietro" lo apre/chiude.
        setConvDrawerAperto(st?.sub === "conversazioni");
      }
      if (st?.sub) ripristinaSub(v, st.sub);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // 🔗 Link bidirezionali fra aree: un componente chiede "portami all'area X (e alla casella Y)".
  // Es: una domanda nel Cervello → "Vai alle Azioni"; un'azione da firmare → "Vedi nel Cervello".
  // Il listener è montato UNA volta (deps []): senza, veniva smontato/rimontato ad ogni tick di
  // polling (deps [conversazioni, lavori]) — spreco e possibili eventi persi. Per leggere sempre
  // l'ultima apriChatDaGruppo uso un ref aggiornato ad ogni render.
  const apriChatRef = useRef(apriChatDaGruppo);
  apriChatRef.current = apriChatDaGruppo;
  useEffect(() => {
    const onVai = (e: Event) => {
      const det = (e as CustomEvent).detail as { vista?: Vista; anchor?: string; sub?: string } | undefined;
      if (!det?.vista) return;
      if (det.vista === "auto-coscienza") {
        setVista("cervello");
      } else {
        setVista(det.vista);
        if (det.vista === "assistente" && det.sub === "conversazioni") setConvDrawerAperto(true);
        if (det.vista === "assistente" && det.sub === "chat") {
          setConvDrawerAperto(false);
          if (det.anchor) void apriChatRef.current(det.anchor);
        }
      }
      if (det.anchor) {
        const target = det.anchor;
        // Ritenta: la casella può comparire dopo il cambio area, l'apertura della scheda
        // o il caricamento dei dati. Cerco fino a ~2.4s, poi mi arrendo (nessun danno).
        let tentativi = 0;
        const cerca = () => {
          const el = document.getElementById(target);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.classList.add("flash-target");
            setTimeout(() => el.classList.remove("flash-target"), 2200);
            return;
          }
          if (++tentativi < 20) setTimeout(cerca, 120);
        };
        setTimeout(cerca, 120);
      }
    };
    window.addEventListener("mycity:vai", onVai);
    return () => window.removeEventListener("mycity:vai", onVai);
  }, []);

  useEffect(() => {
    caricaStato();
    caricaMetriche();
    // Il diario salvato lato server e' la fonte durevole: se c'e', vince sul locale.
    fetch("/api/diario", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.memoria && Array.isArray(d.voci) && d.voci.length) {
          setDiario(
            d.voci.map((v: any) => ({ id: v.id, at: v.created_at, tipo: v.tipo, titolo: v.titolo, testo: v.testo }))
          );
        }
      })
      .catch(() => {});
  }, [caricaStato, caricaMetriche]);

  // Carica l'elenco conversazioni: dal database se la tabella esiste, altrimenti
  // dal salvataggio locale (questo dispositivo).
  const caricaConversazioni = useCallback(() => {
    fetch("/api/conversazioni", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.tabella && Array.isArray(d.conversazioni)) {
          setConvServer(true);
          setConversazioni(
            d.conversazioni.map((c: any) => ({
              id: c.id,
              titolo: c.titolo,
              messaggi: Array.isArray(c.messaggi) ? c.messaggi : [],
              created_at: c.created_at,
              updated_at: c.updated_at,
            }))
          );
        } else {
          setConvServer(false);
          setConversazioni(leggiConvLocali());
        }
      })
      .catch(() => {
        setConvServer(false);
        setConversazioni(leggiConvLocali());
      });
  }, []);

  useEffect(() => {
    caricaConversazioni();
    // 💬 "Parla con la casella" salva una chat in Conversazioni: ricarica l'elenco appena succede.
    const onConv = () => caricaConversazioni();
    window.addEventListener("mycity:conversazioni", onConv);
    return () => window.removeEventListener("mycity:conversazioni", onConv);
  }, [caricaConversazioni]);

  // 🆕 Prima chat all'apertura = l'ULTIMA CHE HO CREATO (non l'ultima aperta). Appena le conversazioni
  // sono caricate apro quella con la data di creazione più recente. Una volta sola per sessione: se sto
  // già in una chat (es. sono arrivato qui da "Lavori" o ho appena scritto) NON la scavalco.
  const chatInizialeFattaRef = useRef(false);
  useEffect(() => {
    if (!caricato || chatInizialeFattaRef.current) return;
    if (conversazioni.length === 0) return; // niente da aprire: resto sulla chat vuota
    chatInizialeFattaRef.current = true;
    if (convId || messages.length > 0) return; // sono già dentro una chat: non forzo
    const piuRecente = [...conversazioni].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];
    if (piuRecente) void continuaConversazione(piuRecente.id);
  }, [caricato, conversazioni, convId, messages.length]);

  // Persistenza della SESSIONE: i messaggi vivono in sessionStorage (restano al refresh, si azzerano a
  // fine sessione). NON si ricorda più "l'ultima chat aperta": all'apertura si riparte dall'ultima
  // conversazione creata (effetto qui sopra). Lo storico non si perde: ogni scambio è già in Conversazioni.
  // Diario e briefing restano in localStorage (memoria persistente, si ritrovano al refresh).
  useEffect(() => {
    try {
      // Pulizia una-tantum: vecchie copie della chat corrente in localStorage (prima del passaggio
      // a sessionStorage) verrebbero altrimenti ignorate ma resterebbero lì a occupare spazio.
      localStorage.removeItem("mycity_chat");
      localStorage.removeItem("mycity_convid");
      // 🆕 All'apertura NON si ripristina più "l'ultima chat aperta": la prima chat è l'ULTIMA CHE HO
      // CREATO (vedi l'effetto qui sotto), così riparto sempre dal filo più fresco, non da dove ero.
      sessionStorage.removeItem("mycity_chat");
      sessionStorage.removeItem("mycity_convid");
      try {
        // localStorage (nuovo canale, sopravvive al riavvio) con fallback a sessionStorage per le
        // sessioni aperte prima del fix — così un pending in volo non si perde durante la migrazione.
        const pendRaw = localStorage.getItem(PENDING_CHAT_KEY) || sessionStorage.getItem(PENDING_CHAT_KEY);
        if (pendRaw) {
          const parsed = JSON.parse(pendRaw);
          // Nuovo formato: array di pendenti. Retro-compatibile col vecchio oggetto singolo.
          const lista = (Array.isArray(parsed) ? parsed : [parsed]) as { id: string; tipo: string; targetConvId?: string }[];
          for (const pend of lista) {
            if (pend?.id && pend.targetConvId) {
              pendingLavoroChatRef.current.set(pend.id, { id: pend.id, tipo: pend.tipo, targetConvId: pend.targetConvId });
            }
          }
          setPendingCount(pendingLavoroChatRef.current.size);
        }
      } catch {}
      const d = localStorage.getItem("mycity_diario");
      if (d) setDiario(JSON.parse(d));
      const b = localStorage.getItem("mycity_briefing");
      if (b) {
        const o = JSON.parse(b);
        if (o.briefing) setBriefing(o.briefing);
        if (o.ultimoAt) setUltimoAt(o.ultimoAt);
      }
    } catch {}
    setCaricato(true);
  }, []);

  useEffect(() => {
    if (caricato) try { sessionStorage.setItem("mycity_chat", JSON.stringify(messages)); } catch {}
  }, [messages, caricato]);
  useEffect(() => {
    if (caricato) try { localStorage.setItem("mycity_diario", JSON.stringify(diario)); } catch {}
  }, [diario, caricato]);
  useEffect(() => {
    if (caricato && briefing) try { localStorage.setItem("mycity_briefing", JSON.stringify({ briefing, ultimoAt })); } catch {}
  }, [briefing, ultimoAt, caricato]);
  // (Rimosso) Non si memorizza più "l'ultima chat aperta": all'apertura riparto sempre dall'ultima creata.

  // Ponte col cervello: polling lavori — 2s se C'È QUALSIASI chat in attesa (anche di
  // un'altra conversazione), 8s altrimenti. Risolve TUTTI i pendenti, non solo l'ultimo.
  useEffect(() => {
    let stop = false;
    const carica = async () => {
      try {
        const r = await fetch("/api/lavori", { cache: "no-store" });
        const d = await r.json();
        if (!stop && Array.isArray(d.lavori)) {
          // Aggiorna SOLO se la lista è davvero cambiata: un array nuovo ma identico
          // ri-renderizzerebbe tutto il Pannello ad ogni tick (2-8s) inutilmente.
          setLavori((prev) => (lavoriUguali(prev, d.lavori) ? prev : d.lavori));
          if (pendingLavoroChatRef.current.size > 0) {
            risolviLavoriPendenti(d.lavori);
          }
        }
      } catch {}
    };
    carica();
    const onLavori = () => carica();
    window.addEventListener("mycity:lavori", onLavori);
    const ms = loading || pendingLavoroChatRef.current.size > 0 ? 2000 : 8000;
    const id = setInterval(carica, ms);
    return () => {
      stop = true;
      clearInterval(id);
      window.removeEventListener("mycity:lavori", onLavori);
    };
  }, [loading, pendingCount]);


  return (
    <div className="min-h-screen flex flex-col">
      <header ref={headerRef} className="sticky top-0 z-20 backdrop-blur-md border-b" style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--bg-page) 88%, transparent)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-5 py-3 flex items-center gap-3">
          {/* Icona menù nella barra in alto: apre/chiude il menù laterale su tutti i
              formati (desktop e telefono). */}
          <button
            onClick={() => setNavAperta((v) => !v)}
            className="grid place-items-center w-9 h-9 rounded-xl shrink-0 transition hover:bg-black/[0.04]"
            style={{ color: "var(--text-muted)" }}
            aria-label="Apri o chiudi il menù"
            aria-expanded={navAperta}
            title="Menù"
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="grid place-items-center w-9 h-9 rounded-xl bg-brand text-white font-bold shadow-card shrink-0">
              M
            </div>
            <div className="leading-tight min-w-0">
              <h1 className="font-semibold text-[16px] tracking-tight truncate" style={{ color: "var(--text-primary)" }}>Pannello di Controllo</h1>
              <span className="t-eti text-[12px]">AD MyCity</span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Aggiornato at={datiAggiornatiAt} prefisso="dati" className="hidden sm:inline-flex" />
            {/* Mobile: solo il pallino di stato Worker/AD (la pill piena è sm+). (bug #9) */}
            <span
              className={`sm:hidden w-2.5 h-2.5 rounded-full shrink-0 ${
                workerVivo ? "bg-emerald-600" : adInPausa ? "bg-amber-500" : vivo ? "bg-red-500" : "bg-amber-500"
              }`}
              aria-label="Stato worker"
              title={
                workerVivo
                  ? "Worker ON: sta processando la coda"
                  : adInPausa
                    ? "L'AD è in pausa"
                    : vivo
                      ? "Worker spento: i lavori restano in coda"
                      : "In prova: memoria o giro non ancora attivi"
              }
            />
            <span
              className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ring-1 ${
                workerVivo
                  ? "bg-green-50 text-green-700 ring-green-200 dark:bg-emerald-950/40 dark:text-emerald-400/90 dark:ring-emerald-900/60"
                  : adInPausa
                    ? "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-800"
                    : vivo
                      ? "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/50 dark:text-red-300 dark:ring-red-800"
                      : "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-800"
              }`}
              title={
                workerVivo
                  ? "Il worker sul VPS sta processando la coda chat"
                  : adInPausa
                    ? "L'AD è in pausa: riattivalo dal Pannello"
                    : vivo
                      ? "Memoria ok ma il worker VPS non batte: i lavori restano in coda"
                      : "Memoria o giro non ancora attivi"
              }
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  workerVivo ? "bg-emerald-600" : adInPausa ? "bg-amber-500" : vivo ? "bg-red-500" : "bg-amber-500"
                }`}
              />
              {workerVivo ? "Worker ON" : adInPausa ? "In pausa" : vivo ? "Worker spento" : "In prova"}
            </span>
          </div>
        </div>
      </header>

      {/* Layout a due colonne: sidebar (richiudibile) + contenuto. Niente è stato tolto:
          tutte le aree ci sono, solo raggruppate e con nomi chiari.
          La sidebar è BLOCCATA: parte sotto la testata (mai coperta) e segue lo scroll
          per tutta la pagina — sticky su desktop, drawer fisso su telefono. */}
      <div className="flex flex-1 min-h-0 items-stretch">
        {navAperta && (
          <button
            className="fixed inset-x-0 bottom-0 top-[var(--altezza-testata)] z-30 bg-black/40 lg:hidden"
            onClick={() => setNavAperta(false)}
            aria-label="Chiudi il menù"
          />
        )}

        <aside
          className={`fixed lg:sticky z-40 top-[var(--altezza-testata)] left-0 h-[calc(100dvh-var(--altezza-testata))] lg:self-start shrink-0 overflow-hidden transition-[width,transform] duration-200 ${
            navAperta ? "w-64 translate-x-0" : "w-64 -translate-x-full lg:w-0"
          }`}
          style={{ background: "var(--bg-surface)", borderRight: "1px solid var(--border)" }}
        >
          <nav className="w-64 h-full overflow-y-auto scroll-soft p-3 flex flex-col gap-1">
            {(() => {
              const GRUPPI: { gruppo: string | null; voci: { id: Vista; label: string; icon: React.ReactNode }[] }[] = [
                {
                  gruppo: null,
                  voci: [
                    { id: "plancia", label: "Home", icon: <Home size={15} /> },
                    { id: "azioni", label: "Azioni", icon: <Zap size={15} /> },
                  ],
                },
                {
                  gruppo: "Approfondisci",
                  voci: [
                    { id: "numeri", label: "Numeri", icon: <BarChart3 size={15} /> },
                    { id: "persone", label: "Negozi & clienti", icon: <Users size={15} /> },
                    { id: "operazioni", label: "Operazioni", icon: <Truck size={15} /> },
                    { id: "mondo", label: "Mercato", icon: <Globe size={15} /> },
                    { id: "report", label: "Report", icon: <FileText size={15} /> },
                  ],
                },
                {
                  gruppo: "Macchina & memoria",
                  voci: [
                    { id: "cervello", label: "Controllo", icon: <Cpu size={15} /> },
                    { id: "lavori", label: "Lavori", icon: <Brain size={15} /> },
                    { id: "memoria", label: "Memoria", icon: <Layers size={15} /> },
                    { id: "storico", label: "Storico", icon: <History size={15} /> },
                    { id: "assistente", label: "Assistente", icon: <Send size={15} /> },
                    { id: "esplora", label: "GitHub", icon: <FolderTree size={15} /> },
                  ],
                },
              ];
              return GRUPPI.map((g) => (
                <div key={g.gruppo ?? "top"} className="flex flex-col gap-1">
                  {g.gruppo && <div className="t-micro px-2 pt-3 pb-1">{g.gruppo}</div>}
                  {g.voci.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setVista(v.id);
                        if (typeof window !== "undefined" && window.innerWidth < 1024) setNavAperta(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12.5px] font-medium text-left transition ${
                        vista === v.id ? "bg-brand text-white shadow-card" : "hover:bg-black/[0.04]"
                      }`}
                      style={vista === v.id ? undefined : { color: "var(--text-muted)" }}
                    >
                      {v.icon}
                      <span className="truncate">{v.label}</span>
                    </button>
                  ))}
                </div>
              ));
            })()}
          </nav>
        </aside>

        <main className="flex-1 min-w-0 max-w-5xl mx-auto w-full px-4 sm:px-6 py-5 sm:py-6 space-y-5">

        {/* 🧪 Modalità demo: prova la macchina viva senza chiavi (banner + interruttore) */}
        <DemoBanner />

        {/* Timbro globale: quando i dati del pannello sono stati aggiornati (visibile ovunque) */}
        {datiAggiornatiAt && (
          <div className="-mt-1">
            <Aggiornato at={datiAggiornatiAt} prefisso="dati del pannello aggiornati" />
          </div>
        )}

        {/* Ricerca globale: cercabile da ogni area */}
        <RicercaGlobale />

        {/* ===================== PLANCIA ===================== */}
        {vista === "plancia" && (
          <Plancia metriche={metriche} briefing={briefing} onVaiA={(a) => applicaVistaSalvata(a)} />
        )}

        {/* ===================== AZIONI (corsia operativa) ===================== */}
        {vista === "azioni" && (
          <div className="space-y-4">
            <Azioni proposte={briefing?.azioni || []} />
            <Arsenale />
          </div>
        )}

        {/* ===================== REPORT & PIANI (documenti in consegne/) ===================== */}
        {vista === "report" && <Documenti />}

        {/* ===================== MACCHINA (radiografia + auto-coscienza) ===================== */}
        {vista === "cervello" && <MacchinaArea />}

        {/* ===================== LAVORI DEL CERVELLO ===================== */}
        {vista === "lavori" && (
          <Lavori lavori={lavori} onSvuota={svuotaLavori} workerVivo={workerVivo} adInPausa={adInPausa} />
        )}

        {/* ===================== NUMERI ===================== */}
        {vista === "numeri" && (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="t-area">📊 I numeri dell'azienda</h2>
              <p className="t-eti mt-0.5">Tutte le sfere, per categoria, in tre finestre: oggi · 7 giorni · 30 giorni.</p>
            </div>
            <Aggiornato at={datiAggiornatiAt} className="mt-1 shrink-0" />
          </div>

          {/* I numeri (cockpit): categorie a tendina — apri solo ciò che ti serve */}
          <section className="card p-4">
            <div className="flex items-center gap-2.5 mb-1">
              <span className="sez-ico"><BarChart3 size={16} /></span>
              <span className="t-sez">Tutti i numeri</span>
              <button
                onClick={toggleTutteCat}
                className="ml-auto text-[11px] font-medium text-black/55 hover:text-brand transition px-2 py-1 rounded-lg hover:bg-brand-50/60"
              >
                {tutteCatAperte ? "Chiudi tutte" : "Apri tutte"}
              </button>
            </div>
            <p className="t-eti mb-3 pl-[42px]">Tocca una categoria per aprirla; le celle spente sono fonti da collegare.</p>

            <div className="space-y-1.5">
              {CATEGORIE_NUMERI.map((c, i) => {
                const nuovoGruppo = i === 0 || CATEGORIE_NUMERI[i - 1].gruppo !== c.gruppo;
                return (
                  <Fragment key={c.titolo}>
                    {nuovoGruppo && c.gruppo !== "Panoramica" && <div className="t-micro px-0.5 pt-2 pb-0.5">{c.gruppo}</div>}
                    <CategoriaNumeri
                      emoji={c.emoji}
                      titolo={c.titolo}
                      sottotitolo={c.sottotitolo}
                      kpis={c.kpis}
                      snapshot={c.snapshot}
                      metriche={metriche}
                      open={catAperte.has(c.titolo)}
                      onToggle={() => toggleCat(c.titolo)}
                    />
                  </Fragment>
                );
              })}
            </div>
          </section>

          {/* Numeri & report: trend · unit economics · report */}
          <NumeriReport />
        </div>
        )}

        {/* ===================== MEMORIA & DECISIONI ===================== */}
        {vista === "memoria" && (
          <Memoria briefing={briefing} ultimoAt={ultimoAt} />
        )}

        {/* ===================== PERSONE ===================== */}
        {vista === "persone" && (
          <AreaModuli area="persone" titolo="🤝 Persone" sottotitolo="Chi compra, chi vende, chi consegna e chi lavora con noi." metriche={metriche} aggAt={datiAggiornatiAt} />
        )}

        {/* ===================== OPERAZIONI ===================== */}
        {vista === "operazioni" && (
          <AreaModuli area="operazioni" titolo="⚙️ Operazioni" sottotitolo="Ordini, consegne, catalogo, campagne e lavori in corso." metriche={metriche} aggAt={datiAggiornatiAt} />
        )}

        {/* ===================== MONDO & RISCHI ===================== */}
        {vista === "mondo" && (
        <div className="space-y-4">
          <div>
            <h2 className="t-area">🌍 Mondo & rischi</h2>
            <p className="t-eti mt-0.5">Tutto ciò che ci impatta da fuori: mercato, reputazione, sicurezza, futuro.</p>
          </div>

          {/* Intelligence & opportunità: alert · concorrenti · eventi · buchi */}
          <Intelligence />

          <AreaModuli area="mondo" metriche={metriche} aggAt={datiAggiornatiAt} />
        </div>
        )}

        {/* ===================== SCHEDA: ASSISTENTE ===================== */}
        {vista === "esplora" && <EsploraGitHub />}

        {vista === "assistente" && (
        <div className="space-y-4">
          <div>
            <h2 className="t-area">💬 Assistente</h2>
            <p className="t-eti mt-0.5">Chat con l&apos;AD e conversazioni salvate.</p>
          </div>

          {/* Chat con cassetto "Conversazioni" a scomparsa da SINISTRA (stile Claude): il tasto a
              sinistra lo apre. La section è `relative` così il cassetto la copre tutta. */}
          <section className="card flex flex-col overflow-hidden relative">
          <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b gap-2" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                onClick={() => setConvDrawerAperto(true)}
                className="grid place-items-center w-8 h-8 rounded-lg text-black/50 hover:bg-black/[0.05] hover:text-brand transition shrink-0"
                aria-label="Le tue conversazioni"
                title="Le tue conversazioni"
              >
                <MessagesSquare size={17} />
              </button>
              <div className="leading-tight min-w-0">
                <div className="text-[15px] font-semibold tracking-tight truncate">Parla con l'assistente</div>
                {convId && (
                  <div className="text-[11px] text-black/40 truncate">
                    {conversazioni.find((c) => c.id === convId)?.titolo || "Conversazione in corso"}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={nuovaConversazione}
              className="shrink-0 text-xs text-black/45 hover:text-brand inline-flex items-center gap-1 transition"
              title="Salva questa conversazione e iniziane una nuova"
            >
              <Plus size={13} /> Nuova
            </button>
          </div>
          {base && (
            <div className="px-5 py-2 bg-brand-50/70 border-b border-brand/15 text-xs text-brand flex items-center gap-2">
              <Layers size={13} className="shrink-0" />
              <span className="truncate">
                Base: {base.titoli.join(" · ")} — scrivi la tua domanda, ne terrò conto.
              </span>
              <button onClick={() => setBase(null)} className="ml-auto shrink-0 underline hover:no-underline">
                togli
              </button>
            </div>
          )}
          <div ref={scrollBoxRef} onScroll={(e) => { stickFullRef.current = vicinoAlFondo(e.currentTarget); }} className="scroll-soft flex-1 p-5 space-y-4 overflow-y-auto min-h-[220px] max-h-[440px]">
            {messages.length === 0 && (
              <div className="pt-1">
                <p className="t-corpo text-sm mb-3">
                  Scrivi un obiettivo o una domanda: l'AD la assegna all'esperto giusto del team.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TEAM.map((e) => (
                    <div key={e.nome} className="surface-muted flex items-start gap-2.5 text-xs px-3 py-2 hover:border-brand/30 transition">
                      <span className="text-base leading-none mt-0.5">{e.emoji}</span>
                      <span className="leading-snug">
                        <span className="font-semibold t-sez text-[13px]">{e.nome}</span>
                        <br />
                        <span className="t-eti">{e.ruolo}</span>
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <p className="text-sm text-black/50 mb-2">Comandi rapidi</p>
                  <div className="flex flex-wrap gap-2">
                    {COMANDI_RAPIDI.map((c) => (
                      <button
                        key={c.label}
                        onClick={() => setInput(c.testo)}
                        className="text-xs font-medium border border-brand/30 bg-brand-50/40 text-ink/80 rounded-full px-3 py-1.5 hover:border-brand/50 hover:bg-brand-50/70 active:scale-95 transition"
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {messages.map((m, i) =>
              m.prompt ? (
                <div key={m.id ?? i} className="text-left">
                  <div className="t-eti text-xs mb-1.5 flex items-center gap-1">
                    <FileText size={12} className="text-brand" /> Prompt pronto — incollalo in Claude (claude.ai) col tuo Max: gratis
                  </div>
                  <div className="border border-brand/25 rounded-xl p-3.5" style={{ background: "var(--brand-soft)" }}>
                    <pre className="text-xs whitespace-pre-wrap font-sans t-corpo leading-relaxed">{m.content}</pre>
                    <button
                      onClick={() => copia(m.content)}
                      className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium bg-brand text-white rounded-full px-3 py-1.5 hover:bg-brand-dark active:scale-95 transition"
                    >
                      <Copy size={12} /> Copia
                    </button>
                  </div>
                </div>
              ) : (
                <div key={m.id ?? i} className={m.role === "user" ? "text-right" : "text-left"}>
                  {m.role === "assistant" && m.esperto && (
                    <div className="t-eti text-xs mb-1">
                      {m.esperto.emoji} {m.esperto.nome}
                    </div>
                  )}
                  {m.role === "user" ? (
                    <span className="inline-block px-4 py-2.5 rounded-2xl rounded-br-md text-sm whitespace-pre-wrap max-w-[85%] leading-relaxed bg-brand text-white shadow-card">
                      {m.content}
                    </span>
                  ) : m.pending ? (
                    m.content ? (
                      <div className="chat-bubble-assistant inline-block align-top text-left px-4 py-2.5 rounded-2xl rounded-bl-md max-w-[92%]">
                        <Markdown>{m.content}</Markdown>
                        <span className="ml-0.5 animate-pulse">▍</span>
                      </div>
                    ) : (
                      <div className="chat-bubble-pending inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl rounded-bl-md text-sm">
                        <Loader2 size={14} className="animate-spin" /> sto pensando…
                      </div>
                    )
                  ) : (
                    <div className="chat-bubble-assistant inline-block align-top text-left px-4 py-2.5 rounded-2xl rounded-bl-md max-w-[92%]">
                      <Markdown>{m.content}</Markdown>
                    </div>
                  )}
                  {m.role === "assistant" && m.tools && m.tools.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs t-eti mt-1.5">
                      <Wrench size={12} />
                      {m.tools.map((t) => TOOL_LABELS[t] || t).join(" · ")}
                    </div>
                  )}
                </div>
              )
            )}
            {loading && !messages.some((m) => m.pending) && (
              <div className="flex items-center gap-2 t-eti text-sm">
                <Loader2 size={16} className="animate-spin" /> Sto lavorando...
              </div>
            )}
            <div ref={endRef} />
          </div>
          <div className="border-t p-3 space-y-2" style={{ borderColor: "var(--border)", background: "var(--bg-surface-2)" }}>
            <AnteprimaAllegati allegati={allegatiChat} onTogli={togliAllegatoChat} />
            <div className="flex gap-2 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    mandaAlCervello();
                  }
                }}
                rows={4}
                placeholder="Scrivi all'AD (col tuo Max), gratis..."
                className="input-soft flex-1 min-h-[82px] max-h-40 resize-y"
              />
              <button
                onClick={() => fileChatRef.current?.click()}
                disabled={allegatiChat.length >= 6}
                className="min-h-[44px] min-w-[44px] grid place-items-center px-3 rounded-xl border border-black/10 text-black/55 hover:bg-black/[0.04] transition active:scale-95 disabled:opacity-40"
                aria-label="Allega foto o file"
                title="Allega foto o file (max 6)"
              >
                <Paperclip size={18} />
              </button>
              <button
                onClick={dettaVoce}
                disabled={ascoltando}
                className={`min-h-[44px] min-w-[44px] grid place-items-center px-3 rounded-xl border transition active:scale-95 ${
                  ascoltando ? "bg-red-500 text-white border-red-500 animate-pulse" : "border-black/10 text-black/55 hover:bg-black/[0.04]"
                }`}
                aria-label="Detta a voce"
                title="Detta a voce"
              >
                <Mic size={18} />
              </button>
              <button
                onClick={() => mandaAlCervello()}
                disabled={!input.trim() && allegatiChat.length === 0}
                className="min-h-[44px] min-w-[44px] justify-center bg-brand text-white px-4 rounded-xl hover:bg-brand-dark active:scale-95 transition disabled:opacity-40 disabled:active:scale-100 inline-flex items-center gap-1.5"
                aria-label="Manda al cervello"
                title="Chatta con l'AD (Claude Code sul tuo Max): gratis, risponde qui"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Brain size={18} />}
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={dammiPrompt}
                disabled={!input.trim()}
                className="flex-1 inline-flex items-center justify-center gap-1.5 border border-brand/40 text-brand px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-brand-50 active:scale-95 transition disabled:opacity-40 disabled:active:scale-100"
                title="Crea un prompt pronto da incollare in Claude col tuo Max (gratis)"
              >
                <FileText size={14} /> Prompt (copia per Max)
              </button>
            </div>
            <p className="t-eti text-[11px] px-1 leading-relaxed">
              🧠 <b>Invio</b> = invia · <b>Shift+Invio</b> = a capo — l&apos;AD risponde qui, sul tuo Max (gratis) e ricorda il filo · 📋 <b>Prompt</b> = lo copi e incolli in Claude. Niente API a pagamento.
            </p>
          </div>

          {/* ===== CASSETTO CONVERSAZIONI: sfondo + pannello che scorre da SINISTRA (stile Claude). =====
              Su telefono riempie tutta la chat (w-full); su desktop è un pannello laterale (sm:w-[340px]). */}
          <div
            className={`absolute inset-0 z-20 bg-black/25 transition-opacity duration-200 ${convDrawerAperto ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            onClick={() => setConvDrawerAperto(false)}
            aria-hidden="true"
          />
          <aside
            className={`absolute inset-y-0 left-0 z-30 w-full sm:w-[340px] flex flex-col overflow-hidden border-r shadow-2xl transition-transform duration-200 ${convDrawerAperto ? "translate-x-0" : "-translate-x-full"}`}
            style={{ borderColor: "var(--border)", background: "var(--bg-surface)" }}
            aria-hidden={!convDrawerAperto}
          >
            <div className="px-4 py-3 flex items-center justify-between border-b gap-2 shrink-0" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2 min-w-0">
                <span className="sez-ico"><MessagesSquare size={15} /></span>
                <span className="t-sez">Conversazioni</span>
              </div>
              <button
                onClick={() => setConvDrawerAperto(false)}
                className="grid place-items-center w-7 h-7 rounded-lg text-black/45 hover:bg-black/[0.05] transition shrink-0"
                aria-label="Chiudi conversazioni"
                title="Chiudi"
              >
                <X size={16} />
              </button>
            </div>
            <div className="px-3 py-2.5 flex items-center gap-2 border-b shrink-0" style={{ borderColor: "var(--border)" }}>
              <button
                type="button"
                onClick={() => { void nuovaConversazione(); setConvDrawerAperto(false); }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-brand/40 text-brand text-[12.5px] font-medium py-2 hover:bg-brand/[0.05] transition"
              >
                <Plus size={14} /> Nuova chat
              </button>
              {conversazioni.length > 0 && (
                <button type="button" onClick={svuotaConversazioni} className="btn-ghost shrink-0">
                  <Trash2 size={12} /> Svuota
                </button>
              )}
            </div>
            {convSel.length > 0 && (
              <div className="m-2.5 flex flex-wrap items-center gap-2 rounded-xl border border-brand/25 px-3 py-2 shrink-0" style={{ background: "var(--brand-soft)" }}>
                <span className="text-xs text-brand font-medium">{convSel.length} selezionate</span>
                <button
                  type="button"
                  onClick={() => { void usaComeBase(); setConvDrawerAperto(false); }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium bg-brand text-white rounded-full px-3 py-1.5 hover:bg-brand-dark active:scale-95 transition"
                >
                  <Layers size={13} /> Usa come base
                </button>
                <button type="button" onClick={() => setConvSel([])} className="btn-ghost">
                  annulla
                </button>
              </div>
            )}
            {conversazioni.length === 0 ? (
              <p className="t-eti text-[12.5px] px-3 py-6 text-center">
                Ancora nessuna conversazione. Quando scrivi nella chat, la salvo qui e potrai riprenderla.
              </p>
            ) : (
              <div className="scroll-soft flex-1 overflow-y-auto p-2.5 space-y-1.5">
                {/* Ordine del server (più recenti prima), stabile: la chat aperta resta al suo posto, evidenziata da conv-row-active. */}
                {conversazioni.map((c) => (
                  <div
                    key={c.id}
                    className={`conv-row flex items-center gap-2.5 ${convId === c.id ? "conv-row-active" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={convSel.includes(c.id)}
                      onChange={() => toggleSel(c.id)}
                      className="w-4 h-4 accent-brand shrink-0"
                      aria-label="Seleziona conversazione"
                    />
                    <button type="button" onClick={() => continuaConversazione(c.id)} className="flex-1 min-w-0 text-left">
                      <div className="conv-row-title">{c.titolo}</div>
                      <div className="conv-row-meta">
                        {c.messaggi.filter((m) => !m.prompt).length} messaggi · {fa(c.updated_at)}
                        {convId === c.id && " · in corso"}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => eliminaConversazione(c.id)}
                      className="btn-ghost-danger shrink-0"
                      aria-label="Elimina conversazione"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="t-eti text-[10.5px] px-3 py-2 border-t leading-relaxed shrink-0" style={{ borderColor: "var(--border)" }}>
              {convServer
                ? "💾 Salvate nel database: le ritrovi da ogni dispositivo."
                : "💾 Salvate su questo dispositivo."}
            </p>
          </aside>
          </section>

          <Comandi onScegli={(cmd) => setInput(cmd)} />

        </div>
        )}

        {/* Storico: area a sé (come l'Assistente), col suo header e le sue schede Governo/Diario */}
        {vista === "storico" && (
          <Storico diario={diario} memoria={memoria} onSvuotaDiario={cancellaDiario} fa={fa} />
        )}
      </main>
      </div>

      {/* 📎 Input file NASCOSTO condiviso tra la chat intera e quella fluttuante (una sola è visibile per volta). */}
      <input
        ref={fileChatRef}
        type="file"
        multiple
        accept="image/*,application/pdf,.txt,.csv,.md"
        className="hidden"
        onChange={(e) => {
          aggiungiAllegatiChat(e.target.files);
          e.target.value = ""; // permette di riscegliere lo stesso file
        }}
      />

      {/* 💬 Chat fluttuante: "Parla con l'AD" da qualsiasi area. Nascosto nell'area Assistente (lì c'è la chat intera). */}
      {!chatFluttuante && vista !== "assistente" && (
        <button
          onClick={() => setChatFluttuante(true)}
          className="fixed right-4 sm:right-6 z-40 inline-flex items-center gap-2 rounded-full bg-brand text-white font-semibold text-sm px-4 py-3 shadow-hover hover:bg-brand-dark active:scale-95 transition"
          // safe-area iPhone (PWA): senza, il bottone finisce sotto la barra del gesto home. (mobile)
          style={{ bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
          aria-label="Parla con l'AD"
        >
          <Send size={16} /> Parla con l&apos;AD
          {pendingCount > 0 && <span className="w-2 h-2 rounded-full bg-white/90 animate-pulse" />}
        </button>
      )}
      {chatFluttuante && (
        <div
          className="fixed right-3 sm:right-6 z-50 w-[min(440px,calc(100vw-24px))] h-[min(660px,calc(100dvh-72px))] card flex flex-col overflow-hidden"
          // safe-area iPhone (PWA): la barra della chat non deve finire sotto la barra del gesto home. (mobile)
          style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.28)", bottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <div className="px-4 py-3 flex items-center gap-2.5 border-b" style={{ borderColor: "var(--border)" }}>
            <span className="grid place-items-center w-7 h-7 rounded-lg bg-brand text-white shrink-0 text-[13px] font-bold">M</span>
            <div className="leading-tight min-w-0 flex-1">
              <div className="text-[14px] font-semibold tracking-tight truncate">Parla con l&apos;AD</div>
              <div className="t-eti text-[11px]">Semplice e diretto — penso io a chi lo fa.</div>
            </div>
            <button
              onClick={() => { nuovaConversazione(); setFabConvOpen(false); }}
              className="grid place-items-center w-7 h-7 rounded-lg text-black/45 hover:bg-black/[0.05] transition shrink-0"
              aria-label="Nuova chat"
              title="Nuova chat"
            >
              <Plus size={16} />
            </button>
            <button
              onClick={() => setFabConvOpen((v) => !v)}
              className={`grid place-items-center w-7 h-7 rounded-lg transition shrink-0 ${fabConvOpen ? "bg-brand/10 text-brand" : "text-black/45 hover:bg-black/[0.05]"}`}
              aria-label="Le tue conversazioni"
              title="Le tue conversazioni"
            >
              <MessageSquare size={15} />
            </button>
            <button
              onClick={() => {
                setVista("assistente");
                setChatFluttuante(false);
              }}
              className="grid place-items-center w-7 h-7 rounded-lg text-black/45 hover:bg-black/[0.05] transition shrink-0"
              aria-label="Apri la chat intera"
              title="Apri la chat intera (con conversazioni ed esperti)"
            >
              <Maximize2 size={15} />
            </button>
            <button
              onClick={() => setChatFluttuante(false)}
              className="grid place-items-center w-7 h-7 rounded-lg text-black/45 hover:bg-black/[0.05] transition shrink-0"
              aria-label="Chiudi la chat"
            >
              <X size={15} />
            </button>
          </div>
          {/* Corpo chat SEMPRE montato; il cassetto "Conversazioni" scorre SOPRA da sinistra (come nel desktop). */}
          <div ref={chatFabBoxRef} onScroll={(e) => { stickFabRef.current = vicinoAlFondo(e.currentTarget); }} className="scroll-soft flex-1 p-3.5 space-y-3 overflow-y-auto">
            {messages.filter((m) => !m.prompt).length === 0 && (
              <p className="t-corpo text-[13px]">Scrivi un obiettivo o una domanda: attivo io l&apos;esperto giusto.</p>
            )}
            {messages
              .filter((m) => !m.prompt)
              .map((m, i) => (
                <div key={m.id ?? i} className={m.role === "user" ? "text-right" : "text-left"}>
                  {m.role === "user" ? (
                    <span className="inline-block px-3.5 py-2 rounded-2xl rounded-br-md text-[13px] whitespace-pre-wrap max-w-[85%] leading-relaxed bg-brand text-white shadow-card">
                      {m.content}
                    </span>
                  ) : m.pending ? (
                    m.content ? (
                      <div className="chat-bubble-assistant inline-block align-top text-left px-3.5 py-2 rounded-2xl rounded-bl-md max-w-[92%]">
                        <Markdown>{m.content}</Markdown>
                        <span className="ml-0.5 animate-pulse">▍</span>
                      </div>
                    ) : (
                      <div className="chat-bubble-pending inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl rounded-bl-md text-[13px]">
                        <Loader2 size={13} className="animate-spin" /> sto pensando…
                      </div>
                    )
                  ) : (
                    <div className="chat-bubble-assistant inline-block align-top text-left px-3.5 py-2 rounded-2xl rounded-bl-md max-w-[92%]">
                      <Markdown>{m.content}</Markdown>
                    </div>
                  )}
                </div>
              ))}
            {loading && !messages.some((m) => m.pending) && (
              <div className="flex items-center gap-2 t-eti text-[13px]">
                <Loader2 size={14} className="animate-spin" /> Sto lavorando...
              </div>
            )}
            <div ref={chatFabEndRef} />
          </div>
          <div className="border-t p-2.5" style={{ borderColor: "var(--border)", background: "var(--bg-surface-2)" }}>
            <AnteprimaAllegati allegati={allegatiChat} onTogli={togliAllegatoChat} />
            <div className="flex gap-2 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    mandaAlCervello();
                  }
                }}
                rows={3}
                placeholder="Scrivi all'AD…"
                className="input-soft flex-1 min-h-[78px] max-h-28 resize-y text-[13px]"
              />
              <button
                onClick={() => fileChatRef.current?.click()}
                disabled={allegatiChat.length >= 6}
                className="min-h-[40px] min-w-[40px] grid place-items-center rounded-xl border border-black/10 text-black/55 hover:bg-black/[0.04] transition active:scale-95 disabled:opacity-40"
                aria-label="Allega foto o file"
                title="Allega foto o file (max 6)"
              >
                <Paperclip size={16} />
              </button>
              <button
                onClick={dettaVoce}
                disabled={ascoltando}
                className={`min-h-[40px] min-w-[40px] grid place-items-center rounded-xl border transition active:scale-95 ${
                  ascoltando ? "bg-red-500 text-white border-red-500 animate-pulse" : "border-black/10 text-black/55 hover:bg-black/[0.04]"
                }`}
                aria-label="Detta a voce"
                title="Detta a voce"
              >
                <Mic size={16} />
              </button>
              <button
                onClick={() => mandaAlCervello()}
                disabled={!input.trim() && allegatiChat.length === 0}
                className="min-h-[40px] min-w-[40px] grid place-items-center rounded-xl bg-brand text-white disabled:opacity-40 hover:bg-brand-dark active:scale-95 transition"
                aria-label="Invia"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
          {/* CASSETTO conversazioni del FAB, allineato al cassetto del desktop: scorre da sinistra. */}
          <div
            className={`absolute inset-0 z-20 bg-black/25 transition-opacity duration-200 ${fabConvOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            onClick={() => setFabConvOpen(false)}
            aria-hidden="true"
          />
          <aside
            className={`absolute inset-y-0 left-0 z-30 w-full flex flex-col overflow-hidden border-r shadow-2xl transition-transform duration-200 ${fabConvOpen ? "translate-x-0" : "-translate-x-full"}`}
            style={{ borderColor: "var(--border)", background: "var(--bg-surface)" }}
            aria-hidden={!fabConvOpen}
          >
            <div className="px-4 py-3 flex items-center justify-between border-b gap-2 shrink-0" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2 min-w-0">
                <span className="sez-ico"><MessagesSquare size={15} /></span>
                <span className="t-sez">Conversazioni</span>
              </div>
              <button
                onClick={() => setFabConvOpen(false)}
                className="grid place-items-center w-7 h-7 rounded-lg text-black/45 hover:bg-black/[0.05] transition shrink-0"
                aria-label="Chiudi conversazioni"
                title="Chiudi"
              >
                <X size={16} />
              </button>
            </div>
            <button
              onClick={() => { void nuovaConversazione(); setFabConvOpen(false); }}
              className="m-2.5 inline-flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-brand/40 text-brand text-[12.5px] font-medium py-2 hover:bg-brand/[0.05] transition shrink-0"
            >
              <Plus size={14} /> Nuova chat
            </button>
            {conversazioni.length === 0 ? (
              <p className="t-eti text-[12px] px-3 py-4 text-center">Ancora nessuna conversazione salvata.</p>
            ) : (
              <ul className="scroll-soft flex-1 overflow-y-auto px-2.5 pb-2.5 space-y-1">
                {conversazioni.map((c) => (
                  <li key={c.id}>
                    <button
                      onClick={() => { void continuaConversazione(c.id); setFabConvOpen(false); }}
                      className={`w-full text-left rounded-lg px-2.5 py-2 transition ${c.id === convId ? "bg-brand/10 text-brand" : "hover:bg-black/[0.04]"}`}
                    >
                      <span className={`block truncate text-[12.5px] leading-snug ${c.id === convId ? "font-medium" : ""}`}>{c.titolo || "Conversazione"}</span>
                      <span className="t-eti text-[10.5px]">{new Date(c.updated_at || c.created_at).toLocaleString("it-IT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

// 📎 Riga di anteprima degli allegati scelti (foto/file), prima di inviare — con la ✕ per toglierli.
function AnteprimaAllegati({ allegati, onTogli }: { allegati: File[]; onTogli: (i: number) => void }) {
  if (allegati.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {allegati.map((f, i) => {
        const isImg = f.type.startsWith("image/");
        return (
          <span
            key={i}
            className="inline-flex items-center gap-1 text-[11px] bg-brand-50 dark:bg-brand/15 text-brand rounded-md pl-1.5 pr-1 py-1 max-w-[180px]"
            title={f.name}
          >
            {isImg ? <ImageIcon size={12} /> : <FileText size={12} />}
            <span className="truncate">{f.name}</span>
            <button onClick={() => onTogli(i)} className="hover:text-red-600 transition" aria-label={`Togli ${f.name}`}>
              <X size={12} />
            </button>
          </span>
        );
      })}
    </div>
  );
}

const MD_COMPONENTS: Components = {
  p: ({ children }) => <p className="my-2">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  h1: ({ children }) => <h3 className="font-semibold text-[15px] mt-3 mb-1.5">{children}</h3>,
  h2: ({ children }) => <h3 className="font-semibold text-[15px] mt-3 mb-1.5">{children}</h3>,
  h3: ({ children }) => <h4 className="font-semibold text-sm mt-2.5 mb-1">{children}</h4>,
  h4: ({ children }) => <h4 className="font-semibold text-sm mt-2.5 mb-1">{children}</h4>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noreferrer" className="text-brand underline break-words">
      {children}
    </a>
  ),
  code: ({ className, children }) =>
    className ? (
      <code className={className}>{children}</code>
    ) : (
      <code className="rounded px-1 py-0.5 text-[0.85em] font-mono" style={{ background: "var(--bg-surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)" }}>{children}</code>
    ),
  pre: ({ children }) => (
    <pre className="rounded-lg p-3 overflow-x-auto text-xs my-2" style={{ background: "var(--bg-surface-2)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>{children}</pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 pl-3 my-2" style={{ borderColor: "var(--border-strong)", color: "var(--text-muted)" }}>{children}</blockquote>
  ),
  hr: () => <hr className="my-3" style={{ borderColor: "var(--border)" }} />,
  table: ({ children }) => (
    <div className="overflow-x-auto my-2">
      <table className="w-full text-xs border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead style={{ background: "var(--bg-surface-2)" }}>{children}</thead>,
  th: ({ children }) => <th className="px-2 py-1 text-left font-semibold" style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }}>{children}</th>,
  td: ({ children }) => <td className="px-2 py-1 align-top" style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>{children}</td>,
};

// Mostra il testo dell'AI come Markdown formattato (grassetti, elenchi, tabelle)
// invece che come testo grezzo pieno di asterischi e barrette.
// memo: la resa Markdown è costosa (ReactMarkdown ri-parsa a ogni render). `children` è una stringa
// (primitiva) → con memo, digitare in chat (che ri-renderizza tutto il Pannello per via dello state
// `input`) NON ri-parsa più il Markdown di tutte le bolle esistenti: si ridisegna solo la bolla il cui
// contenuto è cambiato. Toglie il lag di digitazione. (Round 5 — perf percepita)
const Markdown = memo(function Markdown({ children }: { children: string }) {
  return (
    <div className="md-chat text-sm leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={MD_COMPONENTS}>
        {children}
      </ReactMarkdown>
    </div>
  );
});

// Una CATEGORIA di numeri come TENDINA. Chiusa = solo titolo + quanti dati sono
// già collegati (badge); aperta = la tabella (oggi/7g/30g) o, se snapshot, una
// griglia di cifre singole "adesso". Apri solo ciò che ti serve: meno scroll,
// capisci veloce.
function CategoriaNumeri({
  emoji,
  titolo,
  sottotitolo,
  kpis,
  metriche,
  snapshot = false,
  open,
  onToggle,
}: {
  emoji: string;
  titolo: string;
  sottotitolo: string;
  kpis: Kpi[];
  metriche: Record<string, any> | null;
  snapshot?: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  // "Acceso" = c'è un valore E si formatta in qualcosa di mostrabile (non "—").
  // Così il badge e l'aspetto della cella restano sempre d'accordo (es. tempo
  // consegna o recensione media a 0 = fonte di fatto non ancora utile → spenta).
  const acceso = (chiave?: string, tipo?: Tipo) =>
    Boolean(chiave && metriche && metriche[chiave] !== undefined && metriche[chiave] !== null) &&
    formatta(metriche![chiave!], tipo) !== "—";
  const totale = snapshot ? kpis.length : kpis.length * 3;
  const collegate = snapshot
    ? kpis.filter((k) => acceso(k.valore, k.tipo)).length
    : kpis.reduce((s, k) => s + [k.oggi, k.sett, k.mese].filter((c) => acceso(c, k.tipo)).length, 0);
  const haDati = collegate > 0;

  return (
    <div className={`rounded-xl border transition ${open ? "border-brand/25 bg-brand-50/20" : "border-black/[0.06] bg-paper/30 hover:border-brand/20"}`}>
      <button onClick={onToggle} className="w-full flex items-center gap-2 px-3 py-2.5 text-left" aria-expanded={open}>
        <span className="text-[14px] font-semibold tracking-tight">{emoji} {titolo}</span>
        <span className={`text-[10.5px] tabular-nums px-1.5 py-0.5 rounded-full ${haDati ? "bg-brand-50 text-brand" : "bg-black/[0.04] text-black/35"}`}>
          {collegate}/{totale}
        </span>
        <span className="ml-auto shrink-0 text-black/35">{open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>
      </button>
      {open && (
        <div className="px-3 pb-3">
          <p className="text-[11px] text-black/40 mb-2.5">{sottotitolo}</p>
          {snapshot ? <CorpoGriglia kpis={kpis} metriche={metriche} /> : <CorpoTabella kpis={kpis} metriche={metriche} />}
          <ParlaCasella titolo={`Numeri: ${titolo}`} contesto={sottotitolo} />
        </div>
      )}
    </div>
  );
}

// Corpo "tabella": una riga per KPI, tre colonne di valori (Oggi · 7g · 30g).
// Le celle senza fonte collegata mostrano "—".
function CorpoTabella({ kpis, metriche }: { kpis: Kpi[]; metriche: Record<string, any> | null }) {
  const cella = (chiave?: string, tipo?: Tipo) => {
    const present = Boolean(chiave && metriche && metriche[chiave] !== undefined && metriche[chiave] !== null);
    const v = present ? formatta(metriche![chiave!], tipo) : "—";
    return { on: v !== "—", v };
  };
  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <table className="w-full border-separate border-spacing-y-1.5 min-w-[420px]">
        <thead>
          <tr className="text-[10px] uppercase tracking-wide text-black/35">
            <th className="text-left font-medium py-1 pl-1">KPI</th>
            <th className="text-right font-medium py-1 px-2">Oggi</th>
            <th className="text-right font-medium py-1 px-2">7 giorni</th>
            <th className="text-right font-medium py-1 px-2 pr-1">30 giorni</th>
          </tr>
        </thead>
        <tbody>
          {kpis.map((k) => {
            // Due tipi di KPI: a FINESTRA (oggi/7g/30g) e a VALORE SINGOLO (snapshot "adesso":
            // cassa, runway, LTV, ricavo commissioni, negozi in calo…). Questi ultimi hanno solo
            // `valore` e prima restavano "—" perché la tabella leggeva SOLO oggi/sett/mese: dati
            // reali già calcolati dal server che non venivano mostrati. Ora li accendiamo come
            // una cifra unica che occupa le tre colonne, etichettata "adesso". (fix dati-spenti)
            const soloValore = !k.oggi && !k.sett && !k.mese && Boolean(k.valore);
            const celle = [cella(k.oggi, k.tipo), cella(k.sett, k.tipo), cella(k.mese, k.tipo)];
            const cellaValore = cella(k.valore, k.tipo);
            const acceso = soloValore ? cellaValore.on : celle.some((c) => c.on);
            return (
              <tr key={k.label} className="bg-paper/40 hover:bg-brand-50/30 transition">
                <td className="rounded-l-xl border-y border-l border-black/[0.06] py-2 pl-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`grid place-items-center w-7 h-7 rounded-lg shrink-0 ${acceso ? "bg-brand-50 text-brand" : "bg-black/[0.04] text-black/30"}`}>
                      {k.icon}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13px] font-medium text-ink/85 leading-tight truncate">{k.label}</span>
                      <span className="block text-[10px] uppercase tracking-wide text-black/30 leading-tight">
                        {acceso ? k.fonte : `da collegare · ${k.fonte}`}
                      </span>
                    </span>
                  </div>
                </td>
                {soloValore ? (
                  <td colSpan={3} className="border-y border-r border-black/[0.06] text-right px-2 tabular-nums rounded-r-xl pr-2.5">
                    <span className={`text-[15px] font-semibold tracking-tight ${cellaValore.on ? "text-ink" : "text-black/20"}`}>{cellaValore.v}</span>
                    {cellaValore.on && <span className="ml-1.5 text-[9px] uppercase tracking-wide text-black/30 align-middle">adesso</span>}
                  </td>
                ) : (
                  celle.map((c, i) => (
                    <td
                      key={i}
                      className={`border-y border-black/[0.06] text-right px-2 tabular-nums ${i === 2 ? "rounded-r-xl border-r pr-2.5" : ""}`}
                    >
                      <span className={`text-[15px] font-semibold tracking-tight ${c.on ? "text-ink" : "text-black/20"}`}>{c.v}</span>
                    </td>
                  ))
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Corpo "griglia": cifre singole (snapshot di adesso) in card compatte.
// Le card senza fonte collegata sono tratteggiate e mostrano "—".
function CorpoGriglia({ kpis, metriche }: { kpis: Kpi[]; metriche: Record<string, any> | null }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {kpis.map((k) => {
        const present = Boolean(k.valore && metriche && metriche[k.valore] !== undefined && metriche[k.valore] !== null);
        const v = present ? formatta(metriche![k.valore!], k.tipo) : "—";
        const on = v !== "—";
        return (
          <div key={k.label} className={`rounded-xl border p-2.5 ${on ? "border-black/[0.06] bg-paper/40" : "border-dashed border-black/[0.10] bg-paper/20"}`}>
            <div className="flex items-center gap-1.5">
              <span className={`grid place-items-center w-6 h-6 rounded-lg shrink-0 ${on ? "bg-brand-50 text-brand" : "bg-black/[0.04] text-black/30"}`}>
                {k.icon}
              </span>
              <span className="text-[10.5px] text-black/45 leading-tight">{k.label}</span>
            </div>
            <div className={`text-[19px] font-semibold tracking-tight mt-1 tabular-nums ${on ? "text-ink" : "text-black/20"}`}>{v}</div>
          </div>
        );
      })}
    </div>
  );
}
