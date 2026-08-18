import { test } from "node:test";
import assert from "node:assert/strict";
import { dataLezione, lezioneRecente } from "./data-lezione.ts";

// I casi VERI, presi dal file del 18/8: le due forme che convivono in apprendimento.json.
const ricca = { id: "L-2026-0815-001", nato: "2026-08-15", ultima_conferma: "2026-08-15 10:45", stato: "attiva" };
const sottile = { id: "L-2026-0817-04", data: "2026-08-17 23:08" }; // scritta da lezione-nuova.mjs
const oggi = new Date("2026-08-18T07:45:00");

test("il caso vero: la lezione scritta ieri dalla macchina risulta recente, non invisibile", () => {
  assert.ok(lezioneRecente(sottile, 7, oggi), "e' il difetto che faceva dire «0 lezioni negli ultimi 7 giorni»");
});

test("la forma storica continua a funzionare: il ripiego aggiunge, non sostituisce", () => {
  assert.ok(lezioneRecente(ricca, 7, oggi));
  assert.equal(dataLezione(ricca)?.toISOString().slice(0, 10), "2026-08-15");
});

test("la conferma piu' recente vince sulla nascita, e la nascita vince sulla scrittura", () => {
  assert.equal(dataLezione({ nato: "2026-08-01", ultima_conferma: "2026-08-15 10:45" })?.toISOString().slice(0, 10), "2026-08-15");
  assert.equal(dataLezione({ nato: "2026-08-01", data: "2026-08-15 10:45" })?.toISOString().slice(0, 10), "2026-08-01");
});

test("una lezione vecchia non diventa recente per il ripiego: il campo nuovo non allarga la finestra", () => {
  assert.equal(lezioneRecente({ data: "2026-07-01 09:00" }, 7, oggi), false);
});

test("senza nessuna delle tre date resta senza data: qui si legge, non si inventa un giorno", () => {
  assert.equal(dataLezione({ id: "L-x" } as never), null);
  assert.equal(dataLezione(null), null);
  assert.equal(dataLezione({ data: "non e' una data" }), null);
  assert.equal(lezioneRecente({ id: "L-x" } as never, 7, oggi), false);
});

// La prova che conta davvero: il conto sull'ARCHIVIO VERO, non su tre oggetti inventati.
// Se questo numero torna a 0 mentre l'archivio ha lezioni fresche, il difetto e' tornato.
test("sull'archivio vero il conto non e' muto: le lezioni fresche si vedono", async () => {
  const fs = await import("node:fs");
  const p = new URL("../../../MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json", import.meta.url);
  if (!fs.existsSync(p)) return; // fuori dal repo completo la prova non mente: si astiene
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  const lez: ConDataLike[] = j.lezioni || [];
  type ConDataLike = { ultima_conferma?: string; nato?: string; data?: string };
  const serviti = lez.slice(-60); // esattamente cio' che la route manda al telefono (MAX_LEZIONI)
  const conData = serviti.filter((l) => dataLezione(l) !== null).length;
  assert.ok(
    conData >= serviti.length * 0.9,
    `su 60 lezioni servite, ${serviti.length - conData} restano senza data leggibile: la scheda tornerebbe a contare meno del vero`,
  );
});
