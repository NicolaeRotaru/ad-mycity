import json, collections, sys
D = sys.argv[1]
els = {"%s/%s" % (e["type"], e["id"]): e for e in json.load(open(D + "/mappa-grezza.json"))["elements"]}
fila = json.load(open(D + "/fila-intera.json"))
c = collections.Counter()
for x in fila:
    t = els[x["osm"]]["tags"]
    k = ("shop=" + t["shop"]) if "shop" in t else ("amenity=" + t["amenity"]) if "amenity" in t else ("craft=" + t.get("craft", ""))
    c[k] += 1
print(", ".join("%s %d" % (k, v) for k, v in c.most_common()))
