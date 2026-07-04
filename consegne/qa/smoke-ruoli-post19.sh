#!/usr/bin/env bash
# Smoke test post-#19 "ruoli acquisto" — verifica in PROD dei guard di ruolo.
# 🟢 read-only: solo GET/POST senza effetti (no ordini creati, no scritture DB).
#
# USO:
#   bash consegne/qa/smoke-ruoli-post19.sh                 # solo checks ANONIMI (green, auto)
#   ADMIN_COOKIE='sb-...=...' SELLER_COOKIE='sb-...=...' BUYER_COOKIE='sb-...=...' \
#     bash consegne/qa/smoke-ruoli-post19.sh               # + matrice AUTENTICATA (serve login)
#
# I cookie si copiano da DevTools → Application → Cookies (header `Cookie:` intero)
# di una sessione loggata come admin / seller / buyer.
#
# Fonte-di-verità del comportamento atteso: middleware.ts (pagine) +
# lib/api/middleware.ts (API) + spec #19 in consegne/qa/2026-07-02-...md

set -u
BASE="${BASE_URL:-https://mycity-marketplace.com}"
PASS=0; FAIL=0

# code <method> <path> [cookie]
code() {
  local method="$1" path="$2" cookie="${3:-}"
  if [ -n "$cookie" ]; then
    curl -s -o /dev/null -w "%{http_code} %{redirect_url}" -m 20 \
      -X "$method" -H "Cookie: $cookie" "$BASE$path"
  else
    curl -s -o /dev/null -w "%{http_code} %{redirect_url}" -m 20 \
      -X "$method" "$BASE$path"
  fi
}

check() { # <descrizione> <atteso-regex> <valore>
  local desc="$1" want="$2" got="$3"
  if echo "$got" | grep -qE "$want"; then
    echo "  ✅ $desc  → $got"; PASS=$((PASS+1))
  else
    echo "  ❌ $desc  → atteso ~[$want], ottenuto [$got]"; FAIL=$((FAIL+1))
  fi
}

echo "== SMOKE #19 ruoli-acquisto · BASE=$BASE =="

echo "-- 0. il sito risponde --"
check "GET / (home pubblica)"      "^(200|30[0-9]) " "$(code GET /)"

echo "-- 1. ANONIMO su rotte role-protected → redirect a /sign-in (middleware.ts:176-181) --"
check "GET /admin (anon)"          "^30[0-9] .*/sign-in"  "$(code GET /admin)"
check "GET /seller/dashboard (anon)" "^30[0-9] .*/sign-in" "$(code GET /seller/dashboard)"
check "GET /rider (anon)"          "^30[0-9] .*/sign-in"  "$(code GET /rider)"

echo "-- 2. ANONIMO su API admin/seller → 401/403 (lib/api/middleware.ts) --"
check "GET /api/admin/branding (anon)" "^(401|403) " "$(code GET /api/admin/branding)"

# --- MATRICE AUTENTICATA (serve login: passa i cookie via env) -----------------
if [ -n "${ADMIN_COOKIE:-}${SELLER_COOKIE:-}${BUYER_COOKIE:-}" ]; then
  echo "-- 3. ADMIN → zero acquisti: POST purchase API deve dare 403 (spec #19) --"
  [ -n "${ADMIN_COOKIE:-}" ] && check "POST /api/orders/cod (admin)"       "^403 " "$(code POST /api/orders/cod "$ADMIN_COOKIE")"
  [ -n "${ADMIN_COOKIE:-}" ] && check "POST /api/stripe/checkout (admin)"  "^403 " "$(code POST /api/stripe/checkout "$ADMIN_COOKIE")"

  echo "-- 4. SELLER → redirect: marketplace/prodotto rimanda a /seller/dashboard (spec #19) --"
  [ -n "${SELLER_COOKIE:-}" ] && check "GET / (seller)"        "^30[0-9] .*/seller/dashboard" "$(code GET / "$SELLER_COOKIE")"

  echo "-- 5. BUYER → invariato: checkout raggiungibile (200/4xx di validazione, NON 403 ruolo) --"
  [ -n "${BUYER_COOKIE:-}" ] && check "POST /api/orders/cod (buyer, no body)" "^(400|422|409|200) " "$(code POST /api/orders/cod "$BUYER_COOKIE")"
else
  echo "-- 3-5. MATRICE AUTENTICATA saltata (nessun cookie) → passa ADMIN_COOKIE/SELLER_COOKIE/BUYER_COOKIE per eseguirla --"
fi

echo "== RISULTATO: $PASS ok · $FAIL ko =="
[ "$FAIL" -eq 0 ]
