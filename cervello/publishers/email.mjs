// email.mjs — Publisher Email via Resend (newsletter / DEM ai clienti e negozianti).
//
// MANO: gratis (free tier Resend). Vedi collega-le-mani.md punto 4.
// CHIAVI necessarie (variabili d'ambiente):
//   RESEND_API_KEY   -> API key Resend
//   RESEND_FROM      -> mittente verificato (es. "MyCity <no-reply@tuodominio.it>")
//   EMAIL_TEST_TO    -> (opzionale) destinatario di prova per il calendario; in produzione
//                       la lista vera arriva da CRM/segmento, non da qui.
// ENDPOINT: https://api.resend.com/emails
//
// COLORE: 🔴 quando scrive a CLIENTI REALI (serve consenso GDPR — peer review legale-privacy).
//         🟢 solo verso EMAIL_TEST_TO (te stesso) per provare il template.

import { postJSON, conUtm, logRiga, esito } from "./_comune.mjs";

const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM || "MyCity <no-reply@mycity.example>";
const TEST_TO = process.env.EMAIL_TEST_TO;

export async function pubblica(voce, ctx) {
  const testo = conUtm(voce.testo, voce.utm);
  const to = voce.to || TEST_TO; // in dry-run mostra il destinatario previsto
  const subject = voce.subject || voce.titolo || "Novità da MyCity";
  const haChiavi = KEY && to;

  if (!ctx.live || !haChiavi) {
    logRiga(false, "email", `a ${to || "(lista CRM)"} :: oggetto "${subject}" :: ${testo.slice(0, 120)}…`);
    return esito("email", haChiavi ? "dry-run" : "manca-chiave", "RESEND_API_KEY + destinatario");
  }

  const r = await postJSON(
    "https://api.resend.com/emails",
    { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    { from: FROM, to, subject, text: testo }
  );
  logRiga(true, "email", r.ok ? `inviata a ${to}` : `errore ${r.status}`);
  return esito("email", r.ok ? "inviato" : "errore", r.ok ? "" : `${r.status} ${r.text}`);
}
