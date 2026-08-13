// Ogni playbook e ogni analisi hanno il LORO nome (Nicola, 12/8/2026, screenshot dei Lavori:
// quattro caselle chiamate «analisi», «analisi», «playbook», «playbook»).
//
// Le richieste qui sotto NON sono inventate: sono copiate dalle righe vere della tabella `lavori`
// nella memoria (3.033 righe lette in sola lettura il 12/8). È la differenza tra provare il caso
// che esiste e provare quello che immaginavo.
import { test } from "node:test";
import assert from "node:assert/strict";
import { nomeLavoro, etichettaTipo } from "./nome-lavoro.ts";
import { raggruppaLavori, titoloLavoro, type LavoroBase } from "./lavori-gruppo.ts";
import { PLAYBOOKS } from "./playbook-catalogo.ts";

function lav(p: Partial<LavoroBase>): LavoroBase {
  return {
    id: p.id ?? "x",
    created_at: p.created_at ?? "2026-08-12T11:16:00Z",
    updated_at: p.updated_at ?? "2026-08-12T11:16:00Z",
    stato: p.stato ?? "fatto",
    tipo: p.tipo ?? "chat",
    ...p,
  } as LavoroBase;
}

// Le quattro caselle dello screenshot, con le richieste vere che stanno dietro.
const SCREENSHOT = [
  lav({
    id: "1",
    tipo: "analisi",
    richiesta:
      "Sentinella macchina 🧠 — SALUTE BASSA: il voto salute dell'architettura è 45 (< 60). Provvisorio 'pending-merge' 0/100: 110 difetti aperti-davvero (da lavorare), 84 già chiusi-in-codice in attesa di merge+deploy, 23 bloccanti.",
  }),
  lav({
    id: "2",
    tipo: "analisi",
    richiesta:
      "Sentinella azioni 💼 — NEGOZIO FERMO: 1 negozi LIVE con 0 ordini negli ultimi 14 giorni (Pane Quotidiano). Prepara un check-in personalizzato anti-churn per ciascuno (health score, cosa manca, upsell catalogo) e accodalo.",
  }),
  lav({
    id: "3",
    tipo: "playbook",
    richiesta:
      "PLAYBOOK Recupero carrelli: leggi i carrelli abbandonati reali, prepara l'email di recupero (oggetto + corpo + codice) e accodala in AZIONI-PRONTE per ogni cliente con carrello fermo. Niente invii: solo bozze pronte.",
  }),
  lav({
    id: "4",
    tipo: "playbook",
    richiesta:
      "PLAYBOOK Recensioni: individua le consegne completate senza recensione e prepara il messaggio post-consegna (grazie + richiesta recensione). Accoda in AZIONI-PRONTE.",
  }),
];

test("lo screenshot di Nicola: quattro caselle, quattro nomi diversi (mai «analisi»/«playbook»)", () => {
  const nomi = SCREENSHOT.map((l) => titoloLavoro(l));
  assert.equal(new Set(nomi).size, 4, `nomi ripetuti: ${nomi.join(" | ")}`);
  for (const n of nomi) {
    assert.ok(n && n !== "analisi" && n !== "playbook", `casella senza nome proprio: «${n}»`);
  }
  assert.equal(nomi[2], "🛒 Recupero carrelli abbandonati");
  assert.equal(nomi[3], "⭐ Caccia recensioni");
  assert.ok(nomi[0].startsWith("🧠 Salute bassa"), nomi[0]);
  assert.ok(nomi[1].startsWith("💼 Negozio fermo"), nomi[1]);
});

test("ogni playbook del catalogo prende il nome del catalogo, e sono tutti diversi", () => {
  const nomi = PLAYBOOKS.map((p) => nomeLavoro({ tipo: "playbook", richiesta: p.compito }));
  for (const [i, p] of PLAYBOOKS.entries()) {
    assert.equal(nomi[i], `${p.emoji} ${p.titolo}`, `playbook ${p.id}`);
  }
  assert.equal(new Set(nomi).size, PLAYBOOKS.length, "due playbook non possono chiamarsi uguale");
});

test("due allarmi della stessa sentinella restano distinguibili (il dettaglio entra nel nome)", () => {
  const a = nomeLavoro({
    tipo: "analisi",
    richiesta: "Sentinella macchina 🧠 — SALUTE BASSA: il voto salute dell'architettura è 45 (< 60). Altro testo.",
  });
  const b = nomeLavoro({
    tipo: "analisi",
    richiesta: "Sentinella macchina 🧠 — SALUTE BASSA: il voto salute dell'architettura è 9 (< 60). Altro testo.",
  });
  assert.notEqual(a, b);
});

test("le altre forme di analisi che la macchina scrive davvero hanno un nome loro", () => {
  const casi: [string, string][] = [
    [
      "Sentinella macchina 🧠 — SENSORE CIECO: almeno un sensore dati è cieco da 3 giri (sensori-cecita.json). Controlla il .env sul VPS.",
      "🧠 Sensore cieco",
    ],
    [
      "Sentinella macchina 🧠 — AUTO-RADIOGRAFIA SCADUTA: sono passati 12 giorni dall'ultima radiografia completa di te stessa.",
      "🧠 Auto-radiografia scaduta",
    ],
    [
      "Sentinella macchina 🧠 — FONTI WEB MORTE: fonti-salute.json segnala 3 fonte/i peso≥4 morte da ≥3 controlli (comune-news).",
      "🧠 Fonti web morte",
    ],
  ];
  const nomi = casi.map(([richiesta]) => nomeLavoro({ tipo: "analisi", richiesta }));
  for (const [i, [, atteso]] of casi.entries()) {
    assert.ok(nomi[i].startsWith(atteso), `«${nomi[i]}» non comincia con «${atteso}»`);
  }
  assert.equal(new Set(nomi).size, casi.length);
});

test("una riapprovazione porta il nome dell'azione originale, con 🔄 davanti", () => {
  const n = nomeLavoro({
    tipo: "playbook",
    richiesta:
      "RIPROVA (riapprovata da Nicola dal Pannello il 2026-07-23T14:24:23.087Z). Azione originale fallita:\n\nPLAYBOOK Recupero carrelli: leggi i carrelli abbandonati reali, prepara l'email di recupero (oggetto + corpo + codice) e accodala in AZIONI-PRONTE.",
  });
  assert.equal(n, "🔄 🛒 Recupero carrelli abbandonati");
});

test("le altre specie di lavoro: cadenza recuperata, proposta, azione, casella, giro", () => {
  assert.equal(
    nomeLavoro({
      tipo: "ritmo-mattino",
      richiesta:
        "Recupero automatico della cadenza «Piano del mattino» saltata per rate-limit del motore AI. Riesegui la sezione ritmo 'mattino'.",
    }),
    "Recupero «Piano del mattino»",
  );
  assert.equal(
    nomeLavoro({
      tipo: "proposta",
      richiesta:
        "Nicola ha APPROVATO dal Pannello questa PROPOSTA DAL GIRO:\n«Inserisci il BURN mensile nel VPS per calcolare il runway»\nMotivo/contesto: Sconosciuto da 116+ giri.",
    }),
    "Proposta approvata: Inserisci il BURN mensile nel VPS per calcolare il runway",
  );
  assert.equal(
    nomeLavoro({
      tipo: "esegui-azione",
      richiesta:
        'È stata APPROVATA dal Pannello l\'azione "Cambia come si chiudono le PR" (canale GitHub — merge PR). Ricava il resto dalla scheda.',
    }),
    "Azione approvata: Cambia come si chiudono le PR",
  );
  assert.equal(
    nomeLavoro({ tipo: "chat", richiesta: "## Casella del Pannello: Esperimento prezzi\n\n## Nuovo messaggio di Nicola\nva bene" }),
    "Esperimento prezzi",
  );
  assert.equal(nomeLavoro({ tipo: "giro", richiesta: "Giro di perlustrazione richiesto a mano dal Pannello." }), "Giro di perlustrazione");
});

test("una chat si chiama col messaggio di Nicola, non col contesto che gli sta sopra", () => {
  const n = nomeLavoro({
    tipo: "chat",
    richiesta:
      "## Memoria chat precedenti (ultime sessioni)\n[Controlla qui prima di chiedere a Nicola se qualcosa è già stato fatto]\n\n## Nuovo messaggio di Nicola\nogni playbook ed ogni analisi devono avere il loro nome",
  });
  assert.equal(n, "ogni playbook ed ogni analisi devono avere il loro nome");
});

test("senza richiesta (poll leggero) il ripiego è italiano, MAI la sigla del tipo", () => {
  for (const tipo of ["analisi", "playbook", "chat", "ritmo-mattino", "esegui-azione", "metabolizza"]) {
    const n = titoloLavoro(lav({ tipo }));
    assert.notEqual(n, tipo, `il ripiego di «${tipo}» è ancora la sigla tecnica`);
    assert.ok(/^[A-ZÀ-Ý]/.test(n), `«${n}» non sembra un'etichetta scritta per una persona`);
  }
  assert.equal(etichettaTipo("ritmo-sera"), "Report della sera");
  // Un tipo mai visto prima non deve comunque uscire come slug.
  assert.equal(etichettaTipo("nuovo-tipo_mai-visto"), "Nuovo tipo mai visto");
});

test("il nome calcolato dal server (campo titolo) vince su tutto", () => {
  const n = titoloLavoro(lav({ tipo: "analisi", titolo: "💼 Negozio fermo: Pane Quotidiano", richiesta: "" }));
  assert.equal(n, "💼 Negozio fermo: Pane Quotidiano");
});

test("nella lista raggruppata ogni casella resta col suo nome (nessun doppione «playbook»)", () => {
  const gruppi = raggruppaLavori(SCREENSHOT.map((l, i) => ({ ...l, gruppo_id: `g${i}` })));
  const titoli = gruppi.map((g) => g.titolo);
  assert.equal(new Set(titoli).size, 4, titoli.join(" | "));
  assert.ok(!titoli.includes("playbook") && !titoli.includes("analisi"));
});

test("una conversazione a più messaggi prende il nome del messaggio che l'ha aperta", () => {
  const gruppi = raggruppaLavori([
    lav({ id: "a", gruppo_id: "g", created_at: "2026-08-12T10:00:00Z", richiesta: "## Casella del Pannello: Sblocca Pane Quotidiano" }),
    lav({ id: "b", gruppo_id: "g", created_at: "2026-08-12T10:05:00Z", richiesta: "## Nuovo messaggio di Nicola\nok procedi" }),
  ]);
  assert.equal(gruppi.length, 1);
  assert.equal(gruppi[0].titolo, "Sblocca Pane Quotidiano");
});

test("il nome sta in due righe di card: mai più lungo di 100 caratteri", () => {
  const lungo = nomeLavoro({
    tipo: "analisi",
    richiesta: `Sentinella macchina 🧠 — SALUTE BASSA: ${"parola ".repeat(60)}`,
  });
  assert.ok(lungo.length <= 101, `nome lungo ${lungo.length}`);
});
