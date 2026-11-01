#!/usr/bin/env python3
"""Cinque sessioni sui difetti seri del sito: territori, ondate e controlli.

Legge il piano di `cervello/pacchetti-lotto.mjs --sito --gravi --scrivi` e scrive:
  - consegne/audit/2026-11-01-cinque-sessioni-piano.json  (10 ondate: la S<N> fa la 2N-1 e la 2N;
    stesso formato del piano, quindi `schede-pacchetto.mjs --piano ... --ondata K` lo legge)
  - consegne/audit/2026-11-01-cinque-sessioni-territori.json (chi scrive cosa, migrazioni, fuori piano)

Controlli (esce 2 se uno salta, mai un verde cieco):
  1. ogni scheda grave/bloccante del piano sta in UNA sola sessione, o nella lista «fuori» con il perche';
  2. nessun file scrivibile ha due padroni (fuori dai file comuni a sole aggiunte);
  3. nessun file del blocco soldi e cassa sta fuori dalla S1;
  4. nella stessa ondata due pacchetti non condividono un file;
  5. le migrazioni nuove hanno numeri separati.
Uso: python3 consegne/audit/2026-11-01-cinque-sessioni.py <piano-pacchetti.json>
"""
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT_PIANO = ROOT / "consegne/audit/2026-11-01-cinque-sessioni-piano.json"
OUT_TERR = ROOT / "consegne/audit/2026-11-01-cinque-sessioni-territori.json"

NOMI = {
    "S1": "soldi-e-cassa",
    "S2": "ordine-resi-fattorino",
    "S3": "legale-catalogo-home",
    "S4": "testata-ai-accessi",
    "S5": "rilascio-copie-email",
}
MIGRAZIONI = {"S1": (185, 189), "S2": (190, 194), "S3": (195, 199), "S4": (200, 204), "S5": (205, 209)}

# Il territorio: vince il prefisso piu' lungo.
TERRITORI = {
    "S1": ["lib/stripe/", "lib/ordini/annulla.ts", "lib/ordini/prezzi.ts", "lib/db/migrazione-124.ts",
           "app/api/orders/cod/", "app/api/orders/[id]/cancel/", "app/checkout/", "components/checkout/",
           "lib/promesse-pubbliche.ts", "lib/store-hours.ts", "lib/quando-arriva.ts", "lib/promessa-consegna.ts",
           "lib/delivery.ts", "lib/shipping.ts", "lib/constants.ts", "app/api/cron/release-payouts/",
           "app/api/returns/", "app/api/stripe/", "app/cart/", "lib/coupons.ts", "lib/ordini/zona-di-consegna.ts",
           "lib/metriche-venditore.ts", "app/seller/earnings/", "app/seller/dashboard/", "app/seller/analytics/",
           "lib/ordini/veloce-non-confermata.ts"],
    "S2": ["app/orders/", "app/rider/", "components/rider/", "app/admin/sos/", "app/api/kyc/", "lib/kyc/",
           "app/admin/users/page.tsx", "app/seller/orders/", "lib/guadagni/", "app/lavora-con-noi/",
           "app/seller/layout.tsx"],
    "S3": ["app/terms/", "app/privacy/", "app/contact/", "lib/legal/", "components/Footer.tsx",
           "app/api/segnalazioni/", "components/Segnala.tsx", "app/seller/products/import/",
           "app/seller/products/new/", "app/api/ai/catalog-create-bulk/", "components/CategoryShowcase.tsx",
           "lib/site-branding.ts", "app/sitemap.ts", "app/category/", "components/products/VendutoDa.tsx",
           "lib/category-attributes.ts", "app/api/contact/", "app/api/account/export/", "app/seller/help/"],
    "S4": ["components/Navbar.tsx", "app/messages/", "app/api/ai/", "app/api/vision/", "lib/ai/",
           "lib/products/aiPatch.ts", "app/product/[id]/", "lib/supabase/client.ts", "lib/supabase/server.ts",
           "lib/auth/", "app/reset-password/", "app/auth/", "components/PhotoReviewUpload.tsx",
           "lib/installabile.ts", "lib/analytics/", "app/layout.tsx", "components/PWAInstallBanner.tsx",
           "components/ContactSellerButton.tsx", "app/api/chat/", "components/SupportProductAssistant.tsx",
           "components/seller/CatalogCopilot.tsx", "components/seller/ProductForm.tsx",
           "components/ProductCard.tsx", "app/seller/stories/", "components/seller/site/"],
    "S5": [".github/workflows/", "vercel.json", "vercel.js", "scripts/", "app/api/cron/send-emails/",
           "lib/email/", "lib/ordini/esporta-ordini.ts", "lib/admin/", "app/api/admin/users/", "lib/privacy/",
           "docs/backup-restore.md", "tests/e2e/12-la-cassa-dal-carrello-al-pagamento.spec.ts"],
}
# Il blocco soldi e cassa (regola 1 del piano del 31/10): deve stare tutto nella S1.
SOLDI = ["app/api/orders/cod/route.ts", "app/checkout/", "lib/promesse-pubbliche.ts", "lib/store-hours.ts",
         "lib/quando-arriva.ts", "lib/promessa-consegna.ts", "lib/delivery.ts", "components/checkout/",
         "lib/stripe/", "lib/ordini/annulla.ts", "lib/db/migrazione-124.ts"]
# File comuni a sole aggiunte: nessun padrone esclusivo, li ricuce la sesta sessione.
COMUNI = ["messages/", "tests/", "lib/funzioni-al-lancio.ts"]
# I file che non si scrivono mai: le migrazioni vecchie (si scrive una migrazione nuova), le cartelle generate.
MAI = re.compile(r"^(migrations/(0\d\d|1[0-7]\d|18[0-4])_|node_modules/|\.next/|new/page\.tsx$)")

# Le schede che il file del pacchetto manda nel posto sbagliato: si spostano per titolo.
SPOSTA = {
    "un quindicenne può iscriversi come rider": "S2",
    "lo storico consegne dice al fattorino": "S2",
    "nessuno vede l'orario di consegna scelto dal cliente": "S2",
    "chrome non trova il file che rende mycity installabile": "S4",
    "le email «ordine pronto» e «ordine consegnato»": "S5",
    "due squadre hanno scritto lo stesso modulo di esportazione": "S5",
    "gli ordini già fermati dal trigger della 063": "S1",
    # i pacchetti che hanno per chiave una migrazione vecchia: si ripara con una migrazione nuova
    "il riquadro «venduto da» non compare": "S3",
    "un alimento caricato da file va in vendita senza allergeni": "S3",
    "il premio invito resta 5 euro di credito vero": "S1",
}
# Fuori dal piano automatico, col perche'.
FUORI = {
    "falla di sicurezza r7": ("nicola", "chiude Nicola su Supabase, coi sette passi dati in chat"),
    "falla di sicurezza r14": ("S4", "dettagli solo nella chat della sessione dei difetti: entra se arrivano"),
    "falla di sicurezza r15": ("S4", "dettagli solo nella chat della sessione dei difetti: entra se arrivano"),
    "falla di sicurezza r83": ("S1", "dettagli solo nella chat della sessione dei difetti: entra se arrivano"),
}

RE_FILE = re.compile(r"[\w./@\[\]-]+\.(?:tsx?|jsx?|sql|json|css|mjs|js|sh|md|ya?ml|svg|bats)")


def esci(msg):
    print(f"⚪ {msg}", file=sys.stderr)
    sys.exit(2)


def file_citati(d):
    out = []
    for f in RE_FILE.findall(str(d.get("dove") or "")[:20000]):
        n = re.sub(r"^\.?/", "", f)
        n = n.replace("home/user/ad-mycity/", "")
        n = re.sub(r"^marketplace/", "", n)
        if "/" in n and n not in out:
            out.append(n)
    return out


def padrone(f):
    best, lung = None, 0
    for s, prefissi in TERRITORI.items():
        for p in prefissi:
            if f.startswith(p) and len(p) > lung:
                best, lung = s, len(p)
    return best


def e_comune(f):
    return any(f.startswith(p) for p in COMUNI)


def e_soldi(f):
    return any(f.startswith(p) for p in SOLDI)


def cerca(tabella, titolo):
    t = titolo.lower()
    for k, v in tabella.items():
        if k in t:
            return v
    return None


def main():
    if len(sys.argv) != 2:
        esci("uso: cinque-sessioni.py <piano di pacchetti-lotto --sito --gravi --scrivi>")
    piano = json.loads(Path(sys.argv[1]).read_text())
    if not isinstance(piano.get("ondate"), list) or not piano.get("solo_gravi"):
        esci("il piano non e' l'uscita di pacchetti-lotto.mjs --sito --gravi --scrivi")

    per_sessione = defaultdict(lambda: defaultdict(list))  # sessione -> chiave pacchetto -> difetti
    fuori, problemi = [], []
    # Lo stesso prefisso in due territori: il prefisso piu' lungo non sa scegliere, e vincerebbe il primo in silenzio.
    dove_sta = defaultdict(set)
    for s, prefissi in TERRITORI.items():
        for p in prefissi:
            dove_sta[p].add(s)
    for p, ss in dove_sta.items():
        if len(ss) > 1:
            problemi.append(f"prefisso in due territori {sorted(ss)}: {p}")
    viste = set()
    for ondata in piano["ondate"]:
        for p in ondata:
            for d in p["difetti"]:
                if d["chiave"] in viste:
                    problemi.append(f"scheda doppia nel piano: {d['chiave']}")
                viste.add(d["chiave"])
                f = cerca(FUORI, d["titolo"])
                if f:
                    fuori.append({"chiave": d["chiave"], "titolo": d["titolo"], "gravita": d["gravita"],
                                  "di": f[0], "perche": f[1]})
                    continue
                s = cerca(SPOSTA, d["titolo"])
                chiave_pac = p["chiave"]
                if s:
                    propri = [x for x in file_citati(d) if padrone(x) == s and not MAI.match(x)]
                    chiave_pac = propri[0] if propri else p["chiave"]
                else:
                    s = padrone(p["chiave"])
                if not s:
                    problemi.append(f"scheda senza sessione: {d['titolo'][:80]} (pacchetto {p['chiave']})")
                    continue
                per_sessione[s][chiave_pac].append(d)

    # I file che ogni sessione puo' scrivere: il suo territorio, piu' i file senza padrone citati solo da lei.
    citati_da = defaultdict(set)
    for s, pacs in per_sessione.items():
        for ds in pacs.values():
            for d in ds:
                for f in file_citati(d):
                    if not MAI.match(f):
                        citati_da[f].add(s)
    senza_padrone = {}
    for f, ss in sorted(citati_da.items()):
        if padrone(f) or e_comune(f):
            continue
        if len(ss) > 1:
            problemi.append(f"file senza padrone citato da {sorted(ss)}: {f} — assegnalo in TERRITORI")
        else:
            senza_padrone[f] = next(iter(ss))
    for f, ss in citati_da.items():
        if e_soldi(f) and padrone(f) != "S1":
            problemi.append(f"file dei soldi fuori dalla S1: {f}")

    def scrivibili(s, ds):
        out = set()
        for d in ds:
            for f in file_citati(d):
                if MAI.match(f):
                    continue
                if padrone(f) == s or senza_padrone.get(f) == s or e_comune(f):
                    out.add(f)
        return out

    # Le due ondate: due pacchetti che condividono un file scrivibile non vanno insieme; se non si puo',
    # si fondono in un pacchetto solo (tetto 12 difetti, come pacchetti-lotto).
    ondate_out = []
    territori_out = {}
    for s in ["S1", "S2", "S3", "S4", "S5"]:
        pacs = sorted(per_sessione[s].items(), key=lambda kv: -len(kv[1]))
        onde = [[], []]  # ogni elemento: {"chiave", "difetti", "file"}
        for chiave, ds in pacs:
            fs = scrivibili(s, ds) - {f for f in scrivibili(s, ds) if e_comune(f)}
            nuovo = {"chiave": chiave, "difetti": list(ds), "file": fs}
            peso = [sum(len(q["difetti"]) for q in o) for o in onde]
            ordine = sorted(range(2), key=lambda i: peso[i])
            messo = False
            for i in ordine:
                if not any(q["file"] & fs for q in onde[i]):
                    onde[i].append(nuovo)
                    messo = True
                    break
            if not messo:
                i = ordine[0]
                urtano = [q for q in onde[i] if q["file"] & fs]
                totale = len(ds) + sum(len(q["difetti"]) for q in urtano)
                if totale > 12:
                    problemi.append(f"{s}: il pacchetto {chiave} urta in tutte e due le ondate e fuso supera 12")
                for q in urtano:
                    onde[i].remove(q)
                    nuovo["difetti"] += q["difetti"]
                    nuovo["file"] |= q["file"]
                onde[i].append(nuovo)
        for i, o in enumerate(onde):
            for a in range(len(o)):
                for b in range(a + 1, len(o)):
                    if o[a]["file"] & o[b]["file"]:
                        problemi.append(f"{s} ondata {i + 1}: {o[a]['chiave']} e {o[b]['chiave']} condividono un file")
            ondate_out.append([{"chiave": q["chiave"], "difetti": q["difetti"]} for q in o])
        tutti_file = sorted(set().union(*[q["file"] for o in onde for q in o]) if any(onde) else set())
        territori_out[s] = {
            "nome": NOMI[s],
            "ramo_sito": f"claude/cinque-{s.lower()}-{NOMI[s]}",
            "ondate_nel_piano": [len(ondate_out) - 1, len(ondate_out)],
            "difetti": sum(len(q["difetti"]) for o in onde for q in o),
            "per_ondata": [sum(len(q["difetti"]) for q in o) for o in onde],
            "migrazioni_nuove": list(range(MIGRAZIONI[s][0], MIGRAZIONI[s][1] + 1)),
            "territorio_prefissi": TERRITORI[s],
            "file_senza_padrone_assegnati": sorted(f for f, x in senza_padrone.items() if x == s),
            "file_da_toccare_misurati": tutti_file,
        }

    # Due padroni per lo stesso file scrivibile (fuori dai comuni)?
    chi = defaultdict(set)
    for s, t in territori_out.items():
        for f in t["file_da_toccare_misurati"]:
            if not e_comune(f):
                chi[f].add(s)
    for f, ss in chi.items():
        if len(ss) > 1:
            problemi.append(f"file con due padroni {sorted(ss)}: {f}")
    rng = sorted(MIGRAZIONI.values())
    for a, b in zip(rng, rng[1:]):
        if a[1] >= b[0]:
            problemi.append(f"migrazioni sovrapposte: {a} e {b}")

    assegnati = sum(t["difetti"] for t in territori_out.values())
    if assegnati + len(fuori) != len(viste):
        problemi.append(f"conto che non torna: {assegnati} assegnati + {len(fuori)} fuori != {len(viste)} nel piano")
    if problemi:
        for p in problemi:
            print("❌", p, file=sys.stderr)
        sys.exit(2)

    base = {k: piano[k] for k in ("registro", "aperti", "solo_gravi", "quota") if k in piano}
    OUT_PIANO.write_text(json.dumps({
        "_cosa_e": "Il piano delle cinque sessioni parallele del 1/11: la S<N> fa le ondate 2N-1 e 2N. "
                   "Lo scrive consegne/audit/2026-11-01-cinque-sessioni.py dal piano di pacchetti-lotto.",
        "da_piano": Path(sys.argv[1]).name, **base, "coperti": assegnati, "fuori": len(fuori),
        "ondate": ondate_out,
    }, ensure_ascii=False, indent=1) + "\n")
    OUT_TERR.write_text(json.dumps({
        "_cosa_e": "Chi scrive cosa nelle cinque sessioni del 1/11. File comuni a sole aggiunte: " + ", ".join(COMUNI)
                   + ". Le migrazioni vecchie non si toccano: se ne scrive una nuova nel proprio intervallo.",
        "ramo_integrazione_sito": "claude/hopeful-dirac-jneoam",
        "base_sito": "ecb8e2c",
        "file_comuni_solo_aggiunte": COMUNI,
        "sessioni": territori_out,
        "fuori_piano": fuori,
    }, ensure_ascii=False, indent=1) + "\n")
    print(f"✅ {assegnati} schede in 5 sessioni e 10 ondate, {len(fuori)} fuori piano col perche'.")
    for s, t in territori_out.items():
        print(f"   {s} {t['nome']}: {t['difetti']} difetti {t['per_ondata']}, migrazioni {MIGRAZIONI[s][0]}-{MIGRAZIONI[s][1]}")


if __name__ == "__main__":
    main()
