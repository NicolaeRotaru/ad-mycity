#!/usr/bin/env bash
# ============================================================================
# AD verifica RLS + smoke checkout (batch 6/7) — one-shot pronto-al-tap
# ----------------------------------------------------------------------------
# Origine: risposta di Nicola all'auto-analisi (2026-07-04) alla domanda
#   «SQL 107: incolla DROP policy → "fatto sql 107"» →
#   «AD verifica RLS + smoke checkout per batch 6/7.»
# Nicola ritira la Strada B (incolla manuale) e mette la palla all'AD.
#
# COSA FA (🟢 sola lettura — nessun ordine creato, nessuna scrittura DB):
#   A) VERIFICA RLS: che SQL 107 abbia chiuso il buco su public.profiles
#      - anon NON deve più leggere i dati sensibili (stripe_account_id) → 401/403
#      - la VIEW vetrina seller_public_profiles deve essere leggibile da anon → 200
#   B) SMOKE CHECKOUT: che il flusso d'acquisto regga per il batch 6/7
#      - home/catalogo/checkout raggiungibili
#      - delega la matrice ruoli (admin 403 / seller redirect / buyer ok) allo
#        smoke #19 già pronto (consegne/qa/smoke-ruoli-post19.sh)
#
# PREREQUISITO REALE: SQL 107 deve essere GIÀ APPLICATO. Se il buco risulta
# ancora aperto (anon 200 su stripe_account_id), lo script lo DICE e fallisce:
# significa che 107 va ancora eseguita (MCP apply_migration o SQL Editor).
#
# USO:
#   # RLS: serve la ANON/publishable key del progetto marketplace (NON la service
#   # key: quella bypassa l'RLS e falserebbe il test).
#   MARKETPLACE_SUPABASE_URL='https://clmpyfvpvfjgeviworth.supabase.co' \
#   MARKETPLACE_SUPABASE_ANON_KEY='eyJ...anon...' \
#     bash consegne/qa/2026-07-04-verifica-rls-smoke-checkout.sh
#
#   # + matrice ruoli autenticata (opzionale, per lo smoke checkout completo):
#   ADMIN_COOKIE='...' SELLER_COOKIE='...' BUYER_COOKIE='...' \
#     bash consegne/qa/2026-07-04-verifica-rls-smoke-checkout.sh
#
# La anon key si ottiene anche via MCP: mcp__supabase-marketplace__get_publishable_keys
# ============================================================================
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
BASE="${BASE_URL:-https://mycity-marketplace.com}"
SB_URL="${MARKETPLACE_SUPABASE_URL:-}"
# La ANON key esplicita ha la priorità; fallback su MARKETPLACE_SUPABASE_KEY MA
# solo con avviso (potrebbe essere una service key → test RLS non valido).
ANON="${MARKETPLACE_SUPABASE_ANON_KEY:-}"
PASS=0; FAIL=0; WARN=0

check() { # <descrizione> <atteso-regex> <valore>
  local desc="$1" want="$2" got="$3"
  if echo "$got" | grep -qE "$want"; then
    echo "  ✅ $desc  → $got"; PASS=$((PASS+1))
  else
    echo "  ❌ $desc  → atteso ~[$want], ottenuto [$got]"; FAIL=$((FAIL+1))
  fi
}
warn() { echo "  ⚠️  $1"; WARN=$((WARN+1)); }

echo "== A) VERIFICA RLS (SQL 107) · progetto marketplace =="
if [ -z "$SB_URL" ]; then
  warn "MARKETPLACE_SUPABASE_URL assente → RLS non verificabile. Passa URL + ANON key."
elif [ -z "$ANON" ]; then
  if [ -n "${MARKETPLACE_SUPABASE_KEY:-}" ]; then
    warn "MARKETPLACE_SUPABASE_ANON_KEY assente. NON uso MARKETPLACE_SUPABASE_KEY: se è la service key bypassa l'RLS e il test sarebbe FALSO. Fornisci la anon/publishable key (mcp get_publishable_keys)."
  else
    warn "Nessuna anon key → RLS non verificabile."
  fi
else
  # 1) anon NON deve leggere i dati sensibili: dopo 107 la policy permissiva è
  #    sparita e profiles non è più esposta ad anon → 401/permission denied.
  c_sensib="$(curl -s -o /dev/null -w '%{http_code}' -m 20 \
    -H "apikey: $ANON" -H "Authorization: Bearer $ANON" \
    "$SB_URL/rest/v1/profiles?select=stripe_account_id&limit=1")"
  check "anon → profiles.stripe_account_id NON leggibile (401/403/404)" "^(401|403|404)$" "$c_sensib"
  if [ "$c_sensib" = "200" ]; then
    warn "BUCO ANCORA APERTO: anon legge stripe_account_id (HTTP 200) → SQL 107 NON applicata. Applica 107 prima di dare il via al batch 6/7."
  fi

  # 2) la VIEW vetrina deve restare leggibile da anon (il sito la usa per il catalogo)
  c_view="$(curl -s -o /dev/null -w '%{http_code}' -m 20 \
    -H "apikey: $ANON" -H "Authorization: Bearer $ANON" \
    "$SB_URL/rest/v1/seller_public_profiles?select=store_name&limit=1")"
  check "anon → seller_public_profiles leggibile (200)" "^200$" "$c_view"
fi

echo ""
echo "== B) SMOKE CHECKOUT (batch 6/7) · BASE=$BASE =="
code() { curl -s -o /dev/null -w '%{http_code} %{redirect_url}' -m 20 "$BASE$1"; }
check "GET / (home/catalogo pubblico)"        "^(200|30[0-9]) " "$(code /)"
check "GET /checkout raggiungibile"           "^(200|30[0-9]) " "$(code /checkout)"
check "GET /cart raggiungibile"               "^(200|30[0-9]) " "$(code /cart)"

echo ""
echo "-- Matrice ruoli acquisto (delega allo smoke #19 già pronto) --"
if [ -f "$HERE/smoke-ruoli-post19.sh" ]; then
  bash "$HERE/smoke-ruoli-post19.sh" || FAIL=$((FAIL+1))
else
  warn "smoke-ruoli-post19.sh non trovato accanto a questo script."
fi

echo ""
echo "== RISULTATO: $PASS ok · $FAIL ko · $WARN avvisi =="
echo "Nota checkout reale (COD + carta test): la transazione end-to-end che CREA"
echo "un ordine resta un tap manuale (mani di Nicola / buyer di test) — questo"
echo "smoke verifica raggiungibilità e guard, non crea ordini."
[ "$FAIL" -eq 0 ]
