// Le cinque trappole di misura pagate il 30/7, provate sui comandi VERI che le hanno generate.
//
// Ogni caso qui sotto è un comando che ho davvero lanciato quel giorno, con la conclusione sbagliata
// che ne ho tratto. Non sono esempi didattici: sono le prove del reato. E per ognuno c'è la
// controprova — la forma corretta NON deve essere segnalata, altrimenti l'avvisatore diventa rumore
// e si impara a scorrerlo, che è il modo in cui muore un guardiano.

import { test } from "node:test";
import assert from "node:assert/strict";
import { misuraCieca, bustaPerIlModello, TRAPPOLE } from "../misura-cieca.mjs";

const ids = (c) => misuraCieca(c).map((t) => t.id);

test("① $? dopo una pipe: è l'uscita di head, non del comando", () => {
  // Il vero: `node cervello/sorvegliante.mjs --staged | head -60` poi EXIT=$? → sempre 0.
  assert.ok(ids('node cervello/sorvegliante.mjs --staged | head -60\necho "EXIT=$?"').includes("uscita-dopo-la-pipe"));
  assert.ok(ids('git commit -m "x" 2>&1 | tail -14; echo "esito: $?"').includes("uscita-dopo-la-pipe"));
});

test("… e la forma corretta non viene segnalata", () => {
  assert.deepEqual(ids('out=$(node cervello/sorvegliante.mjs --staged); code=$?; echo "$out"; echo "EXIT=$code"'), []);
});

test("② errore in /dev/null e poi una conclusione dal fallimento", () => {
  // Il vero: mi ha fatto concludere «zero hook configurati» mentre ce n'era uno.
  assert.ok(ids('node -e "const s=require(\'.claude/settings.json\')" 2>/dev/null || echo "(assente)"').includes("errore-in-nulla-poi-fallback"));
});

test("… ma tenere stderr, o usare /dev/null senza trarne conclusioni, va bene", () => {
  assert.deepEqual(ids('node -e "require(\'./.claude/settings.json\')" || echo "davvero assente"'), []);
  assert.deepEqual(ids("git fetch origin main 2>/dev/null"), [], "silenziare senza concludere non è la trappola");
});

test("③ git diff dopo aver messo in stage: mostra vuoto e sembra «non è cambiato niente»", () => {
  // Il vero: `git checkout <ref> -- .claude/settings.json` poi `git diff --stat` → vuoto,
  // e ho concluso che main avesse già il file. Non l'aveva.
  assert.ok(ids("git checkout origin/ramo -- .claude/settings.json\ngit diff --stat").includes("diff-che-non-guarda-lo-stage"));
  assert.ok(ids("git add -A; git diff --stat").includes("diff-che-non-guarda-lo-stage"));
});

test("… e le forme che vedono lo stage non vengono segnalate", () => {
  assert.deepEqual(ids("git add -A; git diff --cached --stat"), []);
  assert.deepEqual(ids("git add -A; git status --short"), []);
  assert.deepEqual(ids("git add -A; git diff HEAD --stat"), []);
});

test("④ un cd seguito da `;`: se fallisce, il silenzio del comando dopo sembra un verde", () => {
  // Il vero: `cd <scratchpad>; node cervello/test-cervello.mjs | grep ❌` → niente, e ho letto
  // «nessun test rosso» mentre il comando non era proprio partito.
  assert.ok(ids("cd /tmp/scratchpad; node cervello/test-cervello.mjs").includes("cd-che-puo-fallire"));
});

test("… con && il fallimento si propaga, quindi non è la trappola", () => {
  assert.deepEqual(ids("cd /tmp/scratchpad && node cervello/test-cervello.mjs"), []);
});

test("⑤ una prova che passerebbe anche sulla versione sbagliata", () => {
  // Il vero: ho verificato «il JSON è valido» per dimostrare che il file contenesse l'hook.
  // Passa identico sulla versione senza hook: un verde vuoto.
  assert.ok(ids(`node -e "JSON.parse(require('fs').readFileSync('.claude/settings.json','utf8'));console.log('✅ valido')"`).includes("prova-che-non-puo-dire-no"));
});

test("… ma se cerca davvero il contenuto, la prova può dire di no e va bene", () => {
  assert.deepEqual(
    ids(`node -e "const s=JSON.parse(require('fs').readFileSync('.claude/settings.json','utf8')); console.log(Object.keys(s.hooks).includes('PostToolUse')?'✅':'❌')"`),
    [],
  );
  assert.deepEqual(ids('grep -c "PostToolUse" .claude/settings.json'), []);
});

test("un comando innocuo non viene segnalato: il rumore spegne i guardiani", () => {
  for (const c of ["git status --short", "node --test cervello/test/x.test.mjs", "ls -la cervello/", ""]) {
    assert.deepEqual(ids(c), [], `«${c}» non deve produrre avvisi`);
  }
});

test("ogni trappola porta con sé cosa fare invece: un avviso senza rimedio è solo un rimprovero", () => {
  for (const t of TRAPPOLE) {
    assert.ok(t.invece && t.invece.length > 15, `${t.id} deve dire cosa fare al posto suo`);
    assert.ok(t.cosa && t.cosa.length > 15, `${t.id} deve spiegare il danno, non solo nominarlo`);
  }
  assert.equal(TRAPPOLE.length, 6, "le sei forme misurate sul campo, non una teoria della shell");
});

// ─────────────────────────────────────────────────────────────────────────────
// LA SESTA FORMA (17/8). Il caso vero: dopo il merge della cura della chat ho contato su main
// `grep -c "contesto-lezioni.mjs --richiesta --testo"`, è uscito 0, e ho detto a Nicola che la riga
// non c'era. C'era: nel codice vero fra `.mjs` e `--richiesta` sta una virgoletta di chiusura,
// quindi quella frase non esiste da nessuna parte. Lo zero non diceva «non c'è», diceva «hai
// cercato una frase che non hai mai scritto» — e i due suonano identici.
// ─────────────────────────────────────────────────────────────────────────────

test("il caso vero: contare una frase lunga che una virgoletta può spezzare", () => {
  assert.ok(
    ids('git show origin/main:cervello/worker.sh | grep -c "contesto-lezioni.mjs --richiesta --testo"').includes("zero-su-una-frase-lunga"),
    "è il comando esatto che mi ha fatto dire una cosa falsa a Nicola",
  );
});

test("vale anche per grep -q, dove il verdetto è un sì/no e lo zero non si vede nemmeno", () => {
  assert.ok(ids(`grep -q 'la funzione riceve il messaggio e chiede' cervello/worker.sh`).includes("zero-su-una-frase-lunga"));
});

test("una parola sola non viene segnalata: è il pezzo corto, cioè proprio il rimedio suggerito", () => {
  assert.deepEqual(ids('grep -c "lezioni_tema" cervello/worker.sh'), []);
  assert.deepEqual(ids(`grep -q "PostToolUse" .claude/settings.json`), []);
});

test("un grep che STAMPA le righe non viene segnalato: lì il vuoto si vede, non si scambia per una risposta", () => {
  assert.deepEqual(ids('grep -n "contesto-lezioni.mjs --richiesta --testo" cervello/worker.sh'), []);
});

test("due parole corte non bastano: la trappola è la frase lunga, e il rumore spegne i guardiani", () => {
  assert.deepEqual(ids('grep -c "node cervello" giro.sh'), []);
});

// ─────────────────────────────────────────────────────────────────────────────
// IL CANALE (AR-463). Il riconoscitore era pronto e provato dal 30/7, e sarebbe stato attaccato a un
// hook dove stampava TESTO SEMPLICE: per un PostToolUse che esce 0 vuol dire finire nel log di debug.
// Cioè: una guardia contro le misure cieche, consegnata come misura cieca. Terza volta in due giorni.
// ─────────────────────────────────────────────────────────────────────────────

test("la busta è JSON: in testo semplice il verdetto sparisce nel log e la guardia parla a nessuno", () => {
  const busta = bustaPerIlModello(misuraCieca('node x.mjs | head -3; echo "EXIT=$?"'));
  assert.doesNotThrow(() => JSON.parse(busta), "l'uscita hook DEVE essere JSON, o non arriva al modello");
});

test("la busta si dichiara PostToolUse e porta dentro il verdetto, non solo l'involucro", () => {
  const b = JSON.parse(bustaPerIlModello(misuraCieca('git add -A; git diff --stat')));
  assert.equal(b.hookSpecificOutput.hookEventName, "PostToolUse");
  assert.match(b.hookSpecificOutput.additionalContext, /MISURA CIECA/);
  assert.ok(b.hookSpecificOutput.additionalContext.includes("→"), "deve dire anche cosa fare al posto suo");
});

test("comando pulito = nessuna busta: un avvisatore che parla sempre viene spento entro la settimana", () => {
  assert.equal(bustaPerIlModello(misuraCieca("node cervello/test-cervello.mjs")), null);
  assert.equal(bustaPerIlModello([]), null);
});

// ── il secondo passeggero: il verdetto del sorvegliante (AR-502) ──────────────
//
// Il sorvegliante è agganciato a `Edit|Write|MultiEdit`: un `sed -i`, uno script che riscrive un
// file, un `git checkout -- file` non lo svegliavano. Questo hook sul Bash c'è già, e i due verdetti
// devono viaggiare in UNA busta sola — l'hook legge una sola uscita, e due buste stampate di fila
// non sono JSON: la seconda finirebbe nel nulla, che è il difetto che questi due file curano.

test("il verdetto del sorvegliante entra nella busta del comando", () => {
  const b = JSON.parse(bustaPerIlModello([], "👁️ SORVEGLIANTE — 3 file toccati\n❌ difesa-rimossa · x.mjs"));
  assert.match(b.hookSpecificOutput.additionalContext, /difesa-rimossa/, "senza questo, le modifiche fatte da un comando restano senza guardia");
  assert.equal(b.hookSpecificOutput.hookEventName, "PostToolUse");
});

test("…e viaggia INSIEME alle trappole, non al posto loro", () => {
  const b = JSON.parse(bustaPerIlModello(misuraCieca('node x.mjs | head -3; echo "EXIT=$?"'), "👁️ SORVEGLIANTE — 1 file toccato"));
  const ctx = b.hookSpecificOutput.additionalContext;
  assert.match(ctx, /MISURA CIECA/, "il mestiere di questo file resta il suo");
  assert.match(ctx, /SORVEGLIANTE/, "e l'altro verdetto arriva accanto, non invece");
});

test("una busta sola: due JSON stampati di fila non sono JSON", () => {
  const testo = bustaPerIlModello(misuraCieca("cd /x; ls"), "👁️ SORVEGLIANTE — 1 file toccato");
  assert.doesNotThrow(() => JSON.parse(testo), "se qui ne uscissero due, l'hook non leggerebbe né l'uno né l'altro");
});
