#!/bin/sh
# c4-askpass.sh — la password che git chiede, presa DALL'AMBIENTE (AR-278).
#
# Perché esiste. Prima il token di GitHub viaggiava dentro l'indirizzo del repo
# (`https://x-access-token:$GIT_PUSH_TOKEN@github.com/...`), e l'indirizzo è un ARGOMENTO del
# comando: su Linux gli argomenti di un processo li legge chiunque giri sulla macchina, con `ps` o
# leggendo /proc. Questo file è il canale standard di git per chiedere una password senza metterla
# in riga di comando: git lo esegue come programma figlio, e il figlio eredita l'ambiente — dove il
# token può stare, perché quello è l'unico posto dove un segreto vive.
#
# Non contiene nessun segreto: legge quello che c'è nell'ambiente e lo stampa a git, e basta.
# Se l'ambiente è vuoto stampa una riga vuota: git fallisce l'autenticazione con un errore chiaro,
# invece di provare con una password sbagliata inventata qui.
printf '%s\n' "${GIT_PUSH_TOKEN:-${GIT_TOKEN:-}}"
