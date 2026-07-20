// AR-113 — gate north-star: stallo breve ok, stallo lungo fallisce in --gate
import assert from "node:assert/strict";

function giorniGate(ore, soglia = 3) {
  return ore / 24 >= soglia;
}

assert.equal(giorniGate(48), false, "2 gg sotto soglia 3");
assert.equal(giorniGate(72), true, "3 gg attiva gate");
assert.equal(giorniGate(636), true, "26 gg attiva gate");

const sample = "Business invariato · stallo ~636h (~26,4 giorni)";
const parsed = sample.match(/stallo[^~]*~?\s*(\d+)\s*h/i);
assert.ok(parsed, "regex stallo");
assert.equal(Number(parsed[1]), 636);
console.log("north-star gate self-check ok");
