import json, collections, sys
D = sys.argv[1]
els = {"%s/%s" % (e["type"], e["id"]): e for e in json.load(open(D + "/mappa-grezza.json"))["elements"]}
fila = json.load(open(D + "/fila-intera.json"))
g = collections.defaultdict(list)
for i, x in enumerate(fila):
    t = els[x["osm"]]["tags"]
    k = t.get("shop") or t.get("amenity") or ("craft:" + t.get("craft", ""))
    g[k].append("%d:%s" % (i + 1, x["nome"]))
for k in sorted(g, key=lambda k: -len(g[k])):
    print("== %s: %s" % (k, " | ".join(g[k])))
