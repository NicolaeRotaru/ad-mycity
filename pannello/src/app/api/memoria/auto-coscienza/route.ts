import { NextResponse } from "next/server";
import { readVaultFile } from "@/lib/vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 🧠 AUTO-COSCIENZA — il livello con cui la macchina pensa su se stessa: si controlla
// (auto-analisi), impara (apprendimento), si migliora (auto-miglioramento). Qui leggiamo
// i 5 digest che il giro scrive nel vault (cartella 90-Memoria-AI/auto-coscienza/) e li
// serviamo alla Cabina. €0: nessuna API Claude, solo lettura del vault.
// Spec/contratti: cervello/auto-coscienza.md.

const BASE = "90-Memoria-AI/auto-coscienza";

async function leggiJson(rel: string): Promise<any | null> {
  const raw = await readVaultFile(rel);
  if (raw == null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// 🛡️ Normalizzatore: il giro a volte scrive i JSON fuori dal contratto (nomi di campo o valori enum
// diversi). Qui rimappiamo le varianti più comuni sui campi che il Pannello legge, così le sezioni non
// restano vuote. NON inventa dati: copia solo da un sinonimo al campo giusto. La spec (cervello/*.md) resta
// la fonte di verità; questo è il paracadute per la deriva del giro.
function normStato(s: any): string {
  const v = String(s || "").toLowerCase();
  if (["confermato", "scelta_ragionata", "da_verificare", "scartato"].includes(v)) return v;
  if (v === "reale") return "confermato";
  if (v.includes("ragion")) return "scelta_ragionata";
  if (v.includes("conferm") || v.includes("verific") || v.includes("dubbi")) return "da_verificare";
  return v || "da_verificare";
}
// 🚫 Tipi che NON sono entità del mondo reale: sono concetti/metriche che un giro sbagliato
// a volte infila nel registro (es. «I 7 numeri» tipo "kpi-interni"). Non vanno MAI mostrati come
// «entità senza fondamento — bloccate»: un concetto non si «fonda» né si blocca. Si filtrano via.
const TIPI_NON_ENTITA = ["kpi-interni", "kpi", "numero", "numeri", "metrica", "metriche", "concetto", "dato", "dati"];
function eUnConcetto(e: any): boolean {
  const tipo = String(e?.tipo || "").toLowerCase().trim();
  if (TIPI_NON_ENTITA.includes(tipo)) return true;
  // Anche per nome: «i 7 numeri», «7 numeri», «numeri interni»…
  const nome = String(e?.nome || "").toLowerCase();
  return /\b\d?\s*numeri\b/.test(nome) || nome.startsWith("i 7 numeri");
}
function normalizza(d: { apprendimento: any; registro: any }) {
  // Lezioni: il giro a volte usa `lezione`/`come_applicare` invece di `testo`.
  const lez = d.apprendimento?.lezioni;
  if (Array.isArray(lez)) {
    for (const l of lez) {
      if (l && l.testo == null) l.testo = l.lezione ?? l.come_applicare ?? l.principio ?? "";
    }
  }
  // Registro entità: il giro a volte usa stati REALE/DA-CONFERMARE/NON-VERIFICABILE → rimappa,
  // e SCARTA i non-entità (concetti/metriche) così non finiscono tra le «bloccate».
  if (d.registro && Array.isArray(d.registro.entita)) {
    d.registro.entita = d.registro.entita.filter((e: any) => e && !eUnConcetto(e));
    for (const e of d.registro.entita) e.stato = normStato(e.stato);
  }
}

// 🩺 Un'auto-analisi è «affidabile» solo se ha davvero contenuto: un voto numerico in [0,100] E una
// sintesi non vuota. I giri rotti del VPS scrivono { voto_fiducia: 7, sintesi: "", salute: null }:
// un guscio vuoto. Restituire false fa sì che il Pannello NON mostri quel «7/100» come fosse credibile.
function analisiAffidabile(a: any): boolean {
  if (!a) return false;
  const v = Number(a.voto_fiducia);
  const votoOk = Number.isFinite(v) && v >= 0 && v <= 100;
  const sintesiOk = typeof a.sintesi === "string" && a.sintesi.trim().length >= 20;
  return votoOk && sintesiOk;
}

export async function GET() {
  const [analisi, apprendimento, miglioramento, calibrazione, registro] = await Promise.all([
    leggiJson(`${BASE}/auto-analisi.json`),
    leggiJson(`${BASE}/apprendimento.json`),
    leggiJson(`${BASE}/auto-miglioramento.json`),
    leggiJson(`${BASE}/calibrazione.json`),
    leggiJson(`${BASE}/registro-realta.json`),
  ]);

  const collegato = Boolean(analisi || apprendimento || miglioramento);
  if (!collegato) {
    return NextResponse.json({
      collegato: false,
      messaggio:
        "La macchina non ha ancora fatto la sua auto-analisi. Al prossimo giro (cervello/giro.md, passi Auto-analisi/Apprendimento) genera il primo verdetto su se stessa.",
    });
  }
  normalizza({ apprendimento, registro });
  // 🩺 Segnaliamo al Pannello se l'auto-analisi è un guscio vuoto (giro rotto): così mostra uno stato
  // «in aggiornamento» invece di un allarmante e falso «7/100». Il dato grezzo resta, ma marcato.
  const analisi_affidabile = analisiAffidabile(analisi);
  return NextResponse.json({ collegato: true, analisi, analisi_affidabile, apprendimento, miglioramento, calibrazione, registro });
}
