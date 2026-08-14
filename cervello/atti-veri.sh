#!/usr/bin/env bash
# 🏷️ GENERATO DA cervello/atti-veri.mjs — NON modificare a mano.
# Rigenera con:  node cervello/atti-veri.mjs --bash > cervello/atti-veri.sh
#
# Quali lavori toccano il mondo reale (soldi, email, invii): non si riaccodano MAI da soli.
# La casa della lista è il modulo; questo file è la sua faccia per la shell.
ATTI_VERI="esegui-azione proposta"

# Uso:  if _e_un_atto_vero "$tipo"; then ... ; fi     (0 = sì, 1 = no)
_e_un_atto_vero() {
  case " $ATTI_VERI " in
    *" ${1:-} "*) return 0 ;;
  esac
  return 1
}
