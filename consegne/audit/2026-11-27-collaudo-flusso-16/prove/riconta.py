# Riconteggio indipendente dei conti del flusso 16 (Python, non il codice di produzione).
import json, math, re, sys, unicodedata, collections
mappa = json.load(open(sys.argv[1]))
negozi = json.load(open(sys.argv[2]))  # output del nodo Supabase
LAT, LON, R = 45.0529, 9.6917, 5000
CATENE_TXT = open(sys.argv[3]).read()  # il solo ELENCO dei nomi, letto dal file di produzione come dato
m = re.search(r"const CATENE = /(.*)/;", CATENE_TXT)
catene_re = re.compile(m.group(1).replace('\\b', r'\b'))
m2 = re.search(r"const ESCLUSE = new Set\(\[(.*?)\]\);", CATENE_TXT, re.S)
ESCLUSE = set(re.findall(r"'([^']+)'", m2.group(1)))

def norm(s):
    s = unicodedata.normalize('NFD', (s or '').lower())
    s = ''.join(c for c in s if not ('̀' <= c <= 'ͯ'))
    s = re.sub(r"[’'`]", '', s)
    s = re.sub(r'[^a-z0-9]+', ' ', s)
    return s.strip()

def dist(a, b):
    p1, p2 = math.radians(a[0]), math.radians(b[0])
    dphi = p2 - p1; dl = math.radians(b[1] - a[1])
    h = math.sin(dphi/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2
    return round(2*6371000*math.asin(math.sqrt(h)))

mc = set()
for it in negozi:
    body = it['json']['body']
    for p in body:
        n = norm(p.get('store_name'))
        if len(n) >= 4: mc.add(n)
def su_mycity(nome):
    n = norm(nome)
    if n in mc: return True
    return any(len(s) >= 6 and len(n) >= 6 and (s in n or n in s) for s in mc)

conti = collections.Counter()
visti = collections.defaultdict(list)
dettagli = collections.defaultdict(list)
for e in mappa['elements']:
    t = e.get('tags', {})
    nome = (t.get('name') or t.get('name:it') or '').strip()
    if not nome:
        conti['senza_nome'] += 1; continue
    pos = (e['lat'], e['lon']) if e['type'] == 'node' else ((e['center']['lat'], e['center']['lon']) if 'center' in e else None)
    if pos is None:
        conti['senza_posizione'] += 1; continue
    if (t.get('opening_hours', '').strip().lower() == 'closed') or t.get('disused:shop') or t.get('disused') == 'yes' or t.get('abandoned') == 'yes':
        conti['chiuse'] += 1; continue
    if t.get('brand') or t.get('brand:wikidata') or t.get('operator:wikidata') or catene_re.search(norm(nome)):
        conti['catene'] += 1; dettagli['catene'].append(e); continue
    if t.get('shop') in ESCLUSE:
        conti['categorie_escluse'] += 1; dettagli['escluse'].append(e); continue
    d = dist((LAT, LON), pos)
    if d > R + 50:
        conti['fuori_raggio'] += 1; continue
    k = norm(nome)
    if any(dist(p, pos) < 80 for p in visti[k]):
        conti['doppioni'] += 1; dettagli['doppioni'].append(e); continue
    visti[k].append(pos)
    if su_mycity(nome):
        conti['gia_su_mycity'] += 1; dettagli['mycity'].append(e); continue
    conti['in_fila'] += 1
print(dict(conti))
print('somma', sum(conti.values()), 'letti', len(mappa['elements']))
print('gia_su_mycity:', [(x['type'], x['id'], x['tags'].get('name')) for x in dettagli['mycity']])
print('doppioni:', [(x['type'], x['id'], x['tags'].get('name')) for x in dettagli['doppioni']])
# controprova: chi ha shop non escluso ma brand ecc. Distanza max
mx = max(dist((LAT,LON),(e['lat'],e['lon']) if e['type']=='node' else (e['center']['lat'],e['center']['lon'])) for e in mappa['elements'])
print('distanza massima nella risposta', mx)
# --- per segmento, ricontato a parte: le liste dei segmenti lette come dato dal file, la logica è questa ---
seg_src = re.search(r"const SEGMENTI = \{(.*?)\n\};", CATENE_TXT, re.S).group(1)
segmenti = []
for riga in seg_src.strip().split('\n'):
    nome = re.search(r"nome: '([^']+)'", riga).group(1)
    shop = re.findall(r"'([^']+)'", (re.search(r"shop: \[([^\]]*)\]", riga) or re.search(r"()", riga)).group(1))
    am = re.findall(r"'([^']+)'", (re.search(r"amenity: \[([^\]]*)\]", riga) or re.search(r"()", riga)).group(1))
    segmenti.append((nome, set(shop), set(am)))
per = collections.Counter()
visti2 = collections.defaultdict(list)
for e in mappa['elements']:
    t = e.get('tags', {}); nome = (t.get('name') or t.get('name:it') or '').strip()
    if not nome: continue
    if t.get('brand') or t.get('brand:wikidata') or t.get('operator:wikidata') or catene_re.search(norm(nome)): continue
    if t.get('shop') in ESCLUSE: continue
    pos = (e['lat'], e['lon']) if e['type'] == 'node' else (e['center']['lat'], e['center']['lon'])
    k = norm(nome)
    if any(dist(p, pos) < 80 for p in visti2[k]): continue
    visti2[k].append(pos)
    if su_mycity(nome): continue
    shop, am, cr = t.get('shop'), t.get('amenity'), t.get('craft')
    s = next((n for n, sh, a in segmenti if (shop and shop in sh) or (not shop and am and am in a)), None)
    if s is None: s = 'artigiani' if (not shop and not am and cr) else 'altri negozi'
    per[s] += 1
print('per segmento (ricontato):', dict(per), 'somma', sum(per.values()))
