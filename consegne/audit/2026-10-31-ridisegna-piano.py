"""Ridisegna il piano v2 con le regole vincolanti del critico finale e misura i conflitti.

Uso: python3 ridisegna-piano.py <piano.json> <verifica.json> <registro.json> <sito> [--extra extra.json] [--scrivi out.json]
extra.json (facoltativo): {"p161_file": [...], "riverifica": [{"i":..,"v":..}], "riparati_nuovi": [...]}
"""
import json, os, re, sys, copy, collections

piano_p, ver_p, reg_p, SITO = sys.argv[1:5]
args = sys.argv[5:]
extra = json.load(open(args[args.index('--extra') + 1])) if '--extra' in args else {}
OUT = args[args.index('--scrivi') + 1] if '--scrivi' in args else None

V2 = json.load(open(piano_p))['piano_v2']
VER = {s['i']: s for s in json.load(open(ver_p))['schede']}
REG = json.load(open(reg_p))['problemi']
for r in extra.get('riverifica', []):
    VER[r['i']]['v'] = r['v']

CASSA = {'app/api/orders/cod/route.ts', 'app/checkout/page.tsx', 'lib/promesse-pubbliche.ts', 'lib/store-hours.ts',
         'lib/quando-arriva.ts', 'lib/promessa-consegna.ts', 'lib/delivery.ts',
         'components/checkout/DeliverySlotPicker.tsx', 'lib/stripe/client.ts'}
SOLDI = {'lib/ordini/annulla.ts', 'lib/stripe/payout.ts', 'lib/db/migrazione-124.ts'}
def nel_blocco(f):
    return f in CASSA or f in SOLDI or f.startswith('lib/stripe/webhook/')

# ── i pacchetti di v2, per codice ────────────────────────────────────────────────────────────
pac = {}
ondata_di = {}
for o in V2['ondate']:
    for k in o['pacchetti']:
        cod = k['nome'].split()[0]
        assert cod not in pac, cod
        pac[cod] = {'nome': k['nome'], 'file': list(k['file']), 'indici': list(k['indici']), 'rischio': k['rischio'], 'sforzo': k['sforzo'], 'livello': o['livello']}
        ondata_di[cod] = o['n']

def togli(cod, ids):
    for i in ids:
        assert i in pac[cod]['indici'], (cod, i)
        pac[cod]['indici'].remove(i)
def metti(cod, ids):
    pac[cod]['indici'].extend(ids)

# ── regola 7: i minori del livello 1 senza prova in comune scendono al livello 2 ─────────────
SCENDONO = {'VN': ('VN2a', [1962, 1999, 1997, 1957, 2001, 1992]), 'AN': ('AN3', [1683, 1525, 1536, 1672]),
            'PA': ('PO2a', [1288, 108, 41]), 'SO': ('CF2a', [1712, 2004]), 'PC': ('CF2b', [1922, 1888, 1926]),
            'H': ('L2H', [1673, 1674, 154])}
pac['L2H'] = {'nome': 'L2H salute e lavori a orario (minori scesi dal livello 1)', 'file': list(pac['H']['file']), 'indici': [], 'rischio': 'medio', 'sforzo': 'S', 'livello': 2}
L1_MINORI_RESTO = {'SKB': [1411, 1738, 60], 'AC': [1735, 1745], 'KY': [1242, 1243], 'OC': [294, 1352], 'NL': [1532, 1533], 'FW': [1807, 1808], 'CA': [1760, 1767]}
pac['L2M'] = {'nome': 'L2M minori scesi dal livello 1 (scorte, accessi, documenti, ordine, punti, fascia, contanti)', 'file': [], 'indici': [], 'rischio': 'medio', 'sforzo': 'M', 'livello': 2}
for cod, (dove, ids) in SCENDONO.items():
    togli(cod, ids); metti(dove, ids)
for cod, ids in L1_MINORI_RESTO.items():
    togli(cod, ids); metti('L2M', ids)
    pac['L2M']['file'] += [f for f in pac[cod]['file'] if f not in pac['L2M']['file']]

# ── spostamenti fra pacchetti del livello 1 ──────────────────────────────────────────────────
togli('NE', [1812]); metti('PA', [1812])
pac['NE']['file'] = [f for f in pac['NE']['file'] if f != 'lib/stripe/client.ts']
pac['PA']['file'].append('lib/stripe/client.ts')
# LE si divide; 50 e 255 vanno con PC, che possiede lib/promesse-pubbliche.ts
le = pac.pop('LE')
for i in (50, 255):
    if i in le['indici']:
        le['indici'].remove(i); metti('PC', [i])
pac['PC']['file'].append('lib/promesse-pubbliche.ts')
pac['LE-a'] = {'nome': 'LE-a titolare e controllo prima del rilascio', 'file': ['lib/legal/titolare.ts', 'scripts/controlla-titolare.mjs'], 'indici': [i for i in le['indici'] if i == 46], 'rischio': 'medio', 'sforzo': 'M', 'livello': 1}
pac['LE-b'] = {'nome': 'LE-b testi pubblici', 'file': [f for f in le['file'] if f not in ('lib/legal/titolare.ts', 'scripts/controlla-titolare.mjs', '.github/workflows/deploy-dopo-ci.yml', 'lib/promesse-pubbliche.ts')], 'indici': [i for i in le['indici'] if i != 46], 'rischio': 'medio', 'sforzo': 'M', 'livello': 1}
# la scheda 46 tocca anche deploy-dopo-ci.yml, che e' di R (ondata 1): LE-a la aggiunge solo dopo l'unione della 1
# P161: il censimento (run wf_df9b9a65-06c) lo divide in due. P161a: il nome del fattorino e gli
# autori pubblici, con la vista nuova (ondata 1). P161b: i nomi dei clienti visti dal negozio
# (ondata 2). L'iscrizione con invito (app/sign-up) resta a INT: gli inviti sono spenti.
# Le voci 2030-2032 le ha aggiunte il censimento.
for i in (2030, 2031, 2032):
    VER.setdefault(i, {'i': i, 'v': 'presente', 'sev': 'minore'})
p161 = pac.pop('P161')
pac['P161a'] = {'nome': 'P161a il nome del fattorino e gli autori pubblici dopo la 161', 'file': ['migrations/164_i_nomi_pubblici_dopo_la_161.sql', 'app/orders/[id]/page.tsx', 'app/orders/[id]/review/page.tsx', 'app/seller/orders/[id]/page.tsx', 'components/ProductQA.tsx', 'components/store-sections/useStorePageData.ts', 'components/store-sections/ReviewsSection.tsx', 'lib/queries/seller-public-profiles.ts', 'lib/queries/negozio-dell-ordine.ts'], 'indici': [1353, 2031, 2032], 'rischio': 'alto (permessi)', 'sforzo': 'M', 'livello': 1}
pac['P161b'] = {'nome': 'P161b i nomi dei clienti visti dal negozio dopo la 161', 'file': ['app/messages/page.tsx', 'app/messages/[id]/page.tsx', 'lib/queries/controparte-della-chat.ts', 'app/seller/reviews/page.tsx', 'app/seller/customers/page.tsx'], 'indici': [1336, 114, 2030], 'rischio': 'alto (permessi)', 'sforzo': 'M', 'livello': 1}
assert sorted(p161['indici']) == sorted([1336, 1353, 114]), p161['indici']
togli('OC2c', [1372]); metti('P161b', [1372])

# ── il ridisegno del livello 1 (critico finale, problema 1) ──────────────────────────────────
L1 = [
    (1, 'A', 'Il cancello: rilascio dopo la CI, il nome del fattorino dopo la 161, salute, coda email, interruttori', ['R', 'P161a', 'H', 'CE', 'INT']),
    (2, 'B', 'Vetrina, pannello admin, fattorino, home, i nomi dei clienti dopo la 161', ['VE', 'AD', 'RI', 'HP', 'P161b']),
    (3, 'A', 'Soldi e cassa 1: contanti, fasce e orari, promessa, annullo, rimborso con chiave', ['CA', 'CF', 'PC', 'AN', 'PB']),
    (4, 'B', 'Scorte e porta unica, documenti, accessi, iscrizione del negozio, pulsanti AI', ['SKA', 'KY', 'AC', 'NE', 'AIH']),
    (5, 'A', 'Soldi e cassa 2: carta pronta (data della fascia, bonifici e HELD, freno, falle del database, resi)', ['FW', 'PA', 'VN', 'FP', 'SO']),
    (6, 'B', 'Freni sulle rotte AI e newsletter, modulo prodotto, titolare, testi, via i 5 euro', ['SKB', 'FR', 'LE-a', 'LE-b', 'NL']),
    (7, 'A', "L'ordine del cliente coi resi, e i nati del livello 1", ['OC']),
]
usati = {c for _, _, _, cs in L1 for c in cs}
ondate = []
for n, binario, nome, cs in L1:
    ondate.append({'n': n, 'binario': binario, 'livello': 1, 'nome': nome, 'pacchetti': cs})
# livello 2 e 3: l'ordine di v2, con WH in testa alla prima ondata dei soldi e i due pacchetti nuovi
resto = [o for o in V2['ondate'] if o['n'] > 7]
n = 8
for o in resto:
    cs = [k['nome'].split()[0] for k in o['pacchetti']]
    cs = [c for c in cs if c not in usati]
    ondate.append({'n': n, 'binario': None, 'livello': o['livello'], 'nome': o['nome'], 'pacchetti': cs, 'v2': o['n']})
    n += 1
ondate[7]['pacchetti'].insert(0, 'WH')
if len(ondate[7]['pacchetti']) > 5:
    spinto = ondate[7]['pacchetti'].pop()
    ondate.insert(8, {'n': None, 'binario': None, 'livello': 2, 'nome': 'Soldi: il pacchetto spinto fuori da WH', 'pacchetti': [spinto]})
ondate.insert(9, {'n': None, 'binario': None, 'livello': 2, 'nome': 'Minori scesi dal livello 1', 'pacchetti': ['L2H', 'L2M']})
# un pacchetto e' una squadra con circa 60 chiamate: sopra 9 voci si divide, e la seconda meta' va
# in un'ondata nuova subito dopo, sullo stesso binario (stessi file: mai nella stessa ondata)
nuove = []
for o in ondate:
    if o['livello'] == 1:
        continue
    for c in list(o['pacchetti']):
        ids = pac[c]['indici']
        if len(ids) > 9:
            meta = len(ids) // 2
            c2 = c + '-b'
            pac[c2] = dict(pac[c]); pac[c2]['nome'] = pac[c]['nome'] + ' (seconda parte)'
            pac[c2]['indici'] = ids[meta:]; pac[c]['indici'] = ids[:meta]
            nuove.append((o, c2))
for o, c2 in nuove:
    k = ondate.index(o)
    dopo = ondate[k + 1] if k + 1 < len(ondate) else None
    if dopo and dopo.get('nome', '').startswith('Seconde parti') and len(dopo['pacchetti']) < 5 and not (set(pac[c2]['file']) & {f for x in dopo['pacchetti'] for f in pac[x]['file']}):
        dopo['pacchetti'].append(c2)
    else:
        ondate.insert(k + 1, {'n': None, 'binario': None, 'livello': o['livello'], 'nome': 'Seconde parti: ' + o['nome'], 'pacchetti': [c2]})
for k, o in enumerate(ondate, 1):
    o['n'] = k

# ── le voci diventate riparate col main nuovo escono dai pacchetti ───────────────────────────
subito = list(V2['subito_da_chiudere']['indici'])
for cod, p in pac.items():
    for i in list(p['indici']):
        if VER[i]['v'] == 'riparato':
            p['indici'].remove(i); subito.append(i)
            p.setdefault('usciti_riparati', []).append(i)

# ── copertura ────────────────────────────────────────────────────────────────────────────────
cnt = collections.Counter()
for i in subito: cnt[i] += 1
for i in V2['non_riparare']['indici']: cnt[i] += 1
for m in V2['mani_di_nicola']:
    for i in m['indici']: cnt[i] += 1
for o in ondate:
    for c in o['pacchetti']:
        for i in pac[c]['indici']: cnt[i] += 1
tutti = set(VER)
mancanti = sorted(tutti - set(cnt)); doppi = sorted(i for i, k in cnt.items() if k > 1); estranei = sorted(set(cnt) - tutti)
orfani = sorted(c for c in pac if c not in {x for o in ondate for x in o['pacchetti']})

# ── le prove che importano ogni file ─────────────────────────────────────────────────────────
def senza_est(f):
    return re.sub(r'\.(tsx?|jsx?|mjs)$', '', f)
prove = []
for radice, _, files in os.walk(os.path.join(SITO, 'tests')):
    for x in files:
        if re.search(r'\.(tsx?|jsx?|mjs)$', x):
            prove.append(os.path.join(radice, x))
testo = {p: open(p, errors='ignore').read() for p in prove}
imp_cache = {}
def chi_importa(f):
    if f in imp_cache:
        return imp_cache[f]
    base = senza_est(f)
    if base.endswith('/route') or base.endswith('/page'):
        pass
    # solo le importazioni vere: le prove che leggono il sorgente come testo cercano parole, e le
    # copre il npm run verify della seconda sessione dopo il riallineamento
    pat = re.compile(r"""(?:from\s+|import\(\s*|require\(\s*|vi\.mock\(\s*)['"](?:@/|(?:\.\./)+)""" + re.escape(base) + r"""(?:\.(?:tsx?|jsx?|mjs))?['"]""")
    r = {os.path.relpath(p, SITO) for p, t in testo.items() if pat.search(t)}
    imp_cache[f] = r
    return r
def file_di(cs):
    return {f for c in cs for f in pac[c]['file'] if not f.endswith('/') and '*' not in f and ' ' not in f}
def prove_di(cs):
    return {t for f in file_di(cs) for t in chi_importa(f)}

conflitti = []
for o in ondate:  # dentro l'ondata
    vista = {}
    for c in o['pacchetti']:
        for f in pac[c]['file']:
            if f in vista and vista[f] != c:
                conflitti.append(f"ondata {o['n']}: file «{f}» in {vista[f]} e {c}")
            vista[f] = c
    if o['livello'] == 1 and o['binario'] == 'B':
        for c in o['pacchetti']:
            for f in pac[c]['file']:
                if nel_blocco(f):
                    conflitti.append(f"ondata {o['n']} (binario B): «{f}» e' del blocco cassa/soldi ({c})")
    if o['livello'] == 1:
        # i doppioni dichiarati dal piano v2 seguono l'originale e non contano nel tetto
        DOPPIONI = {1408, 1473, 1478, 1713, 65, 1414, 1417, 1474, 1484, 1403, 1421, 1469, 1475}
        for c in o['pacchetti']:
            distinti = [i for i in pac[c]['indici'] if i not in DOPPIONI]
            if len(distinti) > 7:
                conflitti.append(f"ondata {o['n']}: {c} porta {len(distinti)} voci distinte (tetto 7)")
coppie = [(1, 2), (3, 4), (5, 6)]
dettaglio_coppie = {}
for a, b in coppie:
    A = ondate[a - 1]['pacchetti']; B = ondate[b - 1]['pacchetti']
    fa, fb = file_di(A), file_di(B)
    comuni = fa & fb
    pa, pb = prove_di(A), prove_di(B)
    pc = sorted(pa & pb)
    dettaglio_coppie[f'{a}|{b}'] = {'file_comuni': sorted(comuni), 'prove_comuni': pc}
    for f in comuni:
        conflitti.append(f"coppia {a}|{b}: file comune «{f}»")
    for t in pc:
        conflitti.append(f"coppia {a}|{b}: la prova «{t}» importa file di tutte e due")

print('copertura: mancanti', len(mancanti), mancanti[:20], 'doppi', len(doppi), doppi[:20], 'estranei', estranei, 'pacchetti orfani', orfani)
print('subito_da_chiudere', len(subito))
for o in ondate[:10]:
    print(f"{o['n']:2d} {o['binario'] or '-'} L{o['livello']} {o['nome'][:70]} | " + ', '.join(f"{c}:{len(pac[c]['indici'])}" for c in o['pacchetti']))
print('ondate', len(ondate))
print('conflitti', len(conflitti))
for c in conflitti:
    print('  -', c)

if OUT:
    def chiave(i):
        p = REG[i]; nrm = lambda v: ' '.join(str(v or '').strip().lower().split())
        return f"{nrm(p.get('dimensione'))}|{nrm(p.get('titolo'))}"
    out = {
        '_cosa_e': "Il piano dei pacchetti del sito, ridisegnato dalla v2 con le regole vincolanti del critico finale (consegne/audit/2026-10-31-piano-difetti-sito.md). Formato di cervello/pacchetti-lotto.mjs --scrivi; in piu' per ogni ondata nome, binario e livello, e per ogni pacchetto l'elenco esplicito dei file (da unire agli args di schede-pacchetto.mjs).",
        'registro': 'sito', 'generato': extra.get('generato', ''),
        'subito_da_chiudere': sorted(set(subito)), 'non_riparare': V2['non_riparare']['indici'],
        'mani_di_nicola': V2['mani_di_nicola'],
        'controlli': {'mancanti': mancanti, 'doppi': doppi, 'estranei': estranei, 'conflitti': conflitti, 'coppie': dettaglio_coppie},
        'meta_ondate': [{'n': o['n'], 'binario': o['binario'], 'livello': o['livello'], 'nome': o['nome'], 'pacchetti': [{'codice': c, 'nome': pac[c]['nome'], 'file': pac[c]['file'], 'indici': pac[c]['indici'], 'rischio': pac[c]['rischio'], 'sforzo': pac[c]['sforzo']} for c in o['pacchetti']]} for o in ondate],
        'ondate': [[{'chiave': (pac[c]['file'][0] if pac[c]['file'] else c), 'codice': c, 'file': pac[c]['file'],
                     'difetti': [{'chiave': chiave(i), 'gravita': REG[i].get('severita'), 'titolo': REG[i].get('titolo'), 'indice': i} for i in pac[c]['indici']]}
                    for c in o['pacchetti']] for o in ondate],
    }
    json.dump(out, open(OUT, 'w'), ensure_ascii=False, indent=1)
    print('scritto', OUT)
