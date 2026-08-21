#!/usr/bin/env bash
# 🧷 RICONCILIA LA MEMORIA DEL SERVER RIMASTA INDIETRO. 🟡 Archivia prima, poi allinea.
#
# IL PROBLEMA CHE RISOLVE. Dal 18/8 il server ha continuato a scrivere memoria e a non riuscire a
# pubblicarla: venti commit fermi lassù. Il riallineamento automatico prova un rebase, trova
# conflitti sugli stessi file di memoria che intanto main ha riscritto (AZIONI-IN-ATTESA, STATO e i
# report di auto-coscienza) e — giustamente — si ferma invece di cancellare il lavoro del server.
#
# Rifare a mano venti rebase con otto file in conflitto ciascuno non è un lavoro: è un modo di
# sbagliare. Questo copione fa la cosa onesta:
#
#   ① ARCHIVIA tutto quello che il server ha e main no: un bundle git (ripristinabile intero), la
#      patch leggibile, e l'elenco dei commit. Da lì non si perde niente, mai.
#   ② SEPARA il grano dalla paglia. I report di auto-coscienza li rigenerano i motori a ogni giro:
#      la copia di dodici giorni fa non serve a nessuno. La STORIA invece (briefing, decisioni,
#      quaderni dei reparti) è append-only e non si rigenera: quella si guarda prima di lasciarla.
#   ③ ALLINEA il ramo a origin/main, così il server torna a pubblicare da domani.
#
# Non fa mai force-push, non tocca main, non cancella l'archivio. In prova non scrive niente.
#
# Uso:
#   bash cervello/vps/riconcilia-memoria.sh            -> PROVA: dice cosa farebbe
#   bash cervello/vps/riconcilia-memoria.sh --esegui   -> archivia e allinea
set -euo pipefail

REPO="${REPO:-/opt/mycity/ad-mycity}"
RAMO="${GIT_BRANCH:-main}"
ESEGUI=0
[ "${1:-}" = "--esegui" ] && ESEGUI=1

cd "$REPO"

STAMPO="$(date '+%Y%m%d-%H%M%S')"
ARCHIVIO="${ARCHIVIO:-$REPO/consegne/memoria-server-$STAMPO}"

# I file che i motori rigenerano da soli: la copia vecchia del server non aggiunge niente.
RIGENERATI='MyCity-Vault/90-Memoria-AI/auto-coscienza/'
# La storia che NON si rigenera: se il server ne ha scritta, va guardata prima di lasciarla indietro.
STORIA='MyCity-Vault/90-Memoria-AI/Briefing/ MyCity-Vault/90-Memoria-AI/DECISIONI.md MyCity-Vault/90-Memoria-AI/SALA-OPERATIVA.md memoria-squadra/ consegne/'

echo "🧷 RICONCILIAZIONE DELLA MEMORIA DEL SERVER"
echo

git fetch origin "$RAMO" --quiet 2>/dev/null || { echo "❌ non riesco a scaricare origin/$RAMO"; exit 1; }

SOLO_QUI="$(git rev-list --count "origin/$RAMO..HEAD" 2>/dev/null || echo 0)"
SOLO_LA="$(git rev-list --count "HEAD..origin/$RAMO" 2>/dev/null || echo 0)"

echo "   commit che ha solo il server: $SOLO_QUI"
echo "   commit che ha solo GitHub:    $SOLO_LA"
echo

if [ "$SOLO_QUI" = "0" ]; then
  echo "✅ il server non ha niente di suo da salvare: basta allinearsi."
  [ "$ESEGUI" = "1" ] && git reset --hard "origin/$RAMO" --quiet && echo "   allineato a origin/$RAMO"
  exit 0
fi

echo "── Cosa ha scritto il server e non è mai uscito ──"
git log --oneline "origin/$RAMO..HEAD" | sed 's/^/   /'
echo

echo "── I file toccati, divisi per cosa sono ──"
TOCCATI="$(git diff --name-only "origin/$RAMO...HEAD" 2>/dev/null || true)"
RIG_N="$(printf '%s\n' "$TOCCATI" | grep -c "^$RIGENERATI" || true)"
echo "   $RIG_N report che i motori rigenerano da soli (si lasciano indietro senza perdita)"

STORIA_FILE=""
for p in $STORIA; do
  trovati="$(printf '%s\n' "$TOCCATI" | grep "^$p" || true)"
  [ -n "$trovati" ] && STORIA_FILE="$STORIA_FILE$trovati"$'\n'
done
STORIA_N="$(printf '%s' "$STORIA_FILE" | grep -c . || true)"
if [ "$STORIA_N" -gt 0 ]; then
  echo "   $STORIA_N file di STORIA che non si rigenerano — questi vanno guardati:"
  printf '%s' "$STORIA_FILE" | sed 's/^/      /'
else
  echo "   0 file di storia: il server ha scritto solo report rigenerabili."
fi
echo

if [ "$ESEGUI" != "1" ]; then
  echo "🔍 PROVA: non ho toccato niente."
  echo "   Per farlo davvero:  bash cervello/vps/riconcilia-memoria.sh --esegui"
  exit 0
fi

# ① ARCHIVIO — prima di qualunque cosa, e verificato.
mkdir -p "$ARCHIVIO"
git bundle create "$ARCHIVIO/commit-del-server.bundle" "origin/$RAMO..HEAD" --quiet 2>/dev/null \
  || git bundle create "$ARCHIVIO/commit-del-server.bundle" HEAD --quiet
git log "origin/$RAMO..HEAD" > "$ARCHIVIO/elenco-commit.txt"
# Anche la roba NON committata: `reset --hard` la porterebbe via, e sul server ce n'è spesso — file
# portati a mano da main quando il cancello del commit li blocca. Se non l'archiviassi qui, sarebbe
# l'unica cosa di tutta questa procedura a sparire davvero.
if [ -n "$(git status --porcelain)" ]; then
  git diff > "$ARCHIVIO/modifiche-non-committate.patch"
  git status --porcelain > "$ARCHIVIO/modifiche-non-committate.txt"
  echo "   📎 archiviata anche la roba non committata ($(git status --porcelain | wc -l) file)"
fi
git diff "origin/$RAMO...HEAD" > "$ARCHIVIO/tutte-le-modifiche.patch"
if [ "$STORIA_N" -gt 0 ]; then
  # shellcheck disable=SC2086
  git diff "origin/$RAMO...HEAD" -- $STORIA > "$ARCHIVIO/solo-la-storia.patch"
fi
git bundle verify "$ARCHIVIO/commit-del-server.bundle" >/dev/null 2>&1 \
  || { echo "❌ l'archivio non si rilegge: NON allineo. Il lavoro del server resta dov'è."; exit 1; }
echo "📦 archiviato e riletto: $ARCHIVIO"

# ③ ALLINEO — solo adesso che l'archivio esiste ed è valido.
git reset --hard "origin/$RAMO" --quiet
echo "✅ ramo allineato a origin/$RAMO — il server ricomincia a pubblicare dal prossimo giro."
echo
echo "   I venti commit non sono persi: stanno nel bundle, e si rileggono con"
echo "   git log FETCH_HEAD dopo  git fetch \"$ARCHIVIO/commit-del-server.bundle\" HEAD"
