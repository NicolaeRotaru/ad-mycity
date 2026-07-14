## Summary
- **Rischio tecnico (6/8 fix):** sistema immunitario verifica `core.hooksPath` attivo (non solo file hook); `monitora.sh` allinea con rebase non distruttivo (niente `checkout -f -B`); hook git attivati all'avvio di giro/worker; scan-segreti copre chiavi Resend/n8n; sensori con timeout 8s; meta-guardiano `freschezza-segnali.mjs`; auto-fix in giro senza `--applica` automatico.
- **Memoria:** `allinea-scan-cantiere` chiude 6 findings «Rischio tecnico» nello scan radiografia (restano 2 decisioni umane: permessi Cursor e chiusura difetti via regex).

## Test plan
- [ ] `grep -q 'core.hooksPath' cervello/sistema-immunitario.mjs && ! grep -q 'checkout -f -B' cervello/monitora.sh`
- [ ] `node cervello/allinea-scan-cantiere.mjs` → area rischio-sicurezza-se: 2 aperti (tipo umano), 6 chiusi
- [ ] Dopo merge: Ctrl+Shift+R su Radiografia macchina nel Pannello
