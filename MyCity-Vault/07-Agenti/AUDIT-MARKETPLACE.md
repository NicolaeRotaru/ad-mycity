---
tipo: pipeline
fonte: AD digitale
---

# 🩻 RADIOGRAFIA — analisi profonda e millimetrica del marketplace

> Comando: **"radiografia"** (alias: *"analizza tutto il sito"*, *"trova tutti i bug"*, *"audit totale"*).
> Trova TUTTI gli errori/bug/rischi del marketplace, con ogni problema **verificato** (niente falsi allarmi).
> È SOLA LETTURA: non tocca il codice né il sito.

## Cosa controlla (13 dimensioni, in parallelo)
architettura · sicurezza & autorizzazione · RLS/database · pagamenti/Stripe · privacy/GDPR (IT-EU) ·
performance · frontend/UX · accessibilità · QA & flussi critici (onboarding, carrello, checkout, COD, payout) ·
API/backend · endpoint AI · dati/analytics · deploy/SRE.

## Come funziona
1. **Radiografia:** un revisore senior per ogni dimensione legge il codice (`mycity-live`) e i dati (Supabase, sola lettura) e segnala ogni problema reale con file, severità, impatto e fix.
2. **Verifica avversariale:** ogni problema viene ricontrollato nel codice e si tengono **solo quelli veri** (scartati i falsi positivi). In caso di dubbio, si scarta.
3. **Report:** l'AD raccoglie tutto, toglie i duplicati, ordina per **gravità** (🔴 bloccante · 🟠 grave · 🟡 minore) e salva il report in `consegne/audit/AAAA-MM-GG-radiografia.md`, poi ti mostra in chat i **bloccanti** in cima.

## Motore
Workflow `radiografia` → `.claude/workflows/radiografia.js` (26 agenti: 13 revisori + 13 verificatori).
In alternativa/complemento esiste la skill `analizza-marketplace` (panel di esperti). La radiografia è
**approfondita**: dura di più ed è più costosa di "audit del marketplace" (check rapido). Usala quando vuoi il quadro COMPLETO.

## Output: come leggere il report
Ogni voce: titolo · file:riga · gravità · cosa succede · impatto · fix consigliato. I 🔴 bloccanti vanno
sistemati prima del lancio; i fix al codice passano dalla **corsia CODICE** ([[MODIFICA-MARKETPLACE]]): branch → anteprima → tuo ok.
