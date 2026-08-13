import { creaLavoro, getImpostazione, setImpostazione, memoryConnected } from "@/lib/store";
import { PLAYBOOKS, playbookDaEseguire, type Playbook } from "@/lib/playbook-catalogo";

// 🗡️ I PLAYBOOK dell'arsenale: le leve "dietro le quinte" come lavori ricorrenti.
// Parte deterministica = GRATIS (decidere COSA fare e accodarlo). La scrittura vera
// (copy, analisi) la fa poi il cervello (Max gratis quando fai il giro, o l'API a contagocce).
// Ogni playbook ha: la leva, la cadenza, e il "compito" che accoda al cervello.
//
// L'elenco vero vive in `playbook-catalogo.ts` (dato puro, senza import): serve anche al Pannello
// per dare a ogni lavoro il NOME del suo playbook, e il Pannello non deve tirarsi dietro il
// database. Qui lo si ri-esporta perché chi importava da "@/lib/playbook" continui a trovarlo.
export { PLAYBOOKS, playbookDaEseguire };
export type { Playbook };

function oggiRoma(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(new Date()); // AAAA-MM-GG
}
function giornoSettimanaRoma(): number {
  const g = new Date().toLocaleDateString("en-US", { timeZone: "Europe/Rome", weekday: "short" });
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g);
}

// GRATIS: accoda al cervello i playbook "dovuti" oggi, una sola volta al giorno (dedup).
export async function accodaPlaybookDelGiorno(): Promise<number> {
  if (!memoryConnected()) return 0;
  const oggi = oggiRoma();
  const due = playbookDaEseguire(giornoSettimanaRoma());
  let n = 0;
  for (const p of due) {
    const k = `pb:${p.id}:${oggi}`;
    if (await getImpostazione(k)) continue; // già accodato oggi
    const l = await creaLavoro(p.compito, "playbook").catch(() => null);
    if (!l) continue; // creazione fallita → riprova al prossimo giro (niente stato falso)
    const ora = new Date().toISOString();
    await setImpostazione(k, ora).catch(() => {}); // dedup giornaliero
    await setImpostazione(`pb:${p.id}:ultimo`, ora).catch(() => {}); // ultimo accodamento (qualsiasi giorno)
    n++;
  }
  return n;
}

// Stato per la Cabina: per ogni playbook l'ULTIMO accodamento reale (qualsiasi giorno)
// e se è di oggi. Così i settimanali non sembrano "in attesa" da martedì a domenica.
export async function statoPlaybook(): Promise<{ id: string; ultimo: string | null; oggi: boolean }[]> {
  const oggi = oggiRoma();
  const out: { id: string; ultimo: string | null; oggi: boolean }[] = [];
  for (const p of PLAYBOOKS) {
    const ultimo = await getImpostazione(`pb:${p.id}:ultimo`).catch(() => null);
    const eraOggi = ultimo
      ? new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(new Date(ultimo)) === oggi
      : false;
    out.push({ id: p.id, ultimo, oggi: eraOggi });
  }
  return out;
}
