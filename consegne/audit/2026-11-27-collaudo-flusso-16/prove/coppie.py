import json, math, sys
D = sys.argv[1]
els = {"%s/%s" % (e["type"], e["id"]): e for e in json.load(open(D + "/mappa-grezza.json"))["elements"]}
fila = json.load(open(D + "/fila-intera.json"))
pos = lambda e: (e["lat"], e["lon"]) if e["type"] == "node" else (e["center"]["lat"], e["center"]["lon"])
def dist(a, b):
    p1, p2 = math.radians(a[0]), math.radians(b[0]); dl = math.radians(b[1]-a[1])
    h = math.sin((p2-p1)/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2
    return round(2*6371000*math.asin(math.sqrt(h)))
rank = {x["osm"]: i+1 for i, x in enumerate(fila)}
# coppie in fila entro 25 m l'una dall'altra, con tag
ids = [x["osm"] for x in fila]
out = []
for i in range(len(ids)):
    for j in range(i+1, len(ids)):
        d = dist(pos(els[ids[i]]), pos(els[ids[j]]))
        if d <= 3:
            out.append((d, rank[ids[i]], els[ids[i]]["tags"].get("name"), rank[ids[j]], els[ids[j]]["tags"].get("name")))
print("coppie in fila a <=3 m:", len(out))
for o in sorted(out, key=lambda o: o[1])[:60]: print(o)
for a in sys.argv[2:]:
    e = els[a]; print(a, rank.get(a), pos(e), json.dumps(e["tags"], ensure_ascii=False))
