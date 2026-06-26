import { NextResponse } from "next/server";
import { readVaultFile } from "@/lib/vault";
import { getImpostazioni, setImpostazione } from "@/lib/store";
import { eseguiAzione } from "@/lib/mani";
import { getMetriche } from "@/lib/marketplace-db";
import { azioniDaSentinelle } from "@/lib/sentinelle";

export const runtime = "nodejs";

// "Azioni pronte" = la corsia operativa. Le mosse le prepara l'AD nel vault
// (90-Memoria-AI/AZIONI-PRONTE.md, un blocco per azione). Quando approvi:
//   - l'azione viene ESEGUITA dalle "mani" (lib/mani.ts) — per ora email (Resend);
//   - l'esito ("fatta"/"simulata"/"coda") + il dettaglio si salvano in Supabase
//     (impostazioni: "azione:<id>" e "azione:<id>:nota"), come la checklist.
// Sicuro per costruzione: invia davvero solo con chiave + AZIONI_LIVE=on.

export type StatoAzione = "" | "rifiutata" | "fatta" | "simulata" | "coda";
export type AzionePronta = {
  id: string;
  titolo: string;
  reparto: string;
  livello: "verde" | "giallo" | "rosso" | "?";
  canale: string;
  destinatario: string;
  perche: string;
  preparato: string;
  testo: string;
  fonte: "vault" | "sentinella";
  stato: StatoAzione;
  esito: string;
};

type Blocco = Omit<AzionePronta, "stato" | "esito">;

function livelloDi(s: string): AzionePronta["livello"] {
  if (s.includes("🟢")) return "verde";
  if (s.includes("🟡")) return "giallo";
  if (s.includes("🔴")) return "rosso";
  return "?";
}

function parse(md: string): Blocco[] {
  const out: Blocco[] = [];
  let cur: Blocco | null = null;
  let inTesto = false;
  for (const raw of md.split("\n")) {
    const h = raw.match(/^##\s+(\S+)\s+·\s+(.+)$/);
    if (h) {
      if (cur) out.push({ ...cur, testo: cur.testo.trim() });
      cur = { id: h[1], titolo: h[2].trim(), reparto: "", livello: "?", canale: "", destinatario: "", perche: "", preparato: "", testo: "", fonte: "vault" };
      inTesto = false;
      continue;
    }
    if (!cur) continue;
    if (!inTesto) {
      if (raw.trim() === "testo:") {
        inTesto = true;
        continue;
      }
      const f = raw.match(/^(\w+):\s*(.*)$/);
      if (f) {
        const k = f[1].toLowerCase();
        const v = f[2].trim();
        if (k === "reparto") cur.reparto = v;
        else if (k === "livello") cur.livello = livelloDi(v);
        else if (k === "canale") cur.canale = v;
        else if (k === "destinatario") cur.destinatario = v;
        else if (k === "perche") cur.perche = v;
        else if (k === "preparato") cur.preparato = v;
      }
    } else {
      cur.testo += (cur.testo ? "\n" : "") + raw;
    }
  }
  if (cur) out.push({ ...cur, testo: cur.testo.trim() });
  return out;
}

function statoDa(raw: string): StatoAzione {
  if (raw === "approvata") return "coda"; // compatibilità con la Tappa 1
  if (raw === "rifiutata" || raw === "fatta" || raw === "simulata" || raw === "coda") return raw;
  return "";
}

// Tutte le azioni della corsia: quelle scritte dall'AD nel vault + quelle generate
// in automatico dalle sentinelle sui dati reali. Le sentinelle stanno in cima
// (sono "calde", appena scattate).
async function tutteLeAzioni(): Promise<Blocco[]> {
  const md = await readVaultFile("90-Memoria-AI/AZIONI-PRONTE.md");
  const vault = md ? parse(md) : [];
  let sentinelle: Blocco[] = [];
  try {
    const m: any = await getMetriche();
    sentinelle = azioniDaSentinelle(m).map((s) => ({ ...s, fonte: "sentinella" as const }));
  } catch {
    sentinelle = [];
  }
  return [...sentinelle, ...vault];
}

export async function GET() {
  const blocchi = await tutteLeAzioni();
  const { tabella, valori } = await getImpostazioni();
  const azioni: AzionePronta[] = blocchi.map((b) => ({
    ...b,
    stato: statoDa(valori[`azione:${b.id}`] || ""),
    esito: valori[`azione:${b.id}:nota`] || "",
  }));
  return NextResponse.json({ collegato: blocchi.length > 0, salvataggio: tabella, azioni });
}

// Decidi. Body: { id, decisione: "approva" | "rifiuta" | "annulla" }.
// "approva" → esegue subito tramite le mani; salva esito.
export async function POST(req: Request) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body non valido." }, { status: 400 });
  }
  const id = String(body?.id || "").trim();
  const dec = String(body?.decisione || "").trim();
  if (!id) return NextResponse.json({ ok: false, error: "Manca l'id." }, { status: 400 });

  if (dec === "rifiuta" || dec === "annulla") {
    const stato = dec === "rifiuta" ? "rifiutata" : "";
    const salv = (await setImpostazione(`azione:${id}`, stato)) && (await setImpostazione(`azione:${id}:nota`, ""));
    return NextResponse.json({ ok: true, stato, esito: "", salvataggio: salv });
  }

  if (dec !== "approva") return NextResponse.json({ ok: false, error: "Decisione non valida." }, { status: 400 });

  // Trova l'azione (vault o sentinella) e falla partire (le mani decidono se invia/simula/coda).
  const azione = (await tutteLeAzioni()).find((a) => a.id === id);
  if (!azione) return NextResponse.json({ ok: false, error: "Azione non trovata." }, { status: 404 });

  const esito = await eseguiAzione({ titolo: azione.titolo, canale: azione.canale, destinatario: azione.destinatario, testo: azione.testo });
  const salv = (await setImpostazione(`azione:${id}`, esito.stato)) && (await setImpostazione(`azione:${id}:nota`, esito.dettaglio));
  return NextResponse.json({ ok: true, stato: esito.stato, esito: esito.dettaglio, salvataggio: salv });
}
