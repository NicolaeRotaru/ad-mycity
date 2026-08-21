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

# 🔦 LA ZONA CIECA CHE MI HA FREGATO, e come si guarda. Il 21/8 alle 03:35 il server dichiarava 28
# commit di memoria fermi; alle 03:43 questo copione ne contava ZERO e diceva «niente da salvare».
# Non erano stati pubblicati — su GitHub l'ultimo commit del server è del 18/8 alle 08:56. Erano
# stati STACCATI dal ramo, quasi certamente da un riallineamento automatico che sposta il ramo su
# origin/main. Il conto qui sopra guarda solo ciò che si raggiunge da HEAD: il lavoro staccato è
# invisibile, e il verde che ne esce è la bugia peggiore che questo attrezzo possa dire, perché
# arriva un istante prima di allineare.
#
# Il registro dei movimenti (`git reflog`) tiene ogni posizione passata di HEAD per ~90 giorni. Di
# lì si ripescano i commit che non stanno né su origin/main né su HEAD: sono, per definizione, il
# lavoro del server rimasto senza casa.
ORFANI="$(git rev-list $(git reflog --format=%H 2>/dev/null | sort -u | tr '\n' ' ') HEAD --not "origin/$RAMO" 2>/dev/null | sort -u || true)"
ORFANI_N="$(printf '%s' "$ORFANI" | grep -c . || true)"
# Le PUNTE: i commit orfani che nessun altro orfano ha come antenato. Sono quelli da agganciare a un
# ramo — attaccata la punta, tutta la catena sotto torna raggiungibile.
PUNTE=""
for c in $ORFANI; do
  e_antenato=0
  for altro in $ORFANI; do
    [ "$c" = "$altro" ] && continue
    if git merge-base --is-ancestor "$c" "$altro" 2>/dev/null; then e_antenato=1; break; fi
  done
  [ "$e_antenato" = "0" ] && PUNTE="$PUNTE $c"
done

echo "   commit che ha solo il server: $SOLO_QUI"
echo "   commit che ha solo GitHub:    $SOLO_LA"
echo "   commit suoi rimasti senza ramo (dal registro dei movimenti): $ORFANI_N"
echo

if [ "$SOLO_QUI" = "0" ] && [ "$ORFANI_N" = "0" ]; then
  echo "✅ il server non ha niente di suo da salvare, né sul ramo né staccato: basta allinearsi."
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

# ①a I COMMIT SENZA RAMO, agganciati a un ramo vero. Un file di archivio si può perdere; un ramo no:
# finché un commit è raggiungibile da un ramo, git non lo tocca mai. Questo è il salvataggio che
# conta, e va fatto PRIMA del bundle — se il resto della procedura si rompe a metà, il lavoro del
# server è già al sicuro.
RAMI_SALVATI=""
if [ "$ORFANI_N" != "0" ]; then
  i=0
  for punta in $PUNTE; do
    i=$((i + 1))
    nome="memoria-server-$STAMPO-$i"
    if git branch "$nome" "$punta" 2>/dev/null; then
      RAMI_SALVATI="$RAMI_SALVATI $nome"
      echo "   🌿 $ORFANI_N commit senza ramo agganciati a: $nome"
    fi
  done
fi

git bundle create "$ARCHIVIO/commit-del-server.bundle" "origin/$RAMO..HEAD" $RAMI_SALVATI --quiet 2>/dev/null \
  || git bundle create "$ARCHIVIO/commit-del-server.bundle" HEAD $RAMI_SALVATI --quiet
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
if [ -n "$RAMI_SALVATI" ]; then
  echo "   Il lavoro che era rimasto senza ramo adesso vive qui:$RAMI_SALVATI"
  echo "   (git log$RAMI_SALVATI  per rileggerlo — non scade e non si perde)"
  echo
fi
echo "   E sta anche nel bundle, che si rilegge con"
echo "   git log FETCH_HEAD dopo  git fetch \"$ARCHIVIO/commit-del-server.bundle\" HEAD"
