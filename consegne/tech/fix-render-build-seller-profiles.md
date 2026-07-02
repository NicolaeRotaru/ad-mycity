# Fix Render build — seller-public-profiles.ts

**Problema:** deploy Render fallisce su `lib/queries/seller-public-profiles.ts` (TS2352 o syntax error se un sed ha rotto la riga).

**Causa:** la vista `seller_public_profiles` non è nel `database.types.ts` generato; il cast diretto `as SellerPublicProfile[]` fallisce in `next build`.

## Applicare dal VPS (~/mycity)

```bash
cd ~/mycity
git fetch origin
git checkout main && git pull

# Opzione A — patch pronto (dopo merge PR #125 su ad-mycity)
git apply consegne/tech/fix-render-build-seller-profiles.patch
# oppure dalla repo ad-mycity clonata:
# curl -fsSL "https://raw.githubusercontent.com/NicolaeRotaru/ad-mycity/main/consegne/tech/fix-render-build-seller-profiles.patch" -o /tmp/fix.patch
# cd ~/mycity && git apply /tmp/fix.patch

# Opzione B — edit manuale (righe 41-44)
#   const rows = (data ?? []) as unknown as SellerPublicProfile[];
#   for (const row of rows) {
#     map.set(row.id, row);
#   }

npm run build   # deve passare
git add lib/queries/seller-public-profiles.ts
git commit -m "fix: typecheck seller_public_profiles query (Render build)"
git push origin main
```

Render rifarà il deploy automaticamente su push a `main`.
