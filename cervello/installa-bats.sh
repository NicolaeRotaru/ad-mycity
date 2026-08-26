#!/usr/bin/env bash
# 🐚 CHI ESEGUE LE PROVE SCRITTE IN BASH — AR-693, clausola ①.
#
# IL DIFETTO. In `cervello/test/` vivono ventinove prove scritte in bash. Girano solo se `bats` è
# installato, e non lo installava nessuno: né la CI, né il VPS, né l'avvio di sessione. In tutto il
# repo l'unica traccia era un PERMESSO (`Bash(npx bats:*)` in .claude/settings.json) — cioè
# l'autorizzazione a lanciarlo, che non è qualcuno che lo lancia.
#
# IL CONTO, misurato il 26/8/2026 su questo stesso commit: installare bats costa **937 millisecondi**
# e fa uscire **dieci file rossi, diciannove casi caduti**, invisibili da mesi. Non perché qualcuno
# mentisse: perché la macchina che misura non aveva lo strumento per guardare.
#
# PERCHÉ UN FILE E NON QUATTRO RIGHE COPIATE. Le stesse quattro righe in CI, nel gancio di sessione e
# nel setup del VPS sono tre copie che si allontanano — è la malattia già censita
# `cadenza-copiata-a-mano`. Qui c'è una casa sola: chi la chiama eredita anche le correzioni.
#
# IDEMPOTENTE E SILENZIOSO SE C'È GIÀ: chiamarlo a ogni avvio di sessione non deve costare niente e
# non deve stampare niente quando non c'è niente da dire.
#
# NON FALLISCE MAI (exit 0 sempre), e la ragione è la stessa che tiene in piedi il resto della casa:
# questo script sta dentro un gancio di sessione e dentro la CI. Se una rete chiusa lo facesse
# uscire ≠0 fermerebbe l'avvio della sessione o il workflow — cioè un guardiano che si impara a
# togliere. Chi misura davvero il buco è `cervello/debito-prove-bash.mjs`, e il banco dichiara le
# prove non eseguite una per una col comando che le cura (cervello/cecita-curabile.mjs).
set -u

if command -v bats >/dev/null 2>&1; then
  exit 0
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "installa-bats: npm non c'è, non posso installare bats — le prove in bash resteranno ⚪." >&2
  exit 0
fi

# `bats` è il pacchetto npm di bats-core. Globale apposta: il banco lo cerca nel PATH e in
# node_modules/.bin, e questo repo non ha un package.json alla radice in cui metterlo.
#
# ⏱️ SOTTO TIMEOUT, e il motivo l'ha trovato la radiografia del perimetro (26/8, lente
# `cadenza-esecuzione`): questo script sta dentro il gancio SessionStart, che parte a OGNI sessione.
# Un `npm` che aspetta una rete che non risponde bloccherebbe l'avvio della sessione — cioè un
# guardiano che si impara a togliere entro la settimana. Novecento millisecondi è quanto costa
# davvero; sessanta secondi è già dieci volte il peggio ragionevole. Se `timeout` non c'è (macchine
# minime), si procede senza: meglio un rischio raro che rifiutarsi di installare.
_con_timeout() { if command -v timeout >/dev/null 2>&1; then timeout "${INSTALLA_BATS_TIMEOUT:-60}" "$@"; else "$@"; fi; }

if _con_timeout npm i -g bats >/dev/null 2>&1; then
  command -v bats >/dev/null 2>&1 && echo "installa-bats: bats $(bats --version 2>/dev/null | awk '{print $2}') installato — le 29 prove in bash adesso le esegue qualcuno."
  exit 0
fi

echo "installa-bats: non sono riuscito a installare bats (rete? permessi? timeout?) — le prove in bash restano ⚪, e il comando per curarle è \`npm i -g bats\`." >&2
exit 0
