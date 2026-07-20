// AR-115 — self-check parsing date e rilevamento target scaduti
import assert from "node:assert/strict";

function parseDataBreve(testo, ref) {
  const m = testo.match(/(?:entro\s+)?(?:lun|mar|mer|gio|ven|sab|dom)?\s*(\d{1,2})\/(\d{1,2})/i);
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  return new Date(Date.UTC(ref.y, month - 1, day));
}

const ref = { y: 2026, m: 7, d: 20 };
const scaduto = parseDataBreve("1° ordine reale entro sab 27/6", ref);
const oggi = new Date(Date.UTC(2026, 6, 20));
assert.ok(scaduto < oggi, "27/6 deve risultare scaduto il 20/7/2026");

const futuro = parseDataBreve("entro 30/7", ref);
assert.ok(futuro > oggi, "30/7 deve risultare futuro il 20/7/2026");

console.log("freschezza-okr self-check ok");
