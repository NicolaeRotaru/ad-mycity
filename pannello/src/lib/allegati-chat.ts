// 📎 Upload allegati chat → blocco @ALLEGATO per il worker (prepara_allegati_chat in worker.sh).

export type AllegatoCaricato = { nome: string; tipo: string; percorso: string };

export function bloccoAllegatiDaRighe(allegati: AllegatoCaricato[]): string {
  if (!allegati.length) return "";
  const righe = allegati
    .map((a) => `@ALLEGATO nome="${a.nome}" tipo="${a.tipo}" percorso="${a.percorso}"`)
    .join("\n");
  return (
    `\n\n## Allegati di Nicola\nNicola ha allegato ${allegati.length} file a questo messaggio ` +
    `(foto o documenti). Sono nello storage: aprili e tienine conto nella risposta.\n${righe}`
  );
}

export async function caricaAllegatiChat(gruppoId: string, files: File[]): Promise<string> {
  if (!files.length) return "";
  const fd = new FormData();
  fd.append("gruppo_id", gruppoId);
  files.forEach((f) => fd.append("file", f));
  const up = await fetch("/api/allegato", { method: "POST", body: fd })
    .then((r) => r.json())
    .catch(() => null);
  if (!up?.ok) throw new Error(up?.error || "Caricamento degli allegati non riuscito.");
  return bloccoAllegatiDaRighe(up.allegati as AllegatoCaricato[]);
}
