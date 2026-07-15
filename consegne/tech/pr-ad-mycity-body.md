## Summary
- Chiude gli **ultimi 2** finding «Rischio tecnico»: auto-fix senza chiusura automatica; perimetro Cursor documentato (guardiani a valle).
- `allinea-scan-cantiere`: **0 finding aperti** su rischio-sicurezza-se.
- Scan Resend senza falsi positivi su testi normali.

## Test plan
- [ ] `node cervello/allinea-scan-cantiere.mjs` → rischio-sicurezza-se: 0 aperti
- [ ] Dopo merge: Ctrl+Shift+R → Radiografia › Rischio tecnico vuota
