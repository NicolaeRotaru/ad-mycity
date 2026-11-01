#!/usr/bin/env python3
"""Il controllo dei confini delle cinque sessioni del 1/11: ogni ramo ha toccato solo i suoi file?

Per ogni ramo del sito `claude/cinque-s<N>-...` confronta i file cambiati rispetto alla base con il
territorio della sua sessione (lo stesso calcolo di 2026-11-01-cinque-sessioni.py, importato):
  - file del proprio territorio, o senza padrone e assegnati a lei → ok;
  - file comuni (messages/, tests/): ok se AGGIUNTI; se MODIFICATI si segnalano da guardare a mano;
  - migrazioni: solo nuove e solo nel proprio intervallo di numeri;
  - `lib/funzioni-al-lancio.ts` → mai;
  - qualunque altro file → fuori territorio.
Esce 1 se c'e' anche un solo sconfinamento, 0 se tutto e' nei confini, 2 se non ha potuto misurare.
Uso: python3 consegne/audit/2026-11-01-cinque-sessioni-confini.py <cartella del sito> [S1 S2 ...]
"""
import importlib.util
import json
import re
import subprocess
import sys
from pathlib import Path

QUI = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("cinque", QUI / "2026-11-01-cinque-sessioni.py")
cinque = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cinque)

TERR = json.loads((QUI / "2026-11-01-cinque-sessioni-territori.json").read_text())
# File assegnati dopo il piano, per messaggio della sesta (1/11): R15 alla S4, il titolo della home alla S3,
# la voce «Resi» alla S2, la notte delle cancellazioni alla S5.
IN_PIU = {
    "S2": ["components/account/"],
    "S3": ["lib/home-site.ts"],
    "S5": ["app/api/cron/process-deletions/", "lib/account/cancellazione.ts"],
    "S4": ["app/sign-up/", "app/sign-in/", "app/api/auth/signup/", "app/api/auth/signin/"],
}


def git(sito, *a):
    r = subprocess.run(["git", "-C", sito, *a], capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(r.stderr.strip())
    return r.stdout


def main():
    if len(sys.argv) < 2:
        print("uso: confini.py <cartella del sito> [S1 S2 ...]", file=sys.stderr)
        sys.exit(2)
    sito = sys.argv[1]
    scelte = sys.argv[2:] or list(TERR["sessioni"])
    base = TERR["base_sito"]
    sconfini = 0
    for s in scelte:
        t = TERR["sessioni"][s]
        ramo = "origin/" + t["ramo_sito"]
        try:
            git(sito, "rev-parse", "--verify", ramo)
        except RuntimeError:
            print(f"⚪ {s}: il ramo {t['ramo_sito']} non c'e' ancora")
            continue
        righe = git(sito, "diff", "--name-status", "--no-renames", f"{base}...{ramo}").splitlines()
        lo, hi = cinque.MIGRAZIONI[s]
        suoi_extra = set(t["file_senza_padrone_assegnati"])
        prefissi_extra = IN_PIU.get(s, [])
        fuori, da_guardare = [], []
        for riga in righe:
            stato, f = riga.split("\t", 1)
            if f == "lib/funzioni-al-lancio.ts":
                fuori.append(f"{stato} {f} (non lo scrive nessuno)")
                continue
            m = re.match(r"^migrations/(\d{3})_", f)
            if m:
                n = int(m.group(1))
                if stato != "A":
                    fuori.append(f"{stato} {f} (migrazione vecchia modificata)")
                elif not lo <= n <= hi:
                    fuori.append(f"{stato} {f} (numero fuori da {lo}-{hi})")
                continue
            if cinque.e_comune(f):
                if stato != "A":
                    da_guardare.append(f"{stato} {f}")
                continue
            if cinque.padrone(f) == s or f in suoi_extra or any(f.startswith(p) for p in prefissi_extra):
                continue
            chi = cinque.padrone(f) or "nessuno"
            fuori.append(f"{stato} {f} (padrone: {chi})")
        segno = "❌" if fuori else "✅"
        print(f"{segno} {s} {t['ramo_sito']}: {len(righe)} file, {len(fuori)} fuori territorio, "
              f"{len(da_guardare)} file comuni modificati da guardare")
        for x in fuori:
            print(f"     fuori: {x}")
        for x in da_guardare:
            print(f"     guarda: {x}")
        sconfini += len(fuori)
    sys.exit(1 if sconfini else 0)


if __name__ == "__main__":
    main()
